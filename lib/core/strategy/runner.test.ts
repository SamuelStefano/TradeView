import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Decimal } from 'decimal.js';

import { evaluateStrategy, type RunnerDeps, type StrategyRow } from './runner';
import { TIMEFRAME_MS } from './schedule';
import { money } from '../../money';
import { DuplicateOrderError, TradingError } from '../../trading/errors';
import type { Candle } from '../exchange';
import type { InstrumentRow } from '../instruments';
import type { PlaceOrderInput, PlaceOrderResult } from '../place-order';

const NOW = 1_700_000_000_000;
const PERIOD = TIMEFRAME_MS['1h'];

function series(closes: number[]): Candle[] {
  return closes.map((c, i) => ({ t: NOW - (closes.length - i) * PERIOD, o: c, h: c, l: c, c, v: 1 }));
}

// Falls, then climbs sharply. Cut so the fast average crosses above the slow one
// exactly on the last closed candle, which closes at 97; the extra candle on the
// end is the one still forming.
function crossingUp(): Candle[] {
  const closes = [
    ...Array.from({ length: 12 }, (_, i) => 100 - i),
    ...Array.from({ length: 8 }, (_, i) => 89 + i * 4),
  ];
  return series(closes.slice(0, 16));
}

// The mirror image: the cross down lands on the last closed candle, at 121.
function crossingDown(): Candle[] {
  const closes = [
    ...Array.from({ length: 12 }, (_, i) => 100 + i * 3),
    ...Array.from({ length: 8 }, (_, i) => 133 - i * 6),
  ];
  return series(closes.slice(0, 16));
}

function flat(): Candle[] {
  return series(new Array(20).fill(100));
}

const INSTRUMENT: InstrumentRow = {
  symbol: 'BTC/BRL',
  venue: 'foxbit',
  base: 'BTC',
  quote: 'BRL',
  qty_precision: 8,
  active: true,
};

function strategy(overrides: Partial<StrategyRow> = {}): StrategyRow {
  return {
    id: 'aaaa-1111',
    user_id: 'user-1',
    name: 'cruzamento',
    kind: 'sma_cross',
    symbol: 'BTC/BRL',
    timeframe: '1h',
    params: { fast: 3, slow: 6 },
    order_notional: '250',
    mode: 'paper',
    consecutive_errors: 0,
    ...overrides,
  };
}

interface Recorded {
  placed: PlaceOrderInput[];
}

function deps(overrides: Partial<RunnerDeps> = {}): RunnerDeps & Recorded {
  const placed: PlaceOrderInput[] = [];

  const base: RunnerDeps = {
    killSwitchActive: async () => false,
    loadInstrument: async () => INSTRUMENT,
    fetchCandles: async () => crossingUp(),
    openPosition: async () => money(0),
    placeOrder: async (input) => {
      placed.push(input);
      return {
        orderId: 'order-1',
        filledQty: input.qty,
        avgPrice: '100',
        fee: '0.1',
        slippagePct: '0.01',
        partial: false,
      } satisfies PlaceOrderResult;
    },
    now: () => NOW,
    ...overrides,
  };

  return Object.assign(base, { placed });
}

test('cruzamento sem posição aberta compra o notional configurado', async () => {
  const d = deps();
  const outcome = await evaluateStrategy(strategy(), d);

  assert.equal(outcome.action, 'buy');
  assert.equal(outcome.error, null);
  assert.equal(outcome.orderId, 'order-1');
  assert.equal(d.placed.length, 1);
  assert.equal(d.placed[0].side, 'buy');
  assert.equal(d.placed[0].mode, 'paper');
  // 250 BRL sobre o fechamento 97 do último candle fechado.
  assert.equal(d.placed[0].qty, new Decimal(250).div(97).toDecimalPlaces(8, Decimal.ROUND_DOWN).toString());
});

test('cruzamento com posição já aberta não dobra a aposta', async () => {
  const d = deps({ openPosition: async () => money('0.5') });
  const outcome = await evaluateStrategy(strategy(), d);

  assert.equal(outcome.action, 'hold');
  assert.match(outcome.reason, /já posicionado/);
  assert.equal(d.placed.length, 0);
});

