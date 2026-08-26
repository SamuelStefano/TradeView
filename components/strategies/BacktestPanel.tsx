'use client';

import { RunStatus } from './RunStatus';

function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function buildChartData() {
  const r = lcg(42);
  let eq = 110;
  let bm = 115;
  const eqPoints: string[] = [];
  const bmPoints: string[] = [];
  for (let i = 0; i <= 62; i++) {
    eq += (r() - 0.42) * 7;
    eq = Math.min(118, Math.max(20, eq));
    bm += (r() - 0.46) * 6;
    bm = Math.min(118, Math.max(30, bm));
    eqPoints.push(`${i * 10},${eq.toFixed(1)}`);
    bmPoints.push(`${i * 10},${bm.toFixed(1)}`);
  }

  const ddBars = Array.from({ length: 36 }, (_, i) => ({
    x: 4 + i * 8,
    h: parseFloat((r() * r() * 52).toFixed(1)),
  }));

  const hist = Array.from({ length: 19 }, (_, i) => {
    const c = Math.exp(-Math.pow(i - 10.5, 2) / 14) * 56;
    return {
      x: 6 + i * 15,
      y: parseFloat((76 - c).toFixed(1)),
      h: parseFloat(c.toFixed(1)),
      positive: i >= 9,
    };
  });

  return {
    equity: eqPoints.join(' '),
    bench: bmPoints.join(' '),
    ddBars,
    hist,
  };
}

const chartData = buildChartData();

const btStats = [
  { k: 'Retorno total', v: '+214,8%', positive: true },
  { k: 'CAGR', v: '37,2%', positive: true },
  { k: 'Sharpe', v: '1,92', neutral: true },
  { k: 'Máx. drawdown', v: '−18,4%', positive: false },
  { k: 'Win rate', v: '61%', neutral: true },
  { k: 'Profit factor', v: '2,14', positive: true },
];

interface TradeRow {
  d: string;
  a: string;
  s: 'LONG' | 'SHORT';
  e: string;
  x: string;
  r: string;
  dur: string;
}

const trades: TradeRow[] = [
  { d: '12/08/26', a: 'BTC perp', s: 'LONG', e: '64.210', x: '67.980', r: '+5,9%', dur: '4d 2h' },
  { d: '28/07/26', a: 'ETH perp', s: 'LONG', e: '3.084', x: '3.312', r: '+7,4%', dur: '6d' },
  { d: '19/07/26', a: 'SOL perp', s: 'SHORT', e: '188,40', x: '194,10', r: '−3,0%', dur: '1d 8h' },
  { d: '02/07/26', a: 'BTC perp', s: 'LONG', e: '61.480', x: '65.120', r: '+5,9%', dur: '5d 3h' },
];

export type BacktestStatus = 'idle' | 'running' | 'done';

interface BacktestPanelProps {
  status: BacktestStatus;
  progress: number;
}

