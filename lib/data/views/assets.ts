import type { AIThesis, Asset, AssetClass, Candle, ChartMarker, Panel } from '../../types';

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
  ai: AIThesis;
  news: NewsItem[];
  correlations: Correlation[];
}

export const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1S', '1M'] as const;
export const INDICATORS = ['MA', 'EMA', 'RSI', 'MACD', 'BB', 'VOL'] as const;

function generateCandles(seed: number): Candle[] {
  let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const n = 66;
  let price = 100;
  const candles: Candle[] = [];
  for (let i = 0; i < n; i++) {
    const o = price;
    const c = o + (r() - 0.485) * 4;
    const h = Math.max(o, c) + r() * 1.6;
    const l = Math.min(o, c) - r() * 1.6;
    candles.push({ open: o, high: h, low: l, close: c, volume: 0.3 + r(), label: `${i}:00` });
    price = c;
  }
  return candles;
}

const cripto: AssetDetailData = {
  asset: {
    symbol: 'BTC-USD',
    name: 'Bitcoin / Tether — contrato perpétuo',
    venue: 'Binance · perpétuo',
    assetClass: 'cripto',
    price: 'US$ 67.412,50',
    change: '▲ +2,41% · +US$ 1.588',
    changePct: 2.41,
    freshness: { kind: 'realtime', agoSeconds: 1 },
    stats: [
      { key: 'OI', value: 'US$ 12,4B' },
      { key: 'Funding 8h', value: '−0,012%' },
      { key: 'Vol 24h', value: 'US$ 31,2B' },
      { key: 'Basis', value: '+4,1% aa' },
    ],
  },
  panels: [
    {
      kind: 'book',
      title: 'Order book',
      meta: 'Binance · 0,1',
      mid: '67.412,5',
      spread: '0,5',
      asks: [
        { price: '67.414,5', qty: '2,841', depthPct: 34 },
        { price: '67.414,0', qty: '1,203', depthPct: 14 },
        { price: '67.413,5', qty: '4,112', depthPct: 49 },
        { price: '67.413,0', qty: '0,932', depthPct: 11 },
        { price: '67.412,5', qty: '6,701', depthPct: 80 },
      ],
      bids: [
        { price: '67.412,0', qty: '5,214', depthPct: 62 },
        { price: '67.411,5', qty: '2,018', depthPct: 24 },
        { price: '67.411,0', qty: '7,431', depthPct: 89 },
        { price: '67.410,5', qty: '1,204', depthPct: 14 },
        { price: '67.410,0', qty: '3,881', depthPct: 46 },
      ],
    },
    {
      kind: 'kv',
      title: 'Derivativos & funding',
      meta: 'agg 5 exchanges',
      rows: [
        { key: 'Funding rate (8h)', value: '−0,012%', tone: 'down' },
        { key: 'Funding previsto', value: '−0,008%', tone: 'down' },
        { key: 'Open interest', value: 'US$ 12,4B', tone: 'neutral' },
        { key: 'Long/short ratio', value: '0,94', tone: 'neutral' },
        { key: 'Liquidações 24h', value: 'US$ 182M', tone: 'neutral' },
        { key: 'Basis 3m anualizado', value: '+4,1%', tone: 'up' },
      ],
    },
    {
      kind: 'kv',
      title: 'On-chain',
      meta: 'Glassnode · há 10min',
      rows: [
        { key: 'Reservas exchanges', value: '2,31M BTC', tone: 'down' },
        { key: 'Fluxo líquido 24h', value: '−12.480 BTC', tone: 'up' },
        { key: 'Endereços ativos', value: '1,02M', tone: 'neutral' },
        { key: 'MVRV', value: '1,84', tone: 'neutral' },
        { key: 'Hashrate 7d', value: '712 EH/s', tone: 'neutral' },
      ],
    },
  ],
  candles: generateCandles(7919),
  markers: [
    { index: 20, kind: 'ai', label: '✦' },
    { index: 34, kind: 'buy', label: '▲' },
    { index: 52, kind: 'sell', label: '▼' },
  ],
  ai: {
    thesis: 'Estrutura de derivativos aponta posicionamento vendido esticado: funding negativo no percentil 10 histórico coexiste com open interest crescente e saída contínua de moedas de exchanges. O preço segura a MA(21) no 4h. O padrão favorece squeeze de vendidos no horizonte de 3–7 dias, com o fluxo on-chain como suporte estrutural.',
    scenarios: [
      { label: 'BULL', prob: 45, target: 'US$ 72.800', text: 'Squeeze acima de 68,5k liquida US$ 1,2B em shorts.' },
      { label: 'BASE', prob: 38, target: 'US$ 66.000–69.500', text: 'Consolidação com funding normalizando a neutro.' },
      { label: 'BEAR', prob: 17, target: 'US$ 61.200', text: 'Perda do suporte de 65,8k ativa stops em cascata.' },
    ],
    risks: [
      'Vencimento de US$ 4,8B em opções sexta (max pain 64k)',
      'FOMC minutes hoje 15:00 — vol de evento',
      'Correlação com NDX em 0,72: aversão em tech contamina',
    ],
    invalidations: [
      'Fechamento diário abaixo de US$ 65.800',
      'Funding virar positivo com OI caindo (desalavancagem long)',
    ],
    sources: [
      { label: 'funding agregado (Coinalyze)' },
      { label: 'reservas exchanges (Glassnode)' },
      { label: 'opções (Deribit)' },
    ],
    model: 'claude-sonnet-4-6',
    generatedAgo: '4min',
  },
  news: [
    { ago: '12min', title: 'Fluxo para ETFs à vista soma US$ 480M no dia, maior desde junho', source: 'The Block', relevancePct: 92, sentimentScore: '+0,72', sentimentTone: 'up' },
    { ago: '38min', title: 'FOMC minutes devem detalhar divisão sobre ritmo de cortes', source: 'Reuters', relevancePct: 78, sentimentScore: '−0,10', sentimentTone: 'neutral' },
    { ago: '1h', title: 'Funding negativo persiste apesar da alta: shorts pagando para manter posição', source: 'Coindesk', relevancePct: 84, sentimentScore: '+0,55', sentimentTone: 'up' },
    { ago: '3h', title: 'Mineradoras reduzem venda de tesouraria pelo 2º mês', source: 'Glassnode', relevancePct: 61, sentimentScore: '+0,38', sentimentTone: 'up' },
    { ago: '5h', title: 'Regulador da UE consulta mercado sobre limites de alavancagem em perpétuos', source: 'FT', relevancePct: 58, sentimentScore: '−0,44', sentimentTone: 'down' },
  ],
  correlations: [
    { symbol: 'NDX (Nasdaq)', value: 0.72 },
    { symbol: 'ETH/USDT', value: 0.88 },
    { symbol: 'SOL/USDT', value: 0.81 },
    { symbol: 'Ouro', value: 0.31 },
    { symbol: 'DXY', value: -0.58 },
    { symbol: 'VIX', value: -0.44 },
    { symbol: 'T10Y yield', value: -0.29 },
    { symbol: 'USD/BRL', value: -0.22 },
  ],
};

