import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluate, closedCandles, parseParams, rsi, smaSeries } from './signals';
import { TradingError } from '../../trading/errors';
import type { Candle } from '../exchange';

function candles(closes: number[]): Candle[] {
  return closes.map((c, i) => ({ t: i * 60_000, o: c, h: c, l: c, c, v: 1 }));
}

function ohlc(rows: [number, number, number][]): Candle[] {
  return rows.map(([h, l, c], i) => ({ t: i * 60_000, o: c, h, l, c, v: 1 }));
}

// ---------------------------------------------------------------- indicators

test('sma só produz valor quando a janela está cheia', () => {
  const out = smaSeries([1, 2, 3, 4], 3);
  assert.deepEqual(out, [null, null, 2, 3]);
});

test('rsi de uma série só de altas satura em 100', () => {
  assert.equal(rsi([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 14), 100);
});

test('rsi de uma série sem movimento fica no meio', () => {
  assert.equal(rsi(new Array(20).fill(50), 14), 50);
});

// ---------------------------------------------------------------- candle hygiene

test('o candle ainda aberto é descartado antes de qualquer decisão', () => {
  const all = candles([1, 2, 3]);
  assert.deepEqual(
    closedCandles(all).map((c) => c.c),
    [1, 2],
  );
  assert.deepEqual(closedCandles([]), []);
});

test('decisão ignora o candle em formação', () => {
  // Sobe até 20 e o candle aberto despenca. Decidir sobre ele viraria venda;
  // sobre os fechados, segue comprado.
  const closes = [...Array.from({ length: 30 }, (_, i) => 10 + i), 1];
  const signal = evaluate('sma_cross', { fast: 3, slow: 5 }, candles(closes));
  assert.notEqual(signal.action, 'sell');
  assert.equal(signal.price, 39);
});

// ---------------------------------------------------------------- sma cross

test('cruzamento para cima gera compra uma única vez', () => {
  const falling = Array.from({ length: 12 }, (_, i) => 100 - i);
  const rising = Array.from({ length: 8 }, (_, i) => 89 + i * 4);
  const series = [...falling, ...rising];

  let buys = 0;
  for (let end = 14; end <= series.length; end++) {
    const signal = evaluate('sma_cross', { fast: 3, slow: 6 }, candles(series.slice(0, end)));
    if (signal.action === 'buy') buys++;
  }

  assert.equal(buys, 1, 'o cruzamento deveria disparar em um único candle');
});

test('cruzamento para baixo gera venda uma única vez', () => {
  const rising = Array.from({ length: 12 }, (_, i) => 100 + i * 3);
  const falling = Array.from({ length: 8 }, (_, i) => 133 - i * 6);
  const series = [...rising, ...falling];

  let sells = 0;
  for (let end = 14; end <= series.length; end++) {
    const signal = evaluate('sma_cross', { fast: 3, slow: 6 }, candles(series.slice(0, end)));
    if (signal.action === 'sell') sells++;
  }

  assert.equal(sells, 1, 'o cruzamento deveria disparar em um único candle');
});

test('sem cruzamento a decisão é não fazer nada', () => {
  const signal = evaluate('sma_cross', { fast: 3, slow: 6 }, candles(new Array(20).fill(100)));
  assert.equal(signal.action, 'hold');
});

// ---------------------------------------------------------------- rsi

test('rsi afundado compra e esticado vende', () => {
  const down = Array.from({ length: 25 }, (_, i) => 200 - i * 4);
  assert.equal(evaluate('rsi_reversion', { period: 14, oversold: 30, overbought: 70 }, candles(down)).action, 'buy');

  const up = Array.from({ length: 25 }, (_, i) => 100 + i * 4);
  assert.equal(evaluate('rsi_reversion', { period: 14, oversold: 30, overbought: 70 }, candles(up)).action, 'sell');
});

// ---------------------------------------------------------------- breakout

test('rompimento compara o fechamento com a janela anterior, não com ela mesma', () => {
  const flat: [number, number, number][] = Array.from({ length: 10 }, () => [105, 95, 100]);

  // O candle decisor tem a maior máxima da série. Se a janela o incluísse, ele
  // nunca romperia a si mesmo e o sinal seria hold.
  const rows: [number, number, number][] = [...flat, [130, 99, 120], [0, 0, 0]];
  const signal = evaluate('breakout', { lookback: 5 }, ohlc(rows));
  assert.equal(signal.action, 'buy');
  assert.equal(signal.price, 120);
});

test('rompimento para baixo vende', () => {
  const flat: [number, number, number][] = Array.from({ length: 10 }, () => [105, 95, 100]);
  const rows: [number, number, number][] = [...flat, [101, 80, 85], [0, 0, 0]];
  assert.equal(evaluate('breakout', { lookback: 5 }, ohlc(rows)).action, 'sell');
});

test('dentro da faixa não faz nada', () => {
  const flat: [number, number, number][] = Array.from({ length: 10 }, () => [105, 95, 100]);
  const rows: [number, number, number][] = [...flat, [104, 96, 101], [0, 0, 0]];
  assert.equal(evaluate('breakout', { lookback: 5 }, ohlc(rows)).action, 'hold');
});

// ---------------------------------------------------------------- guards

test('histórico curto falha em vez de decidir no escuro', () => {
  assert.throws(
    () => evaluate('sma_cross', { fast: 3, slow: 6 }, candles([1, 2, 3])),
    TradingError,
  );
});

test('parâmetros incoerentes são recusados na entrada', () => {
  assert.throws(() => parseParams('sma_cross', { fast: 21, slow: 9 }), TradingError);
  assert.throws(() => parseParams('sma_cross', { fast: 0, slow: 9 }), TradingError);
  assert.throws(() => parseParams('sma_cross', { fast: 1.5, slow: 9 }), TradingError);
  assert.throws(
    () => parseParams('rsi_reversion', { period: 14, oversold: 80, overbought: 20 }),
    TradingError,
  );
});

test('parâmetros ausentes caem no padrão', () => {
  assert.deepEqual(parseParams('sma_cross', {}), { fast: 9, slow: 21 });
  assert.deepEqual(parseParams('breakout', undefined), { lookback: 20 });
});

test('número em texto vindo do formulário é aceito', () => {
  assert.deepEqual(parseParams('sma_cross', { fast: '5', slow: '20' }), { fast: 5, slow: 20 });
});
