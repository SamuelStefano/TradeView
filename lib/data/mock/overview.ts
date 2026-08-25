import type { AssetClass, Freshness, Signal } from '../../types';

export interface NetWorth {
  brl: string;
  usd: string;
  fxRate: string;
  fxSource: string;
}

export interface PnlCard {
  label: string;
  value: string;
  pct: number;
}

export interface AllocationSlice {
  assetClass: AssetClass;
  pct: number;
  value: string;
  color: string;
}

export type EventImpact = 'ALTO' | 'MÉDIO' | 'BAIXO';

export interface EconomicEvent {
  time: string;
  country: string;
  title: string;
  impact: EventImpact;
  forecast: string;
  previous: string;
}

export interface HeatmapCell {
  symbol: string;
  changePct: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: string;
  changePct: number;
  spark: number[];
  freshness: Freshness;
}

export interface OverviewData {
  netWorth: NetWorth;
  pnlCards: PnlCard[];
  allocation: AllocationSlice[];
  events: EconomicEvent[];
  signals: Signal[];
  analyzing: { asset: string; startedAgo: string } | null;
  heatmap: HeatmapCell[][];
  watchlist: WatchlistItem[];
}

export const overviewMock: OverviewData = {
  netWorth: {
    brl: 'R$ 2.847.312,08',
    usd: 'US$ 521.480,15',
    fxRate: '5,4610',
    fxSource: 'PTAX',
  },
  pnlCards: [],
  allocation: [],
  events: [],
  signals: [],
  analyzing: null,
  heatmap: [],
  watchlist: [],
};
