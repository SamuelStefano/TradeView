import Link from 'next/link';
import type { MarketIntegration } from '@/lib/data/mock/markets';
import type { IntegrationStatus } from '@/lib/types';
import { Bar } from '@/components/ui/Bar';

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

function rateLimitColorClass(pct: number): string {
  if (pct > 85) return 'text-down';
  if (pct > 60) return 'text-warn';
  return 'text-accent';
}

function rateLimitVariant(pct: number): 'down' | 'warn' | 'accent' {
  if (pct > 85) return 'down';
  if (pct > 60) return 'warn';
  return 'accent';
}

function lastResponseColorClass(status: IntegrationStatus): string {
  switch (status) {
    case 'offline': return 'text-down';
    case 'degradado': return 'text-warn';
    default: return 'text-text-muted';
  }
}

const LOGO_BG: Record<string, string> = {
  BN: 'bg-warn-bg',
  B3: 'bg-accent-bg',
  TD: 'bg-up-bg',
  CB: 'bg-accent-bg',
  IB: 'bg-down-strong',
  AV: 'bg-hover',
  CC: 'bg-warn-bg',
  EN: 'bg-hover',
  EI: 'bg-hover',
  KR: 'bg-ai-bg',
  GN: 'bg-up-bg',
  CF: 'bg-hover',
  MT: 'bg-hover',
};

interface IntegrationRowProps {
  integration: MarketIntegration;
}

export function IntegrationRow({ integration: r }: IntegrationRowProps) {
  const { name, kind, logo, status, credentialKind, canTrade, rateLimitPct, lastResponseLabel } = r;
  const hasNoCredential = credentialKind === '—';
  const isUnconfigured = status === 'nao_configurado';
  const rlPct = rateLimitPct < 0 ? 0 : rateLimitPct;
  const rlText = rateLimitPct < 0 ? '—' : `${rateLimitPct}%`;

  return (
    <div
      role="row"
      className={`grid items-center border-b border-divider hover:bg-hover transition-colors ${canTrade ? 'bg-down/[0.025]' : ''}`}
      style={{ gridTemplateColumns: '200px 110px 130px 150px 1fr 130px 110px', padding: '9px 14px' }}
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

      <div role="cell" className="text-text-muted font-mono" style={{ fontSize: '11px' }}>
        {credentialKind}
      </div>

      <div role="cell">
        {canTrade && (
          <span
            className="inline-flex items-center gap-1 font-bold text-down bg-down-bg border border-danger-border rounded"
            style={{ fontSize: '10px', letterSpacing: '0.5px', padding: '3px 8px' }}
          >
            ⚠ ORDEM + LEITURA
          </span>
        )}
        {!canTrade && !hasNoCredential && (
          <span
            className="text-text-muted bg-hover border border-border-strong rounded"
            style={{ fontSize: '10px', padding: '3px 8px' }}
          >
            somente leitura
          </span>
        )}
        {hasNoCredential && (
          <span className="text-text-faint" style={{ fontSize: '10px' }}>—</span>
        )}
      </div>

      <div role="cell" className="flex items-center gap-2 pr-4">
        {!isUnconfigured ? (
          <>
            <Bar
              value={rlPct}
              variant={rateLimitVariant(rlPct)}
              height={5}
              label={`rate limit ${rlPct}% consumido`}
              className="flex-1 max-w-[120px]"
            />
            <span
              className={`font-mono tabular-nums ${rateLimitColorClass(rlPct)}`}
              style={{ fontSize: '10.5px', width: 34, textAlign: 'right' }}
            >
              {rlText}
            </span>
          </>
        ) : (
          <span className="text-text-faint font-mono" style={{ fontSize: '10.5px' }}>—</span>
        )}
      </div>

      <div role="cell" className={`font-mono ${lastResponseColorClass(status)}`} style={{ fontSize: '10.5px' }}>
        {lastResponseLabel}
      </div>

      <div role="cell" className="text-right">
        <Link
          href="/settings"
          aria-label={`${isUnconfigured ? 'Configurar' : 'Gerenciar'} ${name}`}
          className="inline-flex items-center bg-hover border border-border-strong rounded text-text-muted cursor-pointer font-sans hover:text-text-secondary transition-colors no-underline"
          style={{ height: 24, padding: '0 10px', fontSize: '10.5px' }}
        >
          {isUnconfigured ? 'Configurar' : 'Gerenciar'}
        </Link>
      </div>
    </div>
  );
}
