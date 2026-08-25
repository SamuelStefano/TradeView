import type { HeatmapCell } from '@/lib/data/mock/overview';
import { Heatmap } from '@/components/charts/Heatmap';

const ROW_LABELS: Record<number, string> = {
  0: 'Cripto',
  1: 'Ações BR',
  2: 'Ações US',
  3: 'Renda fixa',
  4: 'Câmbio',
  5: 'Energia',
  6: 'Commodities',
  7: 'Índices',
};

interface HeatmapPanelProps {
  heatmap: HeatmapCell[][];
}

export function HeatmapPanel({ heatmap }: HeatmapPanelProps) {
  const rows = heatmap.map((cells, i) => ({
    label: ROW_LABELS[i] ?? `Linha ${i + 1}`,
    cells,
  }));

  return (
    <section
      aria-label="Heatmap de mercado"
      className="bg-surface border border-border rounded-lg"
      style={{ padding: '14px' }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
        <span
          className="text-text-muted font-medium uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          Heatmap global
        </span>
        <span className="text-text-faint" style={{ fontSize: '10px' }}>
          variação 24h · células = ativos
        </span>
      </div>
      <Heatmap rows={rows} />
    </section>
  );
}
