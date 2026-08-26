import type { HeatmapCell } from '@/lib/data/mock/overview';

interface HeatmapRow {
  label: string;
  cells: HeatmapCell[];
}

interface HeatmapProps {
  rows: HeatmapRow[];
}

function cellStyle(changePct: number): { background: string; color: string } {
  const abs = Math.abs(changePct);
  const t = Math.min(abs / 4, 1);
  const pct = Math.round((0.12 + t * 0.44) * 100);
  const tint = changePct >= 0 ? 'var(--color-up)' : 'var(--color-down)';
  return {
    background: `color-mix(in srgb, ${tint} ${pct}%, var(--color-base))`,
    color: 'var(--color-text)',
  };
}

function formatChg(changePct: number): string {
  const sign = changePct > 0 ? '+' : '';
  return `${sign}${changePct.toFixed(1).replace('.', ',')}%`;
}

export function Heatmap({ rows }: HeatmapProps) {
  return (
    <div role="table" aria-label="Variação por mercado" className="flex flex-col gap-1.5">
      {rows.map((row) => (
        <div key={row.label} role="row" className="flex gap-1.5 items-center">
          <span
            role="rowheader"
            className="flex-shrink-0 text-text-muted"
            style={{ width: 88, fontSize: '10.5px' }}
          >
            {row.label}
          </span>
          {row.cells.map((cell) => {
            const styles = cellStyle(cell.changePct);
            return (
              <div
                key={cell.symbol}
                title={`${cell.symbol} ${formatChg(cell.changePct)}`}
                className="@container flex-1 rounded flex items-center justify-start @min-[44px]:justify-center gap-0.5 cursor-default min-w-0 overflow-hidden px-px"
                style={{ height: 26, background: styles.background }}
                role="cell"
                aria-label={`${cell.symbol} ${formatChg(cell.changePct)}`}
              >
                <span
                  className="font-semibold shrink-0 whitespace-nowrap"
                  style={{ fontSize: '9px', color: styles.color }}
                >
                  {cell.symbol}
                </span>
                <span
                  className="font-mono tabular-nums shrink-0 whitespace-nowrap hidden @min-[44px]:inline"
                  style={{ fontSize: '9px', color: styles.color }}
                >
                  {formatChg(cell.changePct)}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
