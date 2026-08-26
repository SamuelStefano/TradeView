import type { VenueRow } from '@/lib/data/views/markets';
import type { IntegrationStatus } from '@/lib/types';

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  conectado: 'conectado',
  degradado: 'degradado',
  offline: 'offline',
  nao_configurado: 'não configurado',
};

function statusColorClass(status: IntegrationStatus): string {
  switch (status) {
    case 'conectado': return 'text-up';
    case 'degradado': return 'text-warn';
    case 'offline': return 'text-down';
    case 'nao_configurado': return 'text-text-faint';
  }
}

function statusDotClass(status: IntegrationStatus): string {
  switch (status) {
    case 'conectado': return 'bg-up';
    case 'degradado': return 'bg-warn';
    case 'offline': return 'bg-down';
    case 'nao_configurado': return 'bg-text-faint';
  }
}

const LOGO_BG: Record<string, string> = {
  FX: 'bg-warn-bg',
  OK: 'bg-accent-bg',
};

export const VENUE_GRID = '200px 110px 150px 130px 1fr 150px';

interface IntegrationRowProps {
  venue: VenueRow;
}

export function IntegrationRow({ venue: v }: IntegrationRowProps) {
  const { name, kind, logo, site, status, symbolCount, quotedCount, quoteCurrencies } = v;
  const partial = status !== 'offline' && quotedCount < symbolCount;

  return (
    <div
      role="row"
      className="grid items-center border-b border-divider hover:bg-hover transition-colors"
      style={{ gridTemplateColumns: VENUE_GRID, padding: '9px 14px' }}
    >
      <div role="cell" className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center rounded-md font-mono font-bold text-text shrink-0 ${LOGO_BG[logo] ?? 'bg-hover'}`}
          style={{ width: 24, height: 24, fontSize: 9 }}
          aria-hidden="true"
        >
          {logo}
        </div>
        <div>
          <div className="font-semibold text-text" style={{ fontSize: '12.5px' }}>{name}</div>
          <div className="text-text-faint" style={{ fontSize: '9.5px' }}>{kind}</div>
        </div>
      </div>

      <div role="cell" className={`flex items-center gap-1.5 ${statusColorClass(status)}`} style={{ fontSize: '11px' }}>
        <span className={`rounded-full shrink-0 ${statusDotClass(status)}`} style={{ width: 6, height: 6 }} aria-hidden="true" />
        {STATUS_LABEL[status]}
      </div>

      <div role="cell" className="font-mono tabular-nums" style={{ fontSize: '11px' }}>
        <span className={partial ? 'text-warn' : 'text-text-muted'}>
          {quotedCount}/{symbolCount}
        </span>
        <span className="text-text-faint"> cotados</span>
      </div>

      <div role="cell" className="text-text-muted font-mono" style={{ fontSize: '11px' }}>
        {quoteCurrencies.join(' · ')}
      </div>

      <div role="cell" className="pr-4">
        <span
          className="text-text-muted bg-hover border border-border-strong rounded"
          style={{ fontSize: '10px', padding: '3px 8px' }}
        >
          dados públicos · somente leitura
        </span>
        {v.error && (
          <div className="text-down font-mono truncate" style={{ fontSize: '10px', marginTop: 3 }} title={v.error}>
            {v.error}
          </div>
        )}
      </div>

      <div
        role="cell"
        className={`font-mono ${status === 'offline' ? 'text-down' : status === 'degradado' ? 'text-warn' : 'text-text-muted'}`}
        style={{ fontSize: '10.5px' }}
      >
        {v.lastResponseLabel}
        {site && (
          <>
            {' · '}
            <a
              href={site}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent no-underline hover:underline"
            >
              site
            </a>
          </>
        )}
      </div>
    </div>
  );
}
