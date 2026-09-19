import { saoPauloMonthKey } from './market-clock';

// Brazilian rule the panel is measured against: crypto disposals up to this
// amount in a calendar month are exempt for an individual. The ceiling is on
// the sale volume, not on the gain — which is why the month boundary has to be
// the local one, and why buys never count towards it.
export const CRYPTO_MONTHLY_EXEMPTION_BRL = 35_000;

export interface FiscalFill {
  /** ISO instant the fill was recorded at. */
  at: string;
  side: 'buy' | 'sell';
  grossBRL: number;
  feeBRL: number;
}

export interface FiscalSummary {
  monthKey: string;
  tradeCount: number;
  salesBRL: number;
  feesBRL: number;
  /** How much more could be sold this month before the exemption is lost. */
  headroomBRL: number;
  overExemption: boolean;
}

export function summariseMonth(fills: FiscalFill[], reference: Date): FiscalSummary {
  const monthKey = saoPauloMonthKey(reference);

  let tradeCount = 0;
  let salesBRL = 0;
  let feesBRL = 0;

  for (const fill of fills) {
    if (saoPauloMonthKey(fill.at) !== monthKey) continue;
    tradeCount += 1;
    feesBRL += fill.feeBRL;
    if (fill.side === 'sell') salesBRL += fill.grossBRL;
  }

  return {
    monthKey,
    tradeCount,
    salesBRL,
    feesBRL,
    headroomBRL: Math.max(CRYPTO_MONTHLY_EXEMPTION_BRL - salesBRL, 0),
    overExemption: salesBRL > CRYPTO_MONTHLY_EXEMPTION_BRL,
  };
}
