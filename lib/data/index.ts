import type { AssetClass, Strategy } from '../types';
import { type AlertsData, alertsMock } from './views/alerts';
import { type AnalyticsData, analyticsMock } from './views/analytics';
import { type AssetDetailData, assetsMock, defaultSymbolByClass } from './views/assets';
import type { MarketsData } from './views/markets';
import { getLiveMarkets } from './live/venues';
import { type OverviewData, overviewMock } from './views/overview';
import type { PortfolioData } from './views/portfolio';
import { emptyPortfolio, getLivePortfolio } from './live/portfolio';
import { strategiesMock } from './views/strategies';
import { supabaseConfigured } from '../supabase/config';

export interface DataSource {
  getOverview(): Promise<OverviewData>;
  getAsset(symbol: string): Promise<AssetDetailData | null>;
  getDefaultSymbols(): Promise<Record<AssetClass, string>>;
  getMarkets(): Promise<MarketsData>;
  getPortfolio(): Promise<PortfolioData>;
  getStrategies(): Promise<Strategy[]>;
  getAlerts(): Promise<AlertsData>;
  getAnalytics(): Promise<AnalyticsData>;
}

const mockDataSource: DataSource = {
  async getOverview() {
    return overviewMock;
  },
  async getAsset(symbol) {
    return assetsMock[symbol] ?? null;
  },
  async getDefaultSymbols() {
    return defaultSymbolByClass;
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
  async getStrategies() {
    return strategiesMock;
  },
  async getAlerts() {
    return alertsMock;
  },
  async getAnalytics() {
    return analyticsMock;
  },
};

// Async so it is a data read, not a clock call during render — React's purity
// rule rejects the latter, and it is genuinely a property of the fetch.
export async function fetchedAt(): Promise<number> {
  return Date.now();
}

export function getDataSource(): DataSource {
  return mockDataSource;
}
