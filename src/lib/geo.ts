import type { CityId } from '../types';

export interface Coord {
  lat: number;
  lng: number;
}

export interface Bounds {
  n: number;
  s: number;
  e: number;
  w: number;
}

/* Viewport bounds for each city's canvas map */
export const CITY_BOUNDS: Record<CityId, Bounds> = {
  rome:     { n: 41.922, s: 41.878, e: 12.508, w: 12.442 },
  florence: { n: 43.782, s: 43.758, e: 11.272, w: 11.238 },
  venice:   { n: 45.462, s: 45.424, e: 12.362, w: 12.310 },
  paris:    { n: 48.890, s: 48.842, e: 2.372,  w: 2.284 },
  tokyo:    { n: 35.726, s: 35.648, e: 139.806, w: 139.688 },
  kyoto:    { n: 35.046, s: 34.958, e: 135.800, w: 135.658 },
  osaka:    { n: 34.710, s: 34.644, e: 135.536, w: 135.478 },
};

export function project(coord: Coord, bounds: Bounds, w: number, h: number): { x: number; y: number } {
  const x = ((coord.lng - bounds.w) / (bounds.e - bounds.w)) * w;
  const y = ((bounds.n - coord.lat) / (bounds.n - bounds.s)) * h;
  return { x, y };
}

export function haversineKm(a: Coord, b: Coord): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function pathKm(points: Coord[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversineKm(points[i - 1], points[i]);
  return total;
}

const WALK_KMH = 4.6;

export function walkMinutes(km: number): number {
  return Math.max(3, Math.round(((km / WALK_KMH) * 60) / 5) * 5);
}

/* ---------------- route optimization ----------------
   Nearest-neighbour construction + 2-opt refinement.  */

function loopLength(order: Coord[]): number {
  return pathKm(order);
}

export function optimizeOrder<T extends Coord & { id: string }>(
  items: T[],
  start?: Coord,
): { order: T[]; km: number } {
  if (items.length === 0) return { order: [], km: 0 };

  const remaining = [...items];
  const order: T[] = [];
  let cursor: Coord = start ?? remaining[0];
  if (!start) order.push(remaining.shift() as T);

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i += 1) {
      const d = haversineKm(cursor, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    order.push(next);
    cursor = next;
  }

  /* 2-opt refinement on the open path */
  let improved = true;
  while (improved && order.length > 2) {
    improved = false;
    for (let i = 0; i < order.length - 2; i += 1) {
      for (let j = i + 1; j < order.length - 1; j += 1) {
        const candidate = [...order];
        const reversed = candidate.slice(i + 1, j + 1).reverse();
        candidate.splice(i + 1, j - i, ...reversed);
        if (loopLength(candidate) + 1e-9 < loopLength(order)) {
          order.splice(0, order.length, ...candidate);
          improved = true;
        }
      }
    }
  }

  return { order, km: loopLength(order) };
}

/* ---------------- daily schedule builder ---------------- */

export interface ScheduleStop<T extends Coord & { id: string }> {
  place: T;
  arrive: number; // minutes since midnight
  depart: number;
}

export function buildSchedule<T extends Coord & { id: string }>(
  order: T[],
  startMin: number,
  endMin: number,
  dwellOf: (item: T, index: number) => number,
): { stops: ScheduleStop<T>[]; overflow: boolean; totalWalkKm: number } {
  const stops: ScheduleStop<T>[] = [];
  let clock = startMin;
  let overflow = false;
  let totalWalkKm = 0;

  order.forEach((place, i) => {
    if (i > 0) {
      const leg = haversineKm(order[i - 1], place);
      totalWalkKm += leg;
      clock += walkMinutes(leg);
    }
    const dwell = dwellOf(place, i);
    const arrive = clock;
    const depart = clock + dwell;
    if (arrive > endMin) overflow = true;
    stops.push({ place, arrive: Math.min(arrive, endMin + 120), depart });
    clock = depart;
  });

  return { stops, overflow, totalWalkKm };
}
