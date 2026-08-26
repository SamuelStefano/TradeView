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

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div role="table" aria-label="Integrações">
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
        </div>

        <div className="text-text-faint" style={{ padding: '9px 14px', fontSize: '10.5px' }}>
          mostrando {filtered.length} de {data.totalCount}
          {filter.trim() && (
            <>
              {' · '}
              <button
                onClick={() => setFilter('')}
                className="bg-transparent border-none p-0 text-accent underline cursor-pointer font-sans"
                style={{ fontSize: '10.5px' }}
              >
                ver todas
              </button>
            </>
          )}
          {' · '}chaves nunca são exibidas por completo
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
  const [onFallback, setOnFallback] = useState(false);

  const tone = onFallback
    ? { bg: 'bg-accent-bg', border: 'border-accent-border', text: 'text-accent-hover', hover: 'hover:bg-accent-border' }
    : { bg: 'bg-warn-bg', border: 'border-warn-border', text: 'text-warn', hover: 'hover:bg-warn-border' };

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 ${tone.bg} border ${tone.border} rounded-lg`}
      style={{ padding: '10px 14px' }}
    >
      <span className={tone.text}>◉</span>
      <div className={`flex-1 ${tone.text}`} style={{ fontSize: '12px' }}>
        {onFallback ? (
          <>
            Ações US servidas pelo fallback IEX — dados ao vivo, cobertura menor que a{' '}
            {banner.provider}. Volta sozinho quando a cota renovar em{' '}
            <span className="font-mono">{banner.renewsIn}</span>.
          </>
        ) : (
          <>
            Rate limit da {banner.provider} atingido — dados de ações US em cache desde{' '}
            <span className="font-mono">{banner.cachedSince}</span>. Renova em{' '}
            <span className="font-mono">{banner.renewsIn}</span>.
          </>
        )}
      </div>
      <button
        onClick={() => setOnFallback((v) => !v)}
        aria-pressed={onFallback}
        className={`${tone.bg} border ${tone.border} rounded ${tone.text} cursor-pointer font-sans ${tone.hover} transition-colors`}
        style={{ height: 26, padding: '0 12px', fontSize: '11px' }}
      >
        {onFallback ? 'Voltar para o cache' : banner.fallbackLabel}
      </button>
    </div>
  );
}
