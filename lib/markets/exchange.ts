// The venue client itself lives in ./core/exchange so the strategy runner, a
// plain Node process, can share the same rate-limited instances. This entry
// point keeps the browser guard for everything inside the Next app.
import 'server-only';

export {
  getExchange,
  ensureMarkets,
  venueHealth,
  fetchOrderBook,
  fetchLastPrice,
  fetchQuotes,
  fetchCandles,
} from '../core/exchange';

export type {
  VenueHealth,
  BookLevel,
  OrderBookSnapshot,
  Quote,
  Candle,
} from '../core/exchange';
