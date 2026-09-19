import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { freshnessOf } from './freshness';

const NOW = 1_800_000_000_000;

test('a fresh tick reports its real age in seconds', () => {
  assert.deepEqual(freshnessOf(NOW - 12_000, NOW, 'OKX'), { kind: 'realtime', agoSeconds: 12 });
});

test('a tick older than a minute is reported as delayed, never as realtime', () => {
  assert.deepEqual(freshnessOf(NOW - 5 * 60_000, NOW, 'OKX'), {
    kind: 'delayed',
    delayMinutes: 5,
    source: 'OKX',
  });
});

test('a clock ahead of ours does not produce a negative age', () => {
  assert.deepEqual(freshnessOf(NOW + 30_000, NOW, 'Foxbit'), { kind: 'realtime', agoSeconds: 0 });
});

test('a delayed tick never rounds down to zero minutes', () => {
  const result = freshnessOf(NOW - 61_000, NOW, 'Foxbit');
  assert.equal(result.kind, 'delayed');
  assert.equal(result.kind === 'delayed' && result.delayMinutes, 1);
});