const acoes: AssetDetailData = {
  asset: {
    symbol: 'PETR4',
    name: 'Petrobras PN',
    venue: 'B3 · à vista',
    assetClass: 'ações',
    price: 'R$ 38,42',
    change: '▼ −1,21% · −R$ 0,47',
    changePct: -1.21,
    freshness: { kind: 'realtime', agoSeconds: 2 },
    stats: [
      { key: 'P/L', value: '4,2x' },
      { key: 'DY 12m', value: '13,8%' },
      { key: 'Vol dia', value: 'R$ 1,1B' },
      { key: 'Beta', value: '1,12' },
    ],
  },
  panels: [
    {
      kind: 'kv',
      title: 'Fundamentos (DRE TTM)',
      meta: '2T26 · há 34d',
      rows: [
        { key: 'Receita', value: 'R$ 512,4B', tone: 'neutral' },
        { key: 'EBITDA', value: 'R$ 241,8B', tone: 'neutral' },
        { key: 'Margem EBITDA', value: '47,2%', tone: 'up' },
        { key: 'Lucro líquido', value: 'R$ 118,2B', tone: 'neutral' },
        { key: 'Dívida líq./EBITDA', value: '0,8x', tone: 'up' },
        { key: 'ROE', value: '24,1%', tone: 'up' },
      ],
    },
    {
      kind: 'kv',
      title: 'Múltiplos vs setor',
      meta: 'mediana O&G LatAm',
      rows: [
        { key: 'P/L', value: '4,2x vs 6,1x', tone: 'up' },
        { key: 'EV/EBITDA', value: '2,9x vs 4,0x', tone: 'up' },
        { key: 'P/VP', value: '1,1x vs 1,3x', tone: 'neutral' },
        { key: 'FCF yield', value: '18,4%', tone: 'up' },
      ],
    },
    {
      kind: 'kv',
      title: 'Dividendos',
      meta: 'próx. data-com 12/set',
      rows: [
        { key: 'DY 12m', value: '13,8%', tone: 'up' },
        { key: 'Último provento', value: 'R$ 1,12/ação', tone: 'neutral' },
        { key: 'Payout', value: '52%', tone: 'neutral' },
        { key: 'Frequência', value: 'trimestral', tone: 'neutral' },
      ],
    },
  ],
  candles: generateCandles(2831),
  markers: [
    { index: 20, kind: 'ai', label: '✦' },
    { index: 34, kind: 'buy', label: '▲' },
    { index: 52, kind: 'sell', label: '▼' },
  ],
  ai: {
    thesis: 'PETR4 negocia a 4,2x lucros com FCF yield de 18%, mas o driver de curto prazo é o Brent: a perda do suporte de US$ 74 comprime o caso de dividendos extraordinários no 3T. A defasagem de 3,2% frente ao par histórico com o Brent sugere ajuste antes de reconstrução de posição.',
    scenarios: [
      { label: 'BULL', prob: 25, target: 'R$ 41,50', text: 'Brent recupera 78 e anúncio de extraordinários.' },
      { label: 'BASE', prob: 45, target: 'R$ 36,80–39,20', text: 'Lateralização acompanhando petróleo fraco.' },
      { label: 'BEAR', prob: 30, target: 'R$ 34,60', text: 'Brent abaixo de 70 corta consenso de proventos.' },
    ],
    risks: [
      'Risco de interferência em política de preços',
      'Capex do plano estratégico acima do guidance',
      'Fluxo estrangeiro negativo há 6 pregões na B3',
    ],
    invalidations: [
      'Brent sustentar acima de US$ 78',
      'Anúncio de dividendo extraordinário no 3T',
    ],
    sources: [
      { label: 'DRE 2T26 (RI Petrobras)' },
      { label: 'consenso (LSEG)' },
      { label: 'fluxo B3' },
    ],
    model: 'claude-sonnet-4-6',
    generatedAgo: '22min',
  },
  news: [
    { ago: '8min', title: 'Brent recua 1,2% após dados de estoques americanos acima do esperado', source: 'Reuters', relevancePct: 88, sentimentScore: '−0,61', sentimentTone: 'down' },
    { ago: '1h', title: 'Petrobras confirma guidance de produção para o 3T26', source: 'RI Petrobras', relevancePct: 95, sentimentScore: '+0,42', sentimentTone: 'up' },
    { ago: '3h', title: 'B3 registra 6º pregão consecutivo de saída de capital estrangeiro', source: 'Valor', relevancePct: 72, sentimentScore: '−0,33', sentimentTone: 'down' },
    { ago: '5h', title: 'Analistas revisam preço-alvo de PETR4 após dados de Brent', source: 'XP Research', relevancePct: 81, sentimentScore: '−0,25', sentimentTone: 'down' },
  ],
  correlations: [
    { symbol: 'Brent (ICE)', value: 0.84 },
    { symbol: 'VALE3', value: 0.71 },
    { symbol: 'IBOV', value: 0.79 },
    { symbol: 'USD/BRL', value: -0.61 },
    { symbol: 'WTI', value: 0.81 },
    { symbol: 'DXY', value: -0.48 },
    { symbol: 'NTN-B 35', value: -0.38 },
    { symbol: 'VIX', value: -0.52 },
  ],
};

