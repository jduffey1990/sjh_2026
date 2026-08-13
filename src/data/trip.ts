/**
 * Single source of truth for all static trip content.
 *
 * SOURCING NOTE: San Juan Huts' own page only publishes "~30 miles per day".
 * The per-day mileage and elevation figures below come from a published rider
 * trip report (twowheeledwanderer.com), which is the best public data but is
 * NOT official. The Route Packet emailed with the reservation -- containing the
 * Bikers' Bible, GPS tracks and daily route descriptions -- supersedes this.
 * Correct the numbers here and the whole site follows.
 */

export type DayKind = "travel" | "ride";

export interface TripDay {
  id: string;
  /** null on the travel day; riding days are 1-7 */
  day: number | null;
  kind: DayKind;
  date: string;
  dateLabel: string;
  weekday: string;
  title: string;
  from: string;
  to: string;
  /** Standard route miles. null on the travel day. */
  miles: number | null;
  /** Feet of climbing on the standard route. */
  gainFt: number | null;
  /** Highest point reached, feet. */
  highPointFt: number | null;
  summary: string;
  /** Longer notes shown on the day detail page. */
  detail: string[];
  /** Singletrack alternates and route options. */
  alternates: string[];
  /**
   * Fixed hazards and heads-ups only -- things that are true regardless of
   * what anyone decides. Anything requiring a group call lives in the
   * `decisions` table instead, so it can actually be settled.
   */
  flags: string[];
  /** SJH elevation profile graphic, if one exists for this day. */
  profile: string | null;
}

export const TRIP = {
  name: "San Juan Huts 2026",
  route: "Telluride → Moab",
  startDate: "2026-09-26",
  endDate: "2026-10-02",
  nights: 6,
  huts: [
    "Last Dollar",
    "Spring Creek",
    "Columbine",
    "Graham Ranch",
    "Gateway",
    "La Sal",
  ],
  operator: {
    name: "San Juan Huts",
    url: "https://sanjuanhuts.com/mountain-bike-hut-trips/telluride-to-moab/",
    phone: "970-626-3033",
  },
  /** Hut capacity is 8 -- the group fills a hut exactly. */
  partySize: 8,
} as const;

