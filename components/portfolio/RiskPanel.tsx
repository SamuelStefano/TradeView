import type { RiskMetric } from '@/lib/data/mock/portfolio';
import { SourceRef } from '@/components/ui/SourceRef';

interface RiskPanelProps {
  metrics: RiskMetric[];
  concentrationWarning: string;
}

const TONE_CLASSES: Record<'up' | 'down' | 'neutral', string> = {
  up: 'text-up',
  down: 'text-down',
  neutral: 'text-text',
};

export function RiskPanel({ metrics, concentrationWarning }: RiskPanelProps) {
  return (
    <section
      aria-label="Risco do portfólio"
      className="bg-surface border border-border rounded-lg p-3.5"
    >
      <div
        className="text-text-muted uppercase mb-2.5"
        style={{ fontSize: '11px', letterSpacing: '0.6px' }}
      >
        Risco do portfólio
      </div>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-inset border border-border rounded-md px-2.5 py-2"
          >
            <div className="text-text-faint" style={{ fontSize: '9.5px' }}>
              {m.label}
            </div>
            <div
              className={`font-mono tabular-nums font-semibold text-right ${TONE_CLASSES[m.tone]}`}
              style={{ fontSize: '14px' }}
            >
              {m.value}
            </div>
            <div className="text-text-faint text-right" style={{ fontSize: '9px' }}>
              {m.meta}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-2.5 rounded-md px-3 py-2 text-warn border border-warn-border bg-warn-bg"
        style={{ fontSize: '11px', lineHeight: '1.5' }}
      >
        <span>⚠ {concentrationWarning}</span>
        {' '}
        <SourceRef source="decomposição de fatores de risco do portfólio" className="text-warn">
          ver decomposição
        </SourceRef>
      </div>
    </section>
  );
}
