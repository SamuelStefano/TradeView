import type { Strategy } from '../types';
import { type AlertsData, alertsMock } from './mock/alerts';
import { type AnalyticsData, analyticsMock } from './mock/analytics';
import { type AssetDetailData, assetsMock } from './mock/assets';
import { type MarketsData, marketsMock } from './mock/markets';
import { type OverviewData, overviewMock } from './mock/overview';
import { type PortfolioData, portfolioMock } from './mock/portfolio';
import { strategiesMock } from './mock/strategies';

export interface DataSource {
  getOverview(): Promise<OverviewData>;
  getAsset(symbol: string): Promise<AssetDetailData | null>;
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

export function getDataSource(): DataSource {
  return mockDataSource;
}
