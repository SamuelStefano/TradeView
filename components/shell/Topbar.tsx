'use client';

import type { ShellHealth } from './health-context';

interface TopbarProps {
  clock: string;
  lastSync: string;
  health: ShellHealth;
  onOpenPalette: () => void;
  onOpenKill: () => void;
}

export function Topbar({
  clock,
  lastSync,
  health,
  onOpenPalette,
  onOpenKill,
}: TopbarProps) {
  const dotColor =
    health.offline > 0
      ? 'var(--color-down)'
      : health.degraded > 0
        ? 'var(--color-warn)'
        : 'var(--color-up)';

  return (
    <header
      className="flex items-center gap-4 flex-shrink-0 border-b border-border bg-chrome px-3"
      style={{ height: 44 }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center font-mono font-bold text-white rounded"
          style={{
            width: 20,
            height: 20,
            background: 'var(--color-accent-strong)',
            fontSize: 11,
            borderRadius: 4,
          }}
        >
          TV
        </div>
        <span className="font-semibold text-text" style={{ fontSize: 13, letterSpacing: '0.2px' }}>
          TradeView
        </span>
      </div>

      <div
        className="flex items-center gap-3.5 border border-border rounded-md bg-surface font-mono text-text-muted px-2.5 py-1"
        style={{ fontSize: 11 }}
      >
        <span className="flex items-center gap-1.5">
          <span
            style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, display: 'inline-block' }}
          />
          {health.connected}/{health.total} mercados
        </span>
        <span aria-label="latência mediana">▲ {health.latencyMs} ms</span>
        {health.degraded > 0 && <span className="text-warn">{health.degraded} degradados</span>}
        {health.offline > 0 && <span className="text-down">{health.offline} offline</span>}
        <span title="última sincronização">sync {lastSync}</span>
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={onOpenPalette}
        aria-label="Busca global, atalho Control K"
        className="flex items-center gap-2 border border-border-strong rounded-md bg-surface text-text-muted cursor-pointer font-sans hover:border-border-hover hover:text-text-secondary"
        style={{ height: 28, padding: '0 10px', fontSize: 12, minWidth: 220 }}
      >
        <span style={{ fontSize: 12 }}>⌕</span>
        Buscar ativo, mercado, ação…
        <span
          className="border border-border-strong rounded font-mono text-text-faint"
          style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 5px' }}
        >
          Ctrl K
        </span>
      </button>

      <div className="font-mono text-text-muted tabular-nums" style={{ fontSize: 11 }}>
        {clock} <span className="text-text-faint">GMT-3</span>
      </div>

      <button
        onClick={onOpenKill}
        aria-label="Kill switch global"
        className="flex items-center gap-1.5 border border-danger-border rounded-md text-down font-semibold cursor-pointer font-sans hover:border-down"
        style={{
          height: 28,
          padding: '0 12px',
          background: 'var(--color-down-bg)',
          fontSize: 11,
          letterSpacing: '0.5px',
        }}
      >
        ⏻ KILL SWITCH
      </button>
    </header>
  );
}
