-- =====================================================================
-- San Juan Huts 2026 -- seed data
-- Run after schema.sql. Safe to re-run: everything is idempotent.
--
-- Group items come from the San Juan Huts Bikers' Bible (2024),
-- "Recommended Bike Repair Equipment & Tools". The Bible's own framing is
-- the reason this board exists:
--
--   "Everyone in your group does not need all of these items but the
--    group as a whole should have a good repair kit."
--
-- bible_qty records what the Bible recommended for a group of 8 and is
-- never updated afterwards, so any later change stays legible.
--
-- weight_oz and bulk are ESTIMATES so the load balance works on day one.
-- Anyone can override them in the UI with a real scale reading.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Riders
-- ---------------------------------------------------------------------
insert into riders (name, initials, color, sort_order) values
  ('Jordan Duffey',    'JD', '#f59e0b', 1),
  ('Kyle Lantz',       'KL', '#38bdf8', 2),
  ('John Luke Andrew', 'JA', '#34d399', 3),
  ('Jeff Seligman',    'JS', '#fb7185', 4),
  ('Tyler Gachen',     'TG', '#a78bfa', 5),
  ('Taran Giraud',     'TR', '#a3e635', 6),
  ('Aneel Mawji',      'AM', '#fb923c', 7),
  ('Ethan Cantlin',    'EC', '#22d3ee', 8)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- Group items -- "Items every group should consider bringing"
-- ---------------------------------------------------------------------
insert into group_items
  (name, category, qty, bible_qty, weight_oz, bulk, source, minimalist, notes)
values
  ('Tire patch kit', 'Tires & tubes', 1, 1, 1.5, 1, 'bible', true,
   'Inspect your rim tape before departing — small abrasions or sections failing to cover eyelets can cause a maddening spree of unexplainable flats.'),

  ('Tire levers', 'Tires & tubes', 2, 2, 1.0, 1, 'bible', true,
   null),

  ('Spare tubes (heavy-duty)', 'Tires & tubes', 8, 8, 6.5, 2, 'bible', true,
   'One to two heavy-duty extras per rider. Large groups may be able to reduce this, especially running tubeless from the start — carry a few lightweight emergency spares for the group.'),

  ('Tire plugs', 'Tires & tubes', 2, 2, 2.0, 1, 'bible', true,
   'Can often repair a tire and keep even tubeless tires rolling.'),

  ('Burly needle and floss', 'Tires & tubes', 1, 1, 0.5, 1, 'bible', true,
   'Floss used as thread, to sew up rips in tires.'),

  ('Tire boot / dollar bill', 'Tires & tubes', 2, 2, 0.2, 1, 'bible', false,
   'Covers a hole in the tire itself and protects the tube.'),

  ('Duct tape or Gorilla Tape', 'Fix-it', 2, 2, 2.0, 1, 'bible', true,
   'Roll a good length around your emergency lighter.'),

  ('Bike pump (high-volume)', 'Tires & tubes', 2, 2, 4.5, 2, 'bible', true,
   'Choose compact, high-volume types. Two pumps if you are solo.'),

  ('CO2 inflator + cartridges', 'Tires & tubes', 2, 2, 3.5, 1, 'bible', false,
   'Optional per the Bible — a supplement to a pump, not a replacement.'),

  ('Chain breaker tool', 'Drivetrain', 1, 1, 4.2, 1, 'bible', false,
   'Often built into a good multi-tool — check before packing a separate one.'),

  ('Multi-tool', 'Tools', 2, 2, 5.5, 1, 'bible', true,
   'Combined with a Leatherman must cover: 3–9 mm Allen keys, slotted and Phillips drivers fitting every head on a bike, pliers, sharp knife blade.'),

  ('Leatherman', 'Tools', 1, 1, 8.5, 2, 'bible', true,
   'Pairs with the multi-tool to cover the full tool requirement.'),

  ('Spare 5 mm Allen bolts', 'Fix-it', 2, 2, 0.3, 1, 'bible', true,
   'A spare 5mm Allen bolt or two.'),

  ('SRAM Power Links', 'Drivetrain', 4, 4, 0.2, 1, 'bible', true,
   'Two for EACH type of chain in the group. Check the Riders page — every distinct chain speed needs covering.'),

  ('FiberFix spoke kit', 'Wheels', 2, 2, 1.0, 1, 'bible', true,
   null),

  ('Zip ties', 'Fix-it', 10, 10, 0.5, 1, 'bible', true,
   null),

  ('Chain lube', 'Drivetrain', 2, 2, 3.0, 1, 'bible', true,
   'Bring extra if rain is forecast. Dry-brushing and lubing every evening goes a long way to fewer repairs.'),

  ('Small bike brush', 'Drivetrain', 2, 2, 1.0, 1, 'bible', false,
   'Or a sawed-off toothbrush, to clean off mud. Especially if rain is in the forecast.'),

  ('Spare derailleur hanger', 'Drivetrain', 3, 3, 0.8, 1, 'bible', true,
   'One for EACH type of bike in the group. Fill in the Riders page — every distinct hanger model needs its own spare.'),

  ('Spare brake pads', 'Brakes', 3, 3, 1.2, 1, 'bible', false,
   'Especially if rain is forecast or you did not start on new pads. All riders should start with fresh pads.'),

  ('Spare rear derailleur', 'Drivetrain', 1, 1, 9.0, 3, 'bible', false,
   'You may need more than one as they are often not compatible. If you can set your bike up singlespeed and are OK with that, you might leave this behind.')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- "Other repair items you should consider bringing that have previously
