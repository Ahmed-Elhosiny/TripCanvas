import type { Activity, ActivityCategory, AppState, Day, Expense, Memory, Trip } from '../types';
import { getPlace } from './places';
import { IMG } from './images';
import { rangeIso, uid } from '../lib/format';

/* ---------------- builders ---------------- */

function act(placeId: string, time: string, opts?: Partial<Activity>): Activity {
  const p = getPlace(placeId);
  if (!p) throw new Error(`Unknown place ${placeId}`);
  return {
    id: uid('act'),
    placeId,
    title: p.name,
    category: p.category,
    time,
    durationMin: p.durationMin,
    cost: p.cost,
    lat: p.lat,
    lng: p.lng,
    ...opts,
  };
}

function custom(title: string, category: ActivityCategory, time: string, durationMin: number, cost: number, note?: string): Activity {
  return { id: uid('act'), title, category, time, durationMin, cost, note };
}

function day(date: string, city: Day['city'], activities: Activity[]): Day {
  return { id: uid('day'), date, city, activities };
}

function expense(label: string, category: Expense['category'], amount: number, date: string, note?: string): Expense {
  return { id: uid('exp'), label, category, amount, date, note };
}

function makeDays(start: string, end: string, citySplit: { city: Day['city']; nights: number }[]): Day[] {
  const dates = rangeIso(start, end);
  const days: Day[] = [];
  let cursor = 0;
  citySplit.forEach(({ city, nights }) => {
    for (let i = 0; i < nights && cursor < dates.length; i += 1) {
      days.push(day(dates[cursor], city, []));
      cursor += 1;
    }
  });
  while (cursor < dates.length) {
    days.push(day(dates[cursor], citySplit[citySplit.length - 1].city, []));
    cursor += 1;
  }
  return days;
}

/* ---------------- Italy ---------------- */

