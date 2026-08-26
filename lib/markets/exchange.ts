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

export interface Quote {
  symbol: string;
  venue: string;
  last: number;
  changePct: number | null;
  quoteVolume: number | null;
}

const QUOTE_TTL_MS = 15_000;
const quoteCache = new Map<string, { at: number; value: Map<string, Quote> }>();

// A screen renders dozens of symbols from one venue. fetchTickers is a single
// call for all of them, where fetchTicker would be one round trip each and blow
// the rate limit long before the page finished.
export async function fetchQuotes(venue: string, symbols: string[]): Promise<Map<string, Quote>> {
  const cached = quoteCache.get(venue);
  if (cached && Date.now() - cached.at < QUOTE_TTL_MS) return cached.value;

  await ensureMarkets(venue);
  const raw = await getExchange(venue).fetchTickers(symbols);

  const quotes = new Map<string, Quote>();
  for (const [symbol, ticker] of Object.entries(raw)) {
    const last = ticker.last ?? ticker.close;
    if (typeof last !== 'number') continue;
    quotes.set(symbol, {
      symbol,
      venue,
      last,
      changePct: typeof ticker.percentage === 'number' ? ticker.percentage : null,
      quoteVolume: typeof ticker.quoteVolume === 'number' ? ticker.quoteVolume : null,
    });
  }

  quoteCache.set(venue, { at: Date.now(), value: quotes });
  return quotes;
}

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export async function fetchCandles(
  venue: string,
  symbol: string,
  timeframe = '1d',
  limit = 120,
): Promise<Candle[]> {
  await ensureMarkets(venue);
  const exchange = getExchange(venue);
  if (!exchange.has?.fetchOHLCV) return [];

  const rows = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);

  const candles: Candle[] = [];
  for (const row of rows) {
    const [t, o, h, l, c, v] = row as (number | undefined)[];
    if ([t, o, h, l, c].some((n) => typeof n !== 'number')) continue;
    candles.push({ t: t!, o: o!, h: h!, l: l!, c: c!, v: typeof v === 'number' ? v : 0 });
  }
  return candles;
}
