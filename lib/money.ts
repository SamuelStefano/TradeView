import { Decimal } from 'decimal.js';

// 18 decimals covers ERC-20 quantities; ROUND_DOWN so rounding never invents
// value that the venue will not honour.
Decimal.set({ precision: 40, rounding: Decimal.ROUND_DOWN, toExpNeg: -30, toExpPos: 40 });

export type Money = Decimal;

export function money(value: string | number | Decimal): Money {
  return new Decimal(value);
}

export function toDbString(value: Money): string {
  return value.toFixed(18);
}

export function formatBRL(value: Money | string): string {
  const d = money(value);
  const formatted = d.abs().toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${d.isNegative() ? '-' : ''}R$ ${formatted}`;
}

export function formatQty(value: Money | string, precision = 8): string {
  return money(value).toFixed(precision).replace(/\.?0+$/, '');
}
