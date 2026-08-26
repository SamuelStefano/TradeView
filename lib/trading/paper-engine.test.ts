import assert from 'node:assert/strict';
import { test } from 'node:test';
import { simulateFill, cashEffect } from './paper-engine.ts';
import type { OrderBookSnapshot } from '../markets/exchange.ts';

function book(overrides: Partial<OrderBookSnapshot> = {}): OrderBookSnapshot {
  return {
    symbol: 'BTC/USDT',
    venue: 'binance',
    bids: [
      { price: 100, qty: 1 },
      { price: 99, qty: 5 },
      { price: 98, qty: 10 },
    ],
    asks: [
      { price: 101, qty: 1 },
      { price: 102, qty: 5 },
      { price: 103, qty: 10 },
    ],
    takerFeeRate: 0.001,
    fetchedAt: 0,
    ...overrides,
  };
}

test('compra dentro do primeiro nível executa no topo do livro', () => {
  const fill = simulateFill({ book: book(), side: 'buy', type: 'market', qty: '0.5' });
  assert.equal(fill.avgPrice.toString(), '101');
  assert.equal(fill.filledQty.toString(), '0.5');
  assert.equal(fill.slippage.toString(), '0');
  assert.equal(fill.partial, false);
});

test('compra grande atravessa níveis e paga slippage', () => {
  const fill = simulateFill({ book: book(), side: 'buy', type: 'market', qty: '4' });
  // 1@101 + 3@102 = 407 / 4
  assert.equal(fill.avgPrice.toString(), '101.75');
  assert.equal(fill.notional.toString(), '407');
  assert.ok(fill.slippage.gt(0), 'slippage deveria ser positivo');
});

test('venda consome as ofertas de compra a partir do topo', () => {
  const fill = simulateFill({ book: book(), side: 'sell', type: 'market', qty: '3' });
  // 1@100 + 2@99 = 298 / 3
  assert.equal(fill.notional.toString(), '298');
  assert.equal(fill.avgPrice.toFixed(4), '99.3333');
});

test('taxa sai sobre o notional, não sobre a quantidade', () => {
  const fill = simulateFill({ book: book(), side: 'buy', type: 'market', qty: '1' });
  assert.equal(fill.fee.toString(), '0.101');
});

test('ordem limitada não executa acima do preço informado', () => {
  const fill = simulateFill({
    book: book(), side: 'buy', type: 'limit', qty: '4', limitPrice: '101',
  });
  assert.equal(fill.filledQty.toString(), '1');
  assert.equal(fill.partial, true);
});

test('ordem limitada longe do mercado não executa nada', () => {
  const fill = simulateFill({
    book: book(), side: 'buy', type: 'limit', qty: '1', limitPrice: '50',
  });
  assert.equal(fill.filledQty.toString(), '0');
  assert.equal(fill.partial, true);
});

test('livro raso preenche parcialmente em vez de inventar liquidez', () => {
  const shallow = book({ asks: [{ price: 101, qty: 0.25 }] });
  const fill = simulateFill({ book: shallow, side: 'buy', type: 'market', qty: '10' });
  assert.equal(fill.filledQty.toString(), '0.25');
  assert.equal(fill.partial, true);
});

test('compra debita o caixa e credita o ativo, taxa incluída', () => {
  const fill = simulateFill({ book: book(), side: 'buy', type: 'market', qty: '1' });
  const effect = cashEffect('buy', fill);
  assert.equal(effect.quoteDelta.toString(), '-101.101');
  assert.equal(effect.baseDelta.toString(), '1');
});

test('venda credita o caixa já líquido de taxa', () => {
  const fill = simulateFill({ book: book(), side: 'sell', type: 'market', qty: '1' });
  const effect = cashEffect('sell', fill);
  assert.equal(effect.quoteDelta.toString(), '99.9');
  assert.equal(effect.baseDelta.toString(), '-1');
});

test('caixa e ativo se anulam num round trip sem movimento de preço', () => {
  const flat: OrderBookSnapshot = {
    ...book(), bids: [{ price: 100, qty: 10 }], asks: [{ price: 100, qty: 10 }], takerFeeRate: 0,
  };
  const bought = cashEffect('buy', simulateFill({ book: flat, side: 'buy', type: 'market', qty: '2' }));
  const sold = cashEffect('sell', simulateFill({ book: flat, side: 'sell', type: 'market', qty: '2' }));
  assert.equal(bought.quoteDelta.plus(sold.quoteDelta).toString(), '0');
  assert.equal(bought.baseDelta.plus(sold.baseDelta).toString(), '0');
});

test('quantidade não positiva é recusada', () => {
  assert.throws(() => simulateFill({ book: book(), side: 'buy', type: 'market', qty: '0' }));
});

test('livro vazio é recusado em vez de executar a zero', () => {
  assert.throws(() => simulateFill({ book: book({ asks: [] }), side: 'buy', type: 'market', qty: '1' }));
});