const rendaFixa: AssetDetailData = {
  asset: {
    symbol: 'NTNB-2035',
    name: 'Tesouro IPCA+ com juros semestrais 2035',
    venue: 'Tesouro Direto',
    assetClass: 'renda fixa',
    price: 'IPCA + 6,21%',
    change: '▲ −4 bps hoje · PU R$ 4.412,08',
    changePct: 0.09,
    freshness: { kind: 'eod', agoMinutes: 4 },
    stats: [
      { key: 'Duration', value: '8,9' },
      { key: 'Convexidade', value: '96,4' },
      { key: 'Venc.', value: '15/05/35' },
      { key: 'Cupom', value: '6% aa' },
    ],
  },
  panels: [
    {
      kind: 'curve',
      title: 'Curva de juros real',
      meta: 'NTN-B · agora vs 30d',
      alt: 'Curva de juros real NTN-B, hoje versus 30 dias atrás',
      legend: '— hoje  ┄ 30d atrás · eixo: vencimentos',
      labels: ['2027', '2030', '2035', '2045', '2060'],
      series: [5.82, 6.04, 6.21, 6.38, 6.51],
      series2: [5.91, 6.18, 6.35, 6.52, 6.64],
    },
    {
      kind: 'kv',
      title: 'Marcação a mercado',
      meta: 'posição própria',
      rows: [
        { key: 'PU compra', value: 'R$ 4.196,40', tone: 'neutral' },
        { key: 'PU atual', value: 'R$ 4.412,08', tone: 'neutral' },
        { key: 'Resultado MTM', value: '+R$ 21.568 (+5,1%)', tone: 'up' },
        { key: 'Se levar ao venc.', value: 'IPCA + 6,58% aa', tone: 'neutral' },
        { key: 'DV01 da posição', value: 'R$ 392/bp', tone: 'neutral' },
      ],
    },
    {
      kind: 'kv',
      title: 'Sensibilidade',
      meta: 'cenários de curva',
      rows: [
        { key: '−50 bps', value: '+R$ 19.600 (+4,4%)', tone: 'up' },
        { key: '−25 bps', value: '+R$ 9.800 (+2,2%)', tone: 'up' },
        { key: '+25 bps', value: '−R$ 9.500 (−2,2%)', tone: 'down' },
        { key: '+50 bps', value: '−R$ 18.700 (−4,3%)', tone: 'down' },
        { key: 'Carrego 12m', value: 'IPCA + 6,21%', tone: 'neutral' },
      ],
    },
  ],
  candles: generateCandles(4412),
  markers: [
    { index: 20, kind: 'ai', label: '✦' },
    { index: 34, kind: 'buy', label: '▲' },
    { index: 52, kind: 'sell', label: '▼' },
  ],
  ai: {
    thesis: 'Juro real de 6,2% na ponta de 10 anos está 1,4 desvio acima da média de 5 anos, enquanto o IPCA-15 desacelera pelo terceiro mês. O breakeven implícito de 5,9% excede o Focus em 80bps — o mercado paga prêmio por um cenário de inflação que os dados correntes não sustentam. Duration de 8,9 dá alavancagem de 6,8% de MTM para cada 40bps de fechamento.',
    scenarios: [
      { label: 'BULL', prob: 40, target: 'IPCA + 5,80%', text: 'Copom sinaliza corte; curva fecha 40bps → +6,8% MTM.' },
      { label: 'BASE', prob: 42, target: 'IPCA + 6,05–6,35%', text: 'Curva de lado; retorno = carrego IPCA+6,2%.' },
      { label: 'BEAR', prob: 18, target: 'IPCA + 6,70%', text: 'Risco fiscal reabre prêmio; −4,3% MTM.' },
    ],
    risks: [
      'Pauta fiscal no Congresso (setembro)',
      'Treasury 10y acima de 4,6% pressiona ponta longa local',
      'Liquidez menor em vencimentos 2035+',
    ],
    invalidations: [
      'IPCA-15 reacelerar acima de 0,35% m/m',
      'Breakeven cair abaixo do Focus (prêmio já extraído)',
    ],
    sources: [
      { label: 'curva ANBIMA' },
      { label: 'Focus/BCB' },
      { label: 'IPCA-15 (IBGE)' },
    ],
    model: 'claude-sonnet-4-6',
    generatedAgo: '11min',
  },
  news: [
    { ago: '2h', title: 'IPCA-15 de agosto fica em 0,28%, abaixo do esperado', source: 'IBGE', relevancePct: 96, sentimentScore: '+0,68', sentimentTone: 'up' },
    { ago: '4h', title: 'Focus projeta IPCA de 4,4% para 2026', source: 'BCB', relevancePct: 82, sentimentScore: '+0,21', sentimentTone: 'up' },
    { ago: '6h', title: 'Treasury 10y sobe para 4,58% após dados de emprego nos EUA', source: 'Reuters', relevancePct: 71, sentimentScore: '−0,38', sentimentTone: 'down' },
  ],
  correlations: [
    { symbol: 'NTN-B 2045', value: 0.94 },
    { symbol: 'NTN-B 2060', value: 0.89 },
    { symbol: 'Treasury 10y', value: 0.71 },
    { symbol: 'HGLG11', value: 0.81 },
    { symbol: 'IBOV', value: -0.62 },
    { symbol: 'USD/BRL', value: -0.44 },
    { symbol: 'Selic futuro', value: 0.82 },
    { symbol: 'IPCA-15', value: -0.38 },
  ],
};

