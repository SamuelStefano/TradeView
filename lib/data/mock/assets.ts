import type { AIThesis, Asset, AssetClass, Candle, ChartMarker, Panel } from '../../types';

export interface NewsItem {
  source: string;
  title: string;
  ago: string;
  relevancePct: number;
  url: string;
}

export interface Correlation {
  symbol: string;
  value: number;
}

export interface AssetDetailData {
  asset: Asset;
  panels: Panel[];
  candles: Candle[];
  markers: ChartMarker[];
  ai: AIThesis;
  news: NewsItem[];
  correlations: Correlation[];
}

export const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1S', '1M'] as const;
export const INDICATORS = ['MA', 'EMA', 'RSI', 'MACD', 'BB', 'VOL'] as const;

export const assetsMock: Record<string, AssetDetailData> = {};

export const defaultSymbolByClass: Record<AssetClass, string> = {
  cripto: 'BTC-USD',
  'ações': 'PETR4',
  'renda fixa': 'NTNB-2035',
  'câmbio': 'USD-BRL',
  energia: 'PLD-SE',
  commodities: 'SOJA-MAR',
  'índices': 'IBOV',
  fundos: 'HGLG11',
};
