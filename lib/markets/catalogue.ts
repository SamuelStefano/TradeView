import type { AssetClass } from '../types';

export interface CatalogueEntry {
  symbol: string;
  venue: string;
  assetClass: AssetClass;
  base: string;
  quote: string;
}

// Mirrors 20260826000003_instruments.sql. The table is the authority for
// placing an order — it is what place-order.ts validates against — but reading
// it needs a session, and the market screens are public. Keeping the display
// copy here lets a logged-out visitor see real prices without handing the
// catalogue read to a role that bypasses RLS.
//
// catalogue.test.ts fails if the two ever disagree.
export const TRADABLE: CatalogueEntry[] = [
  { symbol: 'BTC/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'BTC', quote: 'BRL' },
  { symbol: 'ETH/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'ETH', quote: 'BRL' },
  { symbol: 'SOL/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'SOL', quote: 'BRL' },
  { symbol: 'USDT/BRL', venue: 'foxbit', assetClass: 'câmbio', base: 'USDT', quote: 'BRL' },
  { symbol: 'USDC/BRL', venue: 'foxbit', assetClass: 'câmbio', base: 'USDC', quote: 'BRL' },
  { symbol: 'XRP/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'XRP', quote: 'BRL' },
  { symbol: 'ADA/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'ADA', quote: 'BRL' },
  { symbol: 'DOGE/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'DOGE', quote: 'BRL' },
  { symbol: 'AVAX/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'AVAX', quote: 'BRL' },
  { symbol: 'LINK/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'LINK', quote: 'BRL' },
  { symbol: 'LTC/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'LTC', quote: 'BRL' },
  { symbol: 'DOT/BRL', venue: 'foxbit', assetClass: 'cripto', base: 'DOT', quote: 'BRL' },
  { symbol: 'BTC/USDT', venue: 'okx', assetClass: 'cripto', base: 'BTC', quote: 'USDT' },
  { symbol: 'ETH/USDT', venue: 'okx', assetClass: 'cripto', base: 'ETH', quote: 'USDT' },
  { symbol: 'SOL/USDT', venue: 'okx', assetClass: 'cripto', base: 'SOL', quote: 'USDT' },
  { symbol: 'XRP/USDT', venue: 'okx', assetClass: 'cripto', base: 'XRP', quote: 'USDT' },
  { symbol: 'ADA/USDT', venue: 'okx', assetClass: 'cripto', base: 'ADA', quote: 'USDT' },
  { symbol: 'DOGE/USDT', venue: 'okx', assetClass: 'cripto', base: 'DOGE', quote: 'USDT' },
  { symbol: 'AVAX/USDT', venue: 'okx', assetClass: 'cripto', base: 'AVAX', quote: 'USDT' },
  { symbol: 'LINK/USDT', venue: 'okx', assetClass: 'cripto', base: 'LINK', quote: 'USDT' },
  { symbol: 'LTC/USDT', venue: 'okx', assetClass: 'cripto', base: 'LTC', quote: 'USDT' },
  { symbol: 'DOT/USDT', venue: 'okx', assetClass: 'cripto', base: 'DOT', quote: 'USDT' },
  { symbol: 'TRX/USDT', venue: 'okx', assetClass: 'cripto', base: 'TRX', quote: 'USDT' },
];

export const VENUES = [...new Set(TRADABLE.map((t) => t.venue))];

export interface VenueInfo {
  id: string;
  name: string;
  kind: string;
  logo: string;
  site: string;
}

// Only the two venues that answer from a datacenter IP. Binance returns 451 and
// Mercado Bitcoin 403 to hosted ranges, so listing them would be listing a
// connection that can never be established from where this runs.
export const VENUE_INFO: Record<string, VenueInfo> = {
  foxbit: {
    id: 'foxbit',
    name: 'Foxbit',
    kind: 'cripto BR · spot',
    logo: 'FX',
    site: 'https://foxbit.com.br',
  },
  okx: {
    id: 'okx',
    name: 'OKX',
    kind: 'cripto global · spot',
    logo: 'OK',
    site: 'https://www.okx.com',
  },
};

export function bySymbol(symbol: string): CatalogueEntry | undefined {
  return TRADABLE.find((t) => t.symbol === symbol);
}

export function byVenue(venue: string): CatalogueEntry[] {
  return TRADABLE.filter((t) => t.venue === venue);
}

// URL-safe form used by /asset/[symbol]: BTC/BRL <-> BTC-BRL.
export function toSlug(symbol: string): string {
  return symbol.replace('/', '-');
}

export function fromSlug(slug: string): string {
  return slug.replace('-', '/');
}
