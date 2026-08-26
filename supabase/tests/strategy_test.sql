\set ON_ERROR_STOP on

set search_path = tradeview, public;

insert into auth.users (id, email) values
  ('44444444-4444-4444-4444-444444444444', 'bot@test.local');

select tradeview.ensure_user_setup('44444444-4444-4444-4444-444444444444', 'bot');

insert into tradeview.strategies (id, user_id, name, kind, symbol, timeframe, order_notional, status)
values ('55555555-0000-0000-0000-000000000001',
        '44444444-4444-4444-4444-444444444444',
        'cruzamento btc', 'sma_cross', 'BTC/BRL', '1h', 250, 'paused');

-- 1. a saved strategy is parked; nothing trades because it exists
do $$
begin
  if (select count(*) from tradeview.claim_strategies('runner-a', 60, 10)) <> 0
    then raise exception 'FALHA 1: estrategia pausada foi entregue ao runner'; end if;
end $$;

update tradeview.strategies set status = 'active'
where id = '55555555-0000-0000-0000-000000000001';

-- 2. an active due strategy goes to exactly one runner
do $$
begin
  if (select count(*) from tradeview.claim_strategies('runner-a', 60, 10)) <> 1
    then raise exception 'FALHA 2a: runner A nao recebeu a estrategia ativa'; end if;
  if (select count(*) from tradeview.claim_strategies('runner-b', 60, 10)) <> 0
    then raise exception 'FALHA 2b: dois runners pegaram a mesma estrategia'; end if;
end $$;

-- 3. a runner that died mid-evaluation returns the work when the lease expires
do $$
begin
  update tradeview.strategies set locked_until = now() - interval '1 second'
  where id = '55555555-0000-0000-0000-000000000001';

  if (select count(*) from tradeview.claim_strategies('runner-b', 60, 10)) <> 1
    then raise exception 'FALHA 3: lease expirada nao devolveu a estrategia'; end if;
end $$;

-- 4. only the lease holder may record the outcome
do $$
begin
  begin
    perform tradeview.finish_strategy_run(
      '55555555-0000-0000-0000-000000000001', 'runner-a',
      'buy', 'cruzou', 100, null, null, now() + interval '1 hour');
    raise exception 'FALHA 4: runner sem a lease gravou a decisao';
  exception when raise_exception then
    if sqlerrm like 'FALHA%' then raise; end if;
  end;
end $$;

-- 5. finishing records the run, releases the lock and schedules the next tick
do $$
declare s record;
begin
  perform tradeview.finish_strategy_run(
    '55555555-0000-0000-0000-000000000001', 'runner-b',
    'hold', 'sem cruzamento', 407351, null, null, now() + interval '1 hour');

  select * into s from tradeview.strategies where id = '55555555-0000-0000-0000-000000000001';

  if s.locked_by is not null then raise exception 'FALHA 5a: lock nao foi liberado'; end if;
  if s.last_signal <> 'hold' then raise exception 'FALHA 5b: sinal nao registrado'; end if;
  if s.next_run_at <= now() then raise exception 'FALHA 5c: proxima execucao nao foi agendada'; end if;
  if (select count(*) from tradeview.strategy_runs
      where strategy_id = '55555555-0000-0000-0000-000000000001') <> 1
    then raise exception 'FALHA 5d: execucao nao foi gravada'; end if;
  if (select count(*) from tradeview.claim_strategies('runner-a', 60, 10)) <> 0
    then raise exception 'FALHA 5e: estrategia foi entregue antes da hora'; end if;
end $$;

