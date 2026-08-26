import type { Asset, Candle, ChartMarker, Panel } from '../../types';

export interface NewsItem {
  source: string;
  title: string;
  ago: string;
  relevancePct: number;
  sentimentScore: string;
  sentimentTone: 'up' | 'down' | 'neutral';
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
  news: NewsItem[];
  correlations: Correlation[];
}

// Only the overlays the chart actually draws. EMA, RSI and MACD used to be
// offered here and did nothing when toggled.
export const INDICATORS = ['MA', 'BB', 'VOL'] as const;
