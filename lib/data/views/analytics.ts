export interface AccuracyCell {
  value: number;
  opacityFraction: number;
}

export interface AccuracyRow {
  cls: string;
  cells: AccuracyCell[];
}

export interface CostBar {
  x: number;
  y: number;
  h: number;
}

export interface MissedEntry {
  id: string;
  date: string;
  asset: string;
  direction: string;
  directionTone: 'up' | 'down';
  conviction: string;
  gain: string;
  gainTone: 'up' | 'down';
  result: string;
}

export interface AnalyticsData {
  accuracyRows: AccuracyRow[];
  modelAccuracy: string;
  signalCount: number;
  costTokens: string;
  costAI: string;
  costData: string;
  costBars: CostBar[];
  opportunityCost: string;
  missed: MissedEntry[];
}

function cell(v: number): AccuracyCell {
  const t = (v - 45) / 40;
  return { value: v, opacityFraction: 0.08 + Math.max(0, t) * 0.55 };
}

function buildCostBars(): CostBar[] {
  let seed = 7;
  const r = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 25 }, (_, i) => {
    const h = 8 + r() * (i === 21 ? 62 : 38);
    return {
      x: parseFloat((4 + i * 12.6).toFixed(1)),
      y: parseFloat((80 - h).toFixed(1)),
      h: parseFloat(h.toFixed(1)),
    };
  });
}

export const analyticsMock: AnalyticsData = {
  accuracyRows: [
    { cls: 'Cripto', cells: [72, 66, 58, 51].map(cell) },
    { cls: 'Ações BR', cells: [61, 64, 60, 55].map(cell) },
    { cls: 'Ações US', cells: [58, 62, 57, 52].map(cell) },
    { cls: 'Renda fixa', cells: [64, 71, 78, 81].map(cell) },
    { cls: 'Energia', cells: [69, 74, 70, 62].map(cell) },
    { cls: 'Commodities', cells: [55, 60, 63, 58].map(cell) },
  ],
  modelAccuracy: 'claude 71% · kimi 64% · grok 62%',
  signalCount: 412,
  costTokens: '48,2M',
  costAI: 'US$ 128,40',
  costData: 'US$ 214,00',
  costBars: buildCostBars(),
  opportunityCost: 'R$ 61.240',
  missed: [
    {
      id: 'm1',
      date: '14/08',
      asset: 'ETH/USDT',
      direction: 'LONG',
      directionTone: 'up',
      conviction: '84',
      gain: '+R$ 22.410',
      gainTone: 'up',
      result: '+9,2% em 8d',
    },
    {
      id: 'm2',
      date: '06/08',
      asset: 'CAFÉ dez',
      direction: 'LONG',
      directionTone: 'up',
      conviction: '78',
      gain: '+R$ 18.660',
      gainTone: 'up',
      result: '+11,4% em 12d',
    },
    {
      id: 'm3',
      date: '29/07',
      asset: 'NTN-B 2045',
      direction: 'COMPRA',
      directionTone: 'up',
      conviction: '76',
      gain: '+R$ 12.180',
      gainTone: 'up',
      result: '−32 bps em 3 sem',
    },
    {
      id: 'm4',
      date: '18/07',
      asset: 'NVDA',
      direction: 'LONG',
      directionTone: 'up',
      conviction: '72',
      gain: '+R$ 9.940',
      gainTone: 'up',
      result: '+6,1% em 9d',
    },
    {
      id: 'm5',
      date: '11/07',
      asset: 'USD/BRL',
      direction: 'SHORT',
      directionTone: 'down',
      conviction: '71',
      gain: '−R$ 1.950',
      gainTone: 'down',
      result: '+0,9% contra',
    },
  ],
};