-- 6. one venue timeout does not stop the bot; a persistent one does
do $$
declare i int;
begin
  for i in 1..4 loop
    update tradeview.strategies set next_run_at = now() where id = '55555555-0000-0000-0000-000000000001';
    perform tradeview.claim_strategies('runner-a', 60, 10);
    perform tradeview.finish_strategy_run(
      '55555555-0000-0000-0000-000000000001', 'runner-a',
      'hold', '', null, null, 'timeout na venue', now());
  end loop;

  if (select status from tradeview.strategies where id = '55555555-0000-0000-0000-000000000001') <> 'active'
    then raise exception 'FALHA 6a: quatro falhas seguidas ja pararam a estrategia'; end if;

  update tradeview.strategies set next_run_at = now() where id = '55555555-0000-0000-0000-000000000001';
  perform tradeview.claim_strategies('runner-a', 60, 10);
  perform tradeview.finish_strategy_run(
    '55555555-0000-0000-0000-000000000001', 'runner-a',
    'hold', '', null, null, 'timeout na venue', now());

  if (select status from tradeview.strategies where id = '55555555-0000-0000-0000-000000000001') <> 'error'
    then raise exception 'FALHA 6b: cinco falhas seguidas nao pararam a estrategia'; end if;
  if (select count(*) from tradeview.claim_strategies('runner-a', 60, 10)) <> 0
    then raise exception 'FALHA 6c: estrategia em erro continua sendo executada'; end if;
end $$;

-- 7. a successful run clears the error count
do $$
begin
  update tradeview.strategies set status = 'active', next_run_at = now()
  where id = '55555555-0000-0000-0000-000000000001';
  perform tradeview.claim_strategies('runner-a', 60, 10);
  perform tradeview.finish_strategy_run(
    '55555555-0000-0000-0000-000000000001', 'runner-a',
    'hold', 'ok', 1, null, null, now() + interval '1 hour');

  if (select consecutive_errors from tradeview.strategies
      where id = '55555555-0000-0000-0000-000000000001') <> 0
    then raise exception 'FALHA 7: contagem de erros nao zerou apos sucesso'; end if;
end $$;

-- 8. the run log is bounded, or one strategy fills the disk on its own
do $$
declare i int;
begin
  for i in 1..260 loop
    update tradeview.strategies set next_run_at = now(), locked_by = 'runner-a',
           locked_until = now() + interval '60 seconds'
    where id = '55555555-0000-0000-0000-000000000001';
    perform tradeview.finish_strategy_run(
      '55555555-0000-0000-0000-000000000001', 'runner-a',
      'hold', 'tick', 1, null, null, now());
  end loop;

  if (select count(*) from tradeview.strategy_runs
      where strategy_id = '55555555-0000-0000-0000-000000000001') > 200
    then raise exception 'FALHA 8: log de execucoes cresce sem limite (% linhas)',
      (select count(*) from tradeview.strategy_runs
       where strategy_id = '55555555-0000-0000-0000-000000000001'); end if;
end $$;

-- 9. the browser reads its own strategies and writes none
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"44444444-4444-4444-4444-444444444444"}';
  set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';
  do $$
  begin
    if (select count(*) from tradeview.strategies) <> 1
      then raise exception 'FALHA 9a: dono nao enxerga a propria estrategia'; end if;

    begin
      update tradeview.strategies set status = 'active';
      raise exception 'FALHA 9b: authenticated ligou uma estrategia direto no banco';
    exception when insufficient_privilege then null;
    end;

    begin
      insert into tradeview.strategy_runs (strategy_id, user_id, action)
      values ('55555555-0000-0000-0000-000000000001',
              '44444444-4444-4444-4444-444444444444', 'buy');
      raise exception 'FALHA 9c: authenticated forjou uma execucao';
    exception when insufficient_privilege then null;
    end;

    begin
      perform tradeview.claim_strategies('invasor', 60, 10);
      raise exception 'FALHA 9d: authenticated chamou o claim do runner';
    exception when insufficient_privilege then null;
    end;
  end $$;
rollback;

-- 10. another user sees nothing of this one
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
  do $$
  begin
    if (select count(*) from tradeview.strategies) <> 0
      then raise exception 'FALHA 10a: outro usuario enxerga estrategia alheia'; end if;
    if (select count(*) from tradeview.strategy_runs) <> 0
      then raise exception 'FALHA 10b: outro usuario enxerga execucoes alheias'; end if;
  end $$;
rollback;

select 'TODOS OS TESTES DE ESTRATEGIA PASSARAM' as resultado;
