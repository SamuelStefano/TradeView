import type { IntegrationStatus } from '../../types';

export interface VenueRow {
  id: string;
  name: string;
  kind: string;
  logo: string;
  site: string;
  status: IntegrationStatus;
  symbolCount: number;
  quotedCount: number;
  quoteCurrencies: string[];
  latencyMs: number | null;
  lastResponseLabel: string;
  error: string | null;
}

export interface MarketsData {
  venues: VenueRow[];
  connectedCount: number;
  degradedCount: number;
  offlineCount: number;
  totalCount: number;
  medianLatencyMs: number | null;
}
