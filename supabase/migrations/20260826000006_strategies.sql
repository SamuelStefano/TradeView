-- Strategies and the runner that executes them.
--
-- The runner is a long-lived process on a VPS, not a serverless function: a
-- CCXT rate limiter only works inside one process that stays alive, and a
-- strategy has to see its own previous decision. That means more than one
-- runner could be alive at once — during a deploy, or after a crash where the
-- old container has not exited yet. Two runners evaluating the same strategy
-- would place the same order twice, so work is handed out under a lease instead
-- of by a plain `select ... where status = 'active'`.

create type tradeview.strategy_status as enum ('active', 'paused', 'error');
create type tradeview.signal_action as enum ('buy', 'sell', 'hold');

-- ---------------------------------------------------------------- strategies

create table tradeview.strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  kind text not null check (kind in ('sma_cross', 'rsi_reversion', 'breakout')),
  symbol text not null references tradeview.instruments (symbol),
  timeframe text not null check (timeframe in ('5m', '15m', '1h', '4h', '1d', '1w')),
  params jsonb not null default '{}'::jsonb,

  -- How much quote currency one entry is worth. The per-order notional ceiling
  -- in trading_settings still applies on top of this, in the same code path the
  -- manual ticket uses.
  order_notional numeric(38, 18) not null check (order_notional > 0),

  -- 'external' is the counterparty side of the ledger, never something a user
  -- trades into.
  mode tradeview.account_kind not null default 'paper' check (mode <> 'external'),

  -- A new strategy is parked. Nothing starts trading because it was saved.
  status tradeview.strategy_status not null default 'paused',

  next_run_at timestamptz not null default now(),
  locked_by text,
  locked_until timestamptz,

  last_run_at timestamptz,
  last_signal tradeview.signal_action,
  last_error text,

  -- A venue timing out is not a broken strategy. Errors have to accumulate
  -- before the strategy is parked, or one lost packet silently stops the bot.
  consecutive_errors int not null default 0 check (consecutive_errors >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, name)
);

create index strategies_user_idx on tradeview.strategies (user_id, created_at desc);
create index strategies_due_idx on tradeview.strategies (next_run_at)
  where status = 'active';

-- ---------------------------------------------------------------- runs

create table tradeview.strategy_runs (
  id bigserial primary key,
  strategy_id uuid not null references tradeview.strategies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  action tradeview.signal_action not null,
  reason text not null default '',
  price numeric(38, 18),
  order_id uuid references tradeview.orders (id) on delete set null,
  error text,
  created_at timestamptz not null default now()
);

create index strategy_runs_strategy_idx
  on tradeview.strategy_runs (strategy_id, created_at desc);
create index strategy_runs_user_idx
  on tradeview.strategy_runs (user_id, created_at desc);

-- ---------------------------------------------------------------- liveness

