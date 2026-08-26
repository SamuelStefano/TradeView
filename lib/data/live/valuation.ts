import 'server-only';

import { TRADABLE, VENUES, byVenue, bySymbol } from '../../markets/catalogue';
import { fetchQuotes, type Quote } from '../../markets/exchange';

export type QuoteBook = Map<string, Quote>;

// One fetch per venue, then everything downstream reads from the same snapshot.
// Pricing a portfolio and a watchlist off two different snapshots would let the
// same asset show two prices on one screen.
export async function loadQuotes(): Promise<QuoteBook> {
  const book: QuoteBook = new Map();

  const perVenue = await Promise.all(
    VENUES.map(async (venue) => {
      try {
        return await fetchQuotes(
          venue,
          byVenue(venue).map((t) => t.symbol),
        );
      } catch {
        // A venue that is down must not blank the whole screen; the symbols it
        // covers simply have no price this render.
        return new Map<string, Quote>();
      }
    }),
  );

  for (const venueQuotes of perVenue) {
    for (const [symbol, quote] of venueQuotes) book.set(symbol, quote);
  }

  return book;
}

export function priceOf(symbol: string, quotes: QuoteBook): number | null {
  return quotes.get(symbol)?.last ?? null;
}

// BRL is the reporting currency. USDT pairs are converted through the venue's
// own USDT/BRL market rather than a fixed rate, so the number moves with the
// spread the user would actually pay.
export function usdtToBRL(quotes: QuoteBook): number | null {
  return priceOf('USDT/BRL', quotes);
}

export function assetPriceBRL(asset: string, quotes: QuoteBook): number | null {
  if (asset === 'BRL') return 1;

  const direct = priceOf(`${asset}/BRL`, quotes);
  if (direct !== null) return direct;

  const inUsdt = priceOf(`${asset}/USDT`, quotes);
  const rate = usdtToBRL(quotes);
  if (inUsdt !== null && rate !== null) return inUsdt * rate;

  if (asset === 'USDT' || asset === 'USDC') return usdtToBRL(quotes);
  return null;
}

// The quote currency a symbol settles in, used to value a position before
// converting it to BRL.
export function quoteCurrencyOf(symbol: string): string | null {
  return bySymbol(symbol)?.quote ?? null;
}

export function currencyToBRL(currency: string, quotes: QuoteBook): number | null {
  if (currency === 'BRL') return 1;
  return assetPriceBRL(currency, quotes);
}

export const ALL_SYMBOLS = TRADABLE.map((t) => t.symbol);
