import 'server-only';

import { createSupabaseServerClient } from './supabase/server';
import { money } from './money';

export interface Balance {
  accountId: string;
  kind: 'paper' | 'real' | 'external';
  currency: string;
  balance: string;
}

export interface LivePosition {
  symbol: string;
  mode: 'paper' | 'real';
  qty: string;
  costBasis: string;
  fees: string;
  lastFillAt: string;
}

export interface AccountSnapshot {
  balances: Balance[];
  positions: LivePosition[];
  cashByCurrency: Record<string, string>;
}

// Reads go through the anon-key client so RLS is the one deciding what is
// visible. The admin client is reserved for writes that must be atomic.
export async function getAccountSnapshot(mode: 'paper' | 'real'): Promise<AccountSnapshot | null> {
  const supabase = await createSupabaseServerClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return null;

  const [balancesResult, positionsResult] = await Promise.all([
    supabase.from('account_balances').select('account_id, kind, currency, balance').eq('kind', mode),
    supabase
      .from('positions')
      .select('symbol, mode, qty, cost_basis, fees, last_fill_at')
      .eq('mode', mode),
  ]);

  if (balancesResult.error) throw new Error(balancesResult.error.message);
  if (positionsResult.error) throw new Error(positionsResult.error.message);

  const balances: Balance[] = (balancesResult.data ?? []).map((row) => ({
    accountId: row.account_id as string,
    kind: row.kind as Balance['kind'],
    currency: row.currency as string,
    balance: row.balance as string,
  }));

  const cashByCurrency: Record<string, string> = {};
  for (const b of balances) {
    if (money(b.balance).isZero()) continue;
    cashByCurrency[b.currency] = b.balance;
  }

  return {
    balances,
    cashByCurrency,
    positions: (positionsResult.data ?? []).map((row) => ({
      symbol: row.symbol as string,
      mode: row.mode as LivePosition['mode'],
      qty: row.qty as string,
      costBasis: row.cost_basis as string,
      fees: row.fees as string,
      lastFillAt: row.last_fill_at as string,
    })),
  };
}
