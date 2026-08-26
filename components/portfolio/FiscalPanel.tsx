import type { FiscalRow } from '@/lib/data/mock/portfolio';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';

interface FiscalPanelProps {
  rows: FiscalRow[];
  darfAmount: string;
  darfDue: string;
}

const TONE_CLASSES: Record<'up' | 'down' | 'neutral', string> = {
  up: 'text-up',
  down: 'text-down',
  neutral: 'text-text-muted',
};

export function FiscalPanel({ rows, darfAmount, darfDue }: FiscalPanelProps) {
  return (
    <section
      aria-label="Fiscal"
      className="bg-surface border border-border rounded-lg p-3.5"
    >
      <div className="flex items-baseline gap-2 mb-2.5">
        <span
          className="text-text-muted uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          Fiscal · agosto/2026
        </span>
        <span className="text-text-faint" style={{ fontSize: '9.5px' }}>
          regime BR · estimativa
        </span>
      </div>
      <div className="flex flex-col">
        {rows.map((f) => (
          <div
            key={f.label}
            className="flex justify-between border-b border-divider"
            style={{ padding: '5px 0', fontSize: '11.5px' }}
          >
            <span className="text-text-muted">{f.label}</span>
            <span className={`font-mono tabular-nums ${TONE_CLASSES[f.tone]}`}>
              {f.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-2.5 bg-inset border border-border rounded-md px-3 py-2.5">
        <div className="flex-1">
          <div className="text-text-faint" style={{ fontSize: '10px' }}>
            DARF estimado (vence {darfDue})
          </div>
          <div className="font-mono tabular-nums font-bold" style={{ fontSize: '15px' }}>
            {darfAmount}
          </div>
        </div>
        <ExportCsvButton
          headers={['linha', 'valor']}
          rows={[
            ...rows.map((f) => [f.label, f.value]),
            ['DARF estimado', darfAmount],
            ['vencimento', darfDue],
          ]}
          filename="tradeview-memoria-de-calculo"
          label="Gerar memória de cálculo"
          style={{ height: '26px', padding: '0 11px', fontSize: '11px', fontFamily: 'inherit' }}
        />
      </div>
    </section>
  );
}
