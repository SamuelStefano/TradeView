import type { TradeRecord } from '@/lib/data/mock/portfolio';

interface TradesTableProps {
  trades: TradeRecord[];
}

const COL_HEADERS = [
  { label: 'data/hora', align: 'left' },
  { label: 'ativo', align: 'left' },
  { label: 'lado', align: 'left' },
  { label: 'qtd.', align: 'right' },
  { label: 'preço', align: 'right' },
  { label: 'total', align: 'right' },
  { label: 'resultado', align: 'right' },
  { label: 'origem', align: 'right' },
];

function resultTone(result: string): string {
  if (result === '—') return 'text-text-faint';
  if (result.startsWith('+')) return 'text-up';
  return 'text-down';
}

export function TradesTable({ trades }: TradesTableProps) {
  return (
    <section
      aria-label="Histórico de trades"
      className="bg-surface border border-border rounded-lg p-3.5"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="text-text-muted uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          Histórico de trades
        </span>
        <div className="flex gap-1.5 ml-2.5">
          {['Todas as classes', 'Últimos 30 dias', 'Manual + bots'].map((opt) => (
            <select
              key={opt}
              className="bg-inset border border-border-strong rounded text-text-muted cursor-pointer"
              style={{ height: '24px', fontSize: '10.5px', fontFamily: 'inherit', padding: '0 6px' }}
              defaultValue={opt}
              aria-label={opt}
            >
              <option>{opt}</option>
            </select>
          ))}
        </div>
        <div className="flex-1" />
        <button
          type="button"
          className="bg-hover border border-border-strong rounded text-text-secondary cursor-pointer"
          style={{ height: '26px', padding: '0 11px', fontSize: '11px', fontFamily: 'inherit' }}
        >
          Exportar
        </button>
      </div>
      <div className="font-mono tabular-nums overflow-x-auto" style={{ fontSize: '11px' }}>
        <table className="w-full" aria-label="Trades">
          <thead>
            <tr className="border-b border-border">
              {COL_HEADERS.map(({ label, align }) => (
                <th
                  key={label}
                  scope="col"
                  className={`py-1.5 px-2 text-text-faint font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}
                  style={{ fontSize: '10px' }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((h, idx) => (
              <tr key={idx} className="border-b border-divider text-text-secondary">
                <td className="py-1.5 px-2 text-text-faint">{h.datetime}</td>
                <td className="py-1.5 px-2">{h.asset}</td>
                <td
                  className="py-1.5 px-2"
                  style={{ color: h.side === 'COMPRA' ? 'var(--color-up)' : 'var(--color-down)' }}
                >
                  {h.side}
                </td>
                <td className="py-1.5 px-2 text-right">{h.qty}</td>
                <td className="py-1.5 px-2 text-right">{h.price}</td>
                <td className="py-1.5 px-2 text-right">{h.total}</td>
                <td className={`py-1.5 px-2 text-right ${resultTone(h.result)}`}>
                  {h.result}
                </td>
                <td className="py-1.5 px-2 text-right text-text-faint">{h.origin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
