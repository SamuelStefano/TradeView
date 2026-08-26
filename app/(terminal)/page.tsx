import { getDataSource } from '@/lib/data';
import { NetWorthPanel } from '@/components/overview/NetWorthPanel';
import { AllocationPanel } from '@/components/overview/AllocationPanel';
import { HeatmapPanel } from '@/components/overview/HeatmapPanel';
import { WatchlistPanel } from '@/components/overview/WatchlistPanel';

export const metadata = {
  title: 'Overview — TradeView',
};

export default async function OverviewPage() {
  const data = await getDataSource().getOverview();

  return (
    <div
      style={{
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '12px',
        fontSize: '13px',
        alignItems: 'start',
      }}
    >
      <h1 className="sr-only">Overview do portfólio</h1>

      <div className="flex flex-col gap-3">
        <NetWorthPanel
          netWorth={data.netWorth}
          pnlCards={data.pnlCards}
          accountNote={data.accountNote}
        />
        <AllocationPanel allocation={data.allocation} />
      </div>

      <div className="flex flex-col gap-3 min-w-0">
        <HeatmapPanel heatmap={data.heatmap} />
        <WatchlistPanel watchlist={data.watchlist} />
      </div>
    </div>
  );
}
