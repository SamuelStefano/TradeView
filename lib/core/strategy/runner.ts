import { Decimal } from 'decimal.js';

import { createAdminClient } from '../supabase-admin';
import { loadInstrument, type InstrumentRow } from '../instruments';
import { fetchCandles, type Candle } from '../exchange';
import { placeOrder, type PlaceOrderInput, type PlaceOrderResult } from '../place-order';
import { money } from '../../money';
import { DuplicateOrderError, TradingError } from '../../trading/errors';
import type { Timeframe } from '../../markets/timeframes';
import { backoffAt, nextRunAt, TIMEFRAME_MS } from './schedule';
import {
  closedCandles,
  evaluate,
  parseParams,
  requiredCandles,
  type SignalAction,
  type StrategyKind,
} from './signals';

export interface StrategyRow {
  id: string;
  user_id: string;
  name: string;
  kind: StrategyKind;
  symbol: string;
  timeframe: Timeframe;
  params: unknown;
  order_notional: string;
  mode: 'paper' | 'real';
  consecutive_errors: number;
}

export interface Outcome {
  action: SignalAction;
  reason: string;
  price: number | null;
  orderId: string | null;
  error: string | null;
  nextRunAt: Date;
}

// The decision is the part worth testing, and it is unreachable behind a live
// venue and a live database. Everything the evaluation touches from the outside
// world arrives through here.
export interface RunnerDeps {
  killSwitchActive(userId: string): Promise<boolean>;
  loadInstrument(symbol: string): Promise<InstrumentRow>;
  fetchCandles(venue: string, symbol: string, timeframe: string, limit: number): Promise<Candle[]>;
  openPosition(userId: string, symbol: string, mode: string): Promise<Decimal>;
  placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult>;
  now(): number;
}

// Enough history for the slowest parameter, plus headroom so a venue that
// trims the response still leaves the indicator with a full window.
const MIN_CANDLES = 60;

async function readPosition(userId: string, symbol: string, mode: string): Promise<Decimal> {
  const supabase = createAdminClient();

  // The secret key bypasses RLS, so the user scope is applied by hand here.
  const { data, error } = await supabase
    .from('positions')
    .select('qty')
    .eq('user_id', userId)
    .eq('symbol', symbol)
    .eq('mode', mode)
    .maybeSingle();

  if (error) throw new TradingError('não foi possível ler a posição atual');
  return data ? money(data.qty as string) : money(0);
}

async function readKillSwitch(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('trading_settings')
    .select('kill_switch_active')
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new TradingError('configuração de risco não encontrada');
  return Boolean(data.kill_switch_active);
}

export const productionDeps: RunnerDeps = {
  killSwitchActive: readKillSwitch,
  loadInstrument,
  fetchCandles,
  openPosition: readPosition,
  placeOrder,
  now: () => Date.now(),
};

// Never throws: every strategy has to produce a row explaining what happened,
// including the ones that failed. A runner that threw here would leave the
// lease to expire and the screen showing nothing.
export async function evaluateStrategy(
  strategy: StrategyRow,
  deps: RunnerDeps = productionDeps,
): Promise<Outcome> {
  const now = deps.now();
  const period = TIMEFRAME_MS[strategy.timeframe];

  try {
    // Execution is still simulated against the live book even when an account
    // is marked real, so a bot must not run under that label — it would report
    // fills that never reached a venue. The manual ticket carries the same gap,
    // but there a person is watching the result.
    if (strategy.mode !== 'paper') {
      throw new TradingError('estratégia automática só roda em modo papel por enquanto');
    }

    if (await deps.killSwitchActive(strategy.user_id)) {
      return {
        action: 'hold',
        reason: 'kill switch ativo — nada foi enviado',
        price: null,
        orderId: null,
        error: null,
        nextRunAt: new Date(now + Math.min(period, 5 * 60_000)),
      };
    }

    const instrument = await deps.loadInstrument(strategy.symbol);
    const params = parseParams(strategy.kind, strategy.params);
    const limit = Math.max(requiredCandles(strategy.kind, params) + 5, MIN_CANDLES);

    const candles = await deps.fetchCandles(
      instrument.venue,
      instrument.symbol,
      strategy.timeframe,
      limit,
    );

    const signal = evaluate(strategy.kind, params, candles);
    const closed = closedCandles(candles);
    const lastClosed = closed[closed.length - 1];
    const scheduled = nextRunAt(lastClosed.t, strategy.timeframe, now);

    if (signal.price <= 0) throw new TradingError('preço inválido no candle fechado');

    const position = await deps.openPosition(strategy.user_id, strategy.symbol, strategy.mode);

    let qty: Decimal | null = null;

    if (signal.action === 'buy' && position.lte(0)) {
      qty = money(strategy.order_notional).div(signal.price);
    } else if (signal.action === 'sell' && position.gt(0)) {
      qty = position;
    }

    if (qty === null) {
      const why =
        signal.action === 'buy'
          ? 'já posicionado'
          : signal.action === 'sell'
            ? 'sem posição para vender'
            : signal.reason;

      return {
        action: 'hold',
        reason: signal.action === 'hold' ? why : `${signal.reason} — ${why}`,
        price: signal.price,
        orderId: null,
        error: null,
        nextRunAt: scheduled,
      };
    }

    // Rounded down: rounding up asks for size the balance or the position does
    // not cover, and the write would be rejected for a reason that has nothing
    // to do with the signal.
    const rounded = qty.toDecimalPlaces(instrument.qty_precision, Decimal.ROUND_DOWN);

    if (rounded.lte(0)) {
      return {
        action: 'hold',
        reason: `${signal.reason} — tamanho abaixo da precisão do instrumento`,
        price: signal.price,
        orderId: null,
        error: null,
        nextRunAt: scheduled,
      };
    }

    try {
      const result = await deps.placeOrder({
        userId: strategy.user_id,
        symbol: strategy.symbol,
        side: signal.action === 'buy' ? 'buy' : 'sell',
        type: 'market',
        qty: rounded.toString(),
        mode: strategy.mode,
        // Ties the order to the candle that produced it. A second evaluation of
        // the same candle — a lost lease, a restart mid-flight — collides on the
        // unique index instead of doubling the position.
        clientRef: `s:${strategy.id}:${lastClosed.t}`,
      });

      return {
        action: signal.action,
        reason: `${signal.reason} · ${result.filledQty} @ ${result.avgPrice}`,
        price: signal.price,
        orderId: result.orderId,
        error: null,
        nextRunAt: scheduled,
      };
    } catch (err) {
      if (err instanceof DuplicateOrderError) {
        return {
          action: 'hold',
          reason: 'ordem desta vela já havia sido registrada',
          price: signal.price,
          orderId: null,
          error: null,
          nextRunAt: scheduled,
        };
      }
      throw err;
    }
  } catch (err) {
    // A rejected order is a fact about the strategy, not a crash: an
    // insufficient balance or a notional over the limit is written to the run
    // log in the user's own words. Anything else is logged here and generalised.
    if (!(err instanceof TradingError)) {
      console.error('[runner]', strategy.id, err);
    }

    return {
      action: 'hold',
      reason: '',
      price: null,
      orderId: null,
      error: err instanceof TradingError ? err.message : 'erro inesperado na avaliação',
      nextRunAt: backoffAt(strategy.consecutive_errors, now),
    };
  }
}
