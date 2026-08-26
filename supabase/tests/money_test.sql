\set ON_ERROR_STOP on

insert into auth.users (id, email) values
  ('33333333-3333-3333-3333-333333333333', 'trader@test.local');

-- 1. deposit
do $$
declare v_bal numeric;
begin
  perform record_transfer('33333333-3333-3333-3333-333333333333', 'deposit',
                          10000, 'BRL', 'simulado', null, 'paper');
  select account_balance(id) into v_bal from accounts
   where user_id = '33333333-3333-3333-3333-333333333333' and kind = 'paper' and currency = 'BRL';
  if v_bal <> 10000 then raise exception 'FALHA 1: saldo apos deposito = %', v_bal; end if;
end $$;

-- 2. an order larger than the balance is refused
do $$
begin
  begin
    perform record_fill('33333333-3333-3333-3333-333333333333', 'BTC/BRL', 'buy', 'market',
      'paper', 0.05, null, 0.05, 300000, 15, -15015, 0.05, 'BTC', 'BRL', null);
    raise exception 'FALHA 2: ordem acima do saldo foi aceita';
  exception when raise_exception then
    if sqlerrm like 'FALHA%' then raise; end if;
  end;
end $$;

-- 3. an affordable buy debits cash and credits the asset
do $$
declare v_brl numeric; v_btc numeric;
begin
  perform record_fill('33333333-3333-3333-3333-333333333333', 'BTC/BRL', 'buy', 'market',
    'paper', 0.02, null, 0.02, 300000, 6, -6006, 0.02, 'BTC', 'BRL', null);

  select account_balance(id) into v_brl from accounts
   where user_id = '33333333-3333-3333-3333-333333333333' and kind='paper' and currency='BRL';
  select account_balance(id) into v_btc from accounts
   where user_id = '33333333-3333-3333-3333-333333333333' and kind='paper' and currency='BTC';

  if v_brl <> 3994 then raise exception 'FALHA 3a: caixa = %, esperado 3994', v_brl; end if;
  if v_btc <> 0.02 then raise exception 'FALHA 3b: posicao = %, esperado 0.02', v_btc; end if;
end $$;

-- 4. selling more than the position is refused
do $$
begin
  begin
    perform record_fill('33333333-3333-3333-3333-333333333333', 'BTC/BRL', 'sell', 'market',
      'paper', 1, null, 1, 310000, 310, 309690, -1, 'BTC', 'BRL', null);
    raise exception 'FALHA 4: venda a descoberto foi aceita';
  exception when raise_exception then
    if sqlerrm like 'FALHA%' then raise; end if;
  end;
end $$;

-- 5. closing the position returns cash net of fees
do $$
declare v_brl numeric; v_btc numeric;
begin
  perform record_fill('33333333-3333-3333-3333-333333333333', 'BTC/BRL', 'sell', 'market',
    'paper', 0.02, null, 0.02, 310000, 6.2, 6193.8, -0.02, 'BTC', 'BRL', null);

  select account_balance(id) into v_brl from accounts
   where user_id='33333333-3333-3333-3333-333333333333' and kind='paper' and currency='BRL';
  select account_balance(id) into v_btc from accounts
   where user_id='33333333-3333-3333-3333-333333333333' and kind='paper' and currency='BTC';

  if v_brl <> 10187.8 then raise exception 'FALHA 5a: caixa = %, esperado 10187.8', v_brl; end if;
  if v_btc <> 0 then raise exception 'FALHA 5b: posicao residual = %', v_btc; end if;
end $$;

-- 6. withdrawing more than the balance is refused
do $$
begin
  begin
    perform record_transfer('33333333-3333-3333-3333-333333333333', 'withdrawal',
                            99999, 'BRL', 'simulado', null, 'paper');
    raise exception 'FALHA 6: saque acima do saldo foi aceito';
  exception when raise_exception then
    if sqlerrm like 'FALHA%' then raise; end if;
  end;
end $$;

-- 7. system invariant: every currency nets to zero across all accounts
do $$
declare r record;
begin
  for r in select currency, sum(amount) as total from ledger_entries group by currency loop
    if r.total <> 0 then
      raise exception 'FALHA 7: % nao fecha, soma = %', r.currency, r.total;
    end if;
  end loop;
end $$;

-- 8. every individual transaction balances per currency
do $$
declare r record;
begin
  for r in select transaction_id, currency, sum(amount) as total
             from ledger_entries group by transaction_id, currency loop
    if r.total <> 0 then
      raise exception 'FALHA 8: transacao % nao fecha em %', r.transaction_id, r.currency;
    end if;
  end loop;
end $$;

-- 9. the order and fill history survived
do $$
begin
  if (select count(*) from orders where user_id='33333333-3333-3333-3333-333333333333') <> 2
    then raise exception 'FALHA 9a: ordens registradas = %',
      (select count(*) from orders where user_id='33333333-3333-3333-3333-333333333333'); end if;
  if (select count(*) from fills) <> 2 then raise exception 'FALHA 9b: fills registrados'; end if;
end $$;

select 'TODOS OS TESTES DE DINHEIRO PASSARAM' as resultado;