export function BacktestPanel({ status, progress }: BacktestPanelProps) {
  const { equity, bench, ddBars, hist } = chartData;

  return (
    <section
      aria-label="Backtest"
      className="bg-surface border border-border rounded-lg p-3.5 flex flex-col gap-2.5 min-w-0"
    >
      <div className="flex items-center gap-2.5">
        <span
          className="text-[11px] text-text-muted uppercase tracking-[0.6px]"
        >
          Backtest — jan/2023 → ago/2026
        </span>
        <RunStatus status={status} progress={progress} />
        <div className="ml-auto flex gap-3 font-mono tabular-nums text-[11px]">
          <span className="text-up">+214,8%</span>
          <span className="text-text-muted">vs BTC hold +168,2%</span>
        </div>
      </div>

      <svg
        viewBox="0 0 620 150"
        className="w-full block"
        role="img"
        aria-label="Curva de equity da estratégia versus benchmark"
      >
        <line x1="0" x2="620" y1="120" y2="120" stroke="var(--color-border)" />
        <polyline
          points={bench}
          fill="none"
          stroke="var(--color-text-faint)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />
        <polyline
          points={equity}
          fill="none"
          stroke="var(--color-up)"
          strokeWidth="1.6"
        />
        <text x="6" y="12" fill="var(--color-up)" fontSize="9" fontFamily="Geist Mono, monospace">
          — estratégia
        </text>
        <text x="80" y="12" fill="var(--color-text-faint)" fontSize="9" fontFamily="Geist Mono, monospace">
          ┄ benchmark
        </text>
      </svg>

      <div className="flex gap-2.5">
        <svg
          viewBox="0 0 300 80"
          className="flex-1"
          role="img"
          aria-label="Drawdown underwater — máximo −18,4%"
        >
          <text x="4" y="10" fill="var(--color-text-faint)" fontSize="8.5" fontFamily="Geist Mono, monospace">
            drawdown underwater · máx −18,4%
          </text>
          {ddBars.map((d, i) => (
            <rect key={i} x={d.x} y="16" width="7" height={d.h} fill="var(--color-down)" opacity="0.55" />
          ))}
        </svg>

        <svg
          viewBox="0 0 300 80"
          className="flex-1"
          role="img"
          aria-label="Distribuição de retornos por trade"
        >
          <text x="4" y="10" fill="var(--color-text-faint)" fontSize="8.5" fontFamily="Geist Mono, monospace">
            distribuição de retornos/trade
          </text>
          {hist.map((hb, i) => (
            <rect
              key={i}
              x={hb.x}
              y={hb.y}
              width="14"
              height={hb.h}
              fill={hb.positive ? 'var(--color-up)' : 'var(--color-down)'}
              opacity="0.7"
            />
          ))}
          <line
            x1="150" x2="150" y1="14" y2="76"
            stroke="var(--color-text-faint)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        </svg>
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>
        {btStats.map((b) => (
          <div key={b.k} className="bg-inset border border-border rounded-md px-2.5 py-1.5">
            <div className="text-[9.5px] text-text-faint">{b.k}</div>
            <div
              className={`font-mono tabular-nums text-[12.5px] font-semibold text-right ${
                b.neutral ? 'text-text' : b.positive ? 'text-up' : 'text-down'
              }`}
            >
              {b.v}
            </div>
          </div>
        ))}
      </div>

      <div role="table" aria-label="Trades do backtest" className="font-mono tabular-nums text-[10.5px]">
        <div
          role="row"
          className="grid px-2 py-1.5 text-text-faint border-b border-border"
          style={{ gridTemplateColumns: '80px 70px 60px repeat(4,1fr)' }}
        >
          <div role="columnheader">data</div>
          <div role="columnheader">ativo</div>
          <div role="columnheader">lado</div>
          <div role="columnheader" className="text-right">entrada</div>
          <div role="columnheader" className="text-right">saída</div>
          <div role="columnheader" className="text-right">resultado</div>
          <div role="columnheader" className="text-right">duração</div>
        </div>
        <div role="rowgroup">
          {trades.map((t, i) => {
            const positiveResult = t.r.startsWith('+');
            return (
              <div
                key={i}
                role="row"
                className="grid px-2 py-1.5 border-b border-divider text-text-secondary"
                style={{ gridTemplateColumns: '80px 70px 60px repeat(4,1fr)' }}
              >
                <div role="cell" className="text-text-faint">{t.d}</div>
                <div role="cell">{t.a}</div>
                <div role="cell" className={t.s === 'LONG' ? 'text-up' : 'text-down'}>{t.s}</div>
                <div role="cell" className="text-right">{t.e}</div>
                <div role="cell" className="text-right">{t.x}</div>
                <div role="cell" className={`text-right ${positiveResult ? 'text-up' : 'text-down'}`}>{t.r}</div>
                <div role="cell" className="text-right text-text-faint">{t.dur}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
