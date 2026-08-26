import type { AssetClass, Strategy } from '../types';
import { type AlertsData, alertsMock } from './mock/alerts';
import { type AnalyticsData, analyticsMock } from './mock/analytics';
import { type AssetDetailData, assetsMock, defaultSymbolByClass } from './mock/assets';
import { type MarketsData, marketsMock } from './mock/markets';
import { type OverviewData, overviewMock } from './mock/overview';
import { type PortfolioData, portfolioMock } from './mock/portfolio';
import { strategiesMock } from './mock/strategies';

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
    return marketsMock;
  },
  async getPortfolio() {
    return portfolioMock;
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
