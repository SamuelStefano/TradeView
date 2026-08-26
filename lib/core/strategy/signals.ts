import { TradingError } from '../../trading/errors';
import type { Candle } from '../exchange';

export type StrategyKind = 'sma_cross' | 'rsi_reversion' | 'breakout';
export type SignalAction = 'buy' | 'sell' | 'hold';

export const STRATEGY_KINDS: StrategyKind[] = ['sma_cross', 'rsi_reversion', 'breakout'];

export interface Signal {
  action: SignalAction;
  reason: string;
  /** Close of the last candle the decision was allowed to see. */
  price: number;
}

export interface SmaCrossParams {
  fast: number;
  slow: number;
}

export interface RsiReversionParams {
  period: number;
  oversold: number;
  overbought: number;
}

export interface BreakoutParams {
  lookback: number;
}

export type StrategyParams = SmaCrossParams | RsiReversionParams | BreakoutParams;

// ---------------------------------------------------------------- indicators

export function smaSeries(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }

  return out;
}

// Wilder's smoothing, not a plain average of gains: the simple version reacts
// to a single spike and reads oversold on the candle right after it, which is
// the opposite of what a reversion strategy wants to buy.
export function rsi(values: number[], period: number): number | null {
  if (values.length <= period) return null;

  let gain = 0;
  let loss = 0;

  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change >= 0) gain += change;
    else loss -= change;
  }

  let avgGain = gain / period;
  let avgLoss = loss / period;

  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
  }

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

// ---------------------------------------------------------------- params

function integer(raw: unknown, name: string, min: number, max: number): number {
  const value = typeof raw === 'string' ? Number(raw) : raw;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new TradingError(`${name} deve ser um inteiro entre ${min} e ${max}`);
  }
  return value;
}

export function parseParams(kind: StrategyKind, raw: unknown): StrategyParams {
  const source = (raw ?? {}) as Record<string, unknown>;

  if (kind === 'sma_cross') {
    const fast = integer(source.fast ?? 9, 'média rápida', 2, 200);
    const slow = integer(source.slow ?? 21, 'média lenta', 3, 400);
    if (fast >= slow) throw new TradingError('a média rápida precisa ser menor que a lenta');
    return { fast, slow };
  }

  if (kind === 'rsi_reversion') {
    const period = integer(source.period ?? 14, 'período do RSI', 2, 100);
    const oversold = integer(source.oversold ?? 30, 'nível de sobrevenda', 1, 99);
    const overbought = integer(source.overbought ?? 70, 'nível de sobrecompra', 2, 99);
    if (oversold >= overbought) {
      throw new TradingError('a sobrevenda precisa ser menor que a sobrecompra');
    }
    return { period, oversold, overbought };
  }

  const lookback = integer(source.lookback ?? 20, 'janela do rompimento', 2, 400);
  return { lookback };
}

// How many candles the venue has to return before the strategy can decide. One
// extra for the unclosed candle that gets dropped, one more so a crossing has a
// previous bar to be measured against.
export function requiredCandles(kind: StrategyKind, params: StrategyParams): number {
  if (kind === 'sma_cross') return (params as SmaCrossParams).slow + 3;
  if (kind === 'rsi_reversion') return (params as RsiReversionParams).period + 3;
  return (params as BreakoutParams).lookback + 3;
}

// ---------------------------------------------------------------- evaluation

function trim(value: number): string {
  return value >= 100 ? value.toFixed(2) : value.toPrecision(6).replace(/0+$/, '');
}

// The last candle a venue returns is the one still forming: its close moves
// until the period ends. Deciding on it means the same bar can signal buy and
// then not, and a backtest over closed candles would never reproduce the
// trades. Everything below sees closed candles only.
export function closedCandles(candles: Candle[]): Candle[] {
  return candles.length > 0 ? candles.slice(0, -1) : [];
}

export function evaluate(
  kind: StrategyKind,
  params: StrategyParams,
  candles: Candle[],
): Signal {
  const closed = closedCandles(candles);
  const needed = requiredCandles(kind, params) - 1;

  if (closed.length < needed) {
    throw new TradingError(
      `candles insuficientes: ${closed.length} fechados, ${needed} necessários`,
    );
  }

  const closes = closed.map((c) => c.c);
  const price = closes[closes.length - 1];

  if (kind === 'sma_cross') return smaCross(params as SmaCrossParams, closes, price);
  if (kind === 'rsi_reversion') return rsiReversion(params as RsiReversionParams, closes, price);
  return breakout(params as BreakoutParams, closed, price);
}

function smaCross(params: SmaCrossParams, closes: number[], price: number): Signal {
  const fast = smaSeries(closes, params.fast);
  const slow = smaSeries(closes, params.slow);
  const n = closes.length - 1;

  const fastNow = fast[n];
  const slowNow = slow[n];
  const fastPrev = fast[n - 1];
  const slowPrev = slow[n - 1];

  if (fastNow === null || slowNow === null || fastPrev === null || slowPrev === null) {
    throw new TradingError('médias ainda não têm histórico suficiente');
  }

  const gap = `${trim(fastNow)} vs ${trim(slowNow)}`;

  if (fastPrev <= slowPrev && fastNow > slowNow) {
    return { action: 'buy', reason: `média ${params.fast} cruzou acima da ${params.slow} — ${gap}`, price };
  }

  if (fastPrev >= slowPrev && fastNow < slowNow) {
    return { action: 'sell', reason: `média ${params.fast} cruzou abaixo da ${params.slow} — ${gap}`, price };
  }

  return { action: 'hold', reason: `sem cruzamento — ${gap}`, price };
}

function rsiReversion(params: RsiReversionParams, closes: number[], price: number): Signal {
  const value = rsi(closes, params.period);
  if (value === null) throw new TradingError('RSI ainda não tem histórico suficiente');

  const label = `RSI ${value.toFixed(1)}`;

  if (value <= params.oversold) {
    return { action: 'buy', reason: `${label} abaixo de ${params.oversold}`, price };
  }

  if (value >= params.overbought) {
    return { action: 'sell', reason: `${label} acima de ${params.overbought}`, price };
  }

  return { action: 'hold', reason: `${label} entre ${params.oversold} e ${params.overbought}`, price };
}

function breakout(params: BreakoutParams, closed: Candle[], price: number): Signal {
  // The window stops before the deciding candle. Including it would compare the
  // close against a high it set itself, which never breaks out.
  const window = closed.slice(-1 - params.lookback, -1);
  const high = Math.max(...window.map((c) => c.h));
  const low = Math.min(...window.map((c) => c.l));

  if (price > high) {
    return { action: 'buy', reason: `rompeu a máxima de ${params.lookback} candles (${trim(high)})`, price };
  }

  if (price < low) {
    return { action: 'sell', reason: `perdeu a mínima de ${params.lookback} candles (${trim(low)})`, price };
  }

  return { action: 'hold', reason: `dentro da faixa ${trim(low)}–${trim(high)}`, price };
}
