import 'server-only';

import ccxt, { type Exchange } from 'ccxt';

// One instance per venue per process. CCXT's rate limiter is per-instance, so
// sharing it is what keeps concurrent requests inside the venue's budget.
const instances = new Map<string, Exchange>();

export function getExchange(venue: string): Exchange {
  const cached = instances.get(venue);
  if (cached) return cached;

  const Ctor = (ccxt as unknown as Record<string, new (cfg: object) => Exchange>)[venue];
  if (!Ctor) throw new Error(`venue não suportado: ${venue}`);

  const exchange = new Ctor({ enableRateLimit: true, timeout: 10_000 });
  instances.set(venue, exchange);
  return exchange;
}

const marketsLoaded = new Map<string, Promise<unknown>>();

// loadMarkets is a large response; fetching it per request would dominate the
// rate-limit budget.
export function ensureMarkets(venue: string): Promise<unknown> {
  const pending = marketsLoaded.get(venue);
  if (pending) return pending;

  const promise = getExchange(venue)
    .loadMarkets()
    .catch((err) => {
      marketsLoaded.delete(venue);
      throw err;
    });

  marketsLoaded.set(venue, promise);
  return promise;
}

export interface BookLevel {
  price: number;
  qty: number;
}

export interface OrderBookSnapshot {
  symbol: string;
  venue: string;
  bids: BookLevel[];
  asks: BookLevel[];
  takerFeeRate: number;
  fetchedAt: number;
}

export async function fetchOrderBook(
  venue: string,
  symbol: string,
  depth = 50,
): Promise<OrderBookSnapshot> {
  await ensureMarkets(venue);
  const exchange = getExchange(venue);
  const book = await exchange.fetchOrderBook(symbol, depth);

  const toLevels = (raw: unknown[][]): BookLevel[] =>
    raw
      .filter((l) => typeof l[0] === 'number' && typeof l[1] === 'number')
      .map((l) => ({ price: l[0] as number, qty: l[1] as number }));

  return {
    symbol,
    venue,
    bids: toLevels(book.bids ?? []),
    asks: toLevels(book.asks ?? []),
    takerFeeRate: exchange.markets?.[symbol]?.taker ?? 0.001,
    fetchedAt: book.timestamp ?? Date.now(),
  };
}

export async function fetchLastPrice(venue: string, symbol: string): Promise<number | null> {
  await ensureMarkets(venue);
  const ticker = await getExchange(venue).fetchTicker(symbol);
  return ticker.last ?? ticker.close ?? null;
}
