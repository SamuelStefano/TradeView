import { getDataSource } from '@/lib/data';
import type { PortfolioData } from '@/lib/data/mock/portfolio';
import { PositionsTable } from '@/components/portfolio/PositionsTable';
import { ExposurePanel } from '@/components/portfolio/ExposurePanel';
import { RiskPanel } from '@/components/portfolio/RiskPanel';
import { FiscalPanel } from '@/components/portfolio/FiscalPanel';
import { TradesTable } from '@/components/portfolio/TradesTable';

export default async function PortfolioPage() {
  const data = (await getDataSource().getPortfolio()) as PortfolioData;

  return (
    <div className="flex flex-col gap-3 p-4 text-xs">
      <div className="flex items-center gap-3">
        <h1 className="m-0 font-bold" style={{ fontSize: '16px' }}>
          Portfólio consolidado
        </h1>
        <span className="text-text-muted" style={{ fontSize: '11px' }}>
          55 integrações · atualizado{' '}
          <span className="font-mono">há 3s</span>
        </span>
        <div className="flex-1" />
        <button
          type="button"
          className="bg-hover border border-border-strong rounded text-text-secondary cursor-pointer"
          style={{ height: '30px', padding: '0 12px', fontSize: '12px', fontFamily: 'inherit' }}
        >
          Exportar CSV
        </button>
      </div>

      <PositionsTable positions={data.positions} />

      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'start' }}>
        <ExposurePanel
          byClass={data.exposureByClass}
          byCurrency={data.exposureByCurrency}
          byVenue={data.exposureByVenue}
          byCountry={data.exposureByCountry}
        />
        <RiskPanel
          metrics={data.risk}
          concentrationWarning={data.riskConcentrationWarning}
        />
        <FiscalPanel
          rows={data.fiscal}
          darfAmount={data.darfAmount}
          darfDue={data.darfDue}
        />
      </div>

      <TradesTable trades={data.trades} />
    </div>
  );
}