-- Not user data: it answers "is the bot on the VPS alive", which is the same
-- answer for everyone. Scoped like the instrument catalogue — visible to anyone
-- holding a session for this project, and writable only by the server.
create table tradeview.runner_heartbeats (
  runner_id text primary key check (char_length(runner_id) between 1 and 64),
  version text not null default '',
  last_seen_at timestamptz not null default now(),
  claimed int not null default 0,
  detail jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------- write api

-- Hands out due strategies under a lease. SKIP LOCKED means a second runner
-- takes different rows rather than blocking on the same ones, and the lease
-- expiry is what returns work after a runner dies mid-evaluation.
create or replace function tradeview.claim_strategies(
  p_runner_id text,
  p_lease_seconds int,
  p_limit int
) returns setof tradeview.strategies
language plpgsql
set search_path = tradeview, pg_temp as $$
begin
  return query
  with due as (
    select s.id
    from tradeview.strategies s
    where s.status = 'active'
      and s.next_run_at <= now()
      and (s.locked_until is null or s.locked_until < now())
    order by s.next_run_at
    limit greatest(coalesce(p_limit, 0), 0)
    for update skip locked
  )
  update tradeview.strategies t
     set locked_by = p_runner_id,
         locked_until = now() + make_interval(secs => greatest(coalesce(p_lease_seconds, 60), 1)),
         updated_at = now()
    from due
   where t.id = due.id
  returning t.*;
end;
$$;

-- Records the evaluation and releases the lease in one transaction. Refuses if
-- the caller no longer holds the lease: a runner that stalled past its expiry
-- must not overwrite the decision of whoever picked the strategy up next.
create or replace function tradeview.finish_strategy_run(
  p_strategy_id uuid,
  p_runner_id text,
  p_action tradeview.signal_action,
  p_reason text,
  p_price numeric,
  p_order_id uuid,
  p_error text,
  p_next_run_at timestamptz
) returns bigint
language plpgsql
set search_path = tradeview, pg_temp as $$
declare
  v_user uuid;
  v_run bigint;
  v_errors int;
begin
  select user_id, consecutive_errors into v_user, v_errors
  from tradeview.strategies
  where id = p_strategy_id and locked_by = p_runner_id and locked_until > now()
  for update;

  if v_user is null then
    raise exception 'lease expirada para a estratégia %', p_strategy_id;
  end if;

  insert into tradeview.strategy_runs
    (strategy_id, user_id, action, reason, price, order_id, error)
  values
    (p_strategy_id, v_user, p_action, coalesce(p_reason, ''), p_price, p_order_id, p_error)
  returning id into v_run;

  -- One row per evaluation per strategy per tick grows without bound and
  -- nothing else would ever delete it.
  delete from tradeview.strategy_runs r
  where r.strategy_id = p_strategy_id
    and r.id < (
      select min(id) from (
        select id from tradeview.strategy_runs
        where strategy_id = p_strategy_id
        order by id desc
        limit 200
      ) keep
    );

  v_errors := case when p_error is null then 0 else v_errors + 1 end;

  update tradeview.strategies
     set locked_by = null,
         locked_until = null,
         last_run_at = now(),
         last_signal = p_action,
         last_error = p_error,
         consecutive_errors = v_errors,
         status = case when v_errors >= 5 then 'error' else status end,
         next_run_at = coalesce(p_next_run_at, now() + interval '1 minute'),
         updated_at = now()
   where id = p_strategy_id;

  return v_run;
end;
$$;

create or replace function tradeview.record_heartbeat(
  p_runner_id text,
  p_version text,
  p_claimed int,
  p_detail jsonb
) returns void
language sql
set search_path = tradeview, pg_temp as $$
  insert into tradeview.runner_heartbeats (runner_id, version, last_seen_at, claimed, detail)
  values (p_runner_id, coalesce(p_version, ''), now(), coalesce(p_claimed, 0),
          coalesce(p_detail, '{}'::jsonb))
  on conflict (runner_id) do update
    set version = excluded.version,
        last_seen_at = excluded.last_seen_at,
        claimed = excluded.claimed,
        detail = excluded.detail;
$$;

-- ---------------------------------------------------------------- rls

alter table tradeview.strategies        enable row level security;
alter table tradeview.strategy_runs     enable row level security;
alter table tradeview.runner_heartbeats enable row level security;

alter table tradeview.strategies        force row level security;
alter table tradeview.strategy_runs     force row level security;
alter table tradeview.runner_heartbeats force row level security;

create policy strategies_select_own on tradeview.strategies
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy strategy_runs_select_own on tradeview.strategy_runs
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy runner_heartbeats_select_all on tradeview.runner_heartbeats
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------- grants

revoke all on tradeview.strategies, tradeview.strategy_runs, tradeview.runner_heartbeats
  from anon;

-- Same reason as the core tables: with the default grant left in place, a
-- missing policy turns a write into a silent zero-row no-op instead of an error.
revoke insert, update, delete, truncate
  on tradeview.strategies, tradeview.strategy_runs, tradeview.runner_heartbeats
  from authenticated;

grant select on tradeview.strategies, tradeview.strategy_runs, tradeview.runner_heartbeats
  to authenticated;

grant all on tradeview.strategies, tradeview.strategy_runs, tradeview.runner_heartbeats
  to service_role;
grant all on sequence tradeview.strategy_runs_id_seq to service_role;

revoke all on function tradeview.claim_strategies(text, int, int)
  from public, anon, authenticated;
revoke all on function tradeview.finish_strategy_run(
  uuid, text, tradeview.signal_action, text, numeric, uuid, text, timestamptz)
  from public, anon, authenticated;
revoke all on function tradeview.record_heartbeat(text, text, int, jsonb)
  from public, anon, authenticated;

grant execute on function tradeview.claim_strategies(text, int, int) to service_role;
grant execute on function tradeview.finish_strategy_run(
  uuid, text, tradeview.signal_action, text, numeric, uuid, text, timestamptz) to service_role;
grant execute on function tradeview.record_heartbeat(text, text, int, jsonb) to service_role;
