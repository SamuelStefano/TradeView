import type { BacktestStatus } from './BacktestPanel';

interface RunStatusProps {
  status: BacktestStatus;
  progress: number;
}

export function RunStatus({ status, progress }: RunStatusProps) {
  if (status === 'idle') {
    return (
      <span className="text-[10.5px] text-text-faint" role="status" aria-live="polite">
        sem execução nesta sessão
      </span>
    );
  }

  if (status === 'done') {
    return (
      <span className="text-[10.5px] text-up" role="status" aria-live="polite">
        ✓ concluído — 1.324 candles, 4 trades
      </span>
    );
  }

  const remaining = Math.max(1, Math.round((100 - progress) * 0.5));

  return (
    <span
      className="flex items-center gap-1.5 text-[10.5px] text-accent-hover"
      role="status"
      aria-live="polite"
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-accent-hover animate-pulse-dot"
        aria-hidden="true"
      />
      rodando · {progress}%
      <span className="text-text-faint">· ~{remaining}s restantes</span>
    </span>
  );
}
