import type { IntegrationStatus } from '../../types';

export interface MarketIntegration {
  id: string;
  name: string;
  kind: string;
  logo: string;
  status: IntegrationStatus;
  credentialKind: string;
  canTrade: boolean;
  rateLimitPct: number;
  lastResponseMs: number | null;
  lastResponseLabel: string;
}

export interface RateLimitBanner {
  provider: string;
  cachedSince: string;
  renewsIn: string;
  fallbackLabel: string;
}

export interface MarketsData {
  integrations: MarketIntegration[];
  connectedCount: number;
  degradedCount: number;
  offlineCount: number;
  unconfiguredCount: number;
  totalCount: number;
  medianLatencyMs: number;
  rateLimitBanner: RateLimitBanner | null;
}

function mk(
  id: string,
  name: string,
  kind: string,
  logo: string,
  status: IntegrationStatus,
  credentialKind: string,
  canTrade: boolean,
  rateLimitPct: number,
  lastResponseMs: number | null,
  lastResponseLabel: string,
): MarketIntegration {
  return { id, name, kind, logo, status, credentialKind, canTrade, rateLimitPct, lastResponseMs, lastResponseLabel };
}

const integrations: MarketIntegration[] = [
    mk('binance', 'Binance', 'cripto · spot + perp', 'BN', 'conectado', 'API key', true, 42, 182, '182ms · há 1s'),
    mk('b3', 'B3 (via corretora)', 'ações + derivativos BR', 'B3', 'conectado', 'OAuth', true, 18, 96, '96ms · há 2s'),
    mk('tesouro', 'Tesouro Direto', 'renda fixa BR', 'TD', 'conectado', 'CPF + token', false, 4, 410, '410ms · há 4min'),
    mk('coinbase', 'Coinbase', 'cripto · spot', 'CB', 'conectado', 'API key', false, 22, 204, '204ms · há 1s'),
    mk('ibkr', 'Interactive Brokers', 'ações US + opções', 'IB', 'degradado', 'OAuth', true, 91, null, 'timeouts · há 12s'),
    mk('alphavantage', 'Alpha Vantage', 'dados ações US', 'AV', 'degradado', 'API key', false, 100, null, 'rate limit · 14:02'),
    mk('ccee', 'CCEE', 'energia · PLD', 'CC', 'conectado', 'certificado', false, 8, 890, '890ms · há 15min'),
    mk('entsoe', 'ENTSO-E', 'energia · Europa', 'EN', 'conectado', 'API key', false, 12, 1200, '1,2s · há 32min'),
    mk('eia', 'EIA', 'energia · EUA', 'EI', 'conectado', 'API key', false, 6, 640, '640ms · há 1h'),
    mk('kraken', 'Kraken', 'cripto · spot', 'KR', 'offline', 'API key', false, 0, null, 'sem resposta · 42min'),
    mk('glassnode', 'Glassnode', 'on-chain', 'GN', 'conectado', 'API key', false, 71, 310, '310ms · há 10min'),
    mk('cftc', 'CFTC / COT', 'posicionamento', 'CF', 'conectado', 'público', false, 2, null, 'semanal · sexta'),
    mk('mt5', 'MetaTrader 5', 'câmbio', 'MT', 'nao_configurado', '—', false, -1, null, '—'),
    mk('bybit', 'Bybit', 'cripto · perp', 'BY', 'conectado', 'API key', true, 37, 148, '148ms · há 1s'),
    mk('okx', 'OKX', 'cripto · spot + perp', 'OK', 'conectado', 'API key', true, 31, 166, '166ms · há 1s'),
    mk('bitget', 'Bitget', 'cripto · perp', 'BG', 'conectado', 'API key', false, 19, 212, '212ms · há 2s'),
    mk('kucoin', 'KuCoin', 'cripto · spot', 'KC', 'conectado', 'API key', false, 24, 238, '238ms · há 3s'),
    mk('gateio', 'Gate.io', 'cripto · spot', 'GA', 'conectado', 'API key', false, 16, 274, '274ms · há 4s'),
    mk('deribit', 'Deribit', 'cripto · opções', 'DE', 'conectado', 'API key', false, 28, 192, '192ms · há 2s'),
    mk('bitfinex', 'Bitfinex', 'cripto · spot + margem', 'BF', 'conectado', 'API key', false, 11, 296, '296ms · há 6s'),
    mk('htx', 'HTX', 'cripto · spot', 'HT', 'conectado', 'API key', false, 9, 341, '341ms · há 8s'),
    mk('bitstamp', 'Bitstamp', 'cripto · spot', 'BS', 'conectado', 'API key', false, 7, 318, '318ms · há 7s'),
    mk('gemini', 'Gemini', 'cripto · spot', 'GE', 'conectado', 'API key', false, 5, 402, '402ms · há 12s'),
    mk('mercadobitcoin', 'Mercado Bitcoin', 'cripto BR · spot', 'MB', 'conectado', 'API key', false, 13, 286, '286ms · há 5s'),
    mk('bitso', 'Bitso', 'cripto LatAm · spot', 'BI', 'conectado', 'API key', false, 8, 354, '354ms · há 9s'),
    mk('dydx', 'dYdX', 'cripto · perp on-chain', 'DY', 'conectado', 'wallet read-only', false, 21, 468, '468ms · há 14s'),
    mk('hyperliquid', 'Hyperliquid', 'cripto · perp on-chain', 'HL', 'nao_configurado', '—', false, -1, null, '—'),
    mk('coinalyze', 'Coinalyze', 'cripto · funding + OI', 'CZ', 'conectado', 'API key', false, 44, 228, '228ms · há 3s'),
    mk('coingecko', 'CoinGecko', 'cripto · preços agregados', 'CG', 'conectado', 'API key', false, 52, 196, '196ms · há 2s'),
    mk('coinglass', 'Coinglass', 'cripto · liquidações', 'CL', 'conectado', 'API key', false, 38, 332, '332ms · há 8s'),
    mk('xp', 'XP Investimentos', 'ações + fundos BR', 'XP', 'conectado', 'OAuth', true, 26, 142, '142ms · há 2s'),
    mk('rico', 'Rico', 'ações BR', 'RI', 'conectado', 'OAuth', false, 14, 168, '168ms · há 3s'),
    mk('clear', 'Clear', 'ações + futuros BR', 'CR', 'conectado', 'OAuth', false, 17, 158, '158ms · há 2s'),
    mk('btg', 'BTG Pactual', 'ações + renda fixa BR', 'BT', 'conectado', 'OAuth', false, 12, 204, '204ms · há 4s'),
    mk('nuinvest', 'NuInvest', 'ações + fundos BR', 'NU', 'conectado', 'OAuth', false, 10, 246, '246ms · há 5s'),
    mk('genial', 'Genial', 'ações + derivativos BR', 'GI', 'conectado', 'OAuth', false, 9, 262, '262ms · há 6s'),
    mk('alpaca', 'Alpaca', 'ações US · execução', 'AL', 'conectado', 'API key', true, 33, 124, '124ms · há 1s'),
    mk('tradier', 'Tradier', 'ações US + opções', 'TR', 'conectado', 'API key', false, 20, 186, '186ms · há 3s'),
    mk('polygon', 'Polygon.io', 'dados ações US', 'PG', 'conectado', 'API key', false, 58, 88, '88ms · há 1s'),
    mk('finnhub', 'Finnhub', 'dados ações + fundamentos', 'FH', 'conectado', 'API key', false, 47, 152, '152ms · há 2s'),
    mk('tiingo', 'Tiingo', 'dados ações + EOD', 'TI', 'conectado', 'API key', false, 29, 214, '214ms · há 4s'),
    mk('nasdaqdatalink', 'Nasdaq Data Link', 'dados alternativos', 'ND', 'conectado', 'API key', false, 23, 388, '388ms · há 11s'),
    mk('anbima', 'Anbima', 'renda fixa · curvas', 'AN', 'conectado', 'API key', false, 6, 720, '720ms · há 22min'),
    mk('b3rf', 'B3 Renda Fixa', 'debêntures + CRI/CRA', 'BR', 'conectado', 'OAuth', false, 5, 684, '684ms · há 18min'),
    mk('fred', 'FRED', 'macro + juros EUA', 'FR', 'conectado', 'API key', false, 3, 296, '296ms · há 40min'),
    mk('oanda', 'OANDA', 'câmbio · spot', 'OA', 'conectado', 'API key', false, 25, 134, '134ms · há 2s'),
    mk('twelvedata', 'Twelve Data', 'câmbio + índices', 'TW', 'conectado', 'API key', false, 41, 178, '178ms · há 3s'),
    mk('bcbptax', 'BCB PTAX', 'câmbio oficial BR', 'PX', 'conectado', 'público', false, 2, null, 'diário · 13:10'),
    mk('ons', 'ONS', 'energia · carga e geração BR', 'ON', 'conectado', 'público', false, 7, 1050, '1,1s · há 25min'),
    mk('nordpool', 'Nord Pool', 'energia · Nórdicos', 'NP', 'conectado', 'API key', false, 10, 960, '960ms · há 28min'),
    mk('epexspot', 'EPEX Spot', 'energia · Europa central', 'EP', 'nao_configurado', '—', false, -1, null, '—'),
    mk('cme', 'CME Group', 'futuros + commodities', 'CM', 'conectado', 'API key', false, 35, 168, '168ms · há 3s'),
    mk('ice', 'ICE', 'futuros · energia e agro', 'IC', 'conectado', 'API key', false, 18, 242, '242ms · há 5s'),
    mk('lme', 'LME', 'metais', 'LM', 'nao_configurado', '—', false, -1, null, '—'),
    mk('barchart', 'Barchart', 'commodities · agro BR', 'BA', 'conectado', 'API key', false, 27, 306, '306ms · há 7s'),
];

function countBy(status: IntegrationStatus): number {
  return integrations.filter((i) => i.status === status).length;
}

function medianLatency(): number {
  const samples = integrations
    .map((i) => i.lastResponseMs)
    .filter((ms): ms is number => ms !== null)
    .sort((a, b) => a - b);
  const mid = Math.floor(samples.length / 2);
  return samples.length % 2 === 0
    ? Math.round((samples[mid - 1] + samples[mid]) / 2)
    : samples[mid];
}

export const marketsMock: MarketsData = {
  integrations,
  connectedCount: countBy('conectado'),
  degradedCount: countBy('degradado'),
  offlineCount: countBy('offline'),
  unconfiguredCount: countBy('nao_configurado'),
  totalCount: integrations.length,
  medianLatencyMs: medianLatency(),
  rateLimitBanner: {
    provider: 'Alpha Vantage',
    cachedSince: '14:02 (há 31min)',
    renewsIn: '12min',
    fallbackLabel: 'Trocar para fallback (IEX)',
  },
};
