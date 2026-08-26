// Plain JS so the check costs no TypeScript loader on every probe.
import { readFile } from 'node:fs/promises';

const PATH = process.env.TRADEVIEW_RUNNER_LIVENESS ?? '/tmp/tradeview-runner-alive';
const TICK_MS = Number(process.env.TRADEVIEW_RUNNER_TICK_MS) || 15_000;

// Generous against a slow venue, tighter than the 120s lease: a restart has to
// happen while the work is still parked, not after another runner took it.
const STALE_MS = Math.max(TICK_MS * 4, 90_000);

try {
  const written = Number(await readFile(PATH, 'utf8'));
  if (!Number.isFinite(written)) process.exit(1);
  process.exit(Date.now() - written > STALE_MS ? 1 : 0);
} catch {
  process.exit(1);
}
