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

export const marketsMock: MarketsData = {
  connectedCount: 48,
  degradedCount: 2,
  offlineCount: 1,
  unconfiguredCount: 4,
  totalCount: 55,
  rateLimitBanner: {
    provider: 'Alpha Vantage',
    cachedSince: '14:02 (há 31min)',
    renewsIn: '12min',
    fallbackLabel: 'Trocar para fallback (IEX)',
  },
  integrations: [
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
  ],
};