const cambio: AssetDetailData = {
  asset: {
    symbol: 'USD-BRL',
    name: 'Dólar americano / Real brasileiro',
    venue: 'interbancário',
    assetClass: 'câmbio',
    price: 'R$ 5,4610',
    change: '▼ −0,38% · −R$ 0,0208',
    changePct: -0.38,
    freshness: { kind: 'realtime', agoSeconds: 1 },
    stats: [
      { key: 'Cupom', value: '4,9% aa' },
      { key: 'Casado', value: 'R$ 5,4630' },
      { key: 'Vol impl. 1m', value: '11,2%' },
      { key: 'DXY', value: '101,4' },
    ],
  },
  panels: [
    {
      kind: 'kv',
      title: 'Diferencial de juros',
      meta: 'carry trade',
      rows: [
        { key: 'Selic', value: '14,75%', tone: 'neutral' },
        { key: 'Fed funds', value: '4,25%', tone: 'neutral' },
        { key: 'Diferencial', value: '10,50 pp', tone: 'up' },
        { key: 'Carry 3m (hedge)', value: '+2,4%', tone: 'up' },
        { key: 'Posição estrangeiro DI', value: 'R$ 412B', tone: 'neutral' },
      ],
    },
    {
      kind: 'kv',
      title: 'Fluxo cambial',
      meta: 'BCB · semana',
      rows: [
        { key: 'Comercial', value: '+US$ 1,8B', tone: 'up' },
        { key: 'Financeiro', value: '−US$ 2,4B', tone: 'down' },
        { key: 'Saldo', value: '−US$ 0,6B', tone: 'down' },
        { key: 'Posição bancos', value: 'vendido US$ 42B', tone: 'neutral' },
      ],
    },
    {
      kind: 'curve',
      title: 'Curva de cupom cambial',
      meta: 'DDI · agora',
      alt: 'Curva de cupom cambial DDI',
      labels: ['1m', '3m', '6m', '1a', '2a'],
      series: [4.82, 4.91, 4.95, 5.01, 5.08],
    },
  ],
  candles: generateCandles(5461),
  markers: [
    { index: 20, kind: 'ai', label: '✦' },
    { index: 34, kind: 'buy', label: '▲' },
    { index: 52, kind: 'sell', label: '▼' },
  ],
  ai: {
    thesis: 'Diferencial de juros de 10,5pp segue como âncora do real, mas o fluxo financeiro negativo de US$ 2,4B na semana mostra saída via dividendos. Sazonalidade de setembro é historicamente adversa. O balanço favorece range com viés comprador de dólar apenas acima de 5,52.',
    scenarios: [
      { label: 'BULL BRL', prob: 35, target: 'R$ 5,32', text: 'Corte do Fed em set amplia diferencial relativo.' },
      { label: 'BASE', prob: 45, target: 'R$ 5,40–5,55', text: 'Range com carry dominando.' },
      { label: 'BEAR BRL', prob: 20, target: 'R$ 5,68', text: 'Estresse fiscal doméstico + DXY forte.' },
    ],
    risks: [
      'Pauta fiscal doméstica',
      'Payroll dos EUA (sexta)',
      'Rolagem de swaps do BCB',
    ],
    invalidations: [
      'Rompimento sustentado de 5,52',
      'Fluxo comercial virar negativo',
    ],
    sources: [
      { label: 'fluxo BCB' },
      { label: 'CFTC positioning' },
      { label: 'curva DDI (B3)' },
    ],
    model: 'claude-sonnet-4-6',
    generatedAgo: '7min',
  },
  news: [
    { ago: '30min', title: 'BCB anuncia leilão de swap cambial para amortizar volatilidade', source: 'BCB', relevancePct: 91, sentimentScore: '+0,48', sentimentTone: 'up' },
    { ago: '2h', title: 'DXY recua após dados de inflação americana virem abaixo do esperado', source: 'Reuters', relevancePct: 84, sentimentScore: '+0,52', sentimentTone: 'up' },
    { ago: '4h', title: 'Saída de dividendos pressiona real na semana', source: 'Valor', relevancePct: 76, sentimentScore: '−0,31', sentimentTone: 'down' },
  ],
  correlations: [
    { symbol: 'DXY', value: 0.78 },
    { symbol: 'EUR/USD', value: -0.69 },
    { symbol: 'BRL/ARS', value: 0.42 },
    { symbol: 'COP/USD', value: 0.55 },
    { symbol: 'IBOV', value: -0.61 },
    { symbol: 'PETR4', value: -0.54 },
    { symbol: 'NTN-B 35', value: -0.44 },
    { symbol: 'Ouro', value: -0.38 },
  ],
};

