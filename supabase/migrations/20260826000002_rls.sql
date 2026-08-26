-- Row level security.
--
-- Posture: the browser may read its own rows and may write nothing. Every
-- mutation goes through a server route that authorizes explicitly, so a missing
-- policy fails closed instead of exposing a write path. Enabling RLS with no
-- policy for a command is already a deny; the writes are left unpoliced on
-- purpose, not by omission.

alter table tradeview.profiles            enable row level security;
alter table tradeview.trading_settings    enable row level security;
alter table tradeview.accounts            enable row level security;
alter table tradeview.ledger_transactions enable row level security;
alter table tradeview.ledger_entries      enable row level security;
alter table tradeview.transfers           enable row level security;
alter table tradeview.orders              enable row level security;
alter table tradeview.fills               enable row level security;
alter table tradeview.instruments         enable row level security;
alter table tradeview.audit_log           enable row level security;

alter table tradeview.profiles            force row level security;
alter table tradeview.trading_settings    force row level security;
alter table tradeview.accounts            force row level security;
alter table tradeview.ledger_transactions force row level security;
alter table tradeview.ledger_entries      force row level security;
alter table tradeview.transfers           force row level security;
alter table tradeview.orders              force row level security;
alter table tradeview.fills               force row level security;
alter table tradeview.instruments         force row level security;
alter table tradeview.audit_log           force row level security;

-- tradeview_private.exchange_credentials deliberately has no policies and no
-- grants. It is reachable only by a role that bypasses RLS, from the server.
alter table tradeview_private.exchange_credentials enable row level security;

-- ---------------------------------------------------------------- read policies

create policy profiles_select_own on tradeview.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy trading_settings_select_own on tradeview.trading_settings
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy accounts_select_own on tradeview.accounts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy ledger_transactions_select_own on tradeview.ledger_transactions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy ledger_entries_select_own on tradeview.ledger_entries
  for select to authenticated
  using (
    exists (
      select 1 from tradeview.accounts a
      where a.id = ledger_entries.account_id
        and a.user_id = (select auth.uid())
    )
  );

create policy transfers_select_own on tradeview.transfers
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy orders_select_own on tradeview.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy fills_select_own on tradeview.fills
  for select to authenticated
  using (
    exists (
      select 1 from tradeview.orders o
      where o.id = fills.order_id
        and o.user_id = (select auth.uid())
    )
  );

create policy audit_log_select_own on tradeview.audit_log
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- The instrument catalogue is reference data, not user data. A row is still
-- only visible to someone holding a session for this project.
create policy instruments_select_all on tradeview.instruments
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------- grants

-- Scoped to `tradeview` on purpose: the other app in this project owns `public`
-- and a schema-wide revoke there would silently break it.
revoke all on all tables in schema tradeview from anon;
revoke all on all sequences in schema tradeview from anon;
revoke all on all functions in schema tradeview from anon, authenticated;

-- Supabase's default privileges grant ALL on new tables to anon and
-- authenticated. Left alone, a missing RLS policy on an UPDATE degrades to a
-- silent zero-row no-op instead of an error. Revoking the write grants makes
-- the same mistake fail loudly.
revoke insert, update, delete, truncate on all tables in schema tradeview from authenticated;

grant usage on schema tradeview to authenticated;

-- The server's secret key maps to service_role. It bypasses RLS but still needs
-- ordinary privileges, and a fresh schema grants it none.
grant usage on schema tradeview, tradeview_private to service_role;
grant all on all tables in schema tradeview to service_role;
grant all on all sequences in schema tradeview to service_role;
grant all on all tables in schema tradeview_private to service_role;

grant select on
  tradeview.profiles, tradeview.trading_settings, tradeview.accounts,
  tradeview.ledger_transactions, tradeview.ledger_entries, tradeview.transfers,
  tradeview.orders, tradeview.fills, tradeview.instruments, tradeview.audit_log,
  tradeview.account_balances, tradeview.positions
to authenticated;
