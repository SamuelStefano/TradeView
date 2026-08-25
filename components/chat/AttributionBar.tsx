interface AttributionRow {
  sym: string;
  v: string;
  w: string;
  tone: 'up' | 'down';
  src: string;
}

interface AttributionBarProps {
  rows: AttributionRow[];
}

export function AttributionBar({ rows }: AttributionBarProps) {
  return (
    <div className="my-3 flex flex-col gap-1.5">
      {rows.map((row) => (
        <div key={row.sym} className="flex items-center gap-2.5">
          <span
            className="font-mono text-text-secondary"
            style={{ fontSize: '11.5px', width: '80px' }}
          >
            {row.sym}
          </span>
          <div
            className="flex-1 bg-inset rounded overflow-hidden flex justify-end"
            style={{ height: '14px' }}
          >
            <div
              className={row.tone === 'up' ? 'bg-up' : 'bg-down'}
              style={{ height: '100%', width: row.w }}
            />
          </div>
          <a
            href="#"
            title={row.src}
            className={`font-mono tabular-nums ${row.tone === 'up' ? 'text-up' : 'text-down'} hover:underline`}
            style={{ fontSize: '11.5px', width: '88px', textAlign: 'right' }}
          >
            {row.v}
          </a>
        </div>
      ))}
    </div>
  );
}
