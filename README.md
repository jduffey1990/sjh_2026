# San Juan Huts 2026 — Telluride → Moab

Trip site for the San Juan Huts Telluride-to-Moab ride, **Sat Sep 26 – Fri Oct 2, 2026**.
Eight riders, six huts, ~207 miles.

Static React on GitHub Pages, talking straight to Supabase. No serverless
functions and no Vercel project involved.

## What's here

| Page | Without Supabase |
| --- | --- |
| Schedule — 8 day cards with mileage, climbing and elevation profiles | full, minus open-decision counts |
| Route detail — per-day terrain and alternates | full, minus decisions and comments |
| Travel & logistics — Ridgway, vehicles, day 6 shuttle, hut info | full, but values are read-only |
| Gallery — route photos | full |
| **Packing board** — group manifest with claims and load balance | needs backend |
| My kit — personal checklist | needs backend |
| Riders — bike specs feeding the compatibility checks | roster only |

The route content is static, so the trip stays readable even with no Supabase
configured; the collaborative layers simply don't render.

## The packing board

The reason the site exists. From the Bikers' Bible:

> Everyone in your group does not need all of these items but the group as a
> whole should have a good repair kit.

Eight people packing independently produces four chain breakers and zero spare
hangers. The board is a **curated group manifest riders claim from**, so gaps
and duplicates are visible before anyone leaves home.

**Quantity is the only control.** Each tile carries a flat total — how many of
that thing the group is bringing. Drop it to a positive number and the tile
stays, still showing what the Bible originally recommended. Drop it to **zero**
and it moves to the Not Required section. There is no separate skip action and
no status column, so nothing can drift out of sync.

Not Required items **stay claimable** — the group deciding against something
isn't the same as forbidding it, and a claimed item still counts toward that
rider's load, because they're carrying it either way.

**Load balance** tracks weight *and* bulk separately, since a folding spare tire
is light and enormous while a chain breaker is dense and pocket-sized. Only
claimed group gear counts; nobody gets credit for overpacking their own duffel.

**Compatibility warnings** cover the cross-rider constraints a flat checklist
can't express — the Bible wants a hanger for *each type of bike* and Power Links
compatible with *every* chain in the group. Fill in the Riders page and the
board flags what isn't covered.

## Setup

```bash
npm install
cp .env.example .env.local   # optional; static pages work without it
npm run dev                  # http://localhost:5173/sjh_2026/
```

### Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier is plenty).
2. Run the migrations **in order**:

   ```bash
   psql "$DB_URI" -f supabase/schema.sql
   psql "$DB_URI" -f supabase/seed.sql
   psql "$DB_URI" -f supabase/002_planning.sql
   psql "$DB_URI" -v pw='your-trip-password' -f supabase/003_auth.sql
   ```

3. Project Settings → API → copy the URL and **anon** key into `.env.local` as
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. (Vite only reads `VITE_`
   prefixed variables — `NEXT_PUBLIC_*` names are silently ignored.)

## Access

The site is gated by a single shared password. It is a **real** gate, not a UI
one, and that distinction matters: the bundle is static and public, so the
Supabase key inside it can be read by anyone. A JavaScript password prompt would
be trivially bypassed by calling the REST API directly.

So instead, `003_auth.sql` creates one shared account and rewrites every RLS
policy to require the `authenticated` role. Without a session the anon key
returns `[]` from every table. The gate is enforced by Postgres.

Sign-in persists and auto-refreshes, so you do it once. **Do it before you
leave** — there's no signal to sign in with between Telluride and Gateway.

To rotate the password, re-run `003_auth.sql` with a new `-v pw`. psql quotes
and escapes the value itself, so pass it plain — apostrophes and all. The password
is never committed to this repo; it's passed in at run time.

⚠️ Still don't put anything sensitive in the database. One shared password among
eight people is not access control in any serious sense — the Riders page holds
bike specs and deliberately no phone numbers or emergency contacts.

## Planning vs. route facts

Route facts — mileage, elevation, hut names, terrain, singletrack alternates —
are hard-coded in [`src/data/trip.ts`](src/data/trip.ts). They don't change, and
keeping them static means the schedule renders offline with no round-trip.

Everything *around* them is live:

- **Decisions** — open questions attached to a day or a Travel section. Resolving
  one records the outcome and who settled it, not just a status flag. Open counts
  surface on the schedule cards.
- **Comments** — threads on any day, Travel section, or individual decision.
- **Logistics fields** — the label/value pairs on the Travel page are editable in
  place, so whoever books the lodge types it in and everyone has it.

### Deploying

Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and
publishes to Pages. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as
repository secrets (Settings → Secrets and variables → Actions), and set Pages
to deploy from GitHub Actions.

Vite is configured with `base: '/sjh_2026/'`. If the repo is named something
else, change it in [`vite.config.ts`](vite.config.ts).

## Offline

The huts have no electricity and the plateau has effectively no signal, so the
site is an installable PWA: the shell, trip data and photos are precached, board
data mirrors to IndexedDB, and edits queue in an outbox that replays when signal
returns. Conflicts resolve last-write-wins per row.

Install it on your phone before you leave. Gateway on day 5 is the only reliable
charging and signal stop of the week.

## Data caveats

- **Mileage and elevation are unofficial.** San Juan Huts publishes only
  "~30 miles per day"; the per-day figures come from a published rider trip
  report. The Route Packet emailed with the reservation is authoritative. All of
  it lives in [`src/data/trip.ts`](src/data/trip.ts).
- **The packing catalog is partial.** The Bible's *Recommended Bike Repair
  Equipment & Tools* section is seeded verbatim. The clothing, personal and
  kitchen sections weren't available, so those are assembled from trip reports
  and flagged `unofficial` in the UI — weighted toward cold, since this trip runs
  past the season SJH advertises with four days above 9,600 ft.
- Photos and route information are © San Juan Huts, used for trip planning.
