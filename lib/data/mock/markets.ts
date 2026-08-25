import type { Integration } from '../../types';

export interface MarketsData {
  integrations: Integration[];
  connectedCount: number;
  totalCount: number;
}

export const marketsMock: MarketsData = {
  integrations: [],
  connectedCount: 48,
  totalCount: 52,
};
