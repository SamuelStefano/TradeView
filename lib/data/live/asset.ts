import 'server-only';

import { VENUE_INFO, byVenue, bySymbol, fromSlug } from '../../markets/catalogue';
import { fetchCandles, fetchOrderBook, fetchQuotes, type Candle as RawCandle } from '../../markets/exchange';
import { freshnessOf } from '../../markets/freshness';
import { num } from '../../format';
import type { Candle, Panel, Stat } from '../../types';
import type { Timeframe } from '../../markets/timeframes';
import type { AssetDetailData, Correlation } from '../views/assets';

const CANDLE_LIMIT = 90;

function moneyIn(currency: string, value: number): string {
  const decimals = value >= 1000 ? 2 : value >= 1 ? 2 : 6;
  const formatted = num(value, decimals);
  return currency === 'BRL' ? `R$ ${formatted}` : `${formatted} ${currency}`;
}

function compact(value: number, currency: string): string {
  const units: [number, string][] = [
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'k'],
  ];
  for (const [size, suffix] of units) {
    if (value >= size) return `${num(value / size, 1)}${suffix} ${currency}`;
  }
  return `${num(value, 0)} ${currency}`;
}

function labelFor(t: number, timeframe: Timeframe): string {
  const d = new Date(t);
  const intraday = timeframe === '5m' || timeframe === '15m' || timeframe === '1h' || timeframe === '4h';
  return intraday
    ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toChartCandles(raw: RawCandle[], timeframe: Timeframe): Candle[] {
  return raw.map((c) => ({
    open: c.o,
    high: c.h,
    low: c.l,
    close: c.c,
    volume: c.v,
    label: labelFor(c.t, timeframe),
  }));
}

function bookPanel(
  book: Awaited<ReturnType<typeof fetchOrderBook>>,
  currency: string,
  venueName: string,
): Panel {
  const asks = book.asks.slice(0, 5);
  const bids = book.bids.slice(0, 5);
  const peak = Math.max(...[...asks, ...bids].map((l) => l.qty), 0);
  const level = (l: { price: number; qty: number }) => ({
    price: num(l.price, l.price >= 1000 ? 2 : 4),
    qty: num(l.qty, 4),
    depthPct: peak > 0 ? Math.round((l.qty / peak) * 100) : 0,
  });

  const bestAsk = asks[0]?.price ?? 0;
  const bestBid = bids[0]?.price ?? 0;
  const mid = bestAsk && bestBid ? (bestAsk + bestBid) / 2 : bestAsk || bestBid;

  return {
    kind: 'book',
    title: 'Order book',
    meta: `${venueName} · ${currency}`,
    mid: num(mid, mid >= 1000 ? 2 : 4),
    spread: num(bestAsk - bestBid, bestAsk >= 1000 ? 2 : 4),
    // The book arrives best-first; the ask column reads top-down away from the
    // mid, so the far side has to be reversed to sit above it.
    asks: [...asks].reverse().map(level),
    bids: bids.map(level),
  };
}

function correlate(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 20) return null;

  const x = a.slice(-n);
  const y = b.slice(-n);
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;

  let cov = 0;
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    cov += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  if (vx === 0 || vy === 0) return null;
  return cov / Math.sqrt(vx * vy);
}

function returnsOf(candles: RawCandle[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].c;
    if (prev > 0) out.push(candles[i].c / prev - 1);
  }
  return out;
}

const CORR_TTL_MS = 10 * 60 * 1000;
const corrCache = new Map<string, { at: number; value: Correlation[] }>();

