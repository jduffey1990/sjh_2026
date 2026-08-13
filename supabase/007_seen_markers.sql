-- =====================================================================
-- San Juan Huts 2026 -- per-rider read state
--
-- One row per rider per scope holding "when did you last look at this",
-- rather than a row per comment per rider. Eight riders and ~16 scopes is
-- 128 rows that never grow, and "mark this day seen" is a single write.
-- =====================================================================

create table if not exists seen_markers (
  id        uuid primary key default gen_random_uuid(),
  rider_id  uuid not null references riders(id) on delete cascade,
  scope     text not null check (scope in ('day', 'logistics')),
  scope_id  text not null,
  seen_at   timestamptz not null default now(),
  unique (rider_id, scope, scope_id)
);

create index if not exists seen_rider_idx on seen_markers(rider_id);

alter table seen_markers enable row level security;

drop policy if exists trip_members on seen_markers;
create policy trip_members on seen_markers for all to authenticated
  using (true) with check (true);

alter publication supabase_realtime add table seen_markers;

-- ---------------------------------------------------------------------
-- Seed every rider as caught up on everything that exists right now.
--
-- Without this, a missing marker means "never looked", so the first visit
-- would light up every day with a badge counting the seeded decisions --
-- forty notifications about things nobody said. Starting everyone level
-- means a badge only ever appears for activity that happened afterwards.
-- ---------------------------------------------------------------------
insert into seen_markers (rider_id, scope, scope_id, seen_at)
select r.id, s.scope, s.scope_id, now()
from riders r
cross join (values
  ('day', 'travel'), ('day', 'day-1'), ('day', 'day-2'), ('day', 'day-3'),
  ('day', 'day-4'),  ('day', 'day-5'), ('day', 'day-6'), ('day', 'day-7'),
  ('day', 'return'),
  ('logistics', 'getting-there'), ('logistics', 'vehicles'),
  ('logistics', 'day-6-shuttle'), ('logistics', 'getting-home'),
  ('logistics', 'huts'), ('logistics', 'connectivity'), ('logistics', 'weather')
) as s(scope, scope_id)
on conflict (rider_id, scope, scope_id) do nothing;