export const DAYS: TripDay[] = [
  {
    id: "travel",
    day: null,
    kind: "travel",
    date: "2026-09-25",
    dateLabel: "Sep 25",
    weekday: "Friday",
    title: "Travel day → Ridgway",
    from: "Home",
    to: "Ridgway, CO",
    miles: null,
    gainFt: null,
    highPointFt: 6985,
    summary:
      "Drive in, overnight in Ridgway, then run the last hour over to Telluride in the morning.",
    detail: [
      "Ridgway sits at about 7,000 ft. Sleeping here rather than pushing straight to Telluride (8,750 ft) is a small but real acclimatisation win before a day 1 that tops out near 11,000 ft.",
      "Telluride is roughly an hour south on CO-62 and CO-145 — an easy morning drive with time for a real breakfast before the start.",
      "Last chance for anything forgotten: Ridgway and Montrose have proper grocery and hardware. After Telluride there is nothing until the Gateway store on day 5.",
    ],
    alternates: [],
    flags: [],
    profile: null,
  },
  {
    id: "day-1",
    day: 1,
    kind: "ride",
    date: "2026-09-26",
    dateLabel: "Sep 26",
    weekday: "Saturday",
    title: "Telluride → Last Dollar",
    from: "Telluride",
    to: "Last Dollar Hut",
    miles: 22,
    gainFt: 3258,
    highPointFt: 10995,
    summary:
      "Shortest day on paper, hardest in the legs. Straight from town to nearly 11,000 ft with zero acclimatisation.",
    detail: [
      "The day everyone underestimates. Only 22 miles, but it climbs 3,258 ft to the highest point of the entire week on the freshest possible legs and the least adapted lungs.",
      "The route finishes with a steep jeep-trail climb to the hut. Ride it slow; there is no prize for arriving cooked on day 1.",
      "Late September means the aspens should be turning or turned — this is the prettiest day of the week and worth the photo stops.",
    ],
    alternates: [
      "Gondola to Mountain Village to skip the first climb out of town.",
      "Galloping Goose singletrack as an alternative to the road.",
      "Valley floor bike path for the mellowest start.",
    ],
    flags: [
      "Altitude: 10,995 ft with no acclimatisation. Hydrate hard, start slow.",
    ],
    profile: "TM-Day-1-Graph.webp",
  },
  {
    id: "day-2",
    day: 2,
    kind: "ride",
    date: "2026-09-27",
    dateLabel: "Sep 27",
    weekday: "Sunday",
    title: "Last Dollar → Spring Creek",
    from: "Last Dollar Hut",
    to: "Spring Creek Hut",
    miles: 27,
    gainFt: 2044,
    highPointFt: 10995,
    summary:
      "The recovery day. Ridge trails and wildflower mesas under the Sneffels Range.",
    detail: [
      "The gentlest day of the week and a genuine chance to recover after day 1. Descending ridge trails with the Sneffels Range on your shoulder for most of the morning.",
      "Still living high — the day tops out around 11,000 ft again before the long descent.",
    ],
    alternates: ["Several ridge singletrack options for those with legs left."],
    flags: [],
    profile: "TM-DAY-2-Graph.webp",
  },
  {
    id: "day-3",
    day: 3,
    kind: "ride",
    date: "2026-09-28",
    dateLabel: "Sep 28",
    weekday: "Monday",
    title: "Spring Creek → Columbine",
    from: "Spring Creek Hut",
    to: "Columbine Hut",
    miles: 39.5,
    gainFt: 3005,
    highPointFt: 9886,
    summary:
      "The longest day of the trip — 39.5 miles along the edge of the Uncompahgre Plateau.",
    detail: [
      "The biggest mileage day of the week, riding the plateau edge with alpine views most of the way. Start early; this is not a day to leave the hut at 10am.",
      "Singletrack alternates run the full range from beginner to advanced, so a mixed-ability group can split up and still arrive together.",
      "Water planning matters more today than any other day. Fill everything before leaving.",
    ],
    alternates: [
      "Beginner through advanced singletrack alternates along the plateau edge.",
    ],
    flags: [],
    profile: "TM-DAY-3-Graph.webp",
  },
  {
    id: "day-4",
    day: 4,
    kind: "ride",
    date: "2026-09-29",
    dateLabel: "Sep 29",
    weekday: "Tuesday",
    title: "Columbine → Graham Ranch",
    from: "Columbine Hut",
    to: "Graham Ranch Hut",
    miles: 36.5,
    gainFt: 2021,
    highPointFt: 9640,
    summary:
      "Alpine meadows and grassland with big open views. The last of the high country.",
    detail: [
      "Long but far easier than day 3 — only about 2,000 ft of climbing across 36.5 miles of meadow and grassland.",
      "This is the transition day. The alpine ends here and the terrain starts tipping toward the desert foothills.",
      "Three singletrack options if the group wants more than the standard road.",
    ],
    alternates: ["Three separate singletrack options on this segment."],
    flags: [],
    profile: "TM-DAY-4-Graph.webp",
  },
  {
    id: "day-5",
    day: 5,
    kind: "ride",
    date: "2026-09-30",
    dateLabel: "Sep 30",
    weekday: "Wednesday",
    title: "Graham Ranch → Gateway",
    from: "Graham Ranch Hut",
    to: "Gateway Hut",
    miles: 27,
    gainFt: 1663,
    highPointFt: 8950,
    summary:
      "Down into red rock canyon country. The one day with a store, power and signal.",
    detail: [
      "The scenery flips completely today — out of the alpine and down into the red rock. Mostly descending, and the easiest day of the week on the legs.",
      "Gateway has a general store: the single reliable resupply, phone signal and charging opportunity of the whole trip. Charge everything, send the messages you owe people, buy the things you regret not packing.",
      "Ute Creek Trail is the recommended singletrack alternate.",
    ],
    alternates: ["Ute Creek Trail — the pick of the singletrack on this day."],
    flags: [
      "Only charging stop of the week — top up every battery, light and GPS.",
    ],
    profile: "TM-DAY-5-Graph.webp",
  },
  {
    id: "day-6",
    day: 6,
    kind: "ride",
    date: "2026-10-01",
    dateLabel: "Oct 1",
    weekday: "Thursday",
    title: "Gateway → La Sal",
    from: "Gateway Hut",
    to: "La Sal Hut",
    miles: 21,
    gainFt: 4500,
    highPointFt: 8560,
    summary:
      "John Brown Canyon: 4,500 ft of climbing in 21 miles. The day most groups shuttle.",
    detail: [
      "The sleeper hard day. Shortest mileage of the week, most climbing by a wide margin — 4,500 ft, nearly all of it grinding up John Brown Canyon out of Gateway.",
      "Many groups shuttle the climb from the Gateway General Store, which cuts the day to roughly 7.5 miles of riding and turns a sufferfest into a pleasant afternoon into the La Sals.",
      "The top rewards you: out of the desert heat and back into cool alpine forest in the La Sal National Forest.",
    ],
    alternates: [
      "Shuttle the John Brown Canyon climb from Gateway General Store — reduces the day to about 7.5 miles of riding.",
    ],
    flags: [
      "4,500 ft of climbing in 21 miles if ridden — the hardest day of the week.",
    ],
    profile: "TM-DAY-6-Graph.webp",
  },
  {
    id: "day-7",
    day: 7,
    kind: "ride",
    date: "2026-10-02",
    dateLabel: "Oct 2",
    weekday: "Friday",
    title: "La Sal → Moab",
    from: "La Sal Hut",
    to: "Moab, UT",
    miles: 34,
    gainFt: 2743,
    highPointFt: 8260,
    summary:
      "The payoff. Forest to sage to slickrock, dropping into Moab. Porcupine Rim if you have anything left.",
    detail: [
      "Predominantly downhill and the best finish in hut-to-hut riding: alpine forest gives way to sage, sage gives way to red slickrock, and the whole thing tips into Moab.",
      "Porcupine Rim is the alternate for anyone with legs and skills left after six days. It is a serious, chunky descent — not a casual add-on at the end of a long week.",
      "Still 2,743 ft of climbing before the descent, so it is not a freebie.",
    ],
    alternates: [
      "Porcupine Rim Trail — legendary, technical, and a big ask on day 7.",
    ],
    flags: [],
    profile: "TM-DAY-7-Graph.webp",
  },
];

export const RIDERS = [
  { name: "Jordan Duffey", initials: "JD", color: "#f59e0b" },
  { name: "Kyle Lantz", initials: "KL", color: "#38bdf8" },
  { name: "John Luke Andrew", initials: "JA", color: "#34d399" },
  { name: "Jeff Seligman", initials: "JS", color: "#fb7185" },
  { name: "Tyler Gachen", initials: "TG", color: "#a78bfa" },
  { name: "Taran Giraud", initials: "TR", color: "#a3e635" },
  { name: "Aneel Mawji", initials: "AM", color: "#fb923c" },
  { name: "Ethan Cantlin", initials: "EC", color: "#22d3ee" },
] as const;

/** Totals across the seven riding days. */
export const TOTALS = DAYS.reduce(
  (acc, d) => ({
    miles: acc.miles + (d.miles ?? 0),
    gainFt: acc.gainFt + (d.gainFt ?? 0),
  }),
  { miles: 0, gainFt: 0 },
);
