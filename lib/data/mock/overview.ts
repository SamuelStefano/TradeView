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

function seedRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function spark(seed: number, upTrend: boolean): number[] {
  const r = seedRng(seed);
  let y = 12;
  const pts: number[] = [];
  for (let x = 0; x <= 56; x += 4) {
    y += (r() - (upTrend ? 0.56 : 0.44)) * 5;
    y = Math.max(2, Math.min(18, y));
    pts.push(y);
  }
  return pts;
}

export const overviewMock: OverviewData = {
  netWorth: {
    brl: 'R$ 2.847.312,08',
    usd: 'US$ 521.480,15',
    fxRate: '5,4610',
    fxSource: 'PTAX',
  },
  pnlCards: [
    { label: 'P&L dia', value: '+R$ 12.480', pct: 0.44 },
    { label: 'P&L semana', value: '−R$ 8.112', pct: -0.28 },
    { label: 'P&L mês', value: '+R$ 96.204', pct: 3.5 },
    { label: 'Desde o início', value: '+R$ 847.312', pct: 42.4 },
  ],
  allocation: [
    { assetClass: 'ações', pct: 34, value: '', color: 'var(--color-accent)' },
    { assetClass: 'cripto', pct: 22, value: '', color: 'var(--color-class-cripto)' },
    { assetClass: 'renda fixa', pct: 21, value: '', color: 'var(--color-class-renda-fixa)' },
    { assetClass: 'energia', pct: 9, value: '', color: 'var(--color-class-energia)' },
    { assetClass: 'commodities', pct: 8, value: '', color: 'var(--color-class-cambio)' },
    { assetClass: 'câmbio', pct: 6, value: '', color: 'var(--color-class-indices)' },
  ],
  events: [
    { time: '09:00', country: 'BR', title: 'IPCA-15 (ago)', impact: 'ALTO', forecast: '+0,18% m/m', previous: '' },
    { time: '11:30', country: 'BR', title: 'Leilão Tesouro — NTN-B', impact: 'MÉDIO', forecast: 'lote 2035/2045', previous: '' },
    { time: '15:00', country: 'US', title: 'FOMC minutes', impact: 'ALTO', forecast: 'reunião de jul', previous: '' },
    { time: '18:10', country: 'US', title: 'Earnings NVDA', impact: 'ALTO', forecast: 'consenso EPS 0,94', previous: '' },
    { time: '—', country: 'BR', title: 'Copom (amanhã)', impact: 'BAIXO', forecast: 'Selic: manutenção 14,75%', previous: '' },
  ],
  signals: [
    {
      id: 'sig-1',
      asset: 'BTC/USDT',
      direction: 'LONG',
      conviction: 87,
      horizon: '3–7 dias',
      thesis: 'Funding negativo com OI subindo: posicionamento vendido esticado abre espaço para squeeze.',
      why: 'Funding em −0,012% (P10 histórico) enquanto open interest subiu 8% em 48h e reservas em exchanges caíram 22k BTC. Combinação historicamente precede reversões de 4–9% em 5 dias (18 de 23 casos desde 2022).',
      sources: [
        { label: 'funding Binance', url: '#' },
        { label: 'CME OI', url: '#' },
        { label: 'Glassnode', url: '#' },
      ],
      ago: 'há 2min',
    },
    {
      id: 'sig-2',
      asset: 'Tesouro IPCA+ 2035',
      direction: 'COMPRA',
      conviction: 81,
      horizon: '1–3 meses',
      thesis: 'Juro real a 6,2% com IPCA-15 desacelerando: assimetria favorável na ponta longa.',
      why: 'Breakeven de inflação implícito (5,9%) está 80bps acima da mediana das projeções Focus. Fechamento de 40bps na NTN-B 2035 gera +6,8% de marcação a mercado (duration 8,9).',
      sources: [
        { label: 'funding Binance', url: '#' },
        { label: 'CME OI', url: '#' },
        { label: 'Glassnode', url: '#' },
      ],
      ago: 'há 11min',
    },
    {
      id: 'sig-3',
      asset: 'PLD SE/CO',
      direction: 'ALTA',
      conviction: 74,
      horizon: '2–4 semanas',
      thesis: 'ENA 38% abaixo da MLT e despacho térmico crescendo: pressão altista no spot de setembro.',
      why: 'Energia natural afluente no subsistema SE/CO em 62% da média de longo termo, reservatórios em 41%. Curva forward set/26 ainda não precifica despacho térmico adicional de 2,1 GWmed.',
      sources: [
        { label: 'funding Binance', url: '#' },
        { label: 'CME OI', url: '#' },
        { label: 'Glassnode', url: '#' },
      ],
      ago: 'há 26min',
    },
    {
      id: 'sig-4',
      asset: 'PETR4',
      direction: 'SHORT',
      conviction: 62,
      horizon: '1–2 semanas',
      thesis: 'Brent perdendo suporte de US$ 74 com crack spreads comprimindo; PETR4 defasada do móvel.',
      why: 'Correlação PETR4×Brent (0,78 em 90d) sugere ajuste de −3,2% para convergência. Fluxo estrangeiro na B3 negativo há 6 pregões.',
      sources: [
        { label: 'funding Binance', url: '#' },
        { label: 'CME OI', url: '#' },
        { label: 'Glassnode', url: '#' },
      ],
      ago: 'há 1h',
    },
  ],
  analyzing: { asset: 'B3', startedAgo: 'agora' },
  heatmap: [
    [
      { symbol: 'BTC', changePct: 2.4 },
      { symbol: 'ETH', changePct: 3.1 },
      { symbol: 'SOL', changePct: -1.8 },
      { symbol: 'BNB', changePct: 0.6 },
      { symbol: 'XRP', changePct: -0.4 },
      { symbol: 'AVAX', changePct: 4.2 },
      { symbol: 'LINK', changePct: 1.1 },
      { symbol: 'DOGE', changePct: -2.6 },
    ],
    [
      { symbol: 'PETR4', changePct: -1.2 },
      { symbol: 'VALE3', changePct: 0.8 },
      { symbol: 'ITUB4', changePct: 0.4 },
      { symbol: 'BBAS3', changePct: -0.6 },
      { symbol: 'WEGE3', changePct: 1.6 },
      { symbol: 'ELET3', changePct: 2.1 },
      { symbol: 'B3SA3', changePct: -0.3 },
      { symbol: 'PRIO3', changePct: -2.1 },
    ],
    [
      { symbol: 'NVDA', changePct: 1.9 },
      { symbol: 'AAPL', changePct: 0.3 },
      { symbol: 'MSFT', changePct: 0.7 },
      { symbol: 'AMZN', changePct: -0.5 },
      { symbol: 'META', changePct: 1.2 },
      { symbol: 'GOOG', changePct: 0.2 },
      { symbol: 'TSLA', changePct: -3.1 },
      { symbol: 'AMD', changePct: 2.4 },
    ],
    [
      { symbol: 'DI27', changePct: -0.1 },
      { symbol: 'DI29', changePct: -0.2 },
      { symbol: 'B35', changePct: 0.3 },
      { symbol: 'B45', changePct: 0.5 },
      { symbol: 'T10Y', changePct: -0.1 },
      { symbol: 'T2Y', changePct: 0.0 },
      { symbol: 'CDB♦', changePct: 0.0 },
      { symbol: 'LCI♦', changePct: 0.0 },
    ],
    [
      { symbol: 'USDBRL', changePct: -0.4 },
      { symbol: 'EURBRL', changePct: -0.2 },
      { symbol: 'EURUSD', changePct: 0.2 },
      { symbol: 'GBPUSD', changePct: 0.1 },
      { symbol: 'USDJPY', changePct: -0.3 },
      { symbol: 'USDMXN', changePct: 0.4 },
      { symbol: 'DXY', changePct: -0.2 },
      { symbol: 'BTCBRL', changePct: 2.0 },
    ],
    [
      { symbol: 'PLD SE', changePct: 3.4 },
      { symbol: 'PLD S', changePct: 2.8 },
      { symbol: 'PLD NE', changePct: 1.2 },
      { symbol: 'PLD N', changePct: 0.9 },
      { symbol: 'TTF', changePct: -1.4 },
      { symbol: 'HH', changePct: 0.8 },
      { symbol: 'EUA-CO2', changePct: 0.6 },
      { symbol: 'I-REC', changePct: 0.2 },
    ],
    [
      { symbol: 'SOJA', changePct: -0.8 },
      { symbol: 'MILHO', changePct: -1.1 },
      { symbol: 'CAFÉ', changePct: 2.2 },
      { symbol: 'BOI', changePct: 0.4 },
      { symbol: 'OURO', changePct: 0.6 },
      { symbol: 'PRATA', changePct: 1.4 },
      { symbol: 'BRENT', changePct: -1.6 },
      { symbol: 'COBRE', changePct: 0.9 },
    ],
    [
      { symbol: 'IBOV', changePct: -0.3 },
      { symbol: 'WIN', changePct: -0.3 },
      { symbol: 'SPX', changePct: 0.5 },
      { symbol: 'NDX', changePct: 0.9 },
      { symbol: 'VIX', changePct: -4.2 },
      { symbol: 'DAX', changePct: 0.3 },
      { symbol: 'NIKKEI', changePct: 1.1 },
      { symbol: 'IFIX', changePct: 0.2 },
    ],
  ],
  watchlist: [
    { symbol: 'BTC/USDT', name: 'Binance · perp', price: 'US$ 67.412', changePct: 2.41, spark: spark('BTC/USDT'.length * 997 + 13, true), freshness: { kind: 'realtime', agoSeconds: 1 } },
    { symbol: 'ETH/USDT', name: 'Binance · spot', price: 'US$ 3.284,10', changePct: 3.08, spark: spark('ETH/USDT'.length * 997 + 13, true), freshness: { kind: 'realtime', agoSeconds: 1 } },
    { symbol: 'PETR4', name: 'B3', price: 'R$ 38,42', changePct: -1.21, spark: spark('PETR4'.length * 997 + 13, false), freshness: { kind: 'realtime', agoSeconds: 3 } },
    { symbol: 'VALE3', name: 'B3', price: 'R$ 61,08', changePct: 0.84, spark: spark('VALE3'.length * 997 + 13, true), freshness: { kind: 'realtime', agoSeconds: 2 } },
    { symbol: 'NVDA', name: 'NASDAQ', price: 'US$ 182,44', changePct: 1.92, spark: spark('NVDA'.length * 997 + 13, true), freshness: { kind: 'delayed', delayMinutes: 15, source: 'NASDAQ' } },
    { symbol: 'IPCA+ 2035', name: 'Tesouro', price: 'IPCA+6,21%', changePct: -0.04, spark: spark('IPCA+ 2035'.length * 997 + 13, true), freshness: { kind: 'realtime', agoSeconds: 5 } },
    { symbol: 'USD/BRL', name: 'FX', price: 'R$ 5,4610', changePct: -0.38, spark: spark('USD/BRL'.length * 997 + 13, false), freshness: { kind: 'realtime', agoSeconds: 1 } },
    { symbol: 'PLD SE/CO', name: 'CCEE', price: 'R$ 141,20', changePct: 3.4, spark: spark('PLD SE/CO'.length * 997 + 13, true), freshness: { kind: 'realtime', agoSeconds: 10 } },
    { symbol: 'SOJA nov', name: 'B3 · fut', price: 'US$ 10,42', changePct: -0.81, spark: spark('SOJA nov'.length * 997 + 13, false), freshness: { kind: 'closed' } },
    { symbol: 'HGLG11', name: 'B3 · FII', price: 'R$ 162,30', changePct: 0.22, spark: spark('HGLG11'.length * 997 + 13, true), freshness: { kind: 'realtime', agoSeconds: 8 } },
  ],
};
