'use client';

import { useEffect, useRef, useState } from 'react';
import type { Strategy } from '@/lib/types';
import { StrategyTable } from './StrategyTable';
import { BuilderPanel } from './BuilderPanel';
import { BacktestPanel, type BacktestStatus } from './BacktestPanel';
import { RealModeModal } from './RealModeModal';

interface StrategiesClientProps {
  strategies: Strategy[];
}

export function StrategiesClient({ strategies }: StrategiesClientProps) {
  const [realOpen, setRealOpen] = useState(false);
  const [status, setStatus] = useState<BacktestStatus>('idle');
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const realCount = strategies.filter((s) => s.mode === 'REAL').length;

  useEffect(() => {
    const timer = timerRef;
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function runBacktest() {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('running');
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 7;
        if (next >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setStatus('done');
          return 100;
        }
        return next;
      });
    }, 120);
  }

  function focusBuilder() {
    const builder = document.getElementById('builder');
    builder?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    builder?.focus({ preventScroll: true });
  }

  return (
    <>
      <div className="flex flex-col gap-3 p-4 text-[13px]">
        <div className="flex items-center gap-3">
          <h1 className="m-0 text-base font-bold text-text">Estratégias & bots</h1>
          <span className="text-[11px] text-text-muted">
            {strategies.length} estratégias · {realCount} em modo REAL
          </span>
          <div className="flex-1" />
          <button
            onClick={focusBuilder}
            className="h-[30px] px-3.5 bg-accent-bg border border-accent-border rounded-md text-accent-hover text-xs font-semibold cursor-pointer hover:bg-accent-border"
          >
            + Nova estratégia
          </button>
        </div>

        <StrategyTable strategies={strategies} />

        <div className="grid gap-3 items-start" style={{ gridTemplateColumns: '380px 1fr' }}>
          <BuilderPanel
            onActivateReal={() => setRealOpen(true)}
            onRunBacktest={runBacktest}
            running={status === 'running'}
          />
          <BacktestPanel status={status} progress={progress} />
        </div>
      </div>

      <RealModeModal
        open={realOpen}
        onClose={() => setRealOpen(false)}
        onConfirm={() => setRealOpen(false)}
      />
    </>
  );
}
