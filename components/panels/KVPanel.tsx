import type { KVRow } from '@/lib/types';
import { toneClass } from '@/lib/format';

interface KVPanelProps {
  title: string;
  meta: string;
  rows: KVRow[];
}

export function KVPanel({ title, meta, rows }: KVPanelProps) {
  return (
    <section className="bg-surface border border-border rounded-lg p-3">
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
      <div className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex justify-between gap-2 py-1 border-b border-divider"
            style={{ fontSize: '11.5px' }}
          >
            <span className="text-text-muted">{row.key}</span>
            <span
              className={`font-mono tabular-nums text-right ${row.tone ? toneClass(row.tone) : 'text-text'}`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
