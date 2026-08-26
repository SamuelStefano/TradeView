import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getAccountSnapshot } from '@/lib/accounts';
import { formatQty, money } from '@/lib/money';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient, getSessionUserId } from '@/lib/supabase/server';
import { DepositForm } from '@/components/trade/DepositForm';
import { OrderTicket, type TradableInstrument } from '@/components/trade/OrderTicket';
import { signOutAction } from '@/app/actions/auth';

export const metadata = { title: 'Mesa · TradeView' };
export const dynamic = 'force-dynamic';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <h2 className="text-xs font-bold text-text m-0">{title}</h2>
      {children}
    </section>
  );
}

export default async function TradePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; symbol?: string }>;
}) {
  if (!supabaseConfigured) {
    return (
      <div className="p-5 flex flex-col gap-2">
        <h1 className="text-sm font-bold text-text m-0">Mesa indisponível em modo demonstração</h1>
        <p className="text-[11.5px] text-text-secondary max-w-[560px] m-0">
          Saldo e ordens exigem banco. Configure as variáveis do Supabase para habilitar.
        </p>
      </div>
    );
  }

  const params = await searchParams;

  const userId = await getSessionUserId();
  if (!userId) {
    const query = new URLSearchParams();
    if (params.mode) query.set('mode', params.mode);
    if (params.symbol) query.set('symbol', params.symbol);
    const target = query.size > 0 ? `/trade?${query}` : '/trade';
    redirect(`/login?next=${encodeURIComponent(target)}`);
  }

  const mode: 'paper' | 'real' = params.mode === 'real' ? 'real' : 'paper';

  const supabase = await createSupabaseServerClient();

  const [instrumentsResult, settingsResult, snapshot] = await Promise.all([
    supabase.from('instruments').select('symbol, venue, base, quote').eq('active', true).order('symbol'),
    supabase
      .from('trading_settings')
      .select('real_trading_enabled, kill_switch_active, max_order_notional')
      .single(),
    getAccountSnapshot(mode),
  ]);

  const instruments = (instrumentsResult.data ?? []) as TradableInstrument[];
  const settings = settingsResult.data;
  const balances = (snapshot?.balances ?? []).filter((b) => !money(b.balance).isZero());
  const positions = snapshot?.positions ?? [];

  const quoteCurrencies = [...new Set(instruments.map((i) => i.quote))].sort();
  const depositCurrencies = quoteCurrencies.length > 0 ? quoteCurrencies : ['BRL'];

  return (
    <div className="p-5 flex flex-col gap-4">
      <header className="flex items-center gap-3 flex-wrap">
        <h1 className="text-sm font-bold text-text m-0">Mesa de operações</h1>

        <div className="flex gap-1" role="group" aria-label="Modo da conta">
          {(['paper', 'real'] as const).map((m) => (
            <Link
              key={m}
              href={`/trade?mode=${m}`}
              aria-current={mode === m ? 'true' : undefined}
              className={`h-7 px-2.5 inline-flex items-center rounded-md text-[11px] border no-underline ${
                mode === m
                  ? 'bg-hover border-border-strong text-text'
                  : 'bg-transparent border-border text-text-muted'
              }`}
            >
              {m === 'paper' ? 'paper' : 'real'}
            </Link>
          ))}
        </div>

        {settings?.kill_switch_active && (
          <span className="text-[11px] text-down">kill switch ativo — operações bloqueadas</span>
        )}

        <form action={signOutAction} className="ml-auto">
          <button className="h-7 px-2.5 bg-transparent border border-border rounded-md text-text-muted text-[11px] cursor-pointer hover:text-text">
            sair
          </button>
        </form>
      </header>

      {mode === 'real' && (
        <p className="text-[11.5px] text-warn m-0">
          O modo real ainda não roteia nada para a corretora — a ordem é recusada em vez de ser
          preenchida contra o book e gravada como se tivesse acontecido. O saldo e o histórico
          abaixo são da conta real e são reais; só a execução é que não existe.
        </p>
      )}

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        <Card title={`Saldo (${mode})`}>
          {balances.length === 0 ? (
            <p className="text-[11.5px] text-text-muted m-0">
              Sem saldo. Deposite abaixo para começar.
            </p>
          ) : (
            <ul className="list-none p-0 m-0 flex flex-col gap-1">
              {balances.map((b) => (
                <li
                  key={b.accountId}
                  className="flex justify-between text-xs font-mono tabular-nums border-b border-divider pb-1"
                >
                  <span className="text-text-muted">{b.currency}</span>
                  <span className="text-text">{formatQty(b.balance)}</span>
                </li>
              ))}
            </ul>
          )}

          {settings && (
            <p className="text-[11px] text-text-faint m-0">
              limite por ordem: {formatQty(settings.max_order_notional as string, 2)}
            </p>
          )}
        </Card>

        <Card title="Depósito e saque">
          <DepositForm currencies={depositCurrencies} mode={mode} />
        </Card>

        <Card title="Nova ordem">
          <OrderTicket
            instruments={instruments}
            initialSymbol={params.symbol}
            mode={mode}
          />
        </Card>
      </div>

      <Card title="Posições">
        {positions.length === 0 ? (
          <p className="text-[11.5px] text-text-muted m-0">Nenhuma posição aberta.</p>
        ) : (
          <table className="w-full text-xs font-mono tabular-nums border-collapse">
            <thead>
              <tr className="text-text-faint text-left">
                <th className="font-normal py-1">símbolo</th>
                <th className="font-normal py-1 text-right">quantidade</th>
                <th className="font-normal py-1 text-right">custo</th>
                <th className="font-normal py-1 text-right">taxas</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.symbol} className="border-t border-divider">
                  <td className="py-1 text-text">{p.symbol}</td>
                  <td className="py-1 text-right">{formatQty(p.qty)}</td>
                  <td className="py-1 text-right">{formatQty(p.costBasis, 2)}</td>
                  <td className="py-1 text-right text-text-muted">{formatQty(p.fees, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
