export type AlertState = 'ativo' | 'disparado' | 'pausado';
export type AlertChannel = 'app' | 'email' | 'webhook';

export interface Alert {
  id: string;
  asset: string;
  condition: string;
  state: AlertState;
  channels: AlertChannel[];
  createdAgo: string;
  firedAgo: string | null;
}

export interface AlertsData {
  alerts: Alert[];
  history: { asset: string; condition: string; firedAt: string; outcome: string }[];
}

export const alertsMock: AlertsData = {
  alerts: [],
  history: [],
};
