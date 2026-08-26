import type { Position } from '../../types';

export interface ExposureRow {
  label: string;
  value: string;
  pct: number;
  color: string;
}

export interface RiskMetric {
  label: string;
  value: string;
  meta: string;
  tone: 'up' | 'down' | 'neutral';
}

export interface FiscalRow {
  label: string;
  value: string;
  tone: 'up' | 'down' | 'neutral';
}

export interface TradeRecord {
  datetime: string;
  asset: string;
  side: 'COMPRA' | 'VENDA';
  qty: string;
  price: string;
  total: string;
  result: string;
  origin: string;
}

export interface PortfolioData {
  positions: Position[];
  exposureByClass: ExposureRow[];
  exposureByVenue: ExposureRow[];
  exposureByCurrency: ExposureRow[];
  risk: RiskMetric[];
  riskConcentrationWarning: string;
  riskConcentrationSevere: boolean;
  fiscal: FiscalRow[];
  fiscalNote: string;
  fiscalMonth: string;
  trades: TradeRecord[];
  equityCurve: number[];
  equityLabels: string[];
}

