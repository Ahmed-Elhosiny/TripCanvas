import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Activity, Place, Trip } from '../../types';
import { CITIES, CATEGORY_META } from '../../types';
import { useToast, useTripStore } from '../../store/store';
import { distLabel, durationLabel, fmtDate, minToTime, money, timeToMin } from '../../lib/format';
import { pathKm } from '../../lib/geo';
import { getPlace } from '../../data/places';
import { MapCanvas } from '../../components/MapCanvas';
import type { MapMarker } from '../../components/MapCanvas';
import { PlaceVisual, Rating } from '../../components/cards';
import { ActivityModal } from '../../components/modals';
import { Button, Chip, IconBtn, Select } from '../../components/ui';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, EyeIcon, LayersIcon, PinIcon, PlusIcon, RouteIcon, TrashIcon, WalletIcon, XIcon } from '../../components/icons';
import { tabPath } from './Workspace';

type Selection = { kind: 'place'; place: Place } | { kind: 'activity'; activity: Activity; dayId: string } | null;

export default function MapView({ trip }: { trip: Trip }) {
  const { state, savePlace, unsavePlace, deleteActivity, addActivity } = useTripStore();
  const { push } = useToast();
  const currency = state.settings.currency;
  const unit = state.settings.unit;

  const [mode, setMode] = useState<'day' | 'saved'>('day');
  const [dayIdx, setDayIdx] = useState(0);
  const [cityId, setCityId] = useState(trip.cities[0]);
  const [selection, setSelection] = useState<Selection>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [addingPlace, setAddingPlace] = useState<Place | null>(null);

  const day = trip.days[Math.min(dayIdx, trip.days.length - 1)];

  const savedPlaces = useMemo(
    () => trip.savedPlaceIds.map((id) => getPlace(id)).filter((p): p is Place => Boolean(p)),
    [trip.savedPlaceIds],
  );
  const cityPlaces = useMemo(() => savedPlaces.filter((p) => p.city === cityId), [savedPlaces, cityId]);

  const markers: MapMarker[] = useMemo(() => {
    if (mode === 'saved') {
      return cityPlaces.map((p) => ({
        id: p.id, lat: p.lat, lng: p.lng, label: p.name, color: CATEGORY_META[p.category].color, kind: 'place',
      }));
    }
    return day.activities
      .filter((a) => a.lat !== undefined && a.lng !== undefined)
      .sort((a, b) => timeToMin(a.time) - timeToMin(b.time))
      .map((a, i) => ({
        id: a.id, lat: a.lat as number, lng: a.lng as number, label: a.title, color: CATEGORY_META[a.category].color, kind: 'stop', index: i + 1,
      }));
  }, [mode, cityPlaces, day]);

  const route = useMemo(() => {
    if (mode !== 'day') return undefined;
    return day.activities
      .filter((a) => a.lat !== undefined && a.lng !== undefined)
      .sort((a, b) => timeToMin(a.time) - timeToMin(b.time))
      .map((a) => ({ lat: a.lat as number, lng: a.lng as number }));
  }, [mode, day]);

  const walkKm = useMemo(() => (route ? pathKm(route) : 0), [route]);
  const activeCity = mode === 'day' ? day.city : cityId;

  const selectById = (id: string) => {
    if (mode === 'saved') {
      const place = getPlace(id);
      if (place) setSelection({ kind: 'place', place });
    } else {
      const activity = day.activities.find((a) => a.id === id);
      if (activity) setSelection({ kind: 'activity', activity, dayId: day.id });
    }
    setPanelOpen(false);
  };

  const changeDay = (delta: number) => {
    setDayIdx((i) => Math.max(0, Math.min(trip.days.length - 1, i + delta)));
    setSelection(null);
  };

  const panel = (
    <div className="flex h-full w-full flex-col">
      <div className="border-b border-line p-3.5">
        <div className="flex gap-1.5">
          <Chip active={mode === 'day'} onClick={() => { setMode('day'); setSelection(null); }} className="flex-1 justify-center">
            <RouteIcon size={13} /> Day route
          </Chip>
          <Chip active={mode === 'saved'} onClick={() => { setMode('saved'); setSelection(null); }} className="flex-1 justify-center">
            <PinIcon size={13} /> Saved
          </Chip>
        </div>
        {mode === 'day' ? (
          <div className="mt-3 flex items-center gap-1.5">
            <IconBtn label="Previous day" className="h-8 w-8 border border-line" onClick={() => changeDay(-1)} disabled={dayIdx === 0}>
              <ChevronLeftIcon size={14} />
            </IconBtn>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-[13px] font-bold text-ink">Day {dayIdx + 1} · {fmtDate(day.date, 'EEE MMM d')}</p>
              <p className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-fog">{CITIES[day.city].name.toUpperCase()}</p>
            </div>
            <IconBtn label="Next day" className="h-8 w-8 border border-line" onClick={() => changeDay(1)} disabled={dayIdx === trip.days.length - 1}>
              <ChevronRightIcon size={14} />
            </IconBtn>
          </div>
        ) : (
          <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
            {trip.cities.map((c) => (
              <Chip key={c} active={cityId === c} onClick={() => { setCityId(c); setSelection(null); }}>
                {CITIES[c].name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-2.5">
        {mode === 'day' ? (
          day.activities.length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] font-semibold text-fog">No stops this day — add some from the itinerary.</p>
          ) : (
            <ul className="space-y-1">
              {[...day.activities].sort((a, b) => timeToMin(a.time) - timeToMin(b.time)).map((a, i) => {
                const selected = selection?.kind === 'activity' && selection.activity.id === a.id;
                return (
                  <li key={a.id}>
                    <button
                      onClick={() => setSelection({ kind: 'activity', activity: a, dayId: day.id })}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all ${selected ? 'bg-pine text-chalk' : 'hover:bg-mist'}`}
                    >
                      <span className={`tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${selected ? 'bg-persimmon text-bone' : 'bg-mist text-ink'}`}>
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[13px] font-bold ${selected ? 'text-chalk' : 'text-ink'}`}>{a.title}</span>
                        <span className={`tnum font-mono text-[10px] font-bold tracking-wider ${selected ? 'text-fern' : 'text-fog'}`}>{a.time} · {durationLabel(a.durationMin)}</span>
                      </span>
                      {a.lat === undefined && <EyeIcon size={13} className={selected ? 'text-fern' : 'text-fog'} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        ) : cityPlaces.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] font-semibold text-fog">No saved places in {CITIES[cityId].name} yet — find some in Discover.</p>
        ) : (
          <ul className="space-y-1">
            {cityPlaces.map((p) => {
              const selected = selection?.kind === 'place' && selection.place.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => setSelection({ kind: 'place', place: p })}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all ${selected ? 'bg-pine text-chalk' : 'hover:bg-mist'}`}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CATEGORY_META[p.category].color }} />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[13px] font-bold ${selected ? 'text-chalk' : 'text-ink'}`}>{p.name}</span>
                      <span className={`font-mono text-[10px] font-bold tracking-wider ${selected ? 'text-fern' : 'text-fog'}`}>{p.area.toUpperCase()}</span>
                    </span>
                    <span className={`tnum font-mono text-[11px] font-bold ${selected ? 'text-chalk' : 'text-moss'}`}>{p.cost > 0 ? money(p.cost, currency) : 'Free'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-fog">
          {mode === 'day' ? `${day.activities.length} STOPS` : `${cityPlaces.length} PLACES`}
        </span>
        {mode === 'day' && route && route.length > 1 && (
          <span className="tnum font-mono text-[11px] font-bold text-ink">≈ {distLabel(walkKm, unit)} walking</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
      <div className="relative overflow-hidden rounded-xl border border-line bg-mist shadow-card" style={{ height: 'min(72vh, 680px)', minHeight: 480 }}>
        <MapCanvas
          city={activeCity}
          markers={markers}
          selectedId={selection ? (selection.kind === 'place' ? selection.place.id : selection.activity.id) : null}
          onSelect={selectById}
          route={route}
          routeKey={day.id + day.activities.map((a) => a.id).join('')}
        />

        {/* side panel — desktop */}
        <div className="absolute bottom-4 left-4 top-4 hidden w-[300px] overflow-hidden rounded-xl border border-line bg-bone/95 shadow-lift backdrop-blur-md md:block">
          {panel}
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setPanelOpen(true)}
          className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-line bg-bone/95 px-3.5 py-2.5 text-[12.5px] font-bold text-ink shadow-lift backdrop-blur-md md:hidden"
        >
          <LayersIcon size={15} className="text-persimmon" /> {mode === 'day' ? `Day ${dayIdx + 1} · ${day.activities.length} stops` : `${cityPlaces.length} saved`}
        </button>

        {/* selection detail card */}
        {selection && (
          <div className="rise-in absolute bottom-4 right-4 w-[min(340px,calc(100%-2rem))] overflow-hidden rounded-xl border border-line bg-bone shadow-lift">
            {selection.kind === 'place' ? (
              <>
                <div className="relative h-32">
                  <PlaceVisual place={selection.place} className="h-full w-full" />
                  <button onClick={() => setSelection(null)} aria-label="Close details" className="absolute right-2 top-2 rounded-md bg-ink/60 p-1.5 text-chalk backdrop-blur-sm hover:bg-ink">
                    <XIcon size={13} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-[19px] font-semibold leading-tight text-ink">{selection.place.name}</h3>
                    <Rating rating={selection.place.rating} reviews={selection.place.reviews} />
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] font-bold tracking-[0.16em] text-fog">{selection.place.area.toUpperCase()} · {CITIES[selection.place.city].name.toUpperCase()}</p>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-moss">{selection.place.blurb}</p>
                  <div className="mt-3 space-y-1.5 text-[12.5px] font-semibold text-moss">
                    <p className="flex items-center gap-2"><ClockIcon size={13} className="text-fog" /> {selection.place.hours}</p>
                    <p className="flex items-center gap-2"><WalletIcon size={13} className="text-fog" /> {selection.place.cost > 0 ? `${money(selection.place.cost, currency)} / person` : 'Free entry'} · {durationLabel(selection.place.durationMin)}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => setAddingPlace(selection.place)}><PlusIcon size={13} /> Add to itinerary</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-persimmon/40 text-persimmon hover:border-persimmon"
                      onClick={() => {
                        unsavePlace(trip.id, selection.place.id);
                        setSelection(null);
                        push('info', 'Removed from trip', `${selection.place.name} is off the canvas.`);
                      }}
                    >
                      <TrashIcon size={13} /> Remove
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-persimmon">
                      STOP · {fmtDate(trip.days.find((d) => d.id === selection.dayId)?.date ?? day.date, 'EEE MMM d').toUpperCase()}
                    </p>
                    <h3 className="mt-1 font-display text-[19px] font-semibold leading-tight text-ink">{selection.activity.title}</h3>
                  </div>
                  <button onClick={() => setSelection(null)} aria-label="Close details" className="rounded-md p-1.5 text-fog hover:bg-mist hover:text-ink">
                    <XIcon size={14} />
                  </button>
                </div>
                <div className="mt-3 space-y-1.5 text-[12.5px] font-semibold text-moss">
                  <p className="flex items-center gap-2"><ClockIcon size={13} className="text-fog" /> {selection.activity.time} — {minToTime(timeToMin(selection.activity.time) + selection.activity.durationMin)} ({durationLabel(selection.activity.durationMin)})</p>
                  {selection.activity.cost > 0 && <p className="flex items-center gap-2"><WalletIcon size={13} className="text-fog" /> {money(selection.activity.cost, currency)} estimated</p>}
                </div>
                {selection.activity.note && <p className="mt-2.5 text-[12.5px] italic text-moss">"{selection.activity.note}"</p>}
                <div className="mt-4 flex gap-2">
                  <Link to={tabPath(trip.id, 'itinerary')}>
                    <Button size="sm" variant="outline"><CalendarIcon size={13} /> Edit in itinerary</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-persimmon hover:bg-persimmon/10"
                    onClick={() => {
                      deleteActivity(trip.id, selection.dayId, selection.activity.id);
                      setSelection(null);
                      push('info', 'Stop removed from the day');
                    }}
                  >
                    <TrashIcon size={13} /> Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* mobile sheet */}
      {panelOpen && (
        <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true" aria-label="Map list">
          <button className="absolute inset-0 bg-ink/50" onClick={() => setPanelOpen(false)} aria-label="Close list" />
          <div className="rise-in absolute inset-x-0 bottom-0 h-[68vh] overflow-hidden rounded-t-2xl border-t border-line bg-bone shadow-lift">
            <div className="flex justify-center pt-2.5">
              <span className="h-1.5 w-12 rounded-full bg-line" />
            </div>
            <div className="h-[calc(100%-24px)]">{panel}</div>
          </div>
        </div>
      )}

      {addingPlace && (
        <ActivityModal
          open={Boolean(addingPlace)}
          onClose={() => setAddingPlace(null)}
          trip={trip}
          fixedPlace={addingPlace}
          initialDayId={trip.days.find((d) => d.city === addingPlace.city)?.id ?? trip.days[0]?.id}
          onSave={(dayId, activity) => {
            if (addingPlace && !trip.savedPlaceIds.includes(addingPlace.id)) savePlace(trip.id, addingPlace.id);
            addActivity(trip.id, dayId, activity);
            push('success', 'Pinned to the plan', `"${activity.title}" at ${activity.time} on ${fmtDate(trip.days.find((d) => d.id === dayId)?.date ?? day.date)}.`);
            setSelection(null);
          }}
        />
      )}
    </div>
  );
}
