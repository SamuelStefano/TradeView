#!/usr/bin/env bash
# Rebuilds a throwaway Postgres, applies every migration and runs the SQL suite.
# Binds to loopback only — never expose this port.
set -euo pipefail

CONTAINER=tv-pg-test
IMAGE=supabase/postgres:17.6.1.160
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup

docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=tvlocal \
  -p 127.0.0.1:54330:5432 "$IMAGE" >/dev/null

until docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
sleep 3

for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "aplicando $(basename "$f")"
  docker exec -i "$CONTAINER" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -q < "$f"
done

for f in "$ROOT"/supabase/tests/*_test.sql; do
  echo "rodando $(basename "$f")"
  docker exec -i "$CONTAINER" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -q < "$f"
done