const energia: AssetDetailData = {
  asset: {
    symbol: 'PLD-SE',
    name: 'Preço de Liquidação das Diferenças — Sudeste/Centro-Oeste',
    venue: 'CCEE · spot horário',
    assetClass: 'energia',
    price: 'R$ 141,20/MWh',
    change: '▲ +3,40% · +R$ 4,64',
    changePct: 3.40,
    freshness: { kind: 'delayed', delayMinutes: 15, source: 'CCEE' },
    stats: [
      { key: 'ENA SE/CO', value: '62% MLT' },
      { key: 'Reserv.', value: '41,2%' },
      { key: 'Carga', value: '78,4 GW' },
      { key: 'Térmicas', value: '8,2 GW' },
    ],
  },
  panels: [
    {
      kind: 'curve',
      title: 'Curva forward',
      meta: 'BBCE · convencional SE',
      alt: 'Curva forward de energia convencional Sudeste',
      legend: '— forward  ┄ mesma curva há 30d',
      labels: ['set', 'out', 'nov', 'dez', 'jan'],
      series: [141.2, 148.4, 155.1, 162.8, 158.3],
      series2: [119.4, 126.2, 134.8, 141.1, 139.2],
    },
    {
      kind: 'kv',
      title: 'Hidrologia & sazonalidade',
      meta: 'ONS · há 15min',
      rows: [
        { key: 'ENA SE/CO', value: '62% da MLT', tone: 'down' },
        { key: 'Reservatórios SE/CO', value: '41,2%', tone: 'down' },
        { key: 'Tendência 15d (clima)', value: 'seco', tone: 'down' },
        { key: 'ENA histórica set', value: '71% MLT', tone: 'neutral' },
        { key: 'Despacho térmico', value: '8,2 GWmed', tone: 'down' },
      ],
    },
    {
      kind: 'kv',
      title: 'Certificados & gás',
      meta: 'sessão',
      rows: [
        { key: 'Carbono (EUA ETS)', value: '€ 71,40', tone: 'up' },
        { key: 'I-REC BR', value: 'R$ 4,82', tone: 'neutral' },
        { key: 'Gás TTF', value: '€ 32,10/MWh', tone: 'down' },
        { key: 'Henry Hub', value: 'US$ 2,84/MMBtu', tone: 'up' },
      ],
    },
  ],
  candles: generateCandles(1412),
  markers: [
    { index: 20, kind: 'ai', label: '✦' },
    { index: 34, kind: 'buy', label: '▲' },
    { index: 52, kind: 'sell', label: '▼' },
  ],
  ai: {
    thesis: 'ENA 38% abaixo da média de longo termo com reservatórios em 41% força despacho térmico crescente que a curva forward de setembro ainda não precifica. O spread spot–forward de R$ 22/MWh tende a fechar via alta do forward. Clima de 15 dias sem chuva relevante no SE reforça o quadro.',
    scenarios: [
      { label: 'ALTA', prob: 52, target: 'R$ 168/MWh', text: 'Forward set converge ao custo térmico marginal.' },
      { label: 'BASE', prob: 33, target: 'R$ 138–152', text: 'Chuva pontual segura o spot; forward de lado.' },
      { label: 'BAIXA', prob: 15, target: 'R$ 118', text: 'Frente fria antecipada recupera ENA.' },
    ],
    risks: [
      'Modelo climático ECMWF diverge do GFS na semana 2',
      'Decisão CMSE sobre despacho fora da ordem de mérito',
      'Liquidez fina no forward de jan/27',
    ],
    invalidations: [
      'ENA voltar acima de 80% da MLT',
      'Reservatórios recuperarem 46%+',
    ],
    sources: [
      { label: 'ONS (ENA/reservatórios)' },
      { label: 'BBCE forwards' },
      { label: 'ECMWF 15d' },
    ],
    model: 'claude-sonnet-4-6',
    generatedAgo: '18min',
  },
  news: [
    { ago: '1h', title: 'ONS eleva despacho térmico para 8,5 GW na próxima semana', source: 'ONS', relevancePct: 94, sentimentScore: '−0,55', sentimentTone: 'down' },
    { ago: '3h', title: 'Previsão climática aponta seca persistente no SE até setembro', source: 'ECMWF', relevancePct: 88, sentimentScore: '−0,62', sentimentTone: 'down' },
    { ago: '6h', title: 'BBCE registra aumento de 12% no volume de contratos de energia', source: 'BBCE', relevancePct: 65, sentimentScore: '+0,18', sentimentTone: 'up' },
  ],
  correlations: [
    { symbol: 'PLD S', value: 0.91 },
    { symbol: 'PLD NE', value: 0.84 },
    { symbol: 'Henry Hub', value: 0.52 },
    { symbol: 'TTF', value: 0.48 },
    { symbol: 'Chuva SE (ENA)', value: -0.88 },
    { symbol: 'Reservatórios', value: -0.79 },
    { symbol: 'Carbono EUA ETS', value: 0.41 },
    { symbol: 'I-REC BR', value: 0.33 },
  ],
};

