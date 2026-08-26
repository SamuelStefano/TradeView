import assert from 'node:assert/strict';
import { test } from 'node:test';

import { safeNextPath } from './next-path';

test('safeNextPath keeps an internal path with its query', () => {
  assert.equal(safeNextPath('/trade?symbol=ETH/BRL'), '/trade?symbol=ETH/BRL');
});

test('safeNextPath falls back when absent', () => {
  assert.equal(safeNextPath(undefined), '/trade');
  assert.equal(safeNextPath(''), '/trade');
});

test('safeNextPath refuses anything that can leave the origin', () => {
  for (const hostile of ['https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)']) {
    assert.equal(safeNextPath(hostile), '/trade');
  }
});
