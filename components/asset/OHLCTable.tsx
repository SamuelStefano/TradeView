import type { Candle } from '@/lib/types';

interface OHLCTableProps {
  candles: Candle[];
}

export function OHLCTable({ candles }: OHLCTableProps) {
  const rows = candles.slice(-14).reverse().map((c, i) => {
    const isUp = c.close >= c.open;
    return {
      t: `${String(13 - i).padStart(2, '0')}:00`,
      o: c.open.toFixed(2),
      h: c.high.toFixed(2),
      l: c.low.toFixed(2),
      c: c.close.toFixed(2),
      col: isUp ? 'var(--color-up)' : 'var(--color-down)',
      v: (c.volume * 1000).toFixed(0),
    };
  });

  return (
    <div role="table" aria-label="OHLC em tabela" style={{ maxHeight: '300px', overflowY: 'auto' }}>
      <div
        role="rowgroup"
        className="font-mono tabular-nums"
        style={{
          display: 'grid',
          gridTemplateColumns: '70px repeat(5, 1fr)',
          fontSize: '11px',
        }}
      >
        <div role="columnheader" className="text-text-faint px-1.5 py-1">hora</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">abert.</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">máx.</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">mín.</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">fech.</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">volume</div>
        {rows.map((row, i) => (
          <div key={i} role="row" style={{ display: 'contents' }}>
            <div role="cell" className="px-1.5 py-1 text-text-muted border-t border-divider">{row.t}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider">{row.o}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider">{row.h}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider">{row.l}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider" style={{ color: row.col }}>{row.c}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider text-text-muted">{row.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
