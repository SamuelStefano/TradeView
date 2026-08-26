import type { FiscalRow } from '@/lib/data/views/portfolio';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';

interface FiscalPanelProps {
  rows: FiscalRow[];
  note: string;
  month: string;
}

const TONE_CLASSES: Record<'up' | 'down' | 'neutral', string> = {
  up: 'text-up',
  down: 'text-down',
  neutral: 'text-text-muted',
};

export function FiscalPanel({ rows, note, month }: FiscalPanelProps) {
  return (
    <section aria-label="Fiscal" className="bg-surface border border-border rounded-lg p-3.5">
      <div className="flex items-baseline gap-2 mb-2.5">
        <span
          className="text-text-muted uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          Fiscal · {month}
        </span>
        <span className="text-text-faint" style={{ fontSize: '9.5px' }}>
          apurado do ledger
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-text-faint m-0" style={{ fontSize: '11.5px', lineHeight: 1.5 }}>
          Nenhuma operação registrada.
        </p>
      ) : (
        <div className="flex flex-col">
          {rows.map((f) => (
            <div
              key={f.label}
              className="flex justify-between border-b border-divider"
              style={{ padding: '5px 0', fontSize: '11.5px' }}
            >
              <span className="text-text-muted">{f.label}</span>
              <span className={`font-mono tabular-nums ${TONE_CLASSES[f.tone]}`}>{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {note && (
        <p
          className="mt-2.5 text-text-faint m-0 bg-inset border border-border rounded-md px-3 py-2"
          style={{ fontSize: '10.5px', lineHeight: 1.55 }}
        >
          {note}
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-2.5 flex justify-end">
          <ExportCsvButton
            headers={['linha', 'valor']}
            rows={rows.map((f) => [f.label, f.value])}
            filename="tradeview-apuracao"
            label="Exportar apuração"
            style={{ height: '26px', padding: '0 11px', fontSize: '11px', fontFamily: 'inherit' }}
          />
        </div>
      )}
    </section>
  );
}