const commodities: AssetDetailData = {
  asset: {
    symbol: 'CAFE-DEZ',
    name: 'Café arábica — dezembro/2026',
    venue: 'ICE · futuro KC Z6',
    assetClass: 'commodities',
    price: 'US¢ 284,10/lb',
    change: '▲ +2,20% · +6,10',
    changePct: 2.20,
    freshness: { kind: 'realtime', agoSeconds: 1 },
    stats: [
      { key: 'OI', value: '212k' },
      { key: 'Estoques ICE', value: '812k sc' },
      { key: 'Basis BR', value: '−12' },
      { key: 'Vol impl.', value: '38%' },
    ],
  },
  panels: [
    {
      kind: 'kv',
      title: 'Oferta & demanda',
      meta: 'USDA/Conab',
      rows: [
        { key: 'Safra BR 26/27', value: '62,4M sc', tone: 'neutral' },
        { key: 'Estoques certif. ICE', value: '812k sc', tone: 'down' },
        { key: 'Var. estoques 30d', value: '−18%', tone: 'up' },
        { key: 'Export BR (jul)', value: '3,2M sc', tone: 'neutral' },
        { key: 'Vietnã robusta', value: 'aperto', tone: 'up' },
      ],
    },
    {
      kind: 'kv',
      title: 'Clima — cinturão do café',
      meta: 'ECMWF · 15d',
      rows: [
        { key: 'Risco geada', value: 'baixo', tone: 'neutral' },
        { key: 'Chuva MG 15d', value: '12mm (−60%)', tone: 'down' },
        { key: 'Florada set', value: 'em risco', tone: 'up' },
        { key: 'El Niño/La Niña', value: 'neutro', tone: 'neutral' },
      ],
    },
    {
      kind: 'kv',
      title: 'Posicionamento',
      meta: 'CFTC · sexta',
      rows: [
        { key: 'Non-commercial net', value: '+38,2k', tone: 'up' },
        { key: 'Var. semanal', value: '+4,1k', tone: 'up' },
        { key: 'Percentil 3 anos', value: 'P82', tone: 'neutral' },
        { key: 'Commercials', value: 'vendidos −52k', tone: 'neutral' },
      ],
    },
  ],
  candles: generateCandles(2841),
  markers: [
    { index: 20, kind: 'ai', label: '✦' },
    { index: 34, kind: 'buy', label: '▲' },
    { index: 52, kind: 'sell', label: '▼' },
  ],
  ai: {
    thesis: 'Estoques certificados na ICE caíram 18% em 30 dias enquanto a chuva no sul de Minas roda 60% abaixo do normal a três semanas da florada. Fundos já estão comprados (P82), o que limita combustível novo, mas o risco de oferta domina o vetor de preço até outubro.',
    scenarios: [
      { label: 'ALTA', prob: 44, target: 'US¢ 312', text: 'Florada comprometida corta projeção 27/28.' },
      { label: 'BASE', prob: 40, target: 'US¢ 270–295', text: 'Chuva chega em set; prêmio de risco se mantém.' },
      { label: 'BAIXA', prob: 16, target: 'US¢ 248', text: 'Chuva ampla + liquidação de fundos.' },
    ],
    risks: [
      'Posicionamento comprado esticado (P82)',
      'Real forte reduz repasse ao produtor',
      'Robusta do Vietnã surpreender na oferta',
    ],
    invalidations: [
      'Chuva acumulada 40mm+ em MG até 10/set',
      'Estoques ICE voltarem a subir 2 semanas seguidas',
    ],
    sources: [
      { label: 'estoques ICE' },
      { label: 'ECMWF precipitação' },
      { label: 'CFTC COT' },
    ],
    model: 'claude-sonnet-4-6',
    generatedAgo: '31min',
  },
  news: [
    { ago: '45min', title: 'Chuva em Minas fica 60% abaixo da média em agosto', source: 'ECMWF', relevancePct: 93, sentimentScore: '−0,71', sentimentTone: 'down' },
    { ago: '2h', title: 'Estoques certificados ICE caem pela 8ª semana consecutiva', source: 'ICE', relevancePct: 89, sentimentScore: '−0,62', sentimentTone: 'down' },
    { ago: '5h', title: 'CFTC mostra fundos comprados em máxima de 3 anos', source: 'CFTC', relevancePct: 77, sentimentScore: '+0,41', sentimentTone: 'up' },
  ],
  correlations: [
    { symbol: 'CAFÉ KCU6', value: 0.97 },
    { symbol: 'Açúcar ICE', value: 0.62 },
    { symbol: 'Cacau ICE', value: 0.48 },
    { symbol: 'USD/BRL', value: -0.58 },
    { symbol: 'Chuva MG', value: -0.74 },
    { symbol: 'VIX', value: -0.38 },
    { symbol: 'CRB Index', value: 0.71 },
    { symbol: 'Robusta LIFFE', value: 0.82 },
  ],
};

