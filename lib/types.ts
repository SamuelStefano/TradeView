export type AssetClass =
  | 'cripto'
  | 'ações'
  | 'renda fixa'
  | 'câmbio'
  | 'energia'
  | 'commodities'
  | 'índices'
  | 'fundos';

export const ASSET_CLASSES: AssetClass[] = [
  'cripto',
  'ações',
  'renda fixa',
  'câmbio',
  'energia',
  'commodities',
  'índices',
  'fundos',
];

export type Tone = 'up' | 'down' | 'neutral';

export type Freshness =
  | { kind: 'realtime'; agoSeconds: number }
  | { kind: 'delayed'; delayMinutes: number; source: string }
  | { kind: 'eod'; agoMinutes: number }
  | { kind: 'closed' };

export interface Stat {
  key: string;
  value: string;
}

export interface Asset {
  symbol: string;
  name: string;
  venue: string;
  assetClass: AssetClass;
  price: string;
  change: string;
  changePct: number;
  freshness: Freshness;
  stats: Stat[];
}

export interface KVRow {
  key: string;
  value: string;
  tone?: Tone;
}

export interface BookLevel {
  price: string;
  qty: string;
  depthPct: number;
}

export type Panel =
  | { kind: 'kv'; title: string; meta: string; rows: KVRow[] }
  | {
      kind: 'book';
      title: string;
      meta: string;
      mid: string;
      spread: string;
      asks: BookLevel[];
      bids: BookLevel[];
    }
  | {
      kind: 'curve';
      title: string;
      meta: string;
      alt: string;
      legend?: string;
      labels: string[];
      series: number[];
      series2?: number[];
    };

export type IntegrationStatus = 'conectado' | 'degradado' | 'offline' | 'nao_configurado';

export interface Position {
  symbol: string;
  venue: string;
  assetClass: AssetClass;
  qty: string;
  avgPrice: string;
  currentPrice: string;
  pnlOpen: string;
  pnlOpenPct: number;
  pnlRealized: string;
  weightPct: number;
}

export type StrategyState = 'rodando' | 'pausada' | 'backtest' | 'erro';
export type StrategyMode = 'PAPER' | 'REAL';

export interface Strategy {
  id: string;
  name: string;
  state: StrategyState;
  mode: StrategyMode;
  pnl: string;
  drawdownPct: number;
  sharpe: number;
  winRatePct: number;
  trades: number;
  markets: string[];
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  label: string;
}

export type MarkerKind = 'ai' | 'buy' | 'sell';

export interface ChartMarker {
  index: number;
  kind: MarkerKind;
  label: string;
}
