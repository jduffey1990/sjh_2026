-- =====================================================================
-- San Juan Huts 2026 -- put the end-of-trip decisions on the right days
--
-- Two things were wrong:
--
-- 1. "Sort the ride back to the vehicles" sat on day-7 (Fri Oct 2). The ride
--    finishes that day, but the shuttle and the drive home are Sat Oct 3.
--    It also duplicated the more specific return-shuttle decision, so it goes.
--
-- 2. Moab lodging for the Friday night had no presence on the Friday. It was
--    only in the Travel section, which is not where you look when reading the
--    schedule day by day.
--
-- Lodging and travel decisions now live on their day cards, matching how
-- "Book lodging in Ridgway" already hangs off the Sep 25 travel day.
-- =====================================================================

-- 1. Drop the vague, wrongly-dated duplicate. Its comments (if any) move to
--    the specific shuttle decision rather than disappearing with it.
update comments c
   set scope_id = (
         select d.id::text from decisions d
          where d.title = 'Confirm the Sat Oct 3 shuttle back' limit 1)
 where c.scope = 'decision'
   and c.scope_id in (
         select id::text from decisions
          where scope = 'day' and scope_id = 'day-7'
            and title = 'Sort the ride back to the vehicles');

delete from decisions
 where scope = 'day' and scope_id = 'day-7'
   and title = 'Sort the ride back to the vehicles';

-- 2. Moab lodging belongs on Friday Oct 2 -- the night you actually need it.
update decisions
   set scope = 'day', scope_id = 'day-7', sort_order = 1
 where title = 'Book Moab lodging for Friday Oct 2';

-- 3. The return shuttle belongs on Saturday Oct 3, not on the finish day.
update decisions
   set scope = 'day', scope_id = 'return', sort_order = 1
 where title = 'Confirm the Sat Oct 3 shuttle back';

update decisions
   set sort_order = 2
 where scope = 'day' and scope_id = 'return'
   and title = 'Who drives home with whom?';
