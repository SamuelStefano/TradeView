#!/usr/bin/env bash
# Sobe um Postgres com as migrations, um PostgREST e o runner containerizado, e
# prova o ciclo inteiro contra candles de verdade da venue: reivindicar sob
# lease, decidir sobre vela fechada, colocar ordem, mexer no razão, liberar a
# lease. É o único jeito de exercitar isso sem o banco de produção.
#
# Tudo em loopback e descartável. Nada aqui toca o Supabase real.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NET=tv-e2e-net
PG=tv-e2e-pg
REST=tv-e2e-rest
GW=tv-e2e-gw
RUN=tv-e2e-runner
IMAGE=${TRADEVIEW_IMAGE:-tradeview-runner:e2e}
USER_ID=99999999-9999-9999-9999-999999999999
SECRET_FILE=$(mktemp)

cleanup() {
  docker rm -f "$RUN" "$GW" "$REST" "$PG" >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
  rm -f "$SECRET_FILE"
}
trap cleanup EXIT
cleanup

echo "== construindo a imagem"
docker build -q -t "$IMAGE" "$ROOT" >/dev/null

docker network create "$NET" >/dev/null

echo "== postgres com as migrations"
docker run -d --name "$PG" --network "$NET" -e POSTGRES_PASSWORD=tvlocal \
  supabase/postgres:17.6.1.160 >/dev/null
until docker exec "$PG" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
sleep 4
for f in "$ROOT"/supabase/migrations/*.sql; do
  docker exec -i "$PG" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -q < "$f"
done

JWT_SECRET=$(head -c 48 /dev/urandom | base64 | tr -d '=+/' | head -c 48)
python3 - "$JWT_SECRET" > "$SECRET_FILE" <<'PY'
import sys, json, base64, hmac, hashlib, time
secret = sys.argv[1].encode()
b64 = lambda d: base64.urlsafe_b64encode(d).rstrip(b'=')
h = b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(',', ':')).encode())
p = b64(json.dumps({"role": "service_role", "iat": int(time.time()),
                    "exp": int(time.time()) + 3600}, separators=(',', ':')).encode())
sig = b64(hmac.new(secret, h + b'.' + p, hashlib.sha256).digest())
sys.stdout.write((h + b'.' + p + b'.' + sig).decode())
PY

echo "== postgrest e gateway"
docker run -d --name "$REST" --network "$NET" \
  -e PGRST_DB_URI="postgres://supabase_admin:tvlocal@$PG:5432/postgres" \
  -e PGRST_DB_SCHEMAS=tradeview -e PGRST_DB_ANON_ROLE=anon \
  -e PGRST_JWT_SECRET="$JWT_SECRET" \
  public.ecr.aws/supabase/postgrest:v14.10 >/dev/null

# supabase-js fala com `/rest/v1`, que no projeto hospedado é o Kong. Aqui um
# nginx faz o mesmo prefixo, senão o cliente bate em 404 e parece erro de chave.
CONF=$(mktemp)
cat > "$CONF" <<EOF
server {
  listen 8080;
  location /rest/v1/ { proxy_pass http://$REST:3000/; proxy_set_header Authorization \$http_authorization; }
}
EOF
docker run -d --name "$GW" --network "$NET" -v "$CONF":/etc/nginx/conf.d/default.conf:ro \
  nginx:1.27-alpine >/dev/null
sleep 5

echo "== conta, saldo e uma estratégia que tem de comprar"
docker exec -i "$PG" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -q <<SQL
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values ('$USER_ID', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'e2e@local', '', now(), now());

select tradeview.ensure_user_setup('$USER_ID', 'E2E');
select tradeview.record_transfer('$USER_ID', 'deposit', 50000, 'BRL', 'e2e', null, 'paper');

-- Limiares fora da escala para o sinal não depender do humor do mercado: o RSI
-- fica sempre abaixo de 98, então esta estratégia compra em qualquer candle.
insert into tradeview.strategies (user_id, name, kind, symbol, timeframe, params, order_notional, mode, status)
values ('$USER_ID', 'e2e compra', 'rsi_reversion', 'BTC/BRL', '5m',
        '{"period":14,"oversold":98,"overbought":99}'::jsonb, 250, 'paper', 'active');
SQL

echo "== runner"
docker run -d --name "$RUN" --network "$NET" \
  -e NEXT_PUBLIC_SUPABASE_URL="http://$GW:8080" \
  -e SUPABASE_SECRET_KEY_FILE=/run/secrets/k \
  -e TRADEVIEW_RUNNER_TICK_MS=5000 \
  -v "$SECRET_FILE":/run/secrets/k:ro \
  "$IMAGE" >/dev/null

for _ in $(seq 1 24); do
  count=$(docker exec "$PG" psql -U supabase_admin -d postgres -tAc \
    "select count(*) from tradeview.strategy_runs" | tr -d ' ')
  [ "$count" -gt 0 ] && break
  sleep 5
done

docker logs "$RUN" 2>&1 | tail -5
echo
docker exec "$PG" psql -U supabase_admin -d postgres \
  -c "select action, reason, error from tradeview.strategy_runs order by id"

fail() { echo "FALHOU: $1"; docker logs "$RUN" 2>&1 | tail -20; exit 1; }

[ "$(docker exec "$PG" psql -U supabase_admin -d postgres -tAc \
  "select count(*) from tradeview.strategy_runs where action='buy' and error is null")" -ge 1 ] \
  || fail 'nenhuma compra registrada'

[ "$(docker exec "$PG" psql -U supabase_admin -d postgres -tAc \
  "select count(*) from tradeview.orders where side='buy'")" -ge 1 ] \
  || fail 'nenhuma ordem gravada'

# A posição vem do razão, não de um campo escrito à mão: se ela existe, as
# partidas dobradas fecharam. `qty` é texto na view para o JSON não arredondar.
[ "$(docker exec "$PG" psql -U supabase_admin -d postgres -tAc \
  "select count(*) from tradeview.positions where user_id='$USER_ID' and qty::numeric > 0")" -ge 1 ] \
  || fail 'a posição não apareceu no razão'

# A mesma vela decidida de novo tem de colidir no índice único em vez de comprar
# outra vez. É a garantia que sobra quando a lease se perde no meio.
dup=$(docker exec "$PG" psql -U supabase_admin -d postgres -q -c \
  "insert into tradeview.orders (user_id, account_id, symbol, side, qty, mode, client_ref)
   select user_id, account_id, symbol, side, qty, mode, client_ref from tradeview.orders limit 1" \
  2>&1 || true)
grep -q 'orders_client_ref_idx' <<<"$dup" || fail "client_ref repetido não foi recusado: $dup"

# Terminar de decidir tem de devolver a estratégia, senão o próximo runner a
# encontra travada até a lease expirar.
[ "$(docker exec "$PG" psql -U supabase_admin -d postgres -tAc \
  "select count(*) from tradeview.strategies where locked_by is not null")" -eq 0 ] \
  || fail 'a lease não foi liberada'

echo
echo "E2E DO RUNNER PASSOU"