// Correlation is computed from the daily closes the venue already serves, over
// the same window for every pair. It is one of the few analytics on this screen
// the app can derive without a data source it does not have.
async function correlationsFor(symbol: string, venue: string): Promise<Correlation[]> {
  const cached = corrCache.get(symbol);
  if (cached && Date.now() - cached.at < CORR_TTL_MS) return cached.value;

  const peers = byVenue(venue).filter((p) => p.symbol !== symbol);
  const series = await Promise.all(
    [symbol, ...peers.map((p) => p.symbol)].map(async (s) => {
      try {
        return returnsOf(await fetchCandles(venue, s, '1d', 90));
      } catch {
        return [];
      }
    }),
  );

  const [base, ...rest] = series;
  const value: Correlation[] = [];
  peers.forEach((peer, i) => {
    const r = correlate(base, rest[i]);
    if (r !== null) value.push({ symbol: peer.symbol, value: Number(r.toFixed(2)) });
  });
  value.sort((a, b) => b.value - a.value);

  corrCache.set(symbol, { at: Date.now(), value });
  return value;
}

export async function getLiveAsset(
  slug: string,
  timeframe: Timeframe = '1h',
): Promise<AssetDetailData | null> {
  const symbol = fromSlug(slug);
  const entry = bySymbol(symbol);
  if (!entry) return null;

  const { venue, quote: currency, base } = entry;
  const venueName = VENUE_INFO[venue]?.name ?? venue;

  const [quotes, rawCandles, book, correlations] = await Promise.all([
    fetchQuotes(venue, byVenue(venue).map((t) => t.symbol)).catch(() => null),
    fetchCandles(venue, symbol, timeframe, CANDLE_LIMIT).catch(() => [] as RawCandle[]),
    fetchOrderBook(venue, symbol, 20).catch(() => null),
    correlationsFor(symbol, venue).catch(() => [] as Correlation[]),
  ]);

  const ticker = quotes?.get(symbol) ?? null;
  const last = ticker?.last ?? rawCandles.at(-1)?.c ?? null;
  const changePct = ticker?.changePct ?? 0;
  const observedAt = ticker?.observedAt ?? rawCandles.at(-1)?.t ?? null;

  const stats: Stat[] = [];
  if (ticker?.quoteVolume != null) {
    stats.push({ key: 'Vol 24h', value: compact(ticker.quoteVolume, currency) });
  }
  if (rawCandles.length > 0) {
    const window = rawCandles.slice(-24);
    stats.push({ key: 'Máx', value: num(Math.max(...window.map((c) => c.h)), 2) });
    stats.push({ key: 'Mín', value: num(Math.min(...window.map((c) => c.l)), 2) });
  }
  if (book) {
    stats.push({ key: 'Taxa taker', value: `${num(book.takerFeeRate * 100, 3)}%` });
  }

  const panels: Panel[] = [];
  if (book) panels.push(bookPanel(book, currency, venueName));

  const rows = [
    { key: 'Último', value: last !== null ? moneyIn(currency, last) : '—' },
    {
      key: 'Variação 24h',
      value: ticker?.changePct != null ? `${num(ticker.changePct, 2)}%` : '—',
      tone: (changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
    },
    {
      key: 'Volume 24h',
      value: ticker?.quoteVolume != null ? compact(ticker.quoteVolume, currency) : '—',
    },
    { key: 'Moeda de cotação', value: currency },
    { key: 'Candles carregados', value: String(rawCandles.length) },
  ];
  panels.push({ kind: 'kv', title: 'Mercado', meta: `${venueName} · ${timeframe}`, rows });

  return {
    asset: {
      symbol,
      name: `${base} cotado em ${currency}`,
      venue: `${venueName} · spot`,
      assetClass: entry.assetClass,
      price: last !== null ? moneyIn(currency, last) : '—',
      change: ticker?.changePct != null ? `${num(ticker.changePct, 2)}% em 24h` : 'variação indisponível',
      changePct,
      // Falls back to the last candle when the ticker call failed: the price
      // shown then comes from that candle, so the age has to describe it.
      freshness: observedAt === null
        ? { kind: 'closed' }
        : freshnessOf(observedAt, Date.now(), venueName),
      stats,
    },
    panels,
    candles: toChartCandles(rawCandles, timeframe),
    markers: [],
    news: [],
    correlations,
  };
}
