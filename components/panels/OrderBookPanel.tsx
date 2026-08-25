import type { BookLevel } from '@/lib/types';

interface OrderBookPanelProps {
  title: string;
  meta: string;
  mid: string;
  spread: string;
  asks: BookLevel[];
  bids: BookLevel[];
}

export function OrderBookPanel({ title, meta, mid, spread, asks, bids }: OrderBookPanelProps) {
  return (
    <section aria-label={title} className="bg-surface border border-border rounded-lg p-3">
      <div className="flex items-center mb-2">
        <span
          className="text-text-muted font-medium"
          style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}
        >
          {title}
        </span>
        <span className="ml-auto font-mono text-text-faint" style={{ fontSize: '9.5px' }}>
          {meta}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 font-mono tabular-nums" style={{ fontSize: '10.5px' }}>
        {asks.map((level, i) => (
          <div key={i} className="flex relative py-0.5 px-1" aria-label={`venda ${level.price}, quantidade ${level.qty}`}>
            <div
              aria-hidden="true"
              className="absolute right-0 top-0 bottom-0 bg-down/10"
              style={{ width: `${level.depthPct}%` }}
            />
            <span className="text-down z-10">{level.price}</span>
            <span className="ml-auto text-text-muted z-10">{level.qty}</span>
          </div>
        ))}
        <div className="flex justify-between py-1 px-1 border-t border-b border-border">
          <span className="text-text font-semibold">{mid}</span>
          <span className="text-text-faint">spread {spread}</span>
        </div>
        {bids.map((level, i) => (
          <div key={i} className="flex relative py-0.5 px-1" aria-label={`compra ${level.price}, quantidade ${level.qty}`}>
            <div
              aria-hidden="true"
              className="absolute right-0 top-0 bottom-0 bg-up/10"
              style={{ width: `${level.depthPct}%` }}
            />
            <span className="text-up z-10">{level.price}</span>
            <span className="ml-auto text-text-muted z-10">{level.qty}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
