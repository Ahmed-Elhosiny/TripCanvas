import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Activity, Place, Trip } from '../../types';
import { CITIES, CATEGORY_META } from '../../types';
import { useToast, useTripStore } from '../../store/store';
import { distLabel, durationLabel, fmtDate, minToTime, money, timeToMin } from '../../lib/format';
import { buildSchedule, optimizeOrder, pathKm, walkMinutes } from '../../lib/geo';
import { getPlace } from '../../data/places';
import { MapCanvas } from '../../components/MapCanvas';
import type { MapMarker } from '../../components/MapCanvas';
import { Button, Field, Input, Select } from '../../components/ui';
import { AlertIcon, ArrowRightIcon, CheckIcon, MapIcon, RouteIcon, SparkIcon, XIcon } from '../../components/icons';
import { tabPath } from './Workspace';

/* ---------------- FLIP list ---------------- */

function FlipList({ items, render }: { items: Place[]; render: (p: Place, i: number) => ReactNode }) {
  const refs = useRef(new Map<string, HTMLDivElement>());
  const prevRects = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    const next = new Map<string, DOMRect>();
    refs.current.forEach((el, id) => next.set(id, el.getBoundingClientRect()));
    refs.current.forEach((el, id) => {
      const p = prevRects.current.get(id);
      const n = next.get(id);
      if (p && n) {
        const dy = p.top - n.top;
        if (Math.abs(dy) > 2) {
          el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], {
            duration: 620,
            easing: 'cubic-bezier(0.2, 0.75, 0.2, 1)',
          });
        }
      }
    });
    prevRects.current = next;
  });

  return (
    <div className="space-y-2">
      {items.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => {
            if (el) refs.current.set(p.id, el);
            else refs.current.delete(p.id);
          }}
        >
          {render(p, i)}
        </div>
      ))}
    </div>
  );
}

/* ---------------- page ---------------- */

