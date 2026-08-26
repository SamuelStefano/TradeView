import type { Timeframe } from '../../markets/timeframes';

export const TIMEFRAME_MS: Record<Timeframe, number> = {
  '5m': 5 * 60_000,
  '15m': 15 * 60_000,
  '1h': 60 * 60_000,
  '4h': 4 * 60 * 60_000,
  '1d': 24 * 60 * 60_000,
  '1w': 7 * 24 * 60 * 60_000,
};

// A few seconds after the candle closes, because a venue publishes the closing
// print slightly late and asking exactly on the boundary returns the previous
// candle as if it were still open.
const SETTLE_MS = 5_000;

// Evaluating more often than one candle per period is pure waste: the strategy
// only reads closed candles, so every extra call returns the same decision and
// spends rate-limit budget. Scheduling is anchored to the venue's own candle
// clock rather than to wall time, which keeps a slow tick from drifting.
export function nextRunAt(
  lastClosedOpenTime: number,
  timeframe: Timeframe,
  now: number,
): Date {
  const period = TIMEFRAME_MS[timeframe];
  const candidate = lastClosedOpenTime + 2 * period + SETTLE_MS;

  // Stale data: the venue is behind, or the strategy was just created against
  // an old cache. Falling back to a full period from now avoids a hot loop.
  if (candidate <= now) return new Date(now + period);

  return new Date(candidate);
}

const MIN_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 15 * 60_000;

// A venue that is down stays down for a while. Retrying on the normal cadence
// burns the rate limit and fills the run log with the same error.
export function backoffAt(consecutiveErrors: number, now: number): Date {
  const factor = 2 ** Math.max(consecutiveErrors, 0);
  return new Date(now + Math.min(MIN_BACKOFF_MS * factor, MAX_BACKOFF_MS));
}
