import type { Freshness, Tone } from './types';

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function brl(value: number): string {
  return brlFormatter.format(value);
}

export function usd(value: number): string {
  return usdFormatter.format(value);
}

export function num(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function pct(value: number, decimals = 2): string {
  return `${num(value, decimals)}%`;
}

export function signed(value: string | number, decimals = 2): string {
  const raw = typeof value === 'number' ? num(value, decimals) : value;
  if (raw.startsWith('-') || raw.startsWith('+')) return raw;
  const numeric = typeof value === 'number' ? value : Number(value.replace(/[^\d,-]/g, '').replace(',', '.'));
  return numeric < 0 ? raw : `+${raw}`;
}

export function toneOf(value: number): Tone {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
}

export function arrow(value: number): string {
  if (value > 0) return '▲';
  if (value < 0) return '▼';
  return '■';
}

export function toneClass(tone: Tone): string {
  if (tone === 'up') return 'text-up';
  if (tone === 'down') return 'text-down';
  return 'text-text-secondary';
}

export function freshnessLabel(freshness: Freshness): string {
  switch (freshness.kind) {
    case 'realtime':
      return `tempo real · ${freshness.agoSeconds}s`;
    case 'delayed':
      return `atrasado ${freshness.delayMinutes}min · ${freshness.source}`;
    case 'eod':
      return `fechamento · ${freshness.agoMinutes}min`;
    case 'closed':
      return 'fechado';
  }
}

export function freshnessTone(freshness: Freshness): 'ok' | 'warn' | 'muted' {
  switch (freshness.kind) {
    case 'realtime':
      return 'ok';
    case 'delayed':
    case 'eod':
      return 'warn';
    case 'closed':
      return 'muted';
  }
}
