import type { AllocationSlice } from '@/lib/data/views/overview';
import { Donut } from '@/components/charts/Donut';

const LABELS: Record<string, string> = {
  ações: 'Renda variável',
  cripto: 'Cripto',
  'renda fixa': 'Renda fixa',
  energia: 'Energia',
  commodities: 'Commodities',
  câmbio: 'Câmbio + outros',
};

interface AllocationPanelProps {
  allocation: AllocationSlice[];
}

export function AllocationPanel({ allocation }: AllocationPanelProps) {
  const donutSlices = allocation.map((a) => ({
    pct: a.pct,
    color: a.color,
    label: LABELS[a.assetClass] ?? a.assetClass,
  }));

  return (
    <section
      aria-label="Alocação"
      className="bg-surface border border-border rounded-lg"
      style={{ padding: '14px' }}
    >
      <div
        className="text-text-muted font-medium uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.6px', marginBottom: '10px' }}
      >
        Alocação por classe
      </div>
      <div className="flex gap-3.5 items-center">
        <Donut slices={donutSlices} size={96} />
        <div className="flex flex-col gap-1 flex-1">
          {allocation.map((a) => (
            <div key={a.assetClass} className="flex items-center gap-1.5" style={{ fontSize: '11px' }}>
              <span
                className="flex-shrink-0"
                style={{ width: 8, height: 8, borderRadius: 2, background: a.color, display: 'inline-block' }}
                aria-hidden="true"
              />
              <span className="text-text-secondary">{LABELS[a.assetClass] ?? a.assetClass}</span>
              <span className="ml-auto font-mono tabular-nums text-text">{a.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
