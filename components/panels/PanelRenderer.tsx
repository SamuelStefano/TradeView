import type { Panel } from '@/lib/types';
import { KVPanel } from './KVPanel';
import { OrderBookPanel } from './OrderBookPanel';
import { CurvePanel } from './CurvePanel';

interface PanelRendererProps {
  panels: Panel[];
}

export function PanelRenderer({ panels }: PanelRendererProps) {
  return (
    <aside aria-label="Painéis da classe" className="flex flex-col gap-2.5">
      {panels.map((panel, i) => {
        if (panel.kind === 'kv') {
          return (
            <KVPanel
              key={i}
              title={panel.title}
              meta={panel.meta}
              rows={panel.rows}
            />
          );
        }
        if (panel.kind === 'book') {
          return (
            <OrderBookPanel
              key={i}
              title={panel.title}
              meta={panel.meta}
              mid={panel.mid}
              spread={panel.spread}
              asks={panel.asks}
              bids={panel.bids}
            />
          );
        }
        if (panel.kind === 'curve') {
          return (
            <CurvePanel
              key={i}
              title={panel.title}
              meta={panel.meta}
              alt={panel.alt}
              legend={panel.legend}
              labels={panel.labels}
              series={panel.series}
              series2={panel.series2}
            />
          );
        }
        return null;
      })}
    </aside>
  );
}
