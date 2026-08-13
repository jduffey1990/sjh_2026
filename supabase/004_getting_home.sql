-- =====================================================================
-- San Juan Huts 2026 -- the trip home
--
-- The ride finishes in Moab on Fri Oct 2, so there is a lodging night there
-- and then a shuttle back to the vehicles on Sat Oct 3.
--
-- The return shuttle is deliberately seeded as OPEN even though someone in
-- the group has already booked it. Resolving a decision records WHO settled
-- it, so leaving it open lets whoever actually did the work claim it --
-- resolving it on their behalf would attribute it to the wrong person.
-- =====================================================================

insert into logistics_fields (section_id, label, value, sort_order) values
  ('getting-home', 'Moab lodging (Fri Oct 2)',    'TBD',                        1),
  ('getting-home', 'Lodging booked by',           'TBD',                        2),
  ('getting-home', 'Nights',                      '1 — Friday Oct 2',           3),
  ('getting-home', 'Shuttle service (Sat Oct 3)', 'TBD — already booked',       4),
  ('getting-home', 'Shuttle booked by',           'TBD',                        5),
  ('getting-home', 'Pickup time / place',         'TBD',                        6),
  ('getting-home', 'Shuttle cost',                'TBD',                        7),
  ('getting-home', 'Then',                        'Drive home',                 8)
on conflict (section_id, label) do nothing;

insert into decisions (scope, scope_id, title, detail, sort_order) values
  ('logistics', 'getting-home',
   'Book Moab lodging for Friday Oct 2',
   'Everyone rolls into Moab on the Friday. Somewhere to sleep, and ideally somewhere that will hold vehicles either side if the cars are parked there.',
   1),
  ('logistics', 'getting-home',
   'Confirm the Sat Oct 3 shuttle back',
   'Someone has already booked this — whoever it was, resolve this with the operator, pickup time and cost so the group has it. Left open on purpose so it gets credited to the right person.',
   2),
  ('day', 'return',
   'Who drives home with whom?',
   'Same question as the drive out, in reverse, and easy to leave until everyone is standing in a car park in Moab.',
   1)
on conflict do nothing;