function italyTrip(): Trip {
  const start = '2025-05-12';
  const end = '2025-05-21';
  const days = makeDays(start, end, [
    { city: 'rome', nights: 4 },
    { city: 'florence', nights: 3 },
    { city: 'venice', nights: 3 },
  ]);

  days[0].activities = [
    act('p-eustachio', '09:00'),
    act('p-colosseum', '10:30', { note: 'Skip-the-line booked' }),
    act('p-pennestri', '13:30'),
    act('p-forum', '15:30', { note: 'Combo ticket with the Colosseum' }),
    act('p-pincio', '18:30', { note: 'Sunset over the domes' }),
    act('p-roscioli', '20:30'),
  ];
  days[1].activities = [
    act('p-vatican', '09:30', { note: 'Entry includes the Sistine Chapel' }),
    custom('Lunch — Borgo Pio', 'restaurant', '13:00', 60, 18),
    act('p-stpeters', '15:00', { note: 'Dome climb — 551 steps' }),
    act('p-castel', '17:30'),
    act('p-giolitti', '19:15'),
    custom('Dinner near Navona', 'restaurant', '20:30', 90, 35),
  ];
  days[2].activities = [
    act('p-pantheon', '10:00'),
    act('p-navona', '11:30'),
    act('p-campo', '12:30', { note: 'Market lunch — pizza bianca' }),
    act('p-trevi', '15:30', { note: 'Coin tossed over the shoulder' }),
    act('p-spanish', '16:45'),
    act('p-borghese', '18:00', { note: 'Last timed entry slot' }),
  ];
  days[3].activities = [
    act('p-capitoline', '10:00'),
    custom('Trastevere wander', 'attraction', '13:00', 120, 0),
    act('p-villaborghese', '16:30'),
    act('p-eustachio', '18:30', { note: 'Farewell espresso' }),
  ];
  days[4].activities = [
    custom('Frecciarossa Rome → Florence', 'other', '09:05', 95, 45, 'Seat 7A, window'),
    act('p-duomo', '15:00', { note: 'Dome climb at 15:00 sharp' }),
    act('p-vecchio', '17:30'),
    act('p-zaza', '20:00'),
  ];
  days[5].activities = [
    act('p-uffizi', '09:30'),
    act('p-mercato', '13:00', { note: 'Lampredotto — trust the queue' }),
    act('p-boboli', '15:00'),
    act('p-piazzale', '19:00', { note: 'Sunset + a bottle from the enoteca' }),
  ];
  days[6].activities = [
    act('p-croce', '10:30'),
    custom('Oltrarno artisan shops', 'shopping', '12:30', 90, 0),
    act('p-spirito', '18:30', { note: 'Negroni on the church steps' }),
  ];
  days[7].activities = [
    custom('Frecciarossa Florence → Venice', 'other', '09:20', 125, 38),
    act('p-rialto', '15:30'),
    act('p-gondola', '17:00', { note: 'Board at Campo San Moisè' }),
    act('p-bacareto', '19:30'),
  ];
  days[8].activities = [
    act('p-marco', '09:00'),
    act('p-accademia', '11:30'),
    act('p-peggy', '15:00'),
    custom('Cicchetti crawl — Cannaregio', 'restaurant', '19:00', 120, 30),
  ];
  days[9].activities = [
    act('p-oro', '10:00'),
    custom('Vaporetto to the airport', 'other', '13:00', 75, 15, 'Alilaguna line, pay on board'),
  ];

  const expenses: Expense[] = [
    expense('Trastevere apartment · Rome', 'stays', 180, '2025-05-12'),
    expense('Oltrarno B&B · Florence', 'stays', 140, '2025-05-16'),
    expense('Cannaregio inn · Venice', 'stays', 120, '2025-05-19'),
    expense('Train Rome → Florence', 'transport', 45, '2025-05-16'),
    expense('Train Florence → Venice', 'transport', 38, '2025-05-19'),
    expense('Vaporetto 3-day pass', 'transport', 32, '2025-05-19'),
    expense('Colosseum + Forum tickets', 'activities', 18, '2025-05-12'),
    expense('Vatican Museums × 2', 'activities', 25, '2025-05-13'),
    expense('Galleria Borghese', 'activities', 15, '2025-05-14'),
    expense('Uffizi timed entry', 'activities', 25, '2025-05-17'),
    expense('Gondola ride', 'activities', 70, '2025-05-19', 'Worth every cent'),
    expense('Roscioli dinner', 'food', 45, '2025-05-12'),
    expense('Trattoria lunch', 'food', 24, '2025-05-13'),
    expense('Market picnic', 'food', 14, '2025-05-14'),
    expense("Campo de' Fiori haul", 'shopping', 12, '2025-05-14'),
    expense('City tax', 'other', 17, '2025-05-16'),
  ];

  const memories: Memory[] = [
    { id: uid('mem'), date: '2025-05-12', place: 'Colosseum', city: 'rome', image: IMG.rome, caption: 'Two thousand years old and still the main character.', note: 'Golden hour hit the arches right as we came out of the Forum.' },
    { id: uid('mem'), date: '2025-05-13', place: 'St Peter\u2019s dome', city: 'rome', image: IMG.vatican, caption: '551 steps. Zero regrets.', note: 'The whole city is a map of itself from up there.' },
    { id: uid('mem'), date: '2025-05-14', place: 'Trastevere table', city: 'rome', image: IMG.trattoria, caption: 'Pasta rules everything.', note: 'The cacio e pepe arrived still spinning. We applauded.' },
    { id: uid('mem'), date: '2025-05-17', place: 'Piazzale Michelangelo', city: 'florence', image: IMG.florence, caption: 'Florence turned to gold at 20:14.', note: 'Stayed an hour past sunset. Nobody talked.' },
    { id: uid('mem'), date: '2025-05-19', place: 'Grand Canal', city: 'venice', image: IMG.venice, caption: 'Time moves by water here.', note: 'The gondolista sang badly and perfectly.' },
  ];

  return {
    id: 'trip-italy',
    name: 'Italy',
    cover: IMG.rome,
    start,
    end,
    cities: ['rome', 'florence', 'venice'],
    budget: 1500,
    status: 'ready',
    savedPlaceIds: [
      'p-colosseum', 'p-forum', 'p-vatican', 'p-stpeters', 'p-castel', 'p-pantheon',
      'p-navona', 'p-trevi', 'p-spanish', 'p-borghese', 'p-capitoline', 'p-pincio',
      'p-roscioli', 'p-eustachio', 'p-campo',
      'p-duomo', 'p-uffizi', 'p-vecchio', 'p-piazzale', 'p-boboli', 'p-croce', 'p-mercato', 'p-zaza',
      'p-marco', 'p-rialto', 'p-accademia', 'p-peggy', 'p-gondola', 'p-bacareto',
    ],
    days,
    expenses,
    memories,
  };
}

