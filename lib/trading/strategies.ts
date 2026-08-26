import 'server-only';

import { createSupabaseAdminClient } from '../supabase/server';
import { money } from '../money';
import { TradingError } from './errors';
import { parseParams, type StrategyKind } from '../core/strategy/signals';
import type { Timeframe } from '../markets/timeframes';

export interface StrategySummary {
  id: string;
  name: string;
  kind: StrategyKind;
  symbol: string;
  timeframe: Timeframe;
  params: Record<string, number>;
  orderNotional: string;
  status: 'active' | 'paused' | 'error';
  nextRunAt: string;
  lastRunAt: string | null;
  lastSignal: 'buy' | 'sell' | 'hold' | null;
  lastError: string | null;
  consecutiveErrors: number;
}

export interface StrategyRunRow {
  id: number;
  strategyId: string;
  action: 'buy' | 'sell' | 'hold';
  reason: string;
  price: string | null;
  orderId: string | null;
  error: string | null;
  createdAt: string;
}

export interface RunnerHealth {
  runnerId: string;
  version: string;
  lastSeenAt: string;
  claimed: number;
  alive: boolean;
}

// A runner writes a heartbeat every tick. Older than this is a process that died
// or lost the network — the difference between a strategy waiting for its candle
// and one that is not going to run at all.
const HEARTBEAT_STALE_MS = 120_000;

// PostgREST answers PGRST205 for a table it cannot find. Here that means one
// thing only: the strategies migration has not been applied to this project.
// Left as a generic failure the route would 500, and the fix — run the
// migration — is not something a stack trace suggests.
export class SchemaMissingError extends TradingError {
  constructor() {
    super('a migration de estratégias ainda não foi aplicada neste banco');
    this.name = 'SchemaMissingError';
  }
}

function missingSchema(error: { code?: string } | null): boolean {
  return error?.code === 'PGRST205' || error?.code === '42P01';
}

const COLUMNS =
  'id, name, kind, symbol, timeframe, params, order_notional, status, next_run_at, last_run_at, last_signal, last_error, consecutive_errors';

interface StrategyRecord {
  id: string;
  name: string;
  kind: StrategyKind;
  symbol: string;
  timeframe: Timeframe;
  params: Record<string, number>;
  order_notional: string;
  status: 'active' | 'paused' | 'error';
  next_run_at: string;
  last_run_at: string | null;
  last_signal: 'buy' | 'sell' | 'hold' | null;
  last_error: string | null;
  consecutive_errors: number;
}

function toSummary(row: StrategyRecord): StrategySummary {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    symbol: row.symbol,
    timeframe: row.timeframe,
    params: row.params ?? {},
    orderNotional: row.order_notional,
    status: row.status,
    nextRunAt: row.next_run_at,
    lastRunAt: row.last_run_at,
    lastSignal: row.last_signal,
    lastError: row.last_error,
    consecutiveErrors: row.consecutive_errors,
  };
}

export async function listStrategies(userId: string): Promise<StrategySummary[]> {
  const supabase = createSupabaseAdminClient();

  // The secret key ignores RLS, so the user scope is applied by hand on every
  // read here — the policy is the second lock, not the only one.
  const { data, error } = await supabase
    .from('strategies')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (missingSchema(error)) throw new SchemaMissingError();
  if (error) throw new TradingError('não foi possível carregar as estratégias');
  return (data ?? []).map((row) => toSummary(row as unknown as StrategyRecord));
}

export async function listRecentRuns(userId: string, limit = 40): Promise<StrategyRunRow[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('strategy_runs')
    .select('id, strategy_id, action, reason, price, order_id, error, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (missingSchema(error)) return [];
  if (error) throw new TradingError('não foi possível carregar o histórico');

  return (data ?? []).map((row) => ({
    id: row.id as number,
    strategyId: row.strategy_id as string,
    action: row.action as StrategyRunRow['action'],
    reason: row.reason as string,
    price: row.price as string | null,
    orderId: row.order_id as string | null,
    error: row.error as string | null,
    createdAt: row.created_at as string,
  }));
}

export async function readRunnerHealth(): Promise<RunnerHealth[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('runner_heartbeats')
    .select('runner_id, version, last_seen_at, claimed')
    .order('last_seen_at', { ascending: false });

  // A missing heartbeat is the answer, not a failure: it is exactly what the
  // screen has to show before the runner has ever been deployed.
  if (error) return [];

  const now = Date.now();

  return (data ?? []).map((row) => ({
    runnerId: row.runner_id as string,
    version: row.version as string,
    lastSeenAt: row.last_seen_at as string,
    claimed: row.claimed as number,
    alive: now - new Date(row.last_seen_at as string).getTime() < HEARTBEAT_STALE_MS,
  }));
}

export interface NewStrategy {
  name: string;
  kind: StrategyKind;
  symbol: string;
  timeframe: Timeframe;
  params: Record<string, number>;
  orderNotional: string;
}

export async function createStrategy(userId: string, input: NewStrategy): Promise<string> {
  const notional = money(input.orderNotional);
  if (notional.lte(0)) throw new TradingError('o tamanho por entrada precisa ser maior que zero');

  // Rejected here rather than at the first tick: a strategy saved with a slow
  // average below the fast one would sit parked showing an error nobody asked
  // for, and the message would arrive hours after the form was submitted.
  parseParams(input.kind, input.params);

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('strategies')
    .insert({
      user_id: userId,
      name: input.name,
      kind: input.kind,
      symbol: input.symbol,
      timeframe: input.timeframe,
      params: input.params,
      order_notional: notional.toFixed(18),
      // The runner refuses anything else while fills are simulated, so offering
      // the choice here would only produce a strategy that never runs.
      mode: 'paper',
    })
    .select('id')
    .single();

  if (error?.code === '23505') throw new TradingError('já existe uma estratégia com esse nome');
  if (error?.code === '23503') throw new TradingError(`instrumento desconhecido: ${input.symbol}`);

  if (error || !data) {
    console.error('[strategies]', error?.code, error?.message);
    throw new TradingError('não foi possível criar a estratégia');
  }

  return data.id as string;
}

export async function setStrategyStatus(
  userId: string,
  strategyId: string,
  status: 'active' | 'paused',
): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };

  if (status === 'active') {
    // Resuming clears the error count and the lease. Without this, a strategy
    // parked by five failures would be reactivated already one failure from
    // being parked again, and a stale lock would hold it until it expired.
    patch.consecutive_errors = 0;
    patch.last_error = null;
    patch.locked_by = null;
    patch.locked_until = null;
    patch.next_run_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('strategies')
    .update(patch)
    .eq('id', strategyId)
    .eq('user_id', userId)
    .select('id');

  if (error) throw new TradingError('não foi possível alterar a estratégia');
  if (!data || data.length === 0) throw new TradingError('estratégia não encontrada');
}

export async function deleteStrategy(userId: string, strategyId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('strategies')
    .delete()
    .eq('id', strategyId)
    .eq('user_id', userId)
    .select('id');

  if (error) throw new TradingError('não foi possível remover a estratégia');
  if (!data || data.length === 0) throw new TradingError('estratégia não encontrada');
}
