import type { AssetDetailData } from './views/assets';
import { getLiveAsset } from './live/asset';
import type { Timeframe } from '../markets/timeframes';
import type { MarketsData } from './views/markets';
import { getLiveMarkets } from './live/venues';
import type { OverviewData } from './views/overview';
import { getLiveOverview } from './live/overview';
import type { PortfolioData } from './views/portfolio';
import { emptyPortfolio, getLivePortfolio } from './live/portfolio';
import { supabaseConfigured } from '../supabase/config';

export interface DataSource {
  getOverview(): Promise<OverviewData>;
  getAsset(slug: string, timeframe?: Timeframe): Promise<AssetDetailData | null>;
  getMarkets(): Promise<MarketsData>;
  getPortfolio(): Promise<PortfolioData>;
}

const dataSource: DataSource = {
  async getOverview() {
    return getLiveOverview();
  },
  async getAsset(slug, timeframe) {
    return getLiveAsset(slug, timeframe);
  },
  async getMarkets() {
    return getLiveMarkets();
  },
  // The portfolio is the one screen that must never show a number the user did
  // not put there. Without a database there is nothing to report, so it reports
  // nothing rather than a demonstration balance.
  async getPortfolio() {
    if (!supabaseConfigured) return emptyPortfolio;
    return getLivePortfolio('paper');
  },
};

// Async so it is a data read, not a clock call during render — React's purity
// rule rejects the latter, and it is genuinely a property of the fetch.
export async function fetchedAt(): Promise<number> {
  return Date.now();
}

export function getDataSource(): DataSource {
  return dataSource;
}
