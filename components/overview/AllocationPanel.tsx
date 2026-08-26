import type { AllocationSlice } from '@/lib/data/views/overview';
import { Donut } from '@/components/charts/Donut';

interface AllocationPanelProps {
  allocation: AllocationSlice[];
}

export function AllocationPanel({ allocation }: AllocationPanelProps) {
  const donutSlices = allocation.map((a) => ({ pct: a.pct, color: a.color, label: a.label }));

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
      {allocation.length === 0 ? (
        <p className="text-text-muted m-0" style={{ fontSize: '11.5px' }}>
          Sem posições para alocar.
        </p>
      ) : (
      <div className="flex gap-3.5 items-center">
        <Donut slices={donutSlices} size={96} />
        <div className="flex flex-col gap-1 flex-1">
          {allocation.map((a) => (
            <div key={a.label} className="flex items-center gap-1.5" style={{ fontSize: '11px' }}>
              <span
                className="flex-shrink-0"
                style={{ width: 8, height: 8, borderRadius: 2, background: a.color, display: 'inline-block' }}
                aria-hidden="true"
              />
              <span className="text-text-secondary">{a.label}</span>
              <span className="ml-auto font-mono tabular-nums text-text">{a.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}
