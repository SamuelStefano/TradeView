import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { formatBRL, formatQty, money, toDbString } from './money';

test('quantities drop trailing zeros only after the decimal point', () => {
  assert.equal(formatQty(money('0.10000000')), '0.1');
  assert.equal(formatQty(money('1000.00000000')), '1000');
  assert.equal(formatQty(money('1000'), 0), '1000');
  assert.equal(formatQty(money('100'), 2), '100');
  assert.equal(formatQty(money('0')), '0');
});

test('quantities keep the significant digits at the requested precision', () => {
  assert.equal(formatQty(money('1234.5678'), 2), '1234.56');
  assert.equal(formatQty(money('0.000012345678'), 8), '0.00001234');
});

test('BRL formatting keeps the sign outside the currency symbol', () => {
  assert.equal(formatBRL(money('1234567.891')), 'R$ 1.234.567,89');
  assert.equal(formatBRL(money('-12.5')), '-R$ 12,50');
  assert.equal(formatBRL(money('0')), 'R$ 0,00');
});

test('database strings carry the full ledger precision', () => {
  assert.equal(toDbString(money('1.5')), '1.500000000000000000');
});
