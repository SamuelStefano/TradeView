import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { CRYPTO_MONTHLY_EXEMPTION_BRL, summariseMonth, type FiscalFill } from './fiscal';

function sell(at: string, grossBRL: number, feeBRL = 0): FiscalFill {
  return { at, side: 'sell', grossBRL, feeBRL };
}

function buy(at: string, grossBRL: number, feeBRL = 0): FiscalFill {
  return { at, side: 'buy', grossBRL, feeBRL };
}

test('a sale late on the last day of the month stays in that month', () => {
  // 01/10 00:30 UTC is 30/09 21:30 in São Paulo. Bucketing on the UTC month
  // would move this sale into October and reopen the exemption a day early.
  const summary = summariseMonth([sell('2026-10-01T00:30:00Z', 1000)], new Date('2026-09-30T23:00:00Z'));

  assert.equal(summary.monthKey, '2026-09');
  assert.equal(summary.salesBRL, 1000);
  assert.equal(summary.tradeCount, 1);
});

test('a sale in the next month is excluded', () => {
  const summary = summariseMonth([sell('2026-10-01T04:00:00Z', 1000)], new Date('2026-09-30T23:00:00Z'));

  assert.equal(summary.salesBRL, 0);
  assert.equal(summary.tradeCount, 0);
});

test('only sales count towards the exemption ceiling, fees count on both sides', () => {
  const summary = summariseMonth(
    [sell('2026-09-10T12:00:00Z', 5000, 10), buy('2026-09-11T12:00:00Z', 9000, 20)],
    new Date('2026-09-19T12:00:00Z'),
  );

  assert.equal(summary.salesBRL, 5000);
  assert.equal(summary.feesBRL, 30);
  assert.equal(summary.tradeCount, 2);
  assert.equal(summary.headroomBRL, CRYPTO_MONTHLY_EXEMPTION_BRL - 5000);
  assert.equal(summary.overExemption, false);
});

test('headroom never goes negative and the ceiling breach is flagged', () => {
  const summary = summariseMonth(
    [sell('2026-09-10T12:00:00Z', 40_000)],
    new Date('2026-09-19T12:00:00Z'),
  );

  assert.equal(summary.headroomBRL, 0);
  assert.equal(summary.overExemption, true);
});

test('exactly at the ceiling is still exempt', () => {
  const summary = summariseMonth(
    [sell('2026-09-10T12:00:00Z', CRYPTO_MONTHLY_EXEMPTION_BRL)],
    new Date('2026-09-19T12:00:00Z'),
  );

  assert.equal(summary.overExemption, false);
  assert.equal(summary.headroomBRL, 0);
});
