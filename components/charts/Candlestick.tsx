'use client';

import type { Candle, ChartMarker } from '@/lib/types';

interface CandlestickProps {
  candles: Candle[];
  markers: ChartMarker[];
  showMA: boolean;
  showBB: boolean;
  showVOL: boolean;
  showTrend: boolean;
  label: string;
}

const UP = 'var(--color-up)';
const DN = 'var(--color-down)';
const CANDLE_W = 12;
const TOP = 8;
const BOT = 240;
const CHART_W = 860;

function computeChart(candles: Candle[]) {
  const lo = Math.min(...candles.map((c) => c.low));
  const hi = Math.max(...candles.map((c) => c.high));
  const range = hi - lo || 1;
  const scaleY = (p: number) => TOP + ((hi - p) / range) * (BOT - TOP);

  const gridLines = [0.1, 0.3, 0.5, 0.7, 0.9].map((t) => {
    const y = TOP + t * (BOT - TOP);
    const price = hi - t * range;
    return { y: y.toFixed(0), ty: (y + 3).toFixed(0), label: price.toFixed(0) };
  });

  const candleData = candles.map((c, i) => {
    const isUp = c.close >= c.open;
    const y1 = scaleY(Math.max(c.open, c.close));
    const y2 = scaleY(Math.min(c.open, c.close));
    return {
      x: i * CANDLE_W + 2,
      cx: i * CANDLE_W + 6,
      y: y1.toFixed(1),
      h: Math.max(1.5, y2 - y1).toFixed(1),
      wt: scaleY(c.high).toFixed(1),
      wb: scaleY(c.low).toFixed(1),
      col: isUp ? UP : DN,
    };
  });

  const ma: number[] = candles.map((_, i) => {
    const window = candles.slice(Math.max(0, i - 20), i + 1);
    return window.reduce((acc, c) => acc + c.close, 0) / window.length;
  });
  const maLine = candles
    .map((_, i) => `${i * CANDLE_W + 6},${scaleY(ma[i]).toFixed(1)}`)
    .join(' ');

  const bbU = candles.map((c, i) => `${i * CANDLE_W + 6},${(scaleY(c.close) - 22).toFixed(1)}`).join(' ');
  const bbL = candles.map((c, i) => `${i * CANDLE_W + 6},${(scaleY(c.close) + 22).toFixed(1)}`).join(' ');

  const vols = candles.map((c, i) => ({
    x: i * CANDLE_W + 2,
    y: (298 - c.volume * 44).toFixed(1),
    h: (c.volume * 44).toFixed(1),
    col: c.close >= c.open ? UP : DN,
  }));

  const n = candles.length;
  const sumX = (n * (n - 1)) / 2;
  const sumXX = ((n - 1) * n * (2 * n - 1)) / 6;
  const sumY = candles.reduce((acc, c) => acc + c.close, 0);
  const sumXY = candles.reduce((acc, c, i) => acc + i * c.close, 0);
  const denom = n * sumXX - sumX * sumX || 1;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const trend = {
    x1: 6,
    y1: scaleY(intercept).toFixed(1),
    x2: (n - 1) * CANDLE_W + 6,
    y2: scaleY(intercept + slope * (n - 1)).toFixed(1),
    rising: slope >= 0,
  };

  return { gridLines, candleData, maLine, bbU, bbL, vols, scaleY, trend };
}

interface MarkerSpec {
  x: number;
  y: string;
  ty: string;
  t: string;
  bg: string;
  bc: string;
  fg: string;
}

function buildMarkers(candles: Candle[], markers: ChartMarker[], scaleY: (p: number) => number): MarkerSpec[] {
  return markers.map((m) => {
    const candle = candles[m.index];
    if (!candle) return null;
    const isBuy = m.kind === 'buy';
    const isSell = m.kind === 'sell';
    const isAI = m.kind === 'ai';
    const cy = isAI || isSell
      ? scaleY(candle.high) - 14
      : scaleY(candle.low) + 14;
    return {
      x: m.index * CANDLE_W + 6,
      y: cy.toFixed(1),
      ty: (cy + 3).toFixed(1),
      t: m.label,
      bg: isAI ? 'var(--color-ai-bg)' : isBuy ? 'var(--color-up-bg)' : 'var(--color-down-bg)',
      bc: isAI ? 'var(--color-ai)' : isBuy ? 'var(--color-up)' : 'var(--color-down)',
      fg: isAI ? 'var(--color-ai)' : isBuy ? 'var(--color-up)' : 'var(--color-down)',
    } as MarkerSpec;
  }).filter((m): m is MarkerSpec => m !== null);
}

export function Candlestick({ candles, markers, showMA, showBB, showVOL, showTrend, label }: CandlestickProps) {
  if (candles.length === 0) return null;

  const { gridLines, candleData, maLine, bbU, bbL, vols, scaleY, trend } = computeChart(candles);
  const markerSpecs = buildMarkers(candles, markers, scaleY);

  return (
    <svg
      viewBox={`0 0 ${CHART_W} 310`}
      style={{ width: '100%', display: 'block' }}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <desc>Gráfico de candlestick com 66 velas. Alternativa em tabela disponível pelo botão Tabela.</desc>
      {gridLines.map((g, i) => (
        <g key={i}>
          <line x1="0" x2="800" y1={g.y} y2={g.y} stroke="var(--color-grid)" strokeWidth="1" />
          <text x="806" y={g.ty} fill="var(--color-text-faint)" fontSize="9" fontFamily="Geist Mono">
            {g.label}
          </text>
        </g>
      ))}
      {candleData.map((c, i) => (
        <g key={i}>
          <line x1={c.cx} x2={c.cx} y1={c.wt} y2={c.wb} stroke={c.col} strokeWidth="1" />
          <rect x={c.x} y={c.y} width="8" height={c.h} fill={c.col} rx="1" />
        </g>
      ))}
      {showTrend && (
        <line
          x1={trend.x1}
          y1={trend.y1}
          x2={trend.x2}
          y2={trend.y2}
          stroke={trend.rising ? 'var(--color-up)' : 'var(--color-down)'}
          strokeWidth="1.4"
          strokeDasharray="5 4"
          opacity={0.85}
        />
      )}
      {showMA && (
        <polyline points={maLine} fill="none" stroke="var(--color-warn)" strokeWidth="1.3" opacity={0.9} />
      )}
      {showBB && (
        <>
          <polyline points={bbU} fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity={0.5} />
          <polyline points={bbL} fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity={0.5} />
        </>
      )}
      {markerSpecs.map((m, i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r="8" fill={m.bg} stroke={m.bc} strokeWidth="1" />
          <text
            x={m.x}
            y={m.ty}
            fill={m.fg}
            fontSize="8.5"
            textAnchor="middle"
            fontFamily="Geist Mono"
          >
            {m.t}
          </text>
        </g>
      ))}
      {showVOL &&
        vols.map((v, i) => (
          <rect
            key={i}
            x={v.x}
            y={v.y}
            width="8"
            height={v.h}
            fill={v.col}
            opacity={0.45}
          />
        ))}
      <line x1="0" x2="800" y1="248" y2="248" stroke="var(--color-border)" strokeWidth="1" />
    </svg>
  );
}
