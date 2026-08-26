-- Atomic write paths.
--
-- These functions hold no pricing or risk logic — that lives in TypeScript,
-- where it is unit tested. What has to be in the database is the part that
-- cannot be done correctly from outside: a single transaction that checks the
-- balance and appends the ledger without a window in between.
--
-- None of them are granted to anon or authenticated. They are reachable only
-- by the server's secret key.

create or replace function ensure_account(
  p_user_id uuid,
  p_kind account_kind,
  p_currency text
) returns uuid
language plpgsql
set search_path = public, pg_temp as $$
declare
  v_id uuid;
begin
  insert into accounts (user_id, kind, currency)
  values (p_user_id, p_kind, p_currency)
  on conflict (user_id, kind, currency) do nothing;

  select id into v_id from accounts
  where user_id = p_user_id and kind = p_kind and currency = p_currency;

  return v_id;
end;
$$;

create or replace function account_balance(p_account_id uuid) returns numeric
language sql stable
set search_path = public, pg_temp as $$
  select coalesce(sum(amount), 0) from ledger_entries where account_id = p_account_id;
$$;

-- ---------------------------------------------------------------- deposits

create or replace function record_transfer(
  p_user_id uuid,
  p_kind transfer_kind,
  p_amount numeric,
  p_currency text,
  p_method text,
  p_provider_ref text,
  p_account_kind account_kind
) returns uuid
language plpgsql
set search_path = public, pg_temp as $$
declare
  v_account uuid;
  v_external uuid;
  v_tx uuid;
  v_transfer uuid;
  v_signed numeric;
begin
  if p_amount <= 0 then
    raise exception 'valor deve ser positivo';
  end if;

  v_account := ensure_account(p_user_id, p_account_kind, p_currency);
  v_external := ensure_account(p_user_id, 'external', p_currency);

  -- Serialise concurrent transfers on the same account so two withdrawals
  -- cannot both observe a sufficient balance.
  perform 1 from accounts where id = v_account for update;

  v_signed := case when p_kind = 'deposit' then p_amount else -p_amount end;

  if v_signed < 0 and account_balance(v_account) + v_signed < 0 then
    raise exception 'saldo insuficiente para saque';
  end if;

  insert into ledger_transactions (user_id, kind, memo, ref_type)
  values (p_user_id, 'transfer', p_kind::text, 'transfer')
  returning id into v_tx;

  insert into ledger_entries (transaction_id, account_id, amount, currency)
  values (v_tx, v_account, v_signed, p_currency),
         (v_tx, v_external, -v_signed, p_currency);

  insert into transfers (user_id, account_id, kind, amount, currency, status,
                         method, provider_ref, transaction_id, settled_at)
  values (p_user_id, v_account, p_kind, p_amount, p_currency, 'confirmed',
          p_method, p_provider_ref, v_tx, now())
  returning id into v_transfer;

  update ledger_transactions set ref_id = v_transfer where id = v_tx;

  return v_transfer;
end;
$$;

-- ---------------------------------------------------------------- fills

create or replace function record_fill(
  p_user_id uuid,
  p_symbol text,
  p_side order_side,
  p_type order_type,
  p_mode account_kind,
  p_requested_qty numeric,
  p_limit_price numeric,
  p_fill_qty numeric,
  p_fill_price numeric,
  p_fee numeric,
  p_quote_delta numeric,
  p_base_delta numeric,
  p_base_currency text,
  p_quote_currency text,
  p_client_ref text
) returns uuid
language plpgsql
set search_path = public, pg_temp as $$
declare
  v_quote uuid;
  v_base uuid;
  v_ext_quote uuid;
  v_ext_base uuid;
  v_tx uuid;
  v_order uuid;
  v_status order_status;
begin
  v_quote := ensure_account(p_user_id, p_mode, p_quote_currency);
  v_base := ensure_account(p_user_id, p_mode, p_base_currency);
  v_ext_quote := ensure_account(p_user_id, 'external', p_quote_currency);
  v_ext_base := ensure_account(p_user_id, 'external', p_base_currency);

  perform 1 from accounts where id in (v_quote, v_base) order by id for update;

  if p_quote_delta < 0 and account_balance(v_quote) + p_quote_delta < 0 then
    raise exception 'saldo insuficiente em %', p_quote_currency;
  end if;

  if p_base_delta < 0 and account_balance(v_base) + p_base_delta < 0 then
    raise exception 'posição insuficiente em %', p_base_currency;
  end if;

  v_status := case when p_fill_qty >= p_requested_qty then 'filled' else 'partial' end;

  insert into orders (user_id, account_id, symbol, side, type, qty, limit_price,
                      status, mode, client_ref, closed_at)
  values (p_user_id, v_quote, p_symbol, p_side, p_type, p_requested_qty, p_limit_price,
          v_status, p_mode, p_client_ref, now())
  returning id into v_order;

  insert into ledger_transactions (user_id, kind, memo, ref_type, ref_id)
  values (p_user_id, 'trade', p_side::text || ' ' || p_symbol, 'order', v_order)
  returning id into v_tx;

  insert into ledger_entries (transaction_id, account_id, amount, currency)
  values (v_tx, v_quote, p_quote_delta, p_quote_currency),
         (v_tx, v_ext_quote, -p_quote_delta, p_quote_currency),
         (v_tx, v_base, p_base_delta, p_base_currency),
         (v_tx, v_ext_base, -p_base_delta, p_base_currency);

  insert into fills (order_id, qty, price, fee, fee_currency, transaction_id)
  values (v_order, p_fill_qty, p_fill_price, p_fee, p_quote_currency, v_tx);

  return v_order;
end;
$$;

revoke all on function ensure_account(uuid, account_kind, text) from public, anon, authenticated;
revoke all on function record_transfer(uuid, transfer_kind, numeric, text, text, text, account_kind) from public, anon, authenticated;
revoke all on function record_fill(uuid, text, order_side, order_type, account_kind, numeric, numeric, numeric, numeric, numeric, numeric, numeric, text, text, text) from public, anon, authenticated;
