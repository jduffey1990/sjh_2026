-- =====================================================================
-- San Juan Huts 2026 -- Travel page structure moves into the database
--
-- Field VALUES were already editable, but the sections and their labels
-- lived in src/data/travel.ts, so adding a section meant a code change and
-- a migration. That is the wrong shape for coordination content.
--
-- `slug` deliberately matches the existing logistics_fields.section_id,
-- decisions.scope_id and seen_markers.scope_id, so nothing else has to
-- change and no data moves.
--
-- The static LOGISTICS array stays as the no-backend fallback.
-- =====================================================================

create table if not exists logistics_sections (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  body       text[] not null default '{}',
  sort_order int not null default 0,
  /** Null on the seeded sections -- they came from the route research. */
  created_by uuid references riders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table logistics_sections enable row level security;

drop policy if exists trip_members on logistics_sections;
create policy trip_members on logistics_sections for all to authenticated
  using (true) with check (true);

drop trigger if exists t_sections_touch on logistics_sections;
create trigger t_sections_touch before update on logistics_sections
  for each row execute function touch_updated_at();

alter publication supabase_realtime add table logistics_sections;

-- Seed generated directly from src/data/travel.ts so the text matches.
insert into logistics_sections (slug, title, body, sort_order) values
  ('getting-there', 'Friday Sep 25 — getting there', array['Drive in and overnight in Ridgway, CO (~7,000 ft), then run the hour south to Telluride on Saturday morning for the day 1 start.', 'Sleeping at Ridgway rather than driving straight through buys a night of altitude adjustment before a day 1 that tops out just under 11,000 ft.'], 10),
  ('vehicles', 'Vehicles & parking', array['The route is one-way Telluride → Moab, so vehicles have to end up somewhere sensible. The common pattern is to leave cars in Moab and shuttle up to Telluride at the start, so you finish the ride standing next to your own car instead of organising a rescue.', 'Moab hotels will often let you leave a vehicle for the week with a reservation on either end.'], 20),
  ('day-6-shuttle', 'The day 6 shuttle question', array['Day 6 out of Gateway climbs 4,500 ft in 21 miles up John Brown Canyon — the hardest day of the week by a distance, on day six of seven.', 'The Gateway General Store runs shuttles up the canyon. Taking it cuts day 6 to roughly 7.5 miles of riding. This needs to be decided and arranged when you hit Gateway on day 5.'], 30),
  ('getting-home', 'Fri Oct 2 – Sat Oct 3 — getting home', array['The ride finishes in Moab on Friday, so Friday night is a bed, a shower and a meal that did not come out of a hut cabinet.', 'Saturday is the shuttle back to wherever the vehicles were left, and then the drive home. Someone in the group has already sorted the shuttle — whoever that was, resolve the decision below with the operator, time and cost so it is in one place instead of one person''s inbox.'], 40),
  ('huts', 'What the huts provide', array['Each hut sleeps 8 — the group fills one exactly. Padded bunks, sleeping bags, propane cook stove, propane light, wood stove, cookware and utensils, food and drinking water are all provided and restocked.', 'There is no electricity in any hut. Composting toilet, toilet paper, hand sanitiser, sunscreen, bug spray, floor pump and basic first aid are on site.'], 50),
  ('gpx-tracks', 'GPS tracks & navigation', array['San Juan Huts sends GPX tracks, daily route descriptions and elevation profiles in the Route Packet when the reservation is made. None of it is published publicly — the packet is essentially the product they sell.', 'However the tracks get distributed, they need to be loaded onto a device before anyone leaves Telluride. There is no signal to download anything between there and the Gateway store on day 5.'], 60),
  ('connectivity', 'Power & signal', array['Assume no signal and no power from Telluride until Gateway on day 5, and none again after it. Gateway General Store is the one reliable charging and resupply point of the week.', 'This site is installable and works fully offline — the packing board and every logistics page stay readable with no bars. Install it before you leave.'], 70),
  ('weather', 'Late-season weather', array['San Juan Huts lists the season as June 1 – September; this trip runs Sep 26 – Oct 2, right at the tail end. October trips clearly happen, but the group should pack for genuine cold rather than the standard summer list.', 'Days 1–4 sit above 9,600 ft with day 1 topping 10,995 ft. Expect hard overnight freezes up high and a real chance of early snow in the alpine sections, then desert warmth once the route drops toward Gateway and Moab.'], 80)
on conflict (slug) do nothing;
