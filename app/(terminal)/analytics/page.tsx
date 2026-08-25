import { getDataSource } from '@/lib/data/index';
import { AccuracyGrid } from '@/components/analytics/AccuracyGrid';
import { CostPanel } from '@/components/analytics/CostPanel';
import { MissedOpportunities } from '@/components/analytics/MissedOpportunities';

export const metadata = {
  title: 'Analytics — TradeView',
};

export default async function AnalyticsPage() {
  const data = await getDataSource().getAnalytics();

  return (
    <div className="p-4 flex flex-col gap-3" style={{ fontSize: '13px' }}>
      <div className="flex items-center gap-3">
        <h1 className="m-0 text-text" style={{ fontSize: '16px', fontWeight: 700 }}>
          Analytics &amp; insights
        </h1>
        <span className="text-text-muted" style={{ fontSize: '11px' }}>
          acurácia, custo e oportunidade perdida · últimos 90 dias
        </span>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'start' }}>
        <AccuracyGrid
          rows={data.accuracyRows}
          modelAccuracy={data.modelAccuracy}
          signalCount={data.signalCount}
        />
        <CostPanel
          costTokens={data.costTokens}
          costAI={data.costAI}
          costData={data.costData}
          costBars={data.costBars}
        />
      </div>

      <MissedOpportunities
        opportunityCost={data.opportunityCost}
        missed={data.missed}
      />
    </div>
  );
}