test('venda sem posição não vira venda a descoberto', async () => {
  const d = deps({ fetchCandles: async () => crossingDown(), openPosition: async () => money(0) });
  const outcome = await evaluateStrategy(strategy(), d);

  assert.equal(outcome.action, 'hold');
  assert.match(outcome.reason, /sem posição para vender/);
  assert.equal(d.placed.length, 0);
});

test('o kill switch para o bot antes de qualquer chamada à venue', async () => {
  let touched = false;
  const d = deps({
    killSwitchActive: async () => true,
    fetchCandles: async () => {
      touched = true;
      return crossingUp();
    },
  });

  const outcome = await evaluateStrategy(strategy(), d);

  assert.equal(outcome.action, 'hold');
  assert.equal(outcome.error, null, 'kill switch não é falha da estratégia');
  assert.match(outcome.reason, /kill switch/);
  assert.equal(touched, false, 'não deveria consultar a venue com o kill switch ligado');
  assert.equal(d.placed.length, 0);
});

test('estratégia marcada como real é recusada enquanto a execução for simulada', async () => {
  const d = deps();
  const outcome = await evaluateStrategy(strategy({ mode: 'real' }), d);

  assert.equal(d.placed.length, 0);
  assert.match(String(outcome.error), /modo papel/);
});

test('a ordem carrega a vela que a gerou, para colidir em vez de duplicar', async () => {
  const d = deps();
  await evaluateStrategy(strategy(), d);

  const candles = crossingUp();
  const lastClosed = candles[candles.length - 2];
  assert.equal(d.placed[0].clientRef, `s:aaaa-1111:${lastClosed.t}`);
});

test('colisão de vela é tratada como já feito, não como erro', async () => {
  const d = deps({
    placeOrder: async () => {
      throw new DuplicateOrderError();
    },
  });

  const outcome = await evaluateStrategy(strategy(), d);

  assert.equal(outcome.action, 'hold');
  assert.equal(outcome.error, null);
  assert.equal(outcome.orderId, null);
  assert.match(outcome.reason, /já havia sido registrada/);
});

test('ordem recusada pelo limite de risco vira registro, não crash', async () => {
  const d = deps({
    placeOrder: async () => {
      throw new TradingError('ordem de 250,00 excede o limite de 100');
    },
  });

  const outcome = await evaluateStrategy(strategy(), d);

  assert.equal(outcome.error, 'ordem de 250,00 excede o limite de 100');
  assert.equal(outcome.action, 'hold');
});

test('falha na venue agenda recuo crescente em vez de repetir na mesma cadência', async () => {
  const d = deps({
    fetchCandles: async () => {
      throw new TradingError('venue indisponível');
    },
  });

  const first = await evaluateStrategy(strategy({ consecutive_errors: 0 }), d);
  const later = await evaluateStrategy(strategy({ consecutive_errors: 3 }), d);

  assert.equal(first.error, 'venue indisponível');
  assert.ok(
    later.nextRunAt.getTime() > first.nextRunAt.getTime(),
    'o recuo deveria crescer com as falhas seguidas',
  );
});

test('a próxima execução é agendada para depois do próximo fechamento de vela', async () => {
  const d = deps({ fetchCandles: async () => flat() });
  const outcome = await evaluateStrategy(strategy(), d);

  assert.equal(outcome.action, 'hold');
  assert.ok(outcome.nextRunAt.getTime() > NOW, 'não deveria reagendar para o passado');
  assert.ok(
    outcome.nextRunAt.getTime() <= NOW + PERIOD + 10_000,
    'não deveria pular um candle inteiro',
  );
});

test('tamanho abaixo da precisão do instrumento não vira ordem de zero', async () => {
  const d = deps({
    loadInstrument: async () => ({ ...INSTRUMENT, qty_precision: 0 }),
    openPosition: async () => money(0),
  });

  const outcome = await evaluateStrategy(strategy({ order_notional: '1' }), d);

  assert.equal(outcome.action, 'hold');
  assert.match(outcome.reason, /precisão/);
  assert.equal(d.placed.length, 0);
});

test('venda com posição aberta liquida a posição inteira', async () => {
  const d = deps({ fetchCandles: async () => crossingDown(), openPosition: async () => money('0.25') });
  const outcome = await evaluateStrategy(strategy(), d);

  assert.equal(outcome.action, 'sell');
  assert.equal(d.placed[0].qty, '0.25');
  assert.equal(d.placed[0].side, 'sell');
});
