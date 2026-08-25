import type { WatchlistItem } from '@/lib/data/mock/overview';
import { Sparkline } from '@/components/ui/Sparkline';
import { toneOf } from '@/lib/format';

interface WatchlistPanelProps {
  watchlist: WatchlistItem[];
}

export function WatchlistPanel({ watchlist }: WatchlistPanelProps) {
  return (
    <section
      aria-label="Watchlist"
      className="bg-surface border border-border rounded-lg flex flex-col gap-0.5"
      style={{ padding: '14px' }}
    >
      <div className="flex items-center" style={{ marginBottom: '8px' }}>
        <span
          className="text-text-muted font-medium uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          Watchlist
        </span>
        <span className="ml-auto font-mono text-text-faint" style={{ fontSize: '10px' }}>
          {watchlist.length} ativos
        </span>
      </div>
      {watchlist.map((item) => {
        const tone = toneOf(item.changePct);
        const colorClass = tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-text-secondary';
        const arrowChar = tone === 'up' ? '▲' : tone === 'down' ? '▼' : '■';
        const chgStr = `${item.changePct > 0 ? '+' : ''}${Math.abs(item.changePct).toFixed(2).replace('.', ',')}%`;
        const isDelayed = item.freshness.kind === 'delayed';
        const isClosed = item.freshness.kind === 'closed';

        return (
          <div
            key={item.symbol}
            className="flex items-center gap-2 border-b border-divider"
            style={{ padding: '6px 4px' }}
          >
            <div className="min-w-0 flex-1">
              <div className="text-text font-semibold" style={{ fontSize: '12px' }}>
                {item.symbol}
              </div>
              <div
                className="text-text-faint flex gap-1.5 items-center"
                style={{ fontSize: '9.5px' }}
              >
                {item.name}
                {isDelayed && (
                  <span
                    className="text-warn border border-warn-border rounded"
                    style={{ padding: '0 4px', fontSize: '8.5px' }}
                  >
                    atrasado 15min
                  </span>
                )}
                {isClosed && (
                  <span
                    className="text-text-muted border border-border-strong rounded"
                    style={{ padding: '0 4px', fontSize: '8.5px' }}
                  >
                    fechado
                  </span>
                )}
              </div>
            </div>
            <Sparkline
              data={item.spark}
              width={56}
              height={20}
              positive={tone === 'up'}
              label={`Gráfico de preço ${item.symbol}`}
            />
            <div className="text-right flex-shrink-0" style={{ width: 88 }}>
              <div className="font-mono tabular-nums text-text" style={{ fontSize: '12px' }}>
                {item.price}
              </div>
              <div
                className={`font-mono tabular-nums ${colorClass}`}
                style={{ fontSize: '10.5px' }}
              >
                {arrowChar} {chgStr}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
