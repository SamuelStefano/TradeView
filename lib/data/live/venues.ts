import 'server-only';

import { VENUES, VENUE_INFO, byVenue } from '../../markets/catalogue';
import { venueHealth } from '../../markets/exchange';
import type { MarketsData, VenueRow } from '../views/markets';
import { loadQuotes } from './valuation';

// Above this a quote is stale enough that the screen it feeds is misleading,
// even though the request did eventually return.
const DEGRADED_ABOVE_MS = 2_000;

function describe(latencyMs: number, at: number): string {
  const ageSec = Math.max(0, Math.round((Date.now() - at) / 1000));
  const latency = latencyMs >= 1000 ? `${(latencyMs / 1000).toFixed(1)}s` : `${latencyMs}ms`;
  const age = ageSec < 60 ? `há ${ageSec}s` : `há ${Math.round(ageSec / 60)}min`;
  return `${latency} · ${age}`;
}

export async function getLiveMarkets(): Promise<MarketsData> {
  const quotes = await loadQuotes();

  const venues: VenueRow[] = VENUES.map((id) => {
    const info = VENUE_INFO[id];
    const symbols = byVenue(id);
    const health = venueHealth(id);
    const quotedCount = symbols.filter((s) => quotes.has(s.symbol)).length;

    let status: VenueRow['status'] = 'offline';
    if (health?.ok) status = health.latencyMs > DEGRADED_ABOVE_MS ? 'degradado' : 'conectado';

    return {
      id,
      name: info?.name ?? id,
      kind: info?.kind ?? '—',
      logo: info?.logo ?? id.slice(0, 2).toUpperCase(),
      site: info?.site ?? '',
      status,
      symbolCount: symbols.length,
      quotedCount,
      quoteCurrencies: [...new Set(symbols.map((s) => s.quote))],
      latencyMs: health ? health.latencyMs : null,
      lastResponseLabel: health ? describe(health.latencyMs, health.at) : 'sem resposta',
      error: health?.error ?? null,
    };
  });

  const samples = venues
    .map((v) => v.latencyMs)
    .filter((ms): ms is number => ms !== null)
    .sort((a, b) => a - b);
  const mid = Math.floor(samples.length / 2);
  const medianLatencyMs = samples.length === 0
    ? null
    : samples.length % 2 === 0
      ? Math.round((samples[mid - 1] + samples[mid]) / 2)
      : samples[mid];

  const countBy = (s: VenueRow['status']) => venues.filter((v) => v.status === s).length;

  return {
    venues,
    connectedCount: countBy('conectado'),
    degradedCount: countBy('degradado'),
    offlineCount: countBy('offline'),
    totalCount: venues.length,
    medianLatencyMs,
  };
}
