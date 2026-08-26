import { Decimal } from 'decimal.js';
import { money } from '../money';
import type { BookLevel, OrderBookSnapshot } from '../markets/exchange';

export type Side = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';

export interface SimulateInput {
  book: OrderBookSnapshot;
  side: Side;
  type: OrderType;
  qty: string;
  limitPrice?: string;
}

export interface SimulatedFill {
  filledQty: Decimal;
  avgPrice: Decimal;
  notional: Decimal;
  fee: Decimal;
  /** Distance between the average fill and the touch, as a fraction. */
  slippage: Decimal;
  /** True when the book was too thin to fill the whole order. */
  partial: boolean;
}

// A buy consumes asks upward from the touch, a sell consumes bids downward.
// Deliberately no "fill at last price" shortcut: pretending an order executes
// at the mid is the single biggest source of backtest self-deception.
export function simulateFill(input: SimulateInput): SimulatedFill {
  const { book, side, type } = input;
  const wanted = money(input.qty);

  if (wanted.lte(0)) throw new Error('quantidade deve ser positiva');

  const levels: BookLevel[] = side === 'buy' ? book.asks : book.bids;
  if (levels.length === 0) throw new Error('livro de ofertas vazio');

  const limit = input.limitPrice ? money(input.limitPrice) : null;
  if (type === 'limit' && !limit) throw new Error('ordem limitada exige preço');

  const touch = money(levels[0].price);

  let remaining = wanted;
  let notional = money(0);
  let filled = money(0);

  for (const level of levels) {
    if (remaining.lte(0)) break;

    const price = money(level.price);
    if (limit) {
      const crossable = side === 'buy' ? price.lte(limit) : price.gte(limit);
      if (!crossable) break;
    }

    const take = Decimal.min(remaining, money(level.qty));
    if (take.lte(0)) continue;

    notional = notional.plus(take.times(price));
    filled = filled.plus(take);
    remaining = remaining.minus(take);
  }

  if (filled.lte(0)) {
    return {
      filledQty: money(0),
      avgPrice: money(0),
      notional: money(0),
      fee: money(0),
      slippage: money(0),
      partial: true,
    };
  }

  const avgPrice = notional.div(filled);
  const fee = notional.times(book.takerFeeRate);
  const slippage = avgPrice.minus(touch).div(touch).abs();

  return { filledQty: filled, avgPrice, notional, fee, slippage, partial: remaining.gt(0) };
}

export interface CashEffect {
  /** Signed movement on the quote currency, fee included. */
  quoteDelta: Decimal;
  /** Signed movement on the base currency. */
  baseDelta: Decimal;
  fee: Decimal;
}

// The fee is always taken in the quote currency, which keeps the ledger to two
// entries per trade instead of three.
export function cashEffect(side: Side, fill: SimulatedFill): CashEffect {
  const fee = fill.fee;
  return side === 'buy'
    ? { quoteDelta: fill.notional.plus(fee).negated(), baseDelta: fill.filledQty, fee }
    : { quoteDelta: fill.notional.minus(fee), baseDelta: fill.filledQty.negated(), fee };
}
