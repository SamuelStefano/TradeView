\set ON_ERROR_STOP on

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.local');

-- 1. signup trigger provisions profile, settings and a paper account
do $$
begin
  if (select count(*) from accounts where user_id = '11111111-1111-1111-1111-111111111111') <> 1
    then raise exception 'FALHA 1a: conta paper nao provisionada'; end if;
  if not exists (select 1 from trading_settings where user_id = '11111111-1111-1111-1111-111111111111')
    then raise exception 'FALHA 1b: trading_settings nao provisionado'; end if;
  if (select real_trading_enabled from trading_settings where user_id = '11111111-1111-1111-1111-111111111111')
    then raise exception 'FALHA 1c: trading real veio habilitado por padrao'; end if;
end $$;

-- seed: fund A with 10.000 BRL from an external funding account
begin;
insert into accounts (id, user_id, kind, currency)
values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'paper', 'EXT');

insert into ledger_transactions (id, user_id, kind, memo)
values ('cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'transfer', 'deposito inicial');

insert into ledger_entries (transaction_id, account_id, amount, currency)
select 'cccccccc-0000-0000-0000-000000000001', id, 10000, 'BRL'
from accounts where user_id = '11111111-1111-1111-1111-111111111111' and currency = 'BRL';

insert into ledger_entries (transaction_id, account_id, amount, currency)
values ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', -10000, 'BRL');
commit;

-- 2. an unbalanced transaction must be rejected
begin;
do $$
begin
  begin
    insert into ledger_transactions (id, user_id, kind)
    values ('cccccccc-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'adjustment');
    insert into ledger_entries (transaction_id, account_id, amount, currency)
    select 'cccccccc-0000-0000-0000-000000000009', id, 999, 'BRL'
    from accounts where user_id = '11111111-1111-1111-1111-111111111111' and currency = 'BRL';
    set constraints all immediate;
    raise exception 'FALHA 2: lancamento desbalanceado foi aceito';
  exception when raise_exception then
    if sqlerrm like 'FALHA%' then raise; end if;
  end;
end $$;
rollback;

-- 3. the ledger is append-only
do $$
begin
  begin
    update ledger_entries set amount = 1 where currency = 'BRL';
    raise exception 'FALHA 3: update no ledger foi aceito';
  exception when raise_exception then
    if sqlerrm like 'FALHA%' then raise; end if;
  end;
end $$;

-- 4. user A sees only its own rows
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  do $$
  begin
    if (select count(*) from accounts) <> 2 then
      raise exception 'FALHA 4a: A enxerga % contas, esperado 2', (select count(*) from accounts); end if;
    if (select balance from account_balances where currency = 'BRL' and kind = 'paper') <> '10000.000000000000000000' then
      raise exception 'FALHA 4b: saldo inesperado %', (select balance from account_balances where currency = 'BRL'); end if;
  end $$;
rollback;

-- 5. user B sees nothing of A
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
  do $$
  begin
    if exists (select 1 from accounts where user_id <> '22222222-2222-2222-2222-222222222222')
      then raise exception 'FALHA 5a: B enxerga conta de outro usuario'; end if;
    if (select count(*) from ledger_entries) <> 0 then raise exception 'FALHA 5b: B enxerga ledger de A'; end if;
    if exists (select 1 from account_balances where balance::numeric <> 0)
      then raise exception 'FALHA 5c: B enxerga saldo de A'; end if;
    if (select count(*) from transfers) <> 0 then raise exception 'FALHA 5d: B enxerga transferencias de A'; end if;
  end $$;
rollback;

-- 6. authenticated cannot write to any financial table
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  do $$
  begin
    begin
      insert into orders (user_id, account_id, symbol, side, qty)
      values ('11111111-1111-1111-1111-111111111111',
              (select id from accounts limit 1), 'BTC/BRL', 'buy', 1);
      raise exception 'FALHA 6a: authenticated inseriu ordem';
    exception when insufficient_privilege then null;
    end;

    begin
      insert into transfers (user_id, account_id, kind, amount, currency)
      values ('11111111-1111-1111-1111-111111111111',
              (select id from accounts limit 1), 'deposit', 1000000, 'BRL');
      raise exception 'FALHA 6b: authenticated inseriu deposito';
    exception when insufficient_privilege then null;
    end;

    begin
      update trading_settings set real_trading_enabled = true;
      raise exception 'FALHA 6c: authenticated habilitou trading real';
    exception when insufficient_privilege then null;
    end;
  end $$;
rollback;

-- 7. exchange credentials are unreachable from the API roles
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  do $$
  declare n int;
  begin
    begin
      select count(*) into n from private.exchange_credentials;
      raise exception 'FALHA 7: authenticated leu private.exchange_credentials';
    exception when insufficient_privilege then null;
    end;
  end $$;
rollback;

-- 8. anon sees nothing at all
begin;
  set local role anon;
  do $$
  declare n int;
  begin
    begin
      select count(*) into n from accounts;
      if n <> 0 then raise exception 'FALHA 8: anon leu % contas', n; end if;
    exception when insufficient_privilege then null;
    end;
  end $$;
rollback;

select 'TODOS OS TESTES DE RLS PASSARAM' as resultado;
