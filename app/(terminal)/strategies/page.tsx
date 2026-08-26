import { redirect } from 'next/navigation';

import { supabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient, getSessionUserId } from '@/lib/supabase/server';
import {
  listRecentRuns,
  listStrategies,
  readRunnerHealth,
  SchemaMissingError,
} from '@/lib/trading/strategies';
import { NewStrategyForm } from '@/components/strategies/NewStrategyForm';
import { StrategyCard } from '@/components/strategies/StrategyCard';

export const metadata = { title: 'Estratégias · TradeView' };
export const dynamic = 'force-dynamic';

export default async function StrategiesPage() {
  if (!supabaseConfigured) {
    return (
      <div className="p-5 flex flex-col gap-2">
        <h1 className="text-sm font-bold text-text m-0">
          Estratégias indisponíveis em modo demonstração
        </h1>
        <p className="text-[11.5px] text-text-secondary max-w-[560px] m-0">
          Uma estratégia mora no banco e é executada por um serviço fora daqui. Configure as
          variáveis do Supabase para habilitar.
        </p>
      </div>
    );
  }

  const userId = await getSessionUserId();
  if (!userId) redirect('/login?next=%2Fstrategies');

  const supabase = await createSupabaseServerClient();

  let loaded;
  try {
    loaded = await Promise.all([
      listStrategies(userId),
      listRecentRuns(userId, 200),
      readRunnerHealth(),
      supabase.from('instruments').select('symbol').eq('active', true).order('symbol'),
    ]);
  } catch (error) {
    if (!(error instanceof SchemaMissingError)) throw error;

    return (
      <div className="p-5 flex flex-col gap-2" style={{ maxWidth: 640 }}>
        <h1 className="text-sm font-bold text-text m-0">Estratégias ainda não instaladas</h1>
        <p className="text-[11.5px] text-text-secondary m-0">
          As tabelas de estratégia não existem neste banco. Aplique{' '}
          <code className="text-text font-mono">
            supabase/migrations/20260826000006_strategies.sql
          </code>{' '}
          e recarregue.
        </p>
      </div>
    );
  }

  const [strategies, runs, runners, instrumentsResult] = loaded;

  const symbols = (instrumentsResult.data ?? []).map((row) => row.symbol as string);

  const alive = runners.filter((r) => r.alive);
  const runnerAlive = alive.length > 0;
  const lastSeen = runners[0];

  const runsByStrategy = new Map<string, typeof runs>();
  for (const run of runs) {
    const bucket = runsByStrategy.get(run.strategyId);
    if (bucket) bucket.push(run);
    else runsByStrategy.set(run.strategyId, [run]);
  }

  return (
    <div className="p-5 flex flex-col gap-4" style={{ maxWidth: 980 }}>
      <header className="flex items-center gap-3 flex-wrap">
        <h1 className="text-sm font-bold text-text m-0">Estratégias</h1>

        <span
          className={`h-6 px-2 inline-flex items-center rounded-md border text-[11px] ${
            runnerAlive
              ? 'text-up border-up-border bg-up-bg'
              : 'text-warn border-warn-border bg-warn-bg'
          }`}
        >
          {runnerAlive
            ? `runner de pé · ${alive.map((r) => r.runnerId).join(', ')}`
            : 'nenhum runner de pé'}
        </span>

        {!runnerAlive && lastSeen && (
          <span className="text-[11px] text-text-faint font-mono">
            último sinal de {lastSeen.runnerId} em{' '}
            {new Date(lastSeen.lastSeenAt).toLocaleString('pt-BR')}
          </span>
        )}
      </header>

      {!runnerAlive && (
        <p className="text-[11.5px] text-text-secondary m-0 max-w-[640px]">
          Estratégias são avaliadas por um processo que fica vivo numa VPS, não por esta página.
          Sem ele, dá para criar e ligar — nada decide. O passo a passo do deploy está em{' '}
          <code className="text-text font-mono">deploy/RUNNER.md</code>.
        </p>
      )}

      <NewStrategyForm symbols={symbols} />

      {strategies.length === 0 ? (
        <p className="text-[11.5px] text-text-secondary m-0">
          Nenhuma estratégia ainda. A de cima é o formulário.
        </p>
      ) : (
        strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            runs={(runsByStrategy.get(strategy.id) ?? []).slice(0, 8)}
            runnerAlive={runnerAlive}
          />
        ))
      )}

      <section className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
        <h2 className="text-xs font-bold text-text m-0">O QUE AINDA NÃO EXISTE AQUI</h2>
        <ul className="m-0 pl-4 flex flex-col gap-1 text-[11.5px] text-text-secondary">
          <li>
            backtest — nada nesta tela diz como a estratégia teria se saído antes de você ligar
          </li>
          <li>
            retorno por estratégia; Sharpe, drawdown e win rate precisam de histórico que só
            aparece depois de rodar
          </li>
          <li>
            edição de uma estratégia existente: hoje se remove e cria de novo, o que zera o
            histórico dela
          </li>
          <li>
            modo real — o runner recusa, porque o preenchimento ainda é simulado contra o book ao
            vivo
          </li>
        </ul>
      </section>
    </div>
  );
}
