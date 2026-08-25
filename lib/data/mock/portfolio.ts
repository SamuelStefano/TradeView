import type { Position } from '../../types';

export interface ExposureRow {
  label: string;
  value: string;
  pct: number;
}

export interface RiskMetric {
  label: string;
  value: string;
  meta: string;
}

export interface PortfolioData {
  positions: Position[];
  exposureByClass: ExposureRow[];
  exposureByVenue: ExposureRow[];
  exposureByCurrency: ExposureRow[];
  risk: RiskMetric[];
  equityCurve: number[];
  equityLabels: string[];
}

export const portfolioMock: PortfolioData = {
  positions: [],
  exposureByClass: [],
  exposureByVenue: [],
  exposureByCurrency: [],
  risk: [],
  equityCurve: [],
  equityLabels: [],
};