--  been used in the field"
-- ---------------------------------------------------------------------
insert into group_items
  (name, category, qty, bible_qty, weight_oz, bulk, source, minimalist, notes)
values
  ('Extra tire (folding bead)', 'Tires & tubes', 1, 1, 24.0, 4, 'bible', false,
   'Folding bead type, often zip-tied to a frame. Strongly recommended for groups of 4+ or anyone riding a lot of singletrack.'),

  ('Spoke wrench', 'Wheels', 1, 1, 1.5, 1, 'bible', false,
   'Covering all four nipple sizes.'),

  ('Toe straps or ski straps', 'Fix-it', 2, 2, 2.0, 1, 'bible', false,
   'They repair everything duct tape cannot.'),

  ('Adjustable wrench', 'Tools', 1, 1, 6.0, 2, 'bible', false,
   null),

  ('Spare spokes + nipples', 'Wheels', 4, 4, 1.0, 1, 'bible', false,
   'Correct length, taped or zip-tied tightly under the left chainstay to keep them out of the way.'),

  ('Spare derailleur cables', 'Drivetrain', 2, 2, 1.0, 1, 'bible', false,
   null),

  ('Coil of medium/heavy gauge wire', 'Fix-it', 1, 1, 1.5, 1, 'bible', false,
   null),

  ('"In the Field" bike repair book', 'Tools', 1, 1, 6.0, 2, 'bible', false,
   'If necessary — phone photos of the key pages weigh nothing.')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Group kit that is NOT from the Bible's repair list. Sourced from the
-- hut info and published trip reports -- flagged so the board shows it
-- as unofficial until the real Bible sections are added.
-- ---------------------------------------------------------------------
insert into group_items
  (name, category, qty, bible_qty, weight_oz, bulk, source, minimalist, notes)
values
  ('Water filter', 'Camp', 2, null, 3.0, 1, 'trip-report', false,
   'Huts supply drinking water; a filter is the backup if a hut is short or a day runs long.'),

  ('Group first aid kit', 'Camp', 2, null, 8.0, 2, 'trip-report', false,
   'Huts carry basic first aid. Riders are expected to bring their own kit too.'),

  ('Battery pack', 'Camp', 3, null, 7.0, 2, 'trip-report', false,
   'No electricity in any hut. Gateway on day 5 is the only charging stop of the week.'),

  ('Emergency lighter', 'Camp', 2, null, 0.8, 1, 'trip-report', false,
   'The Bible suggests rolling your duct tape around it.'),

  ('Playing cards', 'Camp', 1, null, 3.5, 1, 'trip-report', false,
   'Long evenings, no electricity, no signal.'),

  ('Mini chess board', 'Camp', 1, null, 7.0, 2, 'custom', false,
   'Added by the group. Six nights is a lot of evenings.')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Personal kit template, seeded for every rider.
--
-- NOTE: these are marked official = false. The Bikers' Bible clothing and
-- personal sections could not be extracted cleanly from the PDF, so this
-- list is assembled from hut info and published trip reports, weighted
-- toward COLD -- this trip runs Sep 26 - Oct 2 with four days above
-- 9,600 ft, past the end of the season San Juan Huts advertises.
-- Replace with the real Bible sections when the Route Packet arrives.
-- ---------------------------------------------------------------------
insert into personal_items (rider_id, name, category, official, sort_order)
select r.id, t.name, t.category, false, t.ord
from riders r
cross join (values
  ('Sleeping bag liner',              'Sleep',     1),
  ('Inflatable pillow',               'Sleep',     2),
  ('Earplugs',                        'Sleep',     3),
  ('Helmet',                          'Riding',    10),
  ('Riding shoes',                    'Riding',    11),
  ('Riding shorts / bibs x2',         'Riding',    12),
  ('Jersey x2',                       'Riding',    13),
  ('Gloves — full finger',            'Riding',    14),
  ('Sunglasses / clear lens',         'Riding',    15),
  ('Hydration pack (3L capacity)',    'Riding',    16),
  ('Frame bag / handlebar roll',      'Riding',    17),
  ('Chamois cream',                   'Riding',    18),
  ('Insulated jacket',                'Cold',      20),
  ('Rain shell',                      'Cold',      21),
  ('Thermal base layer',              'Cold',      22),
  ('Knee / leg warmers',              'Cold',      23),
  ('Arm warmers',                     'Cold',      24),
  ('Warm hat / beanie',               'Cold',      25),
  ('Buff / neck gaiter',              'Cold',      26),
  ('Warm gloves (spare, dry pair)',   'Cold',      27),
  ('Camp clothes',                    'Camp',      30),
  ('Camp shoes',                      'Camp',      31),
  ('Warm socks for the hut',          'Camp',      32),
  ('Headlamp',                        'Camp',      33),
  ('Personal first aid kit',          'Camp',      34),
  ('Sunscreen',                       'Camp',      35),
  ('Chapstick',                       'Camp',      36),
  ('Wet wipes',                       'Camp',      37),
  ('Toothbrush / toiletries',         'Camp',      38),
  ('Personal medication',             'Camp',      39),
  ('Phone + charging cable',          'Tech',      40),
  ('GPS computer + mount',            'Tech',      41),
  ('GPX tracks loaded',               'Tech',      42),
  ('ID, cards, some cash',            'Admin',     50)
) as t(name, category, ord)
where not exists (
  select 1 from personal_items p
  where p.rider_id = r.id and p.name = t.name
);
