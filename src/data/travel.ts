/**
 * Travel and logistics content. Everything here is a placeholder scaffold
 * except the facts drawn from the trip research -- fill in the bookings,
 * carpools and shuttle choice as they get decided.
 */

export interface LogisticsSection {
  id: string
  title: string
  status: 'settled' | 'open' | 'info'
  body: string[]
  items?: { label: string; value: string }[]
}

export const LOGISTICS: LogisticsSection[] = [
  {
    id: 'getting-there',
    title: 'Friday Sep 25 — getting there',
    status: 'open',
    body: [
      'Drive in and overnight in Ridgway, CO (~7,000 ft), then run the hour south to Telluride on Saturday morning for the day 1 start.',
      'Sleeping at Ridgway rather than driving straight through buys a night of altitude adjustment before a day 1 that tops out just under 11,000 ft.',
    ],
    items: [
      { label: 'Overnight', value: 'Ridgway, CO — lodging TBD' },
      { label: 'Ridgway → Telluride', value: '~1 hour via CO-62 / CO-145' },
      { label: 'Last real resupply', value: 'Ridgway or Montrose' },
    ],
  },
  {
    id: 'vehicles',
    title: 'Vehicles & parking',
    status: 'open',
    body: [
      'The route is one-way Telluride → Moab, so vehicles have to end up somewhere sensible. The common pattern is to leave cars in Moab and shuttle up to Telluride at the start, so you finish the ride standing next to your own car instead of organising a rescue.',
      'Moab hotels will often let you leave a vehicle for the week with a reservation on either end.',
    ],
    items: [
      { label: 'Decision', value: 'Park in Moab and shuttle to Telluride?' },
      { label: 'Shuttle operators', value: 'Moab Express, Porcupine Shuttles' },
      { label: 'Rough cost', value: '~$425 for 3 people, one way' },
    ],
  },
  {
    id: 'day-6-shuttle',
    title: 'The day 6 shuttle question',
    status: 'open',
    body: [
      'Day 6 out of Gateway climbs 4,500 ft in 21 miles up John Brown Canyon — the hardest day of the week by a distance, on day six of seven.',
      'The Gateway General Store runs shuttles up the canyon. Taking it cuts day 6 to roughly 7.5 miles of riding. This needs to be decided and arranged when you hit Gateway on day 5.',
    ],
    items: [
      { label: 'Ride it', value: '21 mi / 4,500 ft' },
      { label: 'Shuttle it', value: '~7.5 mi / 860 ft' },
      { label: 'Arrange at', value: 'Gateway General Store, day 5' },
    ],
  },
  {
    id: 'huts',
    title: 'What the huts provide',
    status: 'info',
    body: [
      'Each hut sleeps 8 — the group fills one exactly. Padded bunks, sleeping bags, propane cook stove, propane light, wood stove, cookware and utensils, food and drinking water are all provided and restocked.',
      'There is no electricity in any hut. Composting toilet, toilet paper, hand sanitiser, sunscreen, bug spray, floor pump and basic first aid are on site.',
    ],
    items: [
      { label: 'Provided', value: 'Bunks, sleeping bags, food, water, stove' },
      { label: 'Bring', value: 'Sleeping bag liner, personal kit, repair kit' },
      { label: 'Electricity', value: 'None, all week' },
      { label: 'Beer package', value: '~$44pp, up to 3 drinks daily' },
    ],
  },
  {
    id: 'connectivity',
    title: 'Power & signal',
    status: 'info',
    body: [
      'Assume no signal and no power from Telluride until Gateway on day 5, and none again after it. Gateway General Store is the one reliable charging and resupply point of the week.',
      'This site is installable and works fully offline — the packing board and every logistics page stay readable with no bars. Install it before you leave.',
    ],
    items: [
      { label: 'Only charging stop', value: 'Gateway General Store, day 5' },
      { label: 'Navigation', value: 'GPS computer + GPX from the Route Packet' },
      { label: 'Recommendation', value: 'Battery pack, and charge everything at Gateway' },
    ],
  },
  {
    id: 'weather',
    title: 'Late-season weather',
    status: 'info',
    body: [
      'San Juan Huts lists the season as June 1 – September; this trip runs Sep 26 – Oct 2, right at the tail end. October trips clearly happen, but the group should pack for genuine cold rather than the standard summer list.',
      'Days 1–4 sit above 9,600 ft with day 1 topping 10,995 ft. Expect hard overnight freezes up high and a real chance of early snow in the alpine sections, then desert warmth once the route drops toward Gateway and Moab.',
    ],
    items: [
      { label: 'High point', value: '10,995 ft on day 1' },
      { label: 'Above 9,600 ft', value: 'Days 1–4' },
      { label: 'Pack for', value: 'Freezing nights up high, warm desert days' },
    ],
  },
]
