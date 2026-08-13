-- =====================================================================
-- San Juan Huts 2026 -- planning layer
--
-- Route facts (mileage, elevation, huts, terrain) stay hard-coded in
-- src/data/trip.ts: they do not change, and keeping them static means the
-- schedule renders offline with no round-trip.
--
-- What DOES change is everything around them -- open questions, who booked
-- what, and the conversation. That lives here.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Decisions: the things that were previously frozen as static "flag"
-- strings on a day card, with no way to actually settle them.
--
-- scope/scope_id point at whatever the decision hangs off:
--   ('day', 'day-6')       -> the day 6 card and detail page
--   ('logistics', 'vehicles') -> a section of the Travel page
-- ---------------------------------------------------------------------
create table if not exists decisions (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null check (scope in ('day', 'logistics')),
  scope_id    text not null,
  title       text not null,
  detail      text,
  status      text not null default 'open' check (status in ('open', 'resolved')),
  outcome     text,
  resolved_by uuid references riders(id) on delete set null,
  resolved_at timestamptz,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Comments. Hang off a day, a logistics section, or a specific decision.
-- ---------------------------------------------------------------------
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  scope      text not null check (scope in ('day', 'logistics', 'decision')),
  scope_id   text not null,
  rider_id   uuid references riders(id) on delete set null,
  body       text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Logistics fields: the label/value pairs on the Travel page. Previously
-- static text reading "lodging TBD" that only a code push could update --
-- now whoever books the lodge just types it in.
-- ---------------------------------------------------------------------
create table if not exists logistics_fields (
  id         uuid primary key default gen_random_uuid(),
  section_id text not null,
  label      text not null,
  value      text,
  sort_order int not null default 0,
  updated_by uuid references riders(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (section_id, label)
);

create index if not exists decisions_scope_idx on decisions(scope, scope_id);
create index if not exists comments_scope_idx  on comments(scope, scope_id);
create index if not exists logistics_sec_idx   on logistics_fields(section_id);

drop trigger if exists t_decisions_touch on decisions;
create trigger t_decisions_touch before update on decisions
  for each row execute function touch_updated_at();

drop trigger if exists t_comments_touch on comments;
create trigger t_comments_touch before update on comments
  for each row execute function touch_updated_at();

drop trigger if exists t_logistics_touch on logistics_fields;
create trigger t_logistics_touch before update on logistics_fields
  for each row execute function touch_updated_at();

alter table decisions        enable row level security;
alter table comments         enable row level security;
alter table logistics_fields enable row level security;

alter publication supabase_realtime add table decisions;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table logistics_fields;

-- =====================================================================
-- Seed -- lifted from the static flags and logistics items.
-- =====================================================================

insert into decisions (scope, scope_id, title, detail, sort_order) values
  ('day', 'travel', 'Book lodging in Ridgway',
   'Overnight at ~7,000 ft on Fri Sep 25 before the run to Telluride. Buys a night of altitude adjustment ahead of a day 1 topping 10,995 ft.', 1),
  ('day', 'travel', 'Confirm carpools and who hauls whose bike',
   'Who drives, who rides along, and how eight bikes get to Telluride.', 2),
  ('day', 'day-1', 'Gondola, or ride out of town?',
   'The gondola to Mountain Village skips the first climb. Day 1 is the highest point of the week on completely unacclimatised legs.', 1),
  ('day', 'day-3', 'Agree a departure time for the long day',
   '39.5 miles, the biggest of the trip. Worth settling the night before rather than at breakfast.', 1),
  ('day', 'day-6', 'Shuttle John Brown Canyon, or ride it?',
   'Ridden: 21 miles and 4,500 ft, the hardest day of the week on day six of seven. Shuttled from the Gateway General Store: about 7.5 miles. Must be arranged at Gateway on day 5.', 1),
  ('day', 'day-7', 'Sort the ride back to the vehicles',
   'One-way route means someone has to close the loop between Moab and Telluride.', 1),
  ('logistics', 'vehicles', 'Where do the cars live for the week?',
   'Common pattern is parking in Moab and shuttling up to Telluride, so you finish next to your own car. Moab hotels will often hold a vehicle with a reservation either side.', 1),
  ('logistics', 'vehicles', 'Book the Telluride shuttle',
   'Moab Express or Porcupine Shuttles, roughly $425 for 3 people one way.', 2),
  ('logistics', 'day-6-shuttle', 'Reserve the Gateway shuttle if we want it',
   'Arranged in person at the Gateway General Store on day 5.', 1)
on conflict do nothing;

insert into logistics_fields (section_id, label, value, sort_order) values
  ('getting-there', 'Overnight',          'Ridgway, CO — lodging TBD',        1),
  ('getting-there', 'Ridgway → Telluride', '~1 hour via CO-62 / CO-145',      2),
  ('getting-there', 'Last real resupply',  'Ridgway or Montrose',             3),
  ('vehicles',      'Plan',                'TBD — park in Moab and shuttle?', 1),
  ('vehicles',      'Shuttle operators',   'Moab Express, Porcupine Shuttles', 2),
  ('vehicles',      'Rough cost',          '~$425 for 3 people, one way',     3),
  ('day-6-shuttle', 'Ride it',             '21 mi / 4,500 ft',                1),
  ('day-6-shuttle', 'Shuttle it',          '~7.5 mi / 860 ft',                2),
  ('day-6-shuttle', 'Arrange at',          'Gateway General Store, day 5',    3),
  ('huts',          'Provided',            'Bunks, sleeping bags, food, water, stove', 1),
  ('huts',          'Bring',               'Sleeping bag liner, personal kit, repair kit', 2),
  ('huts',          'Electricity',         'None, all week',                  3),
  ('huts',          'Beer package',        '~$44pp, up to 3 drinks daily',    4),
  ('connectivity',  'Only charging stop',  'Gateway General Store, day 5',    1),
  ('connectivity',  'Navigation',          'GPS computer + GPX from the Route Packet', 2),
  ('connectivity',  'Recommendation',      'Battery pack, and charge everything at Gateway', 3),
  ('weather',       'High point',          '10,995 ft on day 1',              1),
  ('weather',       'Above 9,600 ft',      'Days 1–4',                        2),
  ('weather',       'Pack for',            'Freezing nights up high, warm desert days', 3)
on conflict (section_id, label) do nothing;