const indices: AssetDetailData = {
  asset: {
    symbol: 'IBOV',
    name: 'Mini futuro de Ibovespa — outubro/2026',
    venue: 'B3 · mini-índice',
    assetClass: 'índices',
    price: '134.280',
    change: '▼ −0,32% · −430 pts',
    changePct: -0.32,
    freshness: { kind: 'realtime', agoSeconds: 1 },
    stats: [
      { key: 'Basis', value: '+412' },
      { key: 'OI', value: '1,84M' },
      { key: 'VIX', value: '14,2' },
      { key: 'Vol impl. IBOV', value: '18,4%' },
    ],
  },
  panels: [
    {
      kind: 'kv',
      title: 'Estrutura a termo',
      meta: 'futuros IBOV',
      rows: [
        { key: 'À vista', value: '133.868', tone: 'neutral' },
        { key: 'WIN out', value: '134.280 (+0,31%)', tone: 'up' },
        { key: 'WIN dez', value: '135.910 (+1,53%)', tone: 'up' },
        { key: 'Rolagem implícita', value: 'CDI − 0,4pp', tone: 'neutral' },
      ],
    },
    {
      kind: 'kv',
      title: 'Volatilidade',
      meta: 'opções IBOV',
      rows: [
        { key: 'Vol implícita ATM', value: '18,4%', tone: 'neutral' },
        { key: 'Vol realizada 21d', value: '15,1%', tone: 'up' },
        { key: 'Prêmio de vol', value: '+3,3pp', tone: 'neutral' },
        { key: 'Skew 25Δ', value: '−4,2', tone: 'neutral' },
        { key: 'VIX (EUA)', value: '14,2', tone: 'neutral' },
      ],
    },
    {
      kind: 'kv',
      title: 'Amplitude de mercado',
      meta: 'B3 · hoje',
      rows: [
        { key: 'Altas/baixas', value: '31/54', tone: 'down' },
        { key: 'Acima da MM200', value: '48%', tone: 'neutral' },
        { key: 'Novas máx. 52s', value: '4', tone: 'neutral' },
        { key: 'Fluxo estrangeiro (D-2)', value: '−R$ 812M', tone: 'down' },
      ],
    },
  ],
  candles: generateCandles(13428),
  markers: [
    { index: 20, kind: 'ai', label: '✦' },
    { index: 34, kind: 'buy', label: '▲' },
    { index: 52, kind: 'sell', label: '▼' },
  ],
  ai: {
    thesis: 'IBOV testa a região dos 134k com amplitude fraca (31 altas × 54 baixas) e sexto pregão de saída estrangeira. Prêmio de vol de 3,3pp torna venda coberta de calls mais atrativa que direcional. Sem gatilho doméstico até o Copom, o índice segue devedor do fluxo global.',
    scenarios: [
      { label: 'ALTA', prob: 30, target: '138.500', text: 'Fluxo global pró-EM com corte do Fed.' },
      { label: 'BASE', prob: 48, target: '131.000–136.000', text: 'Range até Copom; carrego via financiamento.' },
      { label: 'BAIXA', prob: 22, target: '128.200', text: 'Fiscal reabre prêmio de risco local.' },
    ],
    risks: [
      'Concentração VALE3+PETR4+ITUB4 = 28% do índice',
      'Vencimento de opções sobre índice (quarta)',
      'Payroll EUA sexta',
    ],
    invalidations: [
      'Fluxo estrangeiro virar comprador 3 pregões seguidos',
      'Fechamento acima de 136.200 com amplitude > 60%',
    ],
    sources: [
      { label: 'fluxo B3' },
      { label: 'superfície de vol (B3)' },
      { label: 'amplitude interna' },
    ],
    model: 'claude-sonnet-4-6',
    generatedAgo: '9min',
  },
  news: [
    { ago: '20min', title: 'Estrangeiros retiram R$ 812M da B3 pelo 6º pregão consecutivo', source: 'B3', relevancePct: 88, sentimentScore: '−0,52', sentimentTone: 'down' },
    { ago: '1h', title: 'Amplitude fraca reforça cautela: 31 altas contra 54 baixas', source: 'TradeView', relevancePct: 76, sentimentScore: '−0,38', sentimentTone: 'down' },
    { ago: '3h', title: 'Vencimento de opções na quarta pode gerar volatilidade extra', source: 'Valor', relevancePct: 71, sentimentScore: '−0,18', sentimentTone: 'neutral' },
  ],
  correlations: [
    { symbol: 'PETR4', value: 0.79 },
    { symbol: 'VALE3', value: 0.74 },
    { symbol: 'SP500', value: 0.68 },
    { symbol: 'Bovespa futuro dez', value: 0.99 },
    { symbol: 'USD/BRL', value: -0.61 },
    { symbol: 'VIX', value: -0.58 },
    { symbol: 'DXY', value: -0.49 },
    { symbol: 'CDS Brasil 5a', value: -0.71 },
  ],
};

