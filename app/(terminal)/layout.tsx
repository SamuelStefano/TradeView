import { fetchedAt, getDataSource } from '@/lib/data/index';
import { readKillSwitch } from '@/lib/trading/kill-switch';
import { getSessionUserId } from '@/lib/supabase/server';
import { supabaseConfigured } from '@/lib/supabase/config';
import { ShellClient } from '@/components/shell/ShellClient';

// The shell reports live venue latency and the topbar sync clock. Prerendering
// it would freeze both at build time, so every screen under this layout would
// claim a market status measured whenever the last deploy happened.
export const dynamic = 'force-dynamic';

async function killSwitchState(): Promise<boolean> {
  if (!supabaseConfigured) return false;
  const userId = await getSessionUserId();
  if (!userId) return false;
  return readKillSwitch(userId).catch(() => false);
}

export default async function TerminalLayout({ children }: LayoutProps<'/'>) {
  const [markets, killed, at] = await Promise.all([
    getDataSource().getMarkets(),
    killSwitchState(),
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
        killSwitchActive: killed,
        fetchedAt: at,
      }}
    >
      {children}
    </ShellClient>
  );
}
