import type { HeatmapRow } from '@/lib/data/views/overview';
import { Heatmap } from '@/components/charts/Heatmap';

interface HeatmapPanelProps {
  heatmap: HeatmapRow[];
}

export function HeatmapPanel({ heatmap }: HeatmapPanelProps) {
  const total = heatmap.reduce((s, r) => s + r.cells.length, 0);

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
          Variação 24h por venue
        </span>
        <span className="ml-auto font-mono text-text-faint" style={{ fontSize: '10px' }}>
          {total} ativos
        </span>
      </div>
      {heatmap.length === 0 ? (
        <p className="text-text-muted m-0" style={{ fontSize: '11.5px' }}>
          Nenhuma venue respondeu cotação agora.
        </p>
      ) : (
        <Heatmap rows={heatmap} />
      )}
    </section>
  );
}