const fundos: AssetDetailData = {
  asset: {
    symbol: 'HGLG11',
    name: 'CSHG Logística FII',
    venue: 'B3 · FII logística',
    assetClass: 'fundos',
    price: 'R$ 162,30',
    change: '▲ +0,22% · +R$ 0,36',
    changePct: 0.22,
    freshness: { kind: 'realtime', agoSeconds: 3 },
    stats: [
      { key: 'DY 12m', value: '8,9%' },
      { key: 'P/VP', value: '0,96' },
      { key: 'Liquidez', value: 'R$ 4,2M/d' },
      { key: 'Vacância', value: '3,1%' },
    ],
  },
  panels: [
    {
      kind: 'kv',
      title: 'Portfólio do fundo',
      meta: 'relatório jul/26',
      rows: [
        { key: 'ABL', value: '1,42M m²', tone: 'neutral' },
        { key: 'Imóveis', value: '21', tone: 'neutral' },
        { key: 'Vacância física', value: '3,1%', tone: 'up' },
        { key: 'Vacância financeira', value: '2,4%', tone: 'up' },
        { key: 'Cap rate médio', value: '8,2%', tone: 'neutral' },
        { key: 'WAULT', value: '5,8 anos', tone: 'neutral' },
      ],
    },
    {
      kind: 'kv',
      title: 'Rendimentos',
      meta: 'próx. data-com 30/ago',
      rows: [
        { key: 'Último rendimento', value: 'R$ 1,20/cota', tone: 'neutral' },
        { key: 'DY 12m', value: '8,9%', tone: 'neutral' },
        { key: 'DY vs IFIX', value: '+0,7pp', tone: 'up' },
        { key: 'Rendimento vs CDI líq.', value: '−2,1pp', tone: 'down' },
      ],
    },
    {
      kind: 'kv',
      title: 'Valuation',
      meta: 'vs pares logística',
      rows: [
        { key: 'P/VP', value: '0,96 vs 0,92', tone: 'neutral' },
        { key: 'Spread vs NTN-B 35', value: '+2,7pp', tone: 'neutral' },
        { key: 'Preço/m² implícito', value: 'R$ 2.840', tone: 'neutral' },
        { key: 'Custo reposição/m²', value: 'R$ 3.400', tone: 'up' },
      ],
    },
  ],
  candles: generateCandles(1623),
  markers: [
    { index: 20, kind: 'ai', label: '✦' },
    { index: 34, kind: 'buy', label: '▲' },
    { index: 52, kind: 'sell', label: '▼' },
  ],
  ai: {
    thesis: 'HGLG11 negocia a 0,96 P/VP com spread de 2,7pp sobre a NTN-B — comprimido versus a média histórica de 3,5pp. O caso de curto prazo depende do fechamento da curva real: FIIs de tijolo são um proxy alavancado de duration. Fundamentos operacionais (vacância 3,1%, WAULT 5,8a) seguem sólidos.',
    scenarios: [
      { label: 'ALTA', prob: 38, target: 'R$ 174', text: 'Curva real fecha 40bps; IFIX reprecifica.' },
      { label: 'BASE', prob: 44, target: 'R$ 158–166', text: 'Renda de 8,9% aa com cota de lado.' },
      { label: 'BAIXA', prob: 18, target: 'R$ 149', text: 'Juro real longo reabre acima de 6,6%.' },
    ],
    risks: [
      'Correlação 0,81 com NTN-B 2035 (duração implícita)',
      'Emissões concorrentes pressionando P/VP do setor',
      'Devolução de galpão âncora (risco idiossincrático)',
    ],
    invalidations: [
      'NTN-B 35 acima de IPCA+6,6%',
      'Vacância acima de 6%',
    ],
    sources: [
      { label: 'relatório gerencial (RI)' },
      { label: 'curva ANBIMA' },
      { label: 'consenso FIIs' },
    ],
    model: 'claude-sonnet-4-6',
    generatedAgo: '14min',
  },
  news: [
    { ago: '1h', title: 'IFIX sobe 0,4% puxado por FIIs de logística e shoppings', source: 'B3', relevancePct: 82, sentimentScore: '+0,44', sentimentTone: 'up' },
    { ago: '3h', title: 'NTN-B 35 fecha em IPCA+6,21%, pressionando spreads de FII', source: 'ANBIMA', relevancePct: 88, sentimentScore: '−0,28', sentimentTone: 'down' },
    { ago: '6h', title: 'Vacância de galpões logísticos cai para 3,1% — menor em 4 anos', source: 'CBRE', relevancePct: 74, sentimentScore: '+0,61', sentimentTone: 'up' },
  ],
  correlations: [
    { symbol: 'XPLG11', value: 0.88 },
    { symbol: 'BRCO11', value: 0.81 },
    { symbol: 'IFIX', value: 0.91 },
    { symbol: 'NTN-B 2035', value: 0.81 },
    { symbol: 'IBOV', value: -0.42 },
    { symbol: 'USD/BRL', value: -0.38 },
    { symbol: 'Selic', value: -0.71 },
    { symbol: 'IPCA', value: -0.28 },
  ],
};

export const assetsMock: Record<string, AssetDetailData> = {
  'BTC-USD': cripto,
  'PETR4': acoes,
  'NTNB-2035': rendaFixa,
  'USD-BRL': cambio,
  'PLD-SE': energia,
  'CAFE-DEZ': commodities,
  'IBOV': indices,
  'HGLG11': fundos,
};

export const defaultSymbolByClass: Record<AssetClass, string> = {
  cripto: 'BTC-USD',
  'ações': 'PETR4',
  'renda fixa': 'NTNB-2035',
  'câmbio': 'USD-BRL',
  energia: 'PLD-SE',
  commodities: 'CAFE-DEZ',
  'índices': 'IBOV',
  fundos: 'HGLG11',
};
