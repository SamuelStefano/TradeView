import type { Strategy } from '@/lib/types';
import { StrategyRow } from './StrategyRow';

interface StrategyTableProps {
  strategies: Strategy[];
}

const GRID = '34px 1fr 110px 100px 100px 90px 90px 90px 100px';

export function StrategyTable({ strategies }: StrategyTableProps) {
  return (
    <div
      role="table"
      aria-label="Estratégias"
      className="bg-surface border border-border rounded-lg overflow-hidden"
    >
      <div
        role="row"
        className="grid px-3.5 py-2 border-b border-border"
        style={{ gridTemplateColumns: GRID }}
      >
        <div role="columnheader">
          <span className="sr-only">Ícone de estado</span>
        </div>
        <div role="columnheader" className="text-[10px] text-text-faint uppercase tracking-[0.5px]">Estratégia</div>
        <div role="columnheader" className="text-[10px] text-text-faint uppercase tracking-[0.5px]">Estado</div>
        <div role="columnheader" className="text-[10px] text-text-faint uppercase tracking-[0.5px] text-right">P&L</div>
        <div role="columnheader" className="text-[10px] text-text-faint uppercase tracking-[0.5px] text-right">Drawdown</div>
        <div role="columnheader" className="text-[10px] text-text-faint uppercase tracking-[0.5px] text-right">Sharpe</div>
        <div role="columnheader" className="text-[10px] text-text-faint uppercase tracking-[0.5px] text-right">Win rate</div>
        <div role="columnheader" className="text-[10px] text-text-faint uppercase tracking-[0.5px] text-right">Trades</div>
        <div role="columnheader" className="text-[10px] text-text-faint uppercase tracking-[0.5px] text-right">Modo</div>
      </div>
      <div role="rowgroup">
        {strategies.map((s) => (
          <StrategyRow key={s.id} strategy={s} />
        ))}
      </div>
    </div>
  );
}
