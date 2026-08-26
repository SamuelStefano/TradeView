'use client';

import { useState, useMemo } from 'react';
import type { MarketsData } from '@/lib/data/views/markets';
import { IntegrationRow, VENUE_GRID } from './IntegrationRow';

interface MarketsClientProps {
  data: MarketsData;
}

export function MarketsClient({ data }: MarketsClientProps) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.toLowerCase().trim();
    if (!q) return data.venues;
    return data.venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.kind.toLowerCase().includes(q) ||
        v.status.toLowerCase().includes(q) ||
        v.quoteCurrencies.some((c) => c.toLowerCase().includes(q)),
    );
  }, [data.venues, filter]);

  const { connectedCount, degradedCount, offlineCount } = data;

  return (
    <div className="p-4 flex flex-col gap-3" style={{ fontSize: '13px' }}>
      <div className="flex items-center gap-3">
        <h1 className="m-0 font-bold text-text" style={{ fontSize: '16px' }}>
          Mercados conectados
        </h1>
        <div className="flex gap-2.5 font-mono text-text-muted" style={{ fontSize: '11px' }}>
          <span>
            <span className="text-up">●</span> {connectedCount} conectadas
          </span>
          {degradedCount > 0 && (
            <span>
              <span className="text-warn">●</span> {degradedCount} degradadas
            </span>
          )}
          {offlineCount > 0 && (
            <span>
              <span className="text-down">●</span> {offlineCount} offline
            </span>
          )}
          {data.medianLatencyMs !== null && (
            <span className="text-text-faint">mediana {data.medianLatencyMs} ms</span>
          )}
        </div>
        <div className="flex-1" />
        <input
          type="search"
          placeholder="Filtrar venues…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-surface border border-border-strong rounded-md text-text font-sans outline-none focus-visible:border-accent-border"
          style={{ height: 30, width: 220, padding: '0 10px', fontSize: '12px' }}
          aria-label="Filtrar venues"
        />
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div role="table" aria-label="Venues">
          <div
            role="row"
            className="grid border-b border-border text-text-faint uppercase"
            style={{
              gridTemplateColumns: VENUE_GRID,
              padding: '8px 14px',
              fontSize: '10px',
              letterSpacing: '0.5px',
            }}
          >
            <div role="columnheader">Venue</div>
            <div role="columnheader">Status</div>
            <div role="columnheader">Símbolos</div>
            <div role="columnheader">Moedas</div>
            <div role="columnheader">Acesso</div>
            <div role="columnheader">Última resposta</div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-8 text-center text-text-faint" style={{ fontSize: '12px' }}>
              Nenhuma venue encontrada.
            </div>
          ) : (
            filtered.map((v) => <IntegrationRow key={v.id} venue={v} />)
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
        </div>
      </div>

      <p className="m-0 text-text-faint" style={{ fontSize: '11px', lineHeight: 1.6 }}>
        Status e latência são medidos nas requisições que esta sessão realmente fez — não há ping
        sintético. Nenhuma credencial de corretora está conectada: só se lê dado público de mercado,
        e as ordens são executadas em modo papel contra o book ao vivo. Ações, renda fixa, energia e
        commodities ainda não têm fonte ligada e por isso não aparecem aqui.
      </p>
    </div>
  );
}
