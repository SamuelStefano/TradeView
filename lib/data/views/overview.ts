import type { Freshness } from '../../types';

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

// Labelled rather than typed by AssetClass because cash is a slice of the donut
// and is not an asset class.
export interface AllocationSlice {
  label: string;
  pct: number;
  value: string;
  color: string;
}

export interface HeatmapCell {
  symbol: string;
  changePct: number;
}

export interface HeatmapRow {
  label: string;
  cells: HeatmapCell[];
}

export interface WatchlistItem {
  symbol: string;
  slug: string;
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
  heatmap: HeatmapRow[];
  watchlist: WatchlistItem[];
  // Explains an absent patrimony instead of letting the screen render a
  // confident zero for someone who simply is not signed in.
  accountNote: string;
}

export const emptyOverview: OverviewData = {
  netWorth: { brl: '—', usd: '—', fxRate: '—', fxSource: 'sem cotação' },
  pnlCards: [],
  allocation: [],
  heatmap: [],
  watchlist: [],
  accountNote: 'Entre na conta para ver patrimônio e alocação.',
};
