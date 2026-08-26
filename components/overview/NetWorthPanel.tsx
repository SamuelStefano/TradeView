import type { NetWorth, PnlCard } from '@/lib/data/views/overview';
import { toneOf } from '@/lib/format';

interface NetWorthPanelProps {
  netWorth: NetWorth;
  pnlCards: PnlCard[];
}

export function NetWorthPanel({ netWorth, pnlCards }: NetWorthPanelProps) {
  return (
    <section
      aria-label="Patrimônio consolidado"
      className="bg-surface border border-border rounded-lg"
      style={{ padding: '14px' }}
    >
      <div
        className="text-text-muted font-medium uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.6px', marginBottom: '8px' }}
      >
        Patrimônio consolidado
      </div>
      <div
        className="font-mono tabular-nums font-semibold"
        style={{ fontSize: '24px' }}
      >
        {netWorth.brl}
      </div>
      <div
        className="font-mono tabular-nums text-text-muted"
        style={{ fontSize: '12px', marginTop: '2px' }}
      >
        {netWorth.usd}{' '}
        <span className="text-text-faint">@ {netWorth.fxRate}</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5" style={{ marginTop: '12px' }}>
        {pnlCards.map((card) => {
          const tone = toneOf(card.pct);
          const colorClass = tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-text-secondary';
          const arrowChar = tone === 'up' ? '▲' : tone === 'down' ? '▼' : '■';
          const pctStr = `${card.pct > 0 ? '+' : ''}${card.pct.toFixed(2).replace('.', ',')}%`;
          return (
            <div
              key={card.label}
              className="bg-inset border border-border rounded"
              style={{ padding: '7px 9px' }}
            >
              <div className="text-text-faint" style={{ fontSize: '10px' }}>
                {card.label}
              </div>
              <div
                className={`font-mono tabular-nums font-semibold text-right ${colorClass}`}
                style={{ fontSize: '12.5px' }}
              >
                {arrowChar} {card.value}
              </div>
              <div
                className={`font-mono tabular-nums text-right ${colorClass}`}
                style={{ fontSize: '10px' }}
              >
                {pctStr}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
