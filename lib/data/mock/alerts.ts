export type AlertKind = 'PREÇO' | 'INDICADOR' | 'NOTÍCIA' | 'ON-CHAIN' | 'NATURAL';
export type AlertChannel = 'push' | 'e-mail' | 'telegram' | 'discord' | 'whatsapp';

export interface AlertItem {
  id: string;
  kind: AlertKind;
  cond: string;
  meta: string;
  channels: AlertChannel[];
}

export interface FiredEntry {
  id: string;
  when: string;
  what: string;
  result: string;
  resultTone: 'up' | 'down';
  verdict: 'ACERTOU' | 'ERROU';
  verdictTone: 'up' | 'down';
}

export interface AlertsData {
  firedToday: number;
  alerts: AlertItem[];
  fired: FiredEntry[];
}

export const alertsMock: AlertsData = {
  firedToday: 3,
  alerts: [
    {
      id: '1',
      kind: 'PREÇO',
      cond: 'BTC/USDT cruzar US$ 70.000 para cima',
      meta: 'Binance · criado há 3d',
      channels: ['push', 'telegram'],
    },
    {
      id: '2',
      kind: 'NATURAL',
      cond: 'funding BTC positivo por 4h com preço acima da MA(21)',
      meta: 'interpretado pela IA · há 1h',
      channels: ['push'],
    },
    {
      id: '3',
      kind: 'INDICADOR',
      cond: 'RSI(14) do IBOV abaixo de 30 no diário',
      meta: 'B3 · criado há 12d',
      channels: ['e-mail'],
    },
    {
      id: '4',
      kind: 'ON-CHAIN',
      cond: 'saída líquida de exchanges > 20k BTC/24h',
      meta: 'Glassnode · há 8d',
      channels: ['push', 'discord'],
    },
    {
      id: '5',
      kind: 'NOTÍCIA',
      cond: 'manchete sobre PETR4 com sentimento < −0,5 e relevância alta',
      meta: 'IA · há 20d',
      channels: ['push', 'whatsapp'],
    },
    {
      id: '6',
      kind: 'PREÇO',
      cond: 'PLD SE/CO acima de R$ 160/MWh',
      meta: 'CCEE · há 5d',
      channels: ['e-mail', 'telegram'],
    },
  ],
  fired: [
    {
      id: 'f1',
      when: 'hoje 11:02',
      what: 'Sinal LONG BTC (convicção 87) — squeeze de shorts',
      result: '+2,4% em 6h',
      resultTone: 'up',
      verdict: 'ACERTOU',
      verdictTone: 'up',
    },
    {
      id: 'f2',
      when: 'hoje 09:15',
      what: 'PLD SE/CO cruzou R$ 140',
      result: '+3,4% no dia',
      resultTone: 'up',
      verdict: 'ACERTOU',
      verdictTone: 'up',
    },
    {
      id: 'f3',
      when: 'ontem 16:40',
      what: 'Sinal SHORT SOL (convicção 58)',
      result: '+1,8% contra',
      resultTone: 'down',
      verdict: 'ERROU',
      verdictTone: 'down',
    },
    {
      id: 'f4',
      when: '22/08 10:30',
      what: 'RSI IBOV < 30 → reversão esperada',
      result: '+1,1% em 2d',
      resultTone: 'up',
      verdict: 'ACERTOU',
      verdictTone: 'up',
    },
    {
      id: 'f5',
      when: '21/08 14:12',
      what: 'Sentimento negativo PETR4 → queda esperada',
      result: '−0,4% a favor',
      resultTone: 'up',
      verdict: 'ACERTOU',
      verdictTone: 'up',
    },
  ],
};
