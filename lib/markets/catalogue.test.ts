import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TRADABLE, bySymbol, fromSlug, toSlug } from './catalogue';

const SQL = join(
  import.meta.dirname,
  '../../supabase/migrations/20260826000003_instruments.sql',
);

function rowsFromMigration() {
  const text = readFileSync(SQL, 'utf8');
  const pattern = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/g;
  return [...text.matchAll(pattern)].map((m) => ({
    symbol: m[1],
    venue: m[2],
    assetClass: m[3],
    base: m[4],
    quote: m[5],
  }));
}

// The display catalogue is a copy of the table. A copy that drifts would quote
// a symbol the order path then rejects, so the divergence has to fail here.
test('catalogue matches the instruments migration', () => {
  const sql = rowsFromMigration();
  assert.ok(sql.length > 0, 'não extraiu nenhuma linha da migration');
  assert.equal(TRADABLE.length, sql.length, 'quantidade de instrumentos difere');

  const sorted = (rows: typeof sql) => [...rows].sort((a, b) => a.symbol.localeCompare(b.symbol));
  assert.deepEqual(sorted(TRADABLE), sorted(sql));
});

test('every symbol resolves and round-trips through its slug', () => {
  for (const entry of TRADABLE) {
    assert.equal(fromSlug(toSlug(entry.symbol)), entry.symbol);
    assert.equal(bySymbol(entry.symbol)?.venue, entry.venue);
  }
});

test('symbols are unique', () => {
  assert.equal(new Set(TRADABLE.map((t) => t.symbol)).size, TRADABLE.length);
});
