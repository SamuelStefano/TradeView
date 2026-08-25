import { getDataSource } from '@/lib/data';
import { NetWorthPanel } from '@/components/overview/NetWorthPanel';
import { AllocationPanel } from '@/components/overview/AllocationPanel';
import { CalendarPanel } from '@/components/overview/CalendarPanel';
import { SignalsFeed } from '@/components/overview/SignalsFeed';
import { HeatmapPanel } from '@/components/overview/HeatmapPanel';
import { WatchlistPanel } from '@/components/overview/WatchlistPanel';

export default async function OverviewPage() {
  const data = await getDataSource().getOverview();

  return (
    <main
      style={{
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr 340px',
        gap: '12px',
        fontSize: '13px',
        alignItems: 'start',
      }}
    >
      <div className="flex flex-col gap-3">
        <NetWorthPanel netWorth={data.netWorth} pnlCards={data.pnlCards} />
        <AllocationPanel allocation={data.allocation} />
        <CalendarPanel events={data.events} />
      </div>

      <div className="flex flex-col gap-3 min-w-0">
        <SignalsFeed signals={data.signals} analyzing={data.analyzing} />
        <HeatmapPanel heatmap={data.heatmap} />
      </div>

      <WatchlistPanel watchlist={data.watchlist} />
    </main>
  );
}
