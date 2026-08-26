import { getDataSource } from '@/lib/data/index';
import { ShellClient } from '@/components/shell/ShellClient';

export default async function TerminalLayout({ children }: LayoutProps<'/'>) {
  const markets = await getDataSource().getMarkets();

  return (
    <ShellClient
      health={{
        connected: markets.connectedCount,
        total: markets.totalCount,
        degraded: markets.degradedCount,
        offline: markets.offlineCount,
        latencyMs: markets.medianLatencyMs,
      }}
    >
      {children}
    </ShellClient>
  );
}