export default function BuildDay({ trip }: { trip: Trip }) {
  const { state, setDayActivities } = useTripStore();
  const { push } = useToast();
  const [params] = useSearchParams();
  const currency = state.settings.currency;
  const unit = state.settings.unit;

  const initialDayId = params.get('day');
  const [dayId, setDayId] = useState(initialDayId && trip.days.some((d) => d.id === initialDayId) ? initialDayId : trip.days[0]?.id ?? '');
  const day = trip.days.find((d) => d.id === dayId) ?? trip.days[0];

  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('20:00');
  const [dwell, setDwell] = useState(75);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [optimized, setOptimized] = useState<Place[] | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const cityPlaces = useMemo(() => {
    if (!day) return [];
    return trip.savedPlaceIds
      .map((id) => getPlace(id))
      .filter((p): p is Place => Boolean(p && p.city === day.city));
  }, [trip.savedPlaceIds, day]);

  const selected = useMemo(() => selectedIds.map((id) => getPlace(id)).filter((p): p is Place => Boolean(p)), [selectedIds]);

  const startMin = timeToMin(start);
  const endMin = timeToMin(end);

  const beforeKm = useMemo(() => pathKm(selected), [selected]);
  const result = useMemo(() => (optimized ? { order: optimized, km: pathKm(optimized) } : null), [optimized]);

  const schedule = useMemo(
    () => (result ? buildSchedule(result.order, startMin, endMin, (p) => Math.max(p.durationMin, 20)) : null),
    [result, startMin, endMin],
  );

  const savedMin = result ? Math.max(0, walkMinutes(beforeKm) - walkMinutes(result.km)) : 0;

  const markers: MapMarker[] = useMemo(() => {
    const list = optimized ?? selected;
    return list.map((p, i) => ({
      id: p.id, lat: p.lat, lng: p.lng, label: p.name, color: CATEGORY_META[p.category].color, kind: 'stop', index: i + 1,
    }));
  }, [optimized, selected]);

  const route = useMemo(() => (optimized ?? selected).map((p) => ({ lat: p.lat, lng: p.lng })), [optimized, selected]);

  const togglePlace = (id: string) => {
    setOptimized(null);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const run = () => {
    if (selected.length < 2) return;
    const { order } = optimizeOrder(selected);
    setOptimized(order);
    push('success', 'Route optimized', `Reordered ${order.length} stops into a ${distLabel(pathKm(order), unit)} line.`);
  };

  const apply = () => {
    if (!result || !day) return;
    const acts: Activity[] = result.order.map((p, i) => ({
      id: `act-opt-${day.id}-${p.id}`,
      placeId: p.id,
      title: p.name,
      category: p.category,
      time: schedule ? minToTime(schedule.stops[i].arrive) : minToTime(startMin + i * (dwell + 15)),
      durationMin: Math.max(p.durationMin, 20),
      cost: p.cost,
      lat: p.lat,
      lng: p.lng,
    }));
    setDayActivities(trip.id, day.id, acts);
    setConfirmReplace(false);
    push('success', `Day ${fmtDate(day.date, 'MMM d')} is built`, `${acts.length} stops, ${distLabel(result.km, unit)} of walking.`);
  };

  if (!day) return null;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] text-persimmon">
            <span className="h-px w-8 bg-persimmon" /> ROUTE ENGINE
          </p>
          <h2 className="mt-2.5 font-display text-[32px] font-semibold leading-none tracking-tight text-ink sm:text-[38px]">Build my day</h2>
          <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-moss">
            Pick the places, set your hours, and the engine reorders them into the shortest walkable line — nearest-neighbour first, then 2-opt polish.
          </p>
        </div>
        <Link to={tabPath(trip.id, 'itinerary')} className="group flex items-center gap-2 text-[13px] font-bold text-pine hover:text-persimmon">
          Back to itinerary <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[370px_1fr]">
        {/* setup */}
        <section className="rounded-xl border border-line bg-bone p-5 shadow-card sm:p-6">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <Field label="Target day">
                <Select value={dayId} onChange={(e) => { setDayId(e.target.value); setOptimized(null); setSelectedIds([]); setConfirmReplace(false); }}>
                  {trip.days.map((d, i) => (
                    <option key={d.id} value={d.id}>
                      Day {i + 1} · {fmtDate(d.date, 'EEE MMM d')} — {CITIES[d.city].name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Start">
              <Input type="time" value={start} onChange={(e) => { setStart(e.target.value); setOptimized(null); }} />
            </Field>
            <Field label="Finish by">
              <Input type="time" value={end} onChange={(e) => { setEnd(e.target.value); setOptimized(null); }} />
            </Field>
            <div className="col-span-2">
              <Field label={`Time per stop · ${durationLabel(dwell)}`}>
                <input
                  type="range"
                  min={30}
                  max={180}
                  step={15}
                  value={dwell}
                  onChange={(e) => { setDwell(Number(e.target.value)); setOptimized(null); }}
                  className="w-full accent-[#E4572E]"
                  aria-label="Time per stop"
                />
              </Field>
            </div>
          </div>

          <div className="mt-5 border-t border-dashed border-line pt-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-[10.5px] font-bold tracking-[0.2em] text-fog">
                SAVED IN {CITIES[day.city].name.toUpperCase()} · {selectedIds.length} PICKED
              </h3>
              <div className="flex gap-1.5">
                <button onClick={() => { setOptimized(null); setSelectedIds(cityPlaces.map((p) => p.id)); }} className="font-mono text-[10px] font-bold tracking-wider text-pine hover:text-persimmon">
                  ALL
                </button>
                <span className="text-line">/</span>
                <button onClick={() => { setOptimized(null); setSelectedIds([]); }} className="font-mono text-[10px] font-bold tracking-wider text-pine hover:text-persimmon">
                  NONE
                </button>
              </div>
            </div>
            {cityPlaces.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-line bg-chalk p-4 text-[12.5px] font-semibold text-fog">
                No saved places in {CITIES[day.city].name}. Grab a few from <Link to={tabPath(trip.id, 'discover')} className="text-persimmon hover:underline">Discover</Link> first.
              </p>
            ) : (
              <ul className="thin-scroll mt-3 max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
                {cityPlaces.map((p) => {
                  const on = selectedIds.includes(p.id);
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => togglePlace(p.id)}
                        aria-pressed={on}
                        className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all ${
                          on ? 'border-pine/50 bg-pine/8' : 'border-line bg-chalk hover:border-ink/25'
                        }`}
                        style={on ? { background: 'rgba(28,56,48,0.07)' } : undefined}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${on ? 'border-persimmon bg-persimmon text-bone' : 'border-line bg-bone text-transparent'}`}>
                          <CheckIcon size={12} />
                        </span>
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORY_META[p.category].color }} />
                        <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink">{p.name}</span>
                        <span className="tnum shrink-0 font-mono text-[10.5px] font-bold text-fog">{durationLabel(Math.max(p.durationMin, 20))}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-5">
            {!optimized ? (
              <Button className="w-full" size="lg" disabled={selected.length < 2} onClick={run}>
                <SparkIcon size={17} /> Optimize route
              </Button>
            ) : (
              <div className="space-y-2.5">
                {day.activities.length > 0 && !confirmReplace ? (
                  <Button className="w-full" size="lg" onClick={() => setConfirmReplace(true)}>
                    <CheckIcon size={16} /> Apply to Day {trip.days.indexOf(day) + 1}
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={apply}>
                    <CheckIcon size={16} /> Apply to Day {trip.days.indexOf(day) + 1}
                  </Button>
                )}
                <Button className="w-full" variant="outline" onClick={() => setOptimized(null)}>
                  <RouteIcon size={15} /> Re-pick places
                </Button>
              </div>
            )}
            {selected.length < 2 && <p className="mt-2.5 text-center font-mono text-[10px] font-bold tracking-wider text-fog">PICK AT LEAST 2 PLACES TO OPTIMIZE</p>}
          </div>

          {confirmReplace && (
            <div className="rise-in mt-4 rounded-lg border border-persimmon/40 bg-persimmon/5 p-3.5">
              <p className="flex items-start gap-2 text-[12.5px] font-bold text-ink">
                <AlertIcon size={15} className="mt-0.5 shrink-0 text-persimmon" />
                Day {trip.days.indexOf(day) + 1} already has {day.activities.length} stops. Replace them with the optimized route?
              </p>
              <div className="mt-2.5 flex gap-2">
                <Button size="sm" onClick={apply}>Replace</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmReplace(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </section>

        {/* canvas: map + order */}
        <section className="flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-xl border border-line shadow-card" style={{ height: 380 }}>
            {markers.length > 0 ? (
              <MapCanvas city={day.city} markers={markers} route={route.length > 1 ? route : undefined} routeKey={markers.map((m) => m.id).join('|')} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-mist/50 text-center">
                <MapIcon size={30} className="text-fog" />
                <p className="max-w-[30ch] text-[13.5px] font-semibold text-fog">Your route canvas — pick places on the left and the line appears here.</p>
              </div>
            )}
            {markers.length > 0 && (
              <div className="absolute left-3.5 top-3.5 flex gap-2">
                <span className="rounded-md bg-ink/75 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.16em] text-chalk backdrop-blur-sm">
                  {CITIES[day.city].name.toUpperCase()} · {markers.length} STOPS
                </span>
                {result && (
                  <span className="stamp-in rounded-md bg-persimmon px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-bone">
                    −{savedMin} MIN WALK
                  </span>
                )}
              </div>
            )}
          </div>

          {/* order list */}
          <div className="rounded-xl border border-line bg-bone p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-[19px] font-semibold text-ink">{optimized ? 'The optimized line' : 'Your picking order'}</h3>
              <div className="flex items-center gap-4 font-mono text-[11px] font-bold tracking-wider">
                <span className="text-fog">
                  WALK <span className="tnum text-ink">{distLabel(optimized ? result!.km : beforeKm, unit)}</span>
                </span>
                <span className="text-fog">
                  EST. <span className="tnum text-ink">{durationLabel(walkMinutes(optimized ? result!.km : beforeKm))}</span>
                </span>
              </div>
            </div>

            {selected.length === 0 ? (
              <p className="mt-5 rounded-lg border border-dashed border-line bg-chalk p-6 text-center text-[13px] font-semibold text-fog">
                The page is blank — a good day starts with two pins.
              </p>
            ) : (
              <div className="mt-5">
                <FlipList
                  items={optimized ?? selected}
                  render={(p, i) => {
                    const stop = schedule?.stops[i];
                    return (
                      <div className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-colors ${optimized ? 'border-persimmon/30 bg-persimmon/4' : 'border-line bg-chalk'}`} style={optimized ? { background: 'rgba(228,87,46,0.05)' } : undefined}>
                        <span className={`tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-bold ${optimized ? 'bg-persimmon text-bone' : 'bg-mist text-ink'}`}>
                          {i + 1}
                        </span>
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORY_META[p.category].color }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-bold text-ink">{p.name}</span>
                          <span className="tnum font-mono text-[10px] font-bold tracking-wider text-fog">
                            {stop ? `${minToTime(stop.arrive)} — ${minToTime(stop.depart)}` : 'time TBD'} · {p.cost > 0 ? money(p.cost, currency) : 'FREE'}
                          </span>
                        </span>
                        {!optimized && (
                          <button onClick={() => togglePlace(p.id)} aria-label={`Remove ${p.name}`} className="text-fog transition-colors hover:text-persimmon">
                            <XIcon size={14} />
                          </button>
                        )}
                      </div>
                    );
                  }}
                />
                {schedule?.overflow && (
                  <p className="mt-4 flex items-center gap-2 rounded-lg border border-saffron/50 bg-saffron/10 px-3.5 py-2.5 text-[12.5px] font-bold text-[#8a5c14]">
                    <AlertIcon size={15} /> This route runs past {end} — trim a stop or push the finish later.
                  </p>
                )}
                {optimized && !schedule?.overflow && (
                  <p className="mt-4 flex items-center gap-2 rounded-lg border border-teal/40 bg-teal/8 px-3.5 py-2.5 text-[12.5px] font-bold text-teal" style={{ background: 'rgba(46,107,96,0.07)' }}>
                    <CheckIcon size={15} /> Fits inside {start} — {end} with room to wander.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