/* ---------------- Japan ---------------- */

function japanTrip(): Trip {
  const start = '2025-10-03';
  const end = '2025-10-15';
  const days = makeDays(start, end, [
    { city: 'tokyo', nights: 5 },
    { city: 'kyoto', nights: 5 },
    { city: 'osaka', nights: 3 },
  ]);
  days[0].activities = [
    act('p-sensoji', '15:00'),
    act('p-goldengai', '20:00', { note: 'Find the bar with the red lantern' }),
  ];
  days[1].activities = [
    act('p-shibuya', '10:00'),
    act('p-teamlab', '13:00', { note: 'First slot — bring sandals' }),
    act('p-meiji', '17:00'),
  ];
  days[5].activities = [act('p-fushimi', '07:30', { note: 'Beat the crowds to the gates' })];

  return {
    id: 'trip-japan',
    name: 'Japan',
    cover: IMG.kyoto,
    start,
    end,
    cities: ['tokyo', 'kyoto', 'osaka'],
    budget: 2600,
    status: 'planning',
    savedPlaceIds: [
      'p-sensoji', 'p-meiji', 'p-shibuya', 'p-goldengai', 'p-tsukiji', 'p-ueno', 'p-teamlab',
      'p-fushimi', 'p-kinkaku', 'p-kiyomizu', 'p-arashiyama', 'p-gion', 'p-nishiki', 'p-philosopher',
    ],
    days,
    expenses: [
      expense('Flight deposit · Lisbon ↔ Tokyo', 'transport', 480, '2025-09-01'),
      expense('Hotel Shinjuku · 4 nights', 'stays', 340, '2025-10-03'),
    ],
    memories: [],
  };
}

/* ---------------- Paris weekend ---------------- */

function parisTrip(): Trip {
  const start = '2025-06-14';
  const end = '2025-06-17';
  const days = makeDays(start, end, [{ city: 'paris', nights: 4 }]);
  days[0].activities = [
    custom('Arrival stroll along the Seine', 'attraction', '17:00', 90, 0),
    act('p-eiffel', '20:00', { note: 'Sparkle show at 21:00' }),
  ];

  return {
    id: 'trip-paris',
    name: 'Paris Weekend',
    cover: IMG.paris,
    start,
    end,
    cities: ['paris'],
    budget: 520,
    status: 'draft',
    savedPlaceIds: ['p-eiffel', 'p-louvre', 'p-seine', 'p-orsay', 'p-montmartre'],
    days,
    expenses: [expense('Eurostar London ↔ Paris', 'transport', 96, '2025-06-14')],
    memories: [],
  };
}

/* ---------------- app state ---------------- */

export function buildSeedState(): AppState {
  return {
    trips: [italyTrip(), japanTrip(), parisTrip()],
    settings: {
      traveler: 'Elena Moretti',
      email: 'elena@moretti.travel',
      home: 'Lisbon, Portugal',
      currency: 'EUR',
      unit: 'km',
    },
  };
}
