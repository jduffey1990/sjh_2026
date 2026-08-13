-- =====================================================================
-- San Juan Huts 2026 -- GPS tracks section
--
-- Whether the app hosts the GPX files is a group decision, not a technical
-- one, so it is posed as an open decision rather than settled in code.
--
-- The constraint worth knowing before deciding: this site's repo is public
-- and GitHub Pages serves it to anyone. San Juan Huts does not publish the
-- tracks anywhere -- the Route Packet is effectively what you paid for.
-- Hosting them in the app therefore means a private Supabase bucket behind
-- the trip password, not files in the repo.
-- =====================================================================

insert into logistics_fields (section_id, label, value, sort_order) values
  ('gpx-tracks', 'Source',             'Route Packet email from San Juan Huts', 1),
  ('gpx-tracks', 'Who has the packet', 'TBD',                                   2),
  ('gpx-tracks', 'Sent to the group',  'TBD',                                   3),
  ('gpx-tracks', 'Load onto devices by', 'Before leaving Telluride, Sep 26',    4),
  ('gpx-tracks', 'Navigation',         'GPS computer — phone battery will not last the week', 5)
on conflict (section_id, label) do nothing;

insert into decisions (scope, scope_id, title, detail, sort_order) values
  ('logistics', 'gpx-tracks',
   'Host the GPX files in this app, or just email them round?',
   'Emailing them is free and takes a minute. Hosting them here means a private Supabase bucket gated behind the trip password, plus per-day download links and route shapes drawn from the real tracks — but it is only worth building if people would actually use it. What it must NOT be is files committed to the repo: that is public, and San Juan Huts does not release these.',
   1),
  ('logistics', 'gpx-tracks',
   'Confirm everyone has the tracks on a device',
   'Not the same as having been sent them. No signal between Telluride and Gateway to fix it on the road.',
   2)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- New scopes have no seen_markers, and a missing marker means "never
-- looked" -- so without this every rider would open the site to a badge
-- for decisions nobody wrote. Same reasoning as 007.
-- ---------------------------------------------------------------------
insert into seen_markers (rider_id, scope, scope_id, seen_at)
select r.id, 'logistics', 'gpx-tracks', now()
from riders r
on conflict (rider_id, scope, scope_id) do nothing;
