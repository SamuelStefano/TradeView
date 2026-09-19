import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { dayKeyLabel, saoPauloDayKey, saoPauloMonthKey } from './market-clock';

test('a late evening trade stays on the São Paulo day, not the next UTC day', () => {
  assert.equal(saoPauloDayKey('2026-09-19T23:30:00Z'), '2026-09-19');
  assert.equal(saoPauloDayKey('2026-09-20T01:30:00Z'), '2026-09-19');
});

test('the last evening of a month stays in that month', () => {
  assert.equal(saoPauloMonthKey('2026-10-01T01:00:00Z'), '2026-09');
  assert.equal(saoPauloMonthKey('2026-09-30T23:59:00Z'), '2026-09');
  assert.equal(saoPauloMonthKey('2026-10-01T03:00:00Z'), '2026-10');
});

test('day keys sort chronologically', () => {
  const keys = ['2026-10-02', '2026-09-30', '2026-10-01'].sort();
  assert.deepEqual(keys, ['2026-09-30', '2026-10-01', '2026-10-02']);
});

test('day key label is day/month', () => {
  assert.equal(dayKeyLabel('2026-09-05'), '05/09');
});
