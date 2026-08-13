#!/usr/bin/env bash
#
# Set or rotate the shared trip password.
#
#   ./supabase/set-password.sh
#
# Prompts without echoing, so the password never appears on screen, in your
# shell history, or in the terminal scrollback.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

printf 'New trip password: '
read -rs pw
printf '\n'

if [ -z "$pw" ]; then
  echo "!! Empty password, nothing changed." >&2
  exit 1
fi

printf 'Again to confirm:  '
read -rs pw2
printf '\n'

if [ "$pw" != "$pw2" ]; then
  echo "!! Passwords did not match, nothing changed." >&2
  exit 1
fi

"$HERE/psql.sh" -q -v ON_ERROR_STOP=1 -v pw="$pw" -f "$HERE/003_auth.sql"

echo "Password updated."
echo
echo "Note: anyone already signed in stays signed in -- this only changes what"
echo "a NEW sign-in requires."
