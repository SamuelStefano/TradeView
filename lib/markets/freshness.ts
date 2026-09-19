import type { Freshness } from '../types';

// Quotes are served from a per-venue cache and a server component renders once,
// so the page a user is looking at is always older than the fetch. Stamping
// every row "tempo real · 0s" claims a guarantee the pipeline does not give.
const REALTIME_MAX_MS = 60_000;

export function freshnessOf(observedAt: number, now: number, source: string): Freshness {
  // A venue clock ahead of ours would otherwise report a negative age.
  const ageMs = Math.max(now - observedAt, 0);

  if (ageMs <= REALTIME_MAX_MS) {
    return { kind: 'realtime', agoSeconds: Math.round(ageMs / 1000) };
  }

  // Deliberately not 'eod': these markets never close, so a stale tick is a late
  // tick, not a settlement price.
  return { kind: 'delayed', delayMinutes: Math.max(Math.round(ageMs / 60_000), 1), source };
}
