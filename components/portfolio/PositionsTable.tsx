import type { Position, AssetClass } from '@/lib/types';
import { Num } from '@/components/ui/Num';

const CLASS_LABELS: Record<AssetClass, string> = {
  cripto: 'CRIPTO',
  ações: 'AÇÕES',
  'renda fixa': 'RF',
  câmbio: 'FX',
  energia: 'ENERGIA',
  commodities: 'COMMOD',
  índices: 'ÍNDICES',
  fundos: 'FII',
};

const CLASS_COLORS: Record<AssetClass, { fg: string; bg: string }> = {
  cripto: { fg: 'var(--color-class-cripto)', bg: 'var(--color-class-cripto-bg)' },
  ações: { fg: 'var(--color-class-acoes)', bg: 'var(--color-class-acoes-bg)' },
  'renda fixa': { fg: 'var(--color-class-renda-fixa)', bg: 'var(--color-class-renda-fixa-bg)' },
  câmbio: { fg: 'var(--color-class-cambio)', bg: 'var(--color-class-cambio-bg)' },
  energia: { fg: 'var(--color-class-energia)', bg: 'var(--color-class-energia-bg)' },
  commodities: { fg: 'var(--color-class-commodities)', bg: 'var(--color-class-commodities-bg)' },
  índices: { fg: 'var(--color-class-indices)', bg: 'var(--color-class-indices-bg)' },
  fundos: { fg: 'var(--color-class-fundos)', bg: 'var(--color-class-fundos-bg)' },
};

type PnlTone = 'up' | 'down' | 'neutral';

function pnlTone(pnlStr: string): PnlTone {
  if (pnlStr === '—') return 'neutral';
  if (pnlStr.startsWith('+')) return 'up';
  if (pnlStr.startsWith('−') || pnlStr.startsWith('-')) return 'down';
  return 'neutral';
}

const COL_HEADERS = ['Ativo', 'Qtd.', 'Preço médio', 'Atual', 'P&L aberto', 'P&L realizado', 'Peso'];

interface PositionsTableProps {
  positions: Position[];
}

export function PositionsTable({ positions }: PositionsTableProps) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <table className="w-full" aria-label="Posições">
        <thead>
          <tr className="border-b border-border">
            {COL_HEADERS.map((col, i) => (
              <th
                key={col}
                scope="col"
                className={`py-2 px-3.5 text-text-faint font-medium ${i === 0 ? 'text-left' : 'text-right'}`}
                style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => {
            const cls = CLASS_LABELS[p.assetClass];
            const { fg, bg } = CLASS_COLORS[p.assetClass];
            const openTone = pnlTone(p.pnlOpen);
            const realTone = p.pnlRealized === '—' ? 'neutral' : pnlTone(p.pnlRealized);
            const barWidth = Math.min(p.weightPct * 3.5, 100);

            return (
              <tr
                key={`${p.symbol}-${p.venue}`}
                className="border-b border-divider hover:bg-hover transition-colors"
              >
                <td className="py-2 px-3.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="rounded font-mono font-semibold text-center shrink-0"
                      style={{ fontSize: '9px', color: fg, background: bg, padding: '2px 6px', width: '54px' }}
                    >
                      {cls}
                    </span>
                    <div>
                      <div className="font-mono font-semibold" style={{ fontSize: '12.5px' }}>
                        {p.symbol}
                      </div>
                      <div className="text-text-faint" style={{ fontSize: '9.5px' }}>
                        {p.venue}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-3.5 text-right">
                  <Num value={p.qty} className="text-text-muted text-xs" />
                </td>
                <td className="py-2 px-3.5 text-right">
                  <Num value={p.avgPrice} className="text-xs" />
                </td>
                <td className="py-2 px-3.5 text-right">
                  <Num value={p.currentPrice} className="text-xs" />
                </td>
                <td className="py-2 px-3.5 text-right">
                  <Num
                    value={p.pnlOpen}
                    tone={openTone !== 'neutral' ? openTone : undefined}
                    showArrow={openTone !== 'neutral'}
                    className="text-xs"
                  />
                </td>
                <td className="py-2 px-3.5 text-right">
                  {p.pnlRealized === '—' ? (
                    <span className="font-mono tabular-nums text-text-faint block text-right text-xs">—</span>
                  ) : (
                    <Num
                      value={p.pnlRealized}
                      tone={realTone !== 'neutral' ? realTone : undefined}
                      showArrow={realTone !== 'neutral'}
                      className="text-xs"
                    />
                  )}
                </td>
                <td className="py-2 px-3.5">
                  <div className="flex items-center gap-1.5 justify-end">
                    <div
                      className="bg-border rounded-sm overflow-hidden shrink-0"
                      style={{ width: '36px', height: '4px' }}
                      role="img"
                      aria-label={`Peso ${p.weightPct}%`}
                    >
                      <div
                        className="h-full bg-accent rounded-sm"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span
                      className="font-mono tabular-nums text-text-muted text-right"
                      style={{ fontSize: '10.5px', minWidth: '36px' }}
                    >
                      {p.weightPct}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
