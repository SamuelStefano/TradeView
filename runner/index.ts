// TradeView strategy runner.
//
// Lives on a VPS rather than in the Next app because a strategy needs a process
// that stays alive: CCXT's rate limiter is per-instance and resets with every
// cold start, and a serverless invocation cannot hold a lease while it decides.
//
// It talks to Postgres with the secret key and to public venue endpoints. It
// listens on nothing — there is no port to expose and no inbound path to it.

import { writeFile } from 'node:fs/promises';
import { hostname } from 'node:os';

import { createAdminClient } from '../lib/core/supabase-admin';
import { realTradingAllowed } from '../lib/core/env';
import { evaluateStrategy, type StrategyRow } from '../lib/core/strategy/runner';

const VERSION = process.env.TRADEVIEW_VERSION ?? 'dev';
const RUNNER_ID = (process.env.TRADEVIEW_RUNNER_ID ?? hostname()).slice(0, 64);

function bounded(raw: string | undefined, fallback: number, min: number, max: number): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

const TICK_MS = bounded(process.env.TRADEVIEW_RUNNER_TICK_MS, 15_000, 5_000, 300_000);
const BATCH = bounded(process.env.TRADEVIEW_RUNNER_BATCH, 10, 1, 100);

// Comfortably longer than one strategy takes, so a slow venue does not hand the
// work to a second runner while the first is still waiting on the response.
const LEASE_SECONDS = 120;

// Touched at the end of every tick. The runner listens on nothing, so this file
// is the only way the orchestrator can tell a working process from one stuck in
// a request that never returned — and a stuck runner holds leases, which parks
// every strategy it claimed until someone notices.
const LIVENESS_PATH = process.env.TRADEVIEW_RUNNER_LIVENESS ?? '/tmp/tradeview-runner-alive';

let stopping = false;
let ticking = false;

function log(event: string, detail: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ at: new Date().toISOString(), runner: RUNNER_ID, event, ...detail }));
}

async function tick(): Promise<void> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('claim_strategies', {
    p_runner_id: RUNNER_ID,
    p_lease_seconds: LEASE_SECONDS,
    p_limit: BATCH,
  });

  if (error) {
    log('claim_falhou', { message: error.message });
    return;
  }

  const claimed = (data ?? []) as StrategyRow[];

  // Sequential on purpose. The venue clients share one rate limiter per
  // process, so running these in parallel only queues them inside CCXT while
  // making the lease harder to reason about.
  for (const strategy of claimed) {
    if (stopping) break;

    const outcome = await evaluateStrategy(strategy);

    const { error: finishError } = await supabase.rpc('finish_strategy_run', {
      p_strategy_id: strategy.id,
      p_runner_id: RUNNER_ID,
      p_action: outcome.action,
      p_reason: outcome.reason,
      p_price: outcome.price,
      p_order_id: outcome.orderId,
      p_error: outcome.error,
      p_next_run_at: outcome.nextRunAt.toISOString(),
    });

    if (finishError) {
      log('gravacao_falhou', { strategy: strategy.id, message: finishError.message });
      continue;
    }

    log('avaliada', {
      strategy: strategy.id,
      name: strategy.name,
      symbol: strategy.symbol,
      action: outcome.action,
      order: outcome.orderId,
      error: outcome.error,
    });
  }

  const { error: beatError } = await supabase.rpc('record_heartbeat', {
    p_runner_id: RUNNER_ID,
    p_version: VERSION,
    p_claimed: claimed.length,
    p_detail: { tick_ms: TICK_MS, batch: BATCH },
  });

  if (beatError) log('heartbeat_falhou', { message: beatError.message });
}

async function releaseLeases(): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from('strategies')
      .update({ locked_by: null, locked_until: null })
      .eq('locked_by', RUNNER_ID);
  } catch (err) {
    log('release_falhou', { message: err instanceof Error ? err.message : String(err) });
  }
}

async function loop(): Promise<void> {
  while (!stopping) {
    ticking = true;
    try {
      await tick();
    } catch (err) {
      // The loop must outlive any single failure. A DNS blip that killed the
      // process would leave every strategy parked until someone noticed.
      log('tick_falhou', { message: err instanceof Error ? err.message : String(err) });
    }
    ticking = false;

    await writeFile(LIVENESS_PATH, String(Date.now())).catch(() => {});

    if (stopping) break;
    await new Promise((resolve) => setTimeout(resolve, TICK_MS));
  }
}

function shutdown(signal: string): void {
  if (stopping) return;
  stopping = true;
  log('encerrando', { signal, meio_de_tick: ticking });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

async function main(): Promise<void> {
  // Fails here, at boot, rather than on the first strategy that needed it.
  createAdminClient();

  if (realTradingAllowed()) {
    log('aviso', {
      message: 'TRADEVIEW_ALLOW_REAL_TRADING está ligado neste host; o runner ignora e só opera em papel',
    });
  }

  log('iniciado', { version: VERSION, tick_ms: TICK_MS, batch: BATCH });

  await loop();
  await releaseLeases();

  log('encerrado');
}

main().catch((err) => {
  log('fatal', { message: err instanceof Error ? err.message : String(err) });
  process.exitCode = 1;
});
