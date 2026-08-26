import 'server-only';

import { TradingError } from './trading/errors';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

// In-memory and therefore per-instance: a serverless fan-out multiplies the
// real ceiling. It is here to stop a runaway client or a stuck retry loop from
// hammering the exchange, not as an authorization boundary.
const hits = new Map<string, number[]>();

export function checkRate(key: string): void {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    throw new TradingError('muitas operações seguidas — aguarde um minuto');
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 1000) {
    for (const [k, stamps] of hits) {
      if (stamps.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
}
