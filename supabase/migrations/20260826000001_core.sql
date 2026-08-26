-- TradeView core schema.
--
-- Money model: every balance is the sum of immutable ledger entries. Nothing
-- stores a mutable balance column, so a wrong balance cannot be written — only
-- an unbalanced transaction can, and a constraint trigger rejects those.

create extension if not exists pgcrypto;

-- Secrets live outside the PostgREST-exposed schema so no API role can reach
-- them even if a policy is later written wrong.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------- enums

-- 'external' is the counterparty side of every trade and deposit. Without it a
-- trade could not balance, since cash and the asset are different currencies
-- and each must sum to zero on its own.
create type account_kind as enum ('paper', 'real', 'external');
create type transfer_kind as enum ('deposit', 'withdrawal');
create type transfer_status as enum ('pending', 'confirmed', 'failed', 'cancelled');
create type entry_kind as enum ('transfer', 'trade', 'fee', 'funding', 'adjustment');
create type order_side as enum ('buy', 'sell');
create type order_type as enum ('market', 'limit');
create type order_status as enum ('pending', 'partial', 'filled', 'cancelled', 'rejected');

-- ---------------------------------------------------------------- profiles

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  base_currency text not null default 'BRL' check (char_length(base_currency) between 3 and 8),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- settings

-- Risk rails. These are enforced server-side on every order; they exist in the
-- database so a bug in the app cannot silently trade past them.
create table trading_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  real_trading_enabled boolean not null default false,
  kill_switch_active boolean not null default false,
  max_order_notional numeric(38, 18) not null default 1000 check (max_order_notional > 0),
  daily_loss_limit numeric(38, 18) not null default 500 check (daily_loss_limit > 0),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- accounts

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind account_kind not null default 'paper',
  currency text not null check (char_length(currency) between 2 and 12),
  created_at timestamptz not null default now(),
  unique (user_id, kind, currency)
);

create index accounts_user_idx on accounts (user_id);

-- ---------------------------------------------------------------- ledger

create table ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind entry_kind not null,
  memo text not null default '',
  ref_type text,
  ref_id uuid,
  created_at timestamptz not null default now()
);

create index ledger_transactions_user_idx on ledger_transactions (user_id, created_at desc);

-- Signed amounts. A transaction is valid only when its entries sum to zero per
-- currency, which is checked by a deferred constraint trigger below.
create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references ledger_transactions (id) on delete cascade,
  account_id uuid not null references accounts (id) on delete restrict,
  amount numeric(38, 18) not null check (amount <> 0),
  currency text not null,
  created_at timestamptz not null default now()
);

create index ledger_entries_account_idx on ledger_entries (account_id);
create index ledger_entries_transaction_idx on ledger_entries (transaction_id);

create or replace function assert_transaction_balanced() returns trigger
language plpgsql as $$
declare
  offending text;
begin
  select e.currency into offending
  from ledger_entries e
  where e.transaction_id = coalesce(new.transaction_id, old.transaction_id)
  group by e.currency
  having sum(e.amount) <> 0
  limit 1;

  if offending is not null then
    raise exception 'transação % não fecha em %', coalesce(new.transaction_id, old.transaction_id), offending;
  end if;

  return null;
end;
$$;

create constraint trigger ledger_entries_balanced
  after insert or update or delete on ledger_entries
  deferrable initially deferred
  for each row execute function assert_transaction_balanced();

-- The ledger is append-only. Corrections are made with a reversing entry, so
-- history stays auditable.
create or replace function reject_ledger_mutation() returns trigger
language plpgsql as $$
begin
  raise exception 'ledger é append-only; registre um lançamento de estorno';
end;
$$;

create trigger ledger_entries_immutable
  before update or delete on ledger_entries
  for each row execute function reject_ledger_mutation();

-- ---------------------------------------------------------------- transfers

create table transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references accounts (id) on delete restrict,
  kind transfer_kind not null,
  amount numeric(38, 18) not null check (amount > 0),
  currency text not null,
  status transfer_status not null default 'pending',
  method text not null default 'simulado',
  provider_ref text,
  transaction_id uuid references ledger_transactions (id),
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create index transfers_user_idx on transfers (user_id, created_at desc);
create unique index transfers_provider_ref_idx
  on transfers (method, provider_ref) where provider_ref is not null;

-- ---------------------------------------------------------------- instruments

create table instruments (
  symbol text primary key,
  venue text not null,
  asset_class text not null,
  base text not null,
  quote text not null,
  price_precision int not null default 2 check (price_precision between 0 and 18),
  qty_precision int not null default 8 check (qty_precision between 0 and 18),
  active boolean not null default true
);

-- ---------------------------------------------------------------- orders

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references accounts (id) on delete restrict,
  symbol text not null references instruments (symbol),
  side order_side not null,
  type order_type not null default 'market',
  qty numeric(38, 18) not null check (qty > 0),
  limit_price numeric(38, 18) check (limit_price is null or limit_price > 0),
  status order_status not null default 'pending',
  mode account_kind not null default 'paper',
  reject_reason text,
  client_ref text,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint orders_limit_price_required
    check (type <> 'limit' or limit_price is not null)
);

create index orders_user_idx on orders (user_id, created_at desc);
create unique index orders_client_ref_idx
  on orders (user_id, client_ref) where client_ref is not null;

create table fills (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  qty numeric(38, 18) not null check (qty > 0),
  price numeric(38, 18) not null check (price > 0),
  fee numeric(38, 18) not null default 0 check (fee >= 0),
  fee_currency text not null,
  transaction_id uuid references ledger_transactions (id),
  created_at timestamptz not null default now()
);

create index fills_order_idx on fills (order_id);

-- ---------------------------------------------------------------- credentials

-- Ciphertext only. Encryption and decryption happen in the Node server with a
-- key that never reaches Postgres, so a database dump alone does not yield
-- usable exchange credentials.
create table private.exchange_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null,
  label text not null default '',
  key_ciphertext text not null,
  secret_ciphertext text not null,
  passphrase_ciphertext text,
  key_last_four text not null default '',
  can_trade boolean not null default false,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  unique (user_id, provider, label)
);

-- ---------------------------------------------------------------- audit

create table audit_log (
  id bigserial primary key,
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_user_idx on audit_log (user_id, created_at desc);

-- ---------------------------------------------------------------- views

-- numeric is cast to text so PostgREST does not round it through a JSON double.
create view account_balances
with (security_invoker = true) as
select
  a.id as account_id,
  a.user_id,
  a.kind,
  a.currency,
  coalesce(sum(e.amount), 0)::text as balance
from accounts a
left join ledger_entries e on e.account_id = a.id
group by a.id, a.user_id, a.kind, a.currency;

create view positions
with (security_invoker = true) as
select
  o.user_id,
  o.account_id,
  o.symbol,
  o.mode,
  sum(case when o.side = 'buy' then f.qty else -f.qty end)::text as qty,
  sum(case when o.side = 'buy' then f.qty * f.price else -f.qty * f.price end)::text as cost_basis,
  sum(f.fee)::text as fees,
  max(f.created_at) as last_fill_at
from orders o
join fills f on f.order_id = o.id
group by o.user_id, o.account_id, o.symbol, o.mode
having sum(case when o.side = 'buy' then f.qty else -f.qty end) <> 0;
