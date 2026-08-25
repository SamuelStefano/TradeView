import type { Strategy, StrategyState } from '@/lib/types';

interface StateConfig {
  color: string;
  icon: string;
  label: string;
}

const stateConfigs: Record<StrategyState, StateConfig> = {
  rodando: { color: 'text-up', icon: '▶', label: 'rodando' },
  pausada: { color: 'text-text-muted', icon: '❚❚', label: 'pausada' },
  backtest: { color: 'text-accent-hover', icon: '◌', label: 'backtest' },
  erro: { color: 'text-down', icon: '✕', label: 'erro' },
};

interface StrategyRowProps {
  strategy: Strategy;
}

export function StrategyRow({ strategy }: StrategyRowProps) {
  const cfg = stateConfigs[strategy.state];
  const isReal = strategy.mode === 'REAL';
  const isPositive = !strategy.pnl.startsWith('−') && !strategy.pnl.startsWith('-');

  return (
    <div
      role="row"
      className={`grid items-center px-3.5 py-2.5 border-b border-divider hover:bg-hover transition-colors${isReal ? ' bg-[color-mix(in_srgb,var(--color-danger-solid)_4%,transparent)]' : ''}`}
      style={{ gridTemplateColumns: '34px 1fr 110px 100px 100px 90px 90px 90px 100px' }}
    >
      <div role="cell" className={`text-xs ${cfg.color}`} aria-label={`estado: ${cfg.label}`}>
        {cfg.icon}
      </div>
      <div role="cell">
        <div className="text-[12.5px] font-semibold text-text">{strategy.name}</div>
        <div className="text-[10px] text-text-faint">{strategy.markets.join(' · ')}</div>
      </div>
      <div role="cell" className={`text-[11px] ${cfg.color}`}>{cfg.label}</div>
      <div role="cell" className={`font-mono tabular-nums text-xs text-right ${isPositive ? 'text-up' : 'text-down'}`}>
        {strategy.pnl}
      </div>
      <div role="cell" className="font-mono tabular-nums text-xs text-right text-down">
        {strategy.drawdownPct.toFixed(1).replace('-', '−')}%
      </div>
      <div role="cell" className="font-mono tabular-nums text-xs text-right text-text">
        {strategy.sharpe.toFixed(2).replace('.', ',')}
      </div>
      <div role="cell" className="font-mono tabular-nums text-xs text-right text-text">
        {strategy.winRatePct}%
      </div>
      <div role="cell" className="font-mono tabular-nums text-xs text-right text-text">
        {strategy.trades}
      </div>
      <div role="cell" className="text-right">
        {isReal ? (
          <span className="text-[10px] font-bold tracking-[0.6px] text-white bg-danger-solid rounded px-2 py-[3px]">
            REAL
          </span>
        ) : (
          <span className="text-[10px] font-semibold tracking-[0.6px] text-accent-hover bg-accent-bg border border-accent-border rounded px-2 py-[2px]">
            PAPER
          </span>
        )}
      </div>
    </div>
  );
}
