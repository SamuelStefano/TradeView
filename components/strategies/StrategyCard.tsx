'use client';

import { useActionState } from 'react';

import {
  deleteStrategyAction,
  setStrategyStatusAction,
  type ActionState,
} from '@/app/actions/strategies';
import type { StrategySummary, StrategyRunRow } from '@/lib/trading/strategies';

const initial: ActionState = { ok: false, message: '' };

const STATUS_STYLE: Record<StrategySummary['status'], string> = {
  active: 'text-up border-up-border bg-up-bg',
  paused: 'text-text-muted border-border bg-base',
  error: 'text-down border-danger-border bg-down-bg',
};

const STATUS_LABEL: Record<StrategySummary['status'], string> = {
  active: 'ligada',
  paused: 'parada',
  error: 'parada por erros',
};

const ACTION_STYLE: Record<StrategyRunRow['action'], string> = {
  buy: 'text-up',
  sell: 'text-down',
  hold: 'text-text-muted',
};

function describeParams(strategy: StrategySummary): string {
  const p = strategy.params;
  if (strategy.kind === 'sma_cross') return `médias ${p.fast}/${p.slow}`;
  if (strategy.kind === 'rsi_reversion') {
    return `RSI ${p.period} · ${p.oversold}/${p.overbought}`;
  }
  return `rompimento de ${p.lookback} velas`;
}

function clock(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

interface Props {
  strategy: StrategySummary;
  runs: StrategyRunRow[];
  runnerAlive: boolean;
}

export function StrategyCard({ strategy, runs, runnerAlive }: Props) {
  const [statusState, submitStatus, changing] = useActionState(setStrategyStatusAction, initial);
  const [deleteState, submitDelete, deleting] = useActionState(deleteStrategyAction, initial);

  const running = strategy.status === 'active';
  const message = deleteState.message || statusState.message;
  const failed = (deleteState.message && !deleteState.ok) || (statusState.message && !statusState.ok);

  return (
    <section className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <header className="flex items-center gap-2 flex-wrap">
        <h3 className="text-xs font-bold text-text m-0">{strategy.name}</h3>

        <span
          className={`h-5 px-1.5 inline-flex items-center rounded border text-[10px] ${STATUS_STYLE[strategy.status]}`}
        >
          {STATUS_LABEL[strategy.status]}
        </span>

        <span className="text-[11px] text-text-muted font-mono">
          {strategy.symbol} · {strategy.timeframe} · {describeParams(strategy)}
        </span>

        <span className="text-[11px] text-text-faint font-mono tabular-nums">
          {Number(strategy.orderNotional).toFixed(2).replace('.', ',')} por entrada
        </span>

        <div className="ml-auto flex items-center gap-2">
          <form action={submitStatus}>
            <input type="hidden" name="strategyId" value={strategy.id} />
            <input type="hidden" name="status" value={running ? 'paused' : 'active'} />
            <button
              type="submit"
              disabled={changing}
              className="h-7 px-2.5 bg-accent-bg border border-accent-border rounded-md text-accent text-[11px] font-semibold cursor-pointer disabled:opacity-50"
            >
              {changing ? '…' : running ? 'Parar' : 'Ligar'}
            </button>
          </form>

          <form
            action={submitDelete}
            onSubmit={(e) => {
              if (!confirm(`Remover "${strategy.name}"? O histórico dela vai junto.`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="strategyId" value={strategy.id} />
            <button
              type="submit"
              disabled={deleting}
              className="h-7 px-2.5 bg-transparent border border-border rounded-md text-text-muted text-[11px] cursor-pointer hover:text-down disabled:opacity-50"
            >
              {deleting ? '…' : 'Remover'}
            </button>
          </form>
        </div>
      </header>

      <div className="flex gap-4 flex-wrap text-[11px] text-text-muted">
        <span>
          última execução <span className="text-text font-mono">{clock(strategy.lastRunAt)}</span>
        </span>
        {running && (
          <span>
            próxima <span className="text-text font-mono">{clock(strategy.nextRunAt)}</span>
          </span>
        )}
        {strategy.consecutiveErrors > 0 && (
          <span className="text-warn">
            {strategy.consecutiveErrors} falha{strategy.consecutiveErrors > 1 ? 's' : ''} seguida
            {strategy.consecutiveErrors > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {strategy.status === 'error' && strategy.lastError && (
        <p
          className="bg-down-bg border border-danger-border rounded-md text-down m-0"
          style={{ fontSize: 11.5, padding: '8px 12px' }}
        >
          Parada depois de cinco falhas seguidas: {strategy.lastError}. Ligar de novo zera a
          contagem.
        </p>
      )}

      {running && !runnerAlive && (
        <p className="text-warn m-0" style={{ fontSize: 11.5 }}>
          Ligada, mas nenhum runner deu sinal de vida. Ela só decide quando o serviço na VPS
          estiver de pé.
        </p>
      )}

      {runs.length === 0 ? (
        <p className="text-text-faint m-0" style={{ fontSize: 11 }}>
          Sem execuções ainda.
        </p>
      ) : (
        <ol className="list-none p-0 m-0 flex flex-col gap-1">
          {runs.map((run) => (
            <li key={run.id} className="flex gap-2 items-baseline text-[11px]">
              <span className="text-text-faint font-mono tabular-nums shrink-0">
                {clock(run.createdAt)}
              </span>
              <span className={`font-semibold shrink-0 ${ACTION_STYLE[run.action]}`}>
                {run.action}
              </span>
              <span className={run.error ? 'text-down' : 'text-text-secondary'}>
                {run.error ?? run.reason}
              </span>
            </li>
          ))}
        </ol>
      )}

      {message && (
        <p className={`m-0 text-[11.5px] ${failed ? 'text-down' : 'text-up'}`} role="status">
          {message}
        </p>
      )}
    </section>
  );
}
