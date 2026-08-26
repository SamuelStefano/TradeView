'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUserId } from '@/lib/supabase/server';
import { checkRate } from '@/lib/rate-limit';
import { TradingError } from '@/lib/trading/errors';
import {
  createStrategy,
  deleteStrategy,
  setStrategyStatus,
  type NewStrategy,
} from '@/lib/trading/strategies';
import { STRATEGY_KINDS, type StrategyKind } from '@/lib/core/strategy/signals';
import { TIMEFRAMES, type Timeframe } from '@/lib/markets/timeframes';

export interface ActionState {
  ok: boolean;
  message: string;
}

async function requireUser(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new TradingError('sessão expirada — entre novamente');
  checkRate(userId);
  return userId;
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value !== 'string') throw new TradingError(`campo obrigatório: ${name}`);
  return value.trim();
}

function numericField(form: FormData, name: string): string {
  const raw = field(form, name).replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(raw)) throw new TradingError(`valor inválido em ${name}`);
  return raw;
}

function intField(form: FormData, name: string): number {
  const raw = field(form, name);
  if (!/^\d+$/.test(raw)) throw new TradingError(`valor inválido em ${name}`);
  return Number(raw);
}

function failure(error: unknown): ActionState {
  if (error instanceof TradingError) return { ok: false, message: error.message };

  console.error('[strategies action]', error);
  return { ok: false, message: 'erro inesperado — tente novamente' };
}

function parseKind(raw: string): StrategyKind {
  if (!STRATEGY_KINDS.includes(raw as StrategyKind)) throw new TradingError('tipo inválido');
  return raw as StrategyKind;
}

function parseTimeframeStrict(raw: string): Timeframe {
  if (!TIMEFRAMES.includes(raw as Timeframe)) throw new TradingError('timeframe inválido');
  return raw as Timeframe;
}

// Only the fields the chosen kind actually uses are read. Carrying the whole
// form through would store a slow average on a breakout and quietly change the
// meaning of a strategy the user edits later.
function paramsFor(kind: StrategyKind, form: FormData): Record<string, number> {
  if (kind === 'sma_cross') {
    return { fast: intField(form, 'fast'), slow: intField(form, 'slow') };
  }
  if (kind === 'rsi_reversion') {
    return {
      period: intField(form, 'period'),
      oversold: intField(form, 'oversold'),
      overbought: intField(form, 'overbought'),
    };
  }
  return { lookback: intField(form, 'lookback') };
}

export async function createStrategyAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const userId = await requireUser();
    const kind = parseKind(field(form, 'kind'));

    const input: NewStrategy = {
      name: field(form, 'name'),
      kind,
      symbol: field(form, 'symbol'),
      timeframe: parseTimeframeStrict(field(form, 'timeframe')),
      params: paramsFor(kind, form),
      orderNotional: numericField(form, 'orderNotional'),
    };

    await createStrategy(userId, input);

    revalidatePath('/strategies');
    return { ok: true, message: 'estratégia criada, e parada — ligue quando quiser' };
  } catch (error) {
    return failure(error);
  }
}

export async function setStrategyStatusAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const userId = await requireUser();
    const status = field(form, 'status');
    if (status !== 'active' && status !== 'paused') throw new TradingError('status inválido');

    await setStrategyStatus(userId, field(form, 'strategyId'), status);

    revalidatePath('/strategies');
    return {
      ok: true,
      message: status === 'active' ? 'estratégia ligada' : 'estratégia parada',
    };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteStrategyAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const userId = await requireUser();
    await deleteStrategy(userId, field(form, 'strategyId'));

    revalidatePath('/strategies');
    return { ok: true, message: 'estratégia removida' };
  } catch (error) {
    return failure(error);
  }
}
