-- =====================================================================
-- San Juan Huts 2026 -- attribute decisions to whoever raised them
--
-- Resolving a decision recorded who settled it, but ADDING one recorded
-- nobody, so "who thought this needed deciding?" had no answer. Every other
-- write on the site carries an author; this closes the last gap.
--
-- Seeded decisions keep a null author on purpose -- they came from the
-- Bikers' Bible and the route research, not from a person.
-- =====================================================================

alter table decisions
  add column if not exists created_by uuid references riders(id) on delete set null;
