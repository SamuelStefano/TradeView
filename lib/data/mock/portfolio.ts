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
  exposureByCountry: ExposureRow[];
  risk: RiskMetric[];
  riskConcentrationWarning: string;
  fiscal: FiscalRow[];
  darfAmount: string;
  darfDue: string;
  trades: TradeRecord[];
  equityCurve: number[];
  equityLabels: string[];
}

export const portfolioMock: PortfolioData = {
  positions: [
    {
      symbol: 'NTN-B 2035',
      venue: 'Tesouro Direto',
      assetClass: 'renda fixa',
      qty: '96',
      avgPrice: 'R$ 4.196,40',
      currentPrice: 'R$ 4.412,08',
      pnlOpen: '+R$ 21.568',
      pnlOpenPct: 5.14,
      pnlRealized: '+R$ 8.104',
      weightPct: 14.9,
    },
    {
      symbol: 'BTC',
      venue: 'Binance + Coinbase',
      assetClass: 'cripto',
      qty: '3,1840',
      avgPrice: 'US$ 58.212',
      currentPrice: 'US$ 67.412',
      pnlOpen: '+R$ 159.884',
      pnlOpenPct: 15.8,
      pnlRealized: '+R$ 84.212',
      weightPct: 12.4,
    },
    {
      symbol: 'PETR4',
      venue: 'B3 · XP',
      assetClass: 'ações',
      qty: '8.940',
      avgPrice: 'R$ 36,10',
      currentPrice: 'R$ 38,42',
      pnlOpen: '+R$ 20.741',
      pnlOpenPct: 6.42,
      pnlRealized: '+R$ 12.480',
      weightPct: 12.1,
    },
    {
      symbol: 'NVDA',
      venue: 'IBKR',
      assetClass: 'ações',
      qty: '210',
      avgPrice: 'US$ 148,20',
      currentPrice: 'US$ 182,44',
      pnlOpen: '+R$ 39.244',
      pnlOpenPct: 23.1,
      pnlRealized: '—',
      weightPct: 9.8,
    },
    {
      symbol: 'HGLG11',
      venue: 'B3',
      assetClass: 'fundos',
      qty: '2.400',
      avgPrice: 'R$ 158,10',
      currentPrice: 'R$ 162,30',
      pnlOpen: '+R$ 10.080',
      pnlOpenPct: 2.66,
      pnlRealized: '+R$ 4.318',
      weightPct: 8.7,
    },
    {
      symbol: 'Fwd SE set/26',
      venue: 'BBCE',
      assetClass: 'energia',
      qty: '2,0 MWm',
      avgPrice: 'R$ 122,00',
      currentPrice: 'R$ 119,40',
      pnlOpen: '−R$ 3.822',
      pnlOpenPct: -2.13,
      pnlRealized: '—',
      weightPct: 6.2,
    },
    {
      symbol: 'ETH',
      venue: 'Binance',
      assetClass: 'cripto',
      qty: '18,42',
      avgPrice: 'US$ 2.890',
      currentPrice: 'US$ 3.284',
      pnlOpen: '+R$ 39.664',
      pnlOpenPct: 13.63,
      pnlRealized: '+R$ 11.204',
      weightPct: 5.8,
    },
    {
      symbol: 'CAFÉ dez (KC)',
      venue: 'ICE · IBKR',
      assetClass: 'commodities',
      qty: '4',
      avgPrice: 'US¢ 261,40',
      currentPrice: 'US¢ 284,10',
      pnlOpen: '+R$ 18.612',
      pnlOpenPct: 8.69,
      pnlRealized: '—',
      weightPct: 4.4,
    },
    {
      symbol: 'USD comprado',
      venue: 'OANDA',
      assetClass: 'câmbio',
      qty: 'US$ 40.000',
      avgPrice: 'R$ 5,52',
      currentPrice: 'R$ 5,4610',
      pnlOpen: '−R$ 2.360',
      pnlOpenPct: -1.07,
      pnlRealized: '+R$ 1.104',
      weightPct: 3.9,
    },
  ],

  exposureByClass: [
    { label: 'Renda variável', value: 'Renda variável', pct: 34, color: '#7DA0FF' },
    { label: 'Cripto', value: 'Cripto', pct: 22, color: '#A78BFA' },
    { label: 'Renda fixa', value: 'Renda fixa', pct: 21, color: '#21C77D' },
    { label: 'Energia', value: 'Energia', pct: 9, color: '#E8A33D' },
    { label: 'Commodities', value: 'Commodities', pct: 8, color: '#D4A574' },
    { label: 'Câmbio', value: 'Câmbio', pct: 4, color: '#38BDF8' },
    { label: 'Caixa', value: 'Caixa', pct: 2, color: '#5A6478' },
  ],

  exposureByVenue: [
    { label: 'Energia & O&G', value: 'Energia & O&G', pct: 28, color: '#E8A33D' },
    { label: 'Financeiro', value: 'Financeiro', pct: 18, color: '#7DA0FF' },
    { label: 'Tecnologia', value: 'Tecnologia', pct: 16, color: '#A78BFA' },
    { label: 'Logística/RE', value: 'Logística/RE', pct: 14, color: '#8FBF6A' },
    { label: 'Agro', value: 'Agro', pct: 12, color: '#D4A574' },
    { label: 'Outros', value: 'Outros', pct: 12, color: '#5A6478' },
  ],

  exposureByCurrency: [
    { label: 'BRL', value: 'BRL', pct: 58, color: '#21C77D' },
    { label: 'USD', value: 'USD', pct: 36, color: '#7DA0FF' },
    { label: 'USDT', value: 'USDT', pct: 5, color: '#A78BFA' },
    { label: 'EUR', value: 'EUR', pct: 1, color: '#38BDF8' },
  ],

  exposureByCountry: [
    { label: 'Brasil', value: 'Brasil', pct: 61, color: '#21C77D' },
    { label: 'EUA', value: 'EUA', pct: 31, color: '#7DA0FF' },
    { label: 'Global/cripto', value: 'Global/cripto', pct: 8, color: '#A78BFA' },
  ],

  risk: [
    { label: 'VaR 95% · 1d', value: '−R$ 38.412', meta: '1,35% do patrimônio', tone: 'down' },
    { label: 'Volatilidade 30d', value: '14,2% aa', meta: 'vs 18,1% do IBOV', tone: 'neutral' },
    { label: 'Beta vs IBOV', value: '0,74', meta: 'janela 90d', tone: 'neutral' },
    { label: 'Correlação média', value: '0,31', meta: 'entre posições', tone: 'neutral' },
    { label: 'Maior posição', value: '14,9%', meta: 'NTN-B 2035', tone: 'neutral' },
    { label: 'Alavancagem', value: '1,08x', meta: 'via perpétuos', tone: 'neutral' },
  ],

  riskConcentrationWarning:
    'Concentração: fator juro real BR responde por 41% do patrimônio (NTN-B + FIIs + utilities).',

  fiscal: [
    { label: 'Resultado ações (comum)', value: '+R$ 18.412', tone: 'up' },
    { label: 'Resultado day trade', value: '−R$ 1.208', tone: 'down' },
    { label: 'Resultado cripto', value: '+R$ 22.904', tone: 'up' },
    { label: 'Isenção ações < R$ 20k', value: 'não aplicável', tone: 'neutral' },
    { label: 'Prejuízo a compensar', value: 'R$ 3.180', tone: 'neutral' },
    { label: 'IR retido na fonte', value: 'R$ 214,10', tone: 'neutral' },
  ],

  darfAmount: 'R$ 4.812,44',
  darfDue: '30/set',

  trades: [
    { datetime: '25/08 11:42', asset: 'BTC perp', side: 'COMPRA', qty: '0,2000', price: '66.980', total: 'US$ 13.396', result: '—', origin: 'bot · FSv2' },
    { datetime: '25/08 10:15', asset: 'PETR4', side: 'VENDA', qty: '1.200', price: '38,61', total: 'R$ 46.332', result: '+R$ 2.412', origin: 'manual' },
    { datetime: '22/08 16:48', asset: 'NTN-B 2035', side: 'COMPRA', qty: '12', price: '4.388,10', total: 'R$ 52.657', result: '—', origin: 'manual' },
    { datetime: '21/08 14:02', asset: 'ETH perp', side: 'VENDA', qty: '4,10', price: '3.312,00', total: 'US$ 13.579', result: '+R$ 4.788', origin: 'bot · FSv2' },
    { datetime: '20/08 09:31', asset: 'HGLG11', side: 'COMPRA', qty: '300', price: '160,80', total: 'R$ 48.240', result: '—', origin: 'manual' },
    { datetime: '18/08 15:20', asset: 'CAFÉ dez', side: 'COMPRA', qty: '2', price: '271,20', total: 'US$ 20.340', result: '—', origin: 'manual' },
  ],

  equityCurve: [
    2480000, 2495000, 2488000, 2510000, 2503000, 2528000, 2542000, 2535000, 2558000, 2571000,
    2563000, 2589000, 2601000, 2595000, 2618000, 2632000, 2625000, 2648000, 2661000, 2655000,
    2678000, 2692000, 2685000, 2708000, 2721000, 2715000, 2738000, 2752000, 2745000, 2768000,
    2782000, 2775000, 2798000, 2812000, 2805000, 2828000, 2842000, 2835000, 2848760,
  ],
  equityLabels: [
    'jun', 'jun', 'jun', 'jun', 'jun', 'jun', 'jun', 'jun', 'jun', 'jun',
    'jun', 'jun', 'jul', 'jul', 'jul', 'jul', 'jul', 'jul', 'jul', 'jul',
    'jul', 'jul', 'jul', 'jul', 'ago', 'ago', 'ago', 'ago', 'ago', 'ago',
    'ago', 'ago', 'ago', 'ago', 'ago', 'ago', 'ago', 'ago', 'ago',
  ],
};
