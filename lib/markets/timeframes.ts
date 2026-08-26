// Kept out of exchange.ts and the live data modules because the chart controls
// are a client component: importing this from there would pull ccxt into the
// browser bundle.
export const TIMEFRAMES = ['5m', '15m', '1h', '4h', '1d', '1w'] as const;

export type Timeframe = (typeof TIMEFRAMES)[number];

export function parseTimeframe(raw: string | undefined): Timeframe {
  return TIMEFRAMES.includes(raw as Timeframe) ? (raw as Timeframe) : '1h';
}
