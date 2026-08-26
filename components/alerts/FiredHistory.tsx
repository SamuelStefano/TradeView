import type { FiredEntry } from '@/lib/data/views/alerts';

interface FiredHistoryProps {
  fired: FiredEntry[];
}

export function FiredHistory({ fired }: FiredHistoryProps) {
  return (
    <section
      aria-label="Histórico de disparos"
      className="bg-surface border border-border rounded-lg p-3.5"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="text-text-muted uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          Histórico de disparos · a IA acertou?
        </span>
        <span className="ml-auto font-mono text-text-muted" style={{ fontSize: '10.5px' }}>
          accuracy 30d:{' '}
          <span className="font-mono text-up">68%</span>
        </span>
      </div>

      <div>
        {fired.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-3 py-1.5 border-b border-divider last:border-b-0"
            style={{ fontSize: '11.5px' }}
          >
            <span
              className="font-mono text-text-faint flex-shrink-0"
              style={{ fontSize: '10.5px', width: '88px' }}
            >
              {f.when}
            </span>
            <span className="flex-1 text-text-secondary">{f.what}</span>
            <span
              className={`font-mono ${f.resultTone === 'up' ? 'text-up' : 'text-down'}`}
              style={{ fontSize: '10.5px' }}
            >
              {f.result}
            </span>
            <span
              className={`font-mono font-bold text-right ${f.verdictTone === 'up' ? 'text-up' : 'text-down'}`}
              style={{ fontSize: '10px', width: '56px' }}
            >
              {f.verdict}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
