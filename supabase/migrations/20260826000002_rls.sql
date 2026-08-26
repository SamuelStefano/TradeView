-- Row level security.
--
-- Posture: the browser may read its own rows and may write nothing. Every
-- mutation goes through a server route that authorizes explicitly, so a missing
-- policy fails closed instead of exposing a write path. Enabling RLS with no
-- policy for a command is already a deny; the writes are left unpoliced on
-- purpose, not by omission.

alter table profiles            enable row level security;
alter table trading_settings    enable row level security;
alter table accounts            enable row level security;
alter table ledger_transactions enable row level security;
alter table ledger_entries      enable row level security;
alter table transfers           enable row level security;
alter table orders              enable row level security;
alter table fills               enable row level security;
alter table instruments         enable row level security;
alter table audit_log           enable row level security;

alter table profiles            force row level security;
alter table trading_settings    force row level security;
alter table accounts            force row level security;
alter table ledger_transactions force row level security;
alter table ledger_entries      force row level security;
alter table transfers           force row level security;
alter table orders              force row level security;
alter table fills               force row level security;
alter table instruments         force row level security;
alter table audit_log           force row level security;

-- private.exchange_credentials deliberately has no policies and no grants. It
-- is reachable only by a role that bypasses RLS, from the server.
alter table private.exchange_credentials enable row level security;

-- ---------------------------------------------------------------- read policies

create policy profiles_select_own on profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy trading_settings_select_own on trading_settings
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy accounts_select_own on accounts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy ledger_transactions_select_own on ledger_transactions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy ledger_entries_select_own on ledger_entries
  for select to authenticated
  using (
    exists (
      select 1 from accounts a
      where a.id = ledger_entries.account_id
        and a.user_id = (select auth.uid())
    )
  );

create policy transfers_select_own on transfers
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy orders_select_own on orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy fills_select_own on fills
  for select to authenticated
  using (
    exists (
      select 1 from orders o
      where o.id = fills.order_id
        and o.user_id = (select auth.uid())
    )
  );

create policy audit_log_select_own on audit_log
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- The instrument catalogue is reference data, not user data.
create policy instruments_select_all on instruments
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------- grants

-- Supabase's default privileges grant ALL on new public tables to anon and
-- authenticated. Left alone, a missing RLS policy on an UPDATE degrades to a
-- silent zero-row no-op instead of an error. Revoking the write grants makes
-- the same mistake fail loudly.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke insert, update, delete, truncate on all tables in schema public from authenticated;

grant select on
  profiles, trading_settings, accounts, ledger_transactions, ledger_entries,
  transfers, orders, fills, instruments, audit_log,
  account_balances, positions
to authenticated;

-- ---------------------------------------------------------------- provisioning

-- A new signup gets a profile, default risk rails and a paper account, so no
-- code path has to cope with a half-provisioned user.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;

  insert into trading_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into accounts (user_id, kind, currency) values (new.id, 'paper', 'BRL')
  on conflict (user_id, kind, currency) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
