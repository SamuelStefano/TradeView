import { fetchedAt, getDataSource } from '@/lib/data/index';
import { ShellClient } from '@/components/shell/ShellClient';

// The shell reports live venue latency and the topbar sync clock. Prerendering
// it would freeze both at build time, so every screen under this layout would
// claim a market status measured whenever the last deploy happened.
export const dynamic = 'force-dynamic';

export default async function TerminalLayout({ children }: LayoutProps<'/'>) {
  const source = getDataSource();
  const [markets, strategies, at] = await Promise.all([
    source.getMarkets(),
    source.getStrategies(),
    fetchedAt(),
  ]);

  return (
    <ShellClient
      health={{
        connected: markets.connectedCount,
        total: markets.totalCount,
        degraded: markets.degradedCount,
        offline: markets.offlineCount,
        latencyMs: markets.medianLatencyMs,
        realStrategies: strategies.filter((s) => s.mode === 'REAL').length,
        fetchedAt: at,
      }}
    >
      {children}
    </ShellClient>
  );
}
