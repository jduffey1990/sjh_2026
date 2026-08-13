#!/usr/bin/env bash
#
# Connect psql to the project's Supabase database using the credentials
# already in .env.local, so no connection string has to be typed or pasted.
#
#   ./supabase/psql.sh -f supabase/002_planning.sql
#   ./supabase/psql.sh -v pw=new-trip-password -f supabase/003_auth.sql
#   ./supabase/psql.sh -c 'select count(*) from group_items'
#   ./supabase/psql.sh                      # interactive shell
#
# Requires DB_password and VITE_SUPABASE_URL in .env.local. Nothing here is
# committed -- .env.local is gitignored.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

[ -f "$ENV_FILE" ] || { echo "!! No .env.local at $ENV_FILE" >&2; exit 1; }

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

: "${VITE_SUPABASE_URL:?!! VITE_SUPABASE_URL missing from .env.local}"
: "${DB_password:?!! DB_password missing from .env.local}"

REF="${VITE_SUPABASE_URL#https://}"
REF="${REF%%.*}"

# Supabase retired IPv4 on the direct db.<ref> host, so go via the pooler.
# The region is not derivable from the project ref -- cache it once found.
CACHE="$ROOT/.supabase-host.local"
if [ -f "$CACHE" ]; then
  HOST="$(cat "$CACHE")"
else
  echo "Finding the pooler region for $REF ..." >&2
  for P in 0 1; do
    for R in ca-central-1 us-east-1 us-east-2 us-west-1 us-west-2 \
             eu-west-1 eu-west-2 eu-central-1 \
             ap-southeast-1 ap-southeast-2 ap-northeast-1 ap-south-1 sa-east-1; do
      CANDIDATE="aws-$P-$R.pooler.supabase.com"
      if PGPASSWORD="$DB_password" psql \
           "postgresql://postgres.$REF@$CANDIDATE:5432/postgres?sslmode=require&connect_timeout=5" \
           -tAc 'select 1' >/dev/null 2>&1; then
        HOST="$CANDIDATE"
        echo "$HOST" > "$CACHE"
        echo "  -> $HOST (cached)" >&2
        break 2
      fi
    done
  done
fi

[ -n "${HOST:-}" ] || { echo "!! Could not reach the database." >&2; exit 1; }

export PGPASSWORD="$DB_password"
exec psql "postgresql://postgres.$REF@$HOST:5432/postgres?sslmode=require" "$@"
