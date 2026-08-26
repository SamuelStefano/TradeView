import { getDataSource } from '@/lib/data/index';
import { ShellClient } from '@/components/shell/ShellClient';

export default async function TerminalLayout({ children }: LayoutProps<'/'>) {
  const source = getDataSource();
  const [markets, strategies] = await Promise.all([source.getMarkets(), source.getStrategies()]);

  return (
    <ShellClient
      health={{
        connected: markets.connectedCount,
        total: markets.totalCount,
        degraded: markets.degradedCount,
        offline: markets.offlineCount,
        latencyMs: markets.medianLatencyMs,
        realStrategies: strategies.filter((s) => s.mode === 'REAL').length,
      }}
    >
      {children}
    </ShellClient>
  );
}
