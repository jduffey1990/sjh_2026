-- =====================================================================
-- San Juan Huts 2026 -- schema
-- Run this once in the Supabase SQL editor, then run seed.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Riders. Identity is by name only (no auth); the bike spec columns feed
-- the compatibility warnings on the packing board.
-- ---------------------------------------------------------------------
create table if not exists riders (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  initials       text not null,
  color          text not null,
  sort_order     int  not null default 0,
  bike           text,
  chain_speed    text,          -- e.g. 'SRAM 12sp', 'Shimano 11sp'
  hanger_model   text,          -- e.g. 'Trek #333'
  tire_size      text,          -- e.g. '29 x 2.4'
  brake_pad_type text,          -- e.g. 'Shimano B01S resin'
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Group items: the shared manifest riders claim from.
--
-- qty is the ONLY existence control. qty = 0 means the group decided
-- against it, which moves the tile into the Not Required section without
-- deleting it or its claims. There is deliberately no status column --
-- a second source of truth would only drift.
--
-- bible_qty is written once at seed and never updated, so a deviation
-- from the official Bikers' Bible recommendation stays visible forever.
-- ---------------------------------------------------------------------
create table if not exists group_items (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null default 'Other',
  qty             int  not null default 1 check (qty >= 0),
  bible_qty       int,
  weight_oz       numeric(6,2) not null default 0 check (weight_oz >= 0),
  bulk            int not null default 1 check (bulk between 1 and 4),
  source          text not null default 'custom'
                    check (source in ('bible', 'trip-report', 'custom')),
  minimalist      boolean not null default false,
  notes           text,
  last_changed_by uuid references riders(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Claims: who is actually carrying how many of a group item.
--
-- Independent of group_items.qty, so a zeroed-out item can still be
-- claimed ("not required, but I'm bringing one anyway") and its weight
-- still counts toward that rider's load -- they are carrying it either way.
-- ---------------------------------------------------------------------
create table if not exists claims (
  id            uuid primary key default gen_random_uuid(),
  group_item_id uuid not null references group_items(id) on delete cascade,
  rider_id      uuid not null references riders(id) on delete cascade,
  qty           int  not null default 1 check (qty > 0),
  packed        boolean not null default false,
  updated_at    timestamptz not null default now(),
  unique (group_item_id, rider_id)
);

-- ---------------------------------------------------------------------
-- Personal kit: each rider's own checklist. No weights, no claiming --
-- nobody gets credit in the load balance for their own clothes.
-- ---------------------------------------------------------------------
create table if not exists personal_items (
  id         uuid primary key default gen_random_uuid(),
  rider_id   uuid not null references riders(id) on delete cascade,
  name       text not null,
  category   text not null default 'Other',
  packed     boolean not null default false,
  official   boolean not null default false,
  sort_order int not null default 0,
  notes      text,
  updated_at timestamptz not null default now()
);

create index if not exists claims_item_idx     on claims(group_item_id);
create index if not exists claims_rider_idx    on claims(rider_id);
create index if not exists personal_rider_idx  on personal_items(rider_id);
create index if not exists group_items_qty_idx on group_items(qty);

-- ---------------------------------------------------------------------
-- updated_at maintenance. The offline outbox resolves conflicts by
-- last-write-wins on this column, so it must be trustworthy.
-- ---------------------------------------------------------------------
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists t_group_items_touch on group_items;
create trigger t_group_items_touch before update on group_items
  for each row execute function touch_updated_at();

drop trigger if exists t_claims_touch on claims;
create trigger t_claims_touch before update on claims
  for each row execute function touch_updated_at();

drop trigger if exists t_personal_touch on personal_items;
create trigger t_personal_touch before update on personal_items
  for each row execute function touch_updated_at();

drop trigger if exists t_riders_touch on riders;
create trigger t_riders_touch before update on riders
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------
-- RLS.
--
-- READ THIS BEFORE DEPLOYING: the anon key ships inside a static bundle
-- on a public GitHub Pages site, so these policies mean anyone with the
-- URL can read and write the packing board. That is a deliberate choice
-- for a private trip site among eight friends who wanted no passwords.
--
-- The practical consequence: do NOT put anything sensitive in these
-- tables. Bike specs are fine. Phone numbers, addresses and emergency
-- contacts are not -- keep those in your group chat.
-- ---------------------------------------------------------------------
alter table riders         enable row level security;
alter table group_items    enable row level security;
alter table claims         enable row level security;
alter table personal_items enable row level security;

do $$
declare t text;
begin
  foreach t in array array['riders','group_items','claims','personal_items']
  loop
    execute format('drop policy if exists trip_open on %I', t);
    execute format(
      'create policy trip_open on %I for all to anon, authenticated
         using (true) with check (true)', t);
  end loop;
end $$;

-- Live tile updates across phones while packing.
alter publication supabase_realtime add table group_items;
alter publication supabase_realtime add table claims;
alter publication supabase_realtime add table personal_items;
alter publication supabase_realtime add table riders;
