-- =====================================================================
-- San Juan Huts 2026 -- shared-account auth
--
-- WHY THIS EXISTS
--
-- The site is a static bundle on a public repo, so the Supabase key ships
-- inside it where anyone can read it. A password prompt in the UI would be
-- pure theatre: pull the key out of the JavaScript and you can hit the REST
-- API directly, whatever the front end pretends.
--
-- So the gate is enforced in Postgres instead. One shared account exists,
-- RLS requires the `authenticated` role, and the anon key on its own now
-- returns nothing at all.
--
-- HOW TO RUN -- the password must NOT be committed to this repo:
--
--   psql "$DB_URI" -v pw='the-shared-password' -f supabase/003_auth.sql
--
-- To change the password later, re-run this file with a new -v pw.
-- =====================================================================

\if :{?pw}
\else
  \echo '!! Missing password. Run with:  -v pw=your-password'
  \quit
\endif

-- psql does not substitute :variables inside dollar-quoted blocks, so hand
-- the password over as a session setting the DO block can read back.
--
-- :'pw' (rather than bare :pw) makes psql quote and escape the value into a
-- SQL literal itself, so the caller passes a plain password and one
-- containing an apostrophe can neither break the script nor inject SQL.
-- \g /dev/null discards the result row. Without it psql helpfully prints the
-- password straight to the terminal, where it lands in the scrollback.
select set_config('sjh.pw', :'pw', false) \g /dev/null

-- ---------------------------------------------------------------------
-- The shared account. Upsert so re-running rotates the password rather
-- than failing.
-- ---------------------------------------------------------------------
do $$
declare
  uid uuid;
  addr text := 'trip@sjh2026.local';
  pw   text := current_setting('sjh.pw');
begin
  select id into uid from auth.users where email = addr;

  if uid is null then
    uid := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', uid,
      'authenticated', 'authenticated', addr,
      extensions.crypt(pw, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      '', '', '', ''
    );

    -- GoTrue will not sign an account in without a matching identity row.
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), uid,
      jsonb_build_object('sub', uid::text, 'email', addr, 'email_verified', true),
      'email', addr, now(), now(), now()
    );

    raise notice 'created shared account %', addr;
  else
    update auth.users
       set encrypted_password = extensions.crypt(pw, extensions.gen_salt('bf')),
           updated_at = now()
     where id = uid;
    raise notice 'rotated password for %', addr;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Close the doors: signed-in only, on every table.
--
-- Before this, `anon` could read and write everything. After it, the key
-- baked into the public bundle is useless without a session.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  -- "policy does not exist, skipping" for seven tables is pure noise.
  perform set_config('client_min_messages', 'warning', true);

  foreach t in array array[
    'riders', 'group_items', 'claims', 'personal_items',
    'decisions', 'comments', 'logistics_fields'
  ]
  loop
    execute format('drop policy if exists trip_open on %I', t);
    execute format('drop policy if exists trip_members on %I', t);
    execute format(
      'create policy trip_members on %I for all to authenticated
         using (true) with check (true)', t);
  end loop;
end $$;
