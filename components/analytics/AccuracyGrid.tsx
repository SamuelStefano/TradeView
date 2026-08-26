import type { AccuracyRow } from '@/lib/data/views/analytics';

const HORIZONS = ['1–3 dias', '1–2 sem', '1 mês', '3 meses'];

interface AccuracyGridProps {
  rows: AccuracyRow[];
  modelAccuracy: string;
  signalCount: number;
}

export function AccuracyGrid({ rows, modelAccuracy, signalCount }: AccuracyGridProps) {
  return (
    <section
      aria-label="Acurácia dos sinais"
      className="bg-surface border border-border rounded-lg p-3.5"
    >
      <div
        className="text-text-muted uppercase mb-2.5"
        style={{ fontSize: '11px', letterSpacing: '0.6px' }}
      >
        Acurácia dos sinais da IA
      </div>

      <table className="w-full border-collapse" style={{ fontSize: '10.5px' }}>
        <thead>
          <tr>
            <th scope="col" className="text-left font-normal text-text-faint" style={{ width: '110px', paddingBottom: '6px' }}>
              <span className="sr-only">Classe de ativo</span>
            </th>
            {HORIZONS.map((h) => (
              <th
                key={h}
                scope="col"
                className="text-center font-normal text-text-faint"
                style={{ paddingBottom: '6px' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.cls}>
              <th
                scope="row"
                className="text-left font-normal text-text-secondary py-0.5 pr-2"
              >
                {row.cls}
              </th>
              {row.cells.map((c, ci) => (
                <td key={ci} className="py-0.5 px-0.5">
                  <div
                    className="flex items-center justify-center font-mono tabular-nums text-text rounded"
                    style={{
                      height: '30px',
                      background: `color-mix(in srgb, var(--color-ai) ${Math.round(c.opacityFraction * 100)}%, transparent)`,
                    }}
                  >
                    {c.value}%
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2.5 flex gap-3.5 text-text-faint" style={{ fontSize: '10.5px' }}>
        <span>
          por modelo:{' '}
          <span className="font-mono text-text-secondary">{modelAccuracy}</span>
        </span>
        <span className="ml-auto">n = {signalCount} sinais avaliados</span>
      </div>
    </section>
  );
}
