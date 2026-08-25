'use client';

import { useState, useMemo } from 'react';
import type { MarketsData } from '@/lib/data/mock/markets';
import { IntegrationRow } from './IntegrationRow';
import { ConnectFlowModal } from './ConnectFlowModal';

interface MarketsClientProps {
  data: MarketsData;
}

export function MarketsClient({ data }: MarketsClientProps) {
  const [flowOpen, setFlowOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.toLowerCase().trim();
    if (!q) return data.integrations;
    return data.integrations.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.kind.toLowerCase().includes(q) ||
        r.credentialKind.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q),
    );
  }, [data.integrations, filter]);

  const { connectedCount, degradedCount, offlineCount, unconfiguredCount } = data;

  return (
    <div className="p-4 flex flex-col gap-3" style={{ fontSize: '13px' }}>
      <div className="flex items-center gap-3">
        <h1 className="m-0 font-bold text-text" style={{ fontSize: '16px' }}>
          Mercados &amp; integrações
        </h1>
        <div className="flex gap-2.5 font-mono text-text-muted" style={{ fontSize: '11px' }}>
          <span>
            <span className="text-up">●</span> {connectedCount} conectadas
          </span>
          <span>
            <span className="text-warn">●</span> {degradedCount} degradadas
          </span>
          <span>
            <span className="text-down">●</span> {offlineCount} offline
          </span>
          <span>
            <span className="text-text-faint">●</span> {unconfiguredCount} não configuradas
          </span>
        </div>
        <div className="flex-1" />
        <input
          type="search"
          placeholder="Filtrar integrações…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-surface border border-border-strong rounded-md text-text font-sans outline-none focus-visible:border-accent-border"
          style={{ height: 30, width: 220, padding: '0 10px', fontSize: '12px' }}
          aria-label="Filtrar integrações"
        />
        <button
          onClick={() => setFlowOpen(true)}
          className="bg-accent-bg border border-accent-border rounded-md text-accent-hover font-semibold cursor-pointer font-sans hover:border-accent transition-colors"
          style={{ height: 30, padding: '0 14px', fontSize: '12px' }}
        >
          + Conectar integração
        </button>
      </div>

      <div
        role="table"
        aria-label="Integrações"
        className="bg-surface border border-border rounded-lg overflow-hidden"
      >
        <div
          role="row"
          className="grid border-b border-border text-text-faint uppercase"
          style={{
            gridTemplateColumns: '200px 110px 130px 150px 1fr 130px 110px',
            padding: '8px 14px',
            fontSize: '10px',
            letterSpacing: '0.5px',
          }}
        >
          <div role="columnheader">Provedor</div>
          <div role="columnheader">Status</div>
          <div role="columnheader">Credencial</div>
          <div role="columnheader">Permissões</div>
          <div role="columnheader">Rate limit</div>
          <div role="columnheader">Última resposta</div>
          <div role="columnheader" className="text-right">Ações</div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-text-faint" style={{ fontSize: '12px' }}>
            Nenhuma integração encontrada.
          </div>
        ) : (
          filtered.map((r) => (
            <IntegrationRow key={r.id} integration={r} />
          ))
        )}

        <div className="text-text-faint" style={{ padding: '9px 14px', fontSize: '10.5px' }}>
          mostrando {filtered.length} de {data.totalCount} · <a href="#">ver todas</a> · chaves nunca são exibidas por completo
        </div>
      </div>

      {data.rateLimitBanner && (
        <RateLimitBanner banner={data.rateLimitBanner} />
      )}

      <ConnectFlowModal open={flowOpen} onClose={() => setFlowOpen(false)} />
    </div>
  );
}

function RateLimitBanner({ banner }: { banner: { provider: string; cachedSince: string; renewsIn: string; fallbackLabel: string } }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 bg-warn-bg border border-warn-border rounded-lg"
      style={{ padding: '10px 14px' }}
    >
      <span className="text-warn">◉</span>
      <div className="flex-1 text-warn" style={{ fontSize: '12px' }}>
        Rate limit da {banner.provider} atingido — dados de ações US em cache desde{' '}
        <span className="font-mono">{banner.cachedSince}</span>. Renova em{' '}
        <span className="font-mono">{banner.renewsIn}</span>.
      </div>
      <button
        className="bg-warn-border border border-warn-border rounded text-warn cursor-pointer font-sans hover:bg-warn-bg transition-colors"
        style={{ height: 26, padding: '0 12px', fontSize: '11px' }}
      >
        {banner.fallbackLabel}
      </button>
    </div>
  );
}
