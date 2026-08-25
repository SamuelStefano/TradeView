'use client';

import { useState } from 'react';
import type { ExposureRow } from '@/lib/data/mock/portfolio';

type ExpTab = 'classe' | 'moeda' | 'setor' | 'país';

const TAB_LABELS: { id: ExpTab; label: string }[] = [
  { id: 'classe', label: 'Classe' },
  { id: 'moeda', label: 'Moeda' },
  { id: 'setor', label: 'Setor' },
  { id: 'país', label: 'País' },
];

interface ExposurePanelProps {
  byClass: ExposureRow[];
  byCurrency: ExposureRow[];
  byVenue: ExposureRow[];
  byCountry: ExposureRow[];
}

export function ExposurePanel({ byClass, byCurrency, byVenue, byCountry }: ExposurePanelProps) {
  const [active, setActive] = useState<ExpTab>('classe');

  const dataMap: Record<ExpTab, ExposureRow[]> = {
    classe: byClass,
    moeda: byCurrency,
    setor: byVenue,
    'país': byCountry,
  };

  const rows = dataMap[active];

  return (
    <section
      className="bg-surface border border-border rounded-lg p-3.5"
      aria-label="Exposição do portfólio"
    >
      <div
        role="tablist"
        aria-label="Dimensão de exposição"
        className="flex gap-0.5 mb-2.5"
      >
        {TAB_LABELS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(id)}
              className="cursor-pointer rounded border-none px-2.5 transition-colors"
              style={{
                height: '24px',
                fontSize: '11px',
                fontFamily: 'inherit',
                background: isActive ? '#1C2333' : 'transparent',
                color: isActive ? '#E8ECF4' : '#5A6478',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2.5">
            <span className="text-text-secondary shrink-0" style={{ fontSize: '11.5px', width: '110px' }}>
              {row.label}
            </span>
            <div
              className="flex-1 rounded overflow-hidden"
              style={{ height: '12px', background: '#0D1017' }}
              role="img"
              aria-label={`${row.label}: ${row.pct}%`}
            >
              <div
                className="h-full rounded"
                style={{ width: `${row.pct}%`, background: row.color }}
              />
            </div>
            <span
              className="font-mono tabular-nums text-right shrink-0"
              style={{ fontSize: '11px', width: '44px' }}
            >
              {row.pct}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
