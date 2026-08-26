import Link from 'next/link';

import { getDataSource } from '@/lib/data';
import { PositionsTable } from '@/components/portfolio/PositionsTable';
import { ExposurePanel } from '@/components/portfolio/ExposurePanel';
import { RiskPanel } from '@/components/portfolio/RiskPanel';
import { FiscalPanel } from '@/components/portfolio/FiscalPanel';
import { TradesTable } from '@/components/portfolio/TradesTable';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';

export const metadata = {
  title: 'Portfólio — TradeView',
};

export default async function PortfolioPage() {
  const data = await getDataSource().getPortfolio();
  const venueCount = new Set(data.positions.map((p) => p.venue)).size;
  const empty = data.positions.length === 0 && data.trades.length === 0;

  return (
    <div className="flex flex-col gap-3 p-4 text-xs">
      <div className="flex items-center gap-3">
        <h1 className="m-0 font-bold" style={{ fontSize: '16px' }}>
          Portfólio consolidado
        </h1>
        <span className="text-text-muted" style={{ fontSize: '11px' }}>
          {data.positions.length} posições · {venueCount} venues
        </span>
        <div className="flex-1" />
        {data.positions.length > 0 && (
          <ExportCsvButton
            headers={['ativo', 'venue', 'classe', 'qtd.', 'preco medio', 'preco atual', 'pnl aberto', 'pnl aberto %', 'peso %']}
            rows={data.positions.map((p) => [
              p.symbol, p.venue, p.assetClass, p.qty, p.avgPrice, p.currentPrice,
              p.pnlOpen, p.pnlOpenPct, p.weightPct,
            ])}
            filename="tradeview-posicoes"
            label="Exportar posições"
            style={{ height: '30px', padding: '0 12px', fontSize: '12px', fontFamily: 'inherit' }}
          />
        )}
      </div>

      {empty ? (
        <section
          aria-label="Portfólio vazio"
          className="bg-surface border border-border rounded-lg flex flex-col items-center gap-2 text-center"
          style={{ padding: '48px 24px' }}
        >
          <p className="m-0 text-text font-semibold" style={{ fontSize: '13px' }}>
            Nenhuma posição ainda
          </p>
          <p className="m-0 text-text-faint" style={{ maxWidth: '46ch', lineHeight: 1.6 }}>
            Esta tela mostra apenas o que existe no seu ledger. Deposite e envie uma ordem
            na mesa de operações para que as posições apareçam aqui.
          </p>
          <Link
            href="/trade"
            className="mt-1 h-8 px-3.5 inline-flex items-center rounded-md bg-accent-strong text-white no-underline font-semibold"
            style={{ fontSize: '12px' }}
          >
            Ir para a mesa
          </Link>
        </section>
      ) : (
        <PositionsTable positions={data.positions} />
      )}

      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'start' }}>
        <ExposurePanel
          byClass={data.exposureByClass}
          byCurrency={data.exposureByCurrency}
          byVenue={data.exposureByVenue}
        />
        <RiskPanel
          metrics={data.risk}
          concentrationWarning={data.riskConcentrationWarning}
          concentrationSevere={data.riskConcentrationSevere}
        />
        <FiscalPanel rows={data.fiscal} note={data.fiscalNote} month={data.fiscalMonth} />
      </div>

      {data.trades.length > 0 && <TradesTable trades={data.trades} />}
    </div>
  );
}
