import { useMemo, useState } from 'react';
import type { Place, PlaceCategory, Trip } from '../../types';
import { CITIES, CATEGORY_META } from '../../types';
import { useToast, useTripStore } from '../../store/store';
import { PLACES } from '../../data/places';
import { PlaceCard } from '../../components/cards';
import { ActivityModal } from '../../components/modals';
import { Button, Chip, EmptyState, Input } from '../../components/ui';
import { PinIcon, SearchIcon, XIcon } from '../../components/icons';

export default function Discover({ trip }: { trip: Trip }) {
  const { state, savePlace, unsavePlace, addActivity } = useTripStore();
  const { push } = useToast();
  const currency = state.settings.currency;

  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [adding, setAdding] = useState<Place | null>(null);

  const pool = useMemo(() => PLACES.filter((p) => trip.cities.includes(p.city)), [trip.cities]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((p) => {
      if (city !== 'all' && p.city !== city) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (savedOnly && !trip.savedPlaceIds.includes(p.id)) return false;
      if (q && !`${p.name} ${p.area} ${p.blurb}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [pool, query, city, category, savedOnly, trip.savedPlaceIds]);

  const toggleSave = (p: Place) => {
    if (trip.savedPlaceIds.includes(p.id)) {
      unsavePlace(trip.id, p.id);
      push('info', 'Removed from trip', `${p.name} is off the canvas.`);
    } else {
      savePlace(trip.id, p.id);
      push('success', 'Stamped into the trip', `${p.name} is now on your map.`);
    }
  };

  const filtersActive = query !== '' || city !== 'all' || category !== 'all' || savedOnly;

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] text-persimmon">
            <span className="h-px w-8 bg-persimmon" /> FIELD GUIDE
          </p>
          <h2 className="mt-2.5 font-display text-[32px] font-semibold leading-none tracking-tight text-ink sm:text-[38px]">
            Discover {city === 'all' ? trip.cities.map((c) => CITIES[c].name).join(' · ') : CITIES[city as keyof typeof CITIES].name}
          </h2>
          <p className="mt-2 text-[13.5px] text-moss">
            {results.length} of {pool.length} places · saved ones jump straight onto your map.
          </p>
        </div>
        <div className="relative w-full sm:w-[300px]">
          <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fog" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search trattorias, domes, alleys…" className="pl-10" aria-label="Search places" />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-fog hover:text-ink">
              <XIcon size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          <Chip active={city === 'all'} onClick={() => setCity('all')}>All cities</Chip>
          {trip.cities.map((c) => (
            <Chip key={c} active={city === c} onClick={() => setCity(c)}>{CITIES[c].name}</Chip>
          ))}
        </div>
        <span className="hidden h-5 w-px bg-line sm:block" />
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>Everything</Chip>
          {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_META[c].color }} />
              {CATEGORY_META[c].label}
            </Chip>
          ))}
        </div>
        <span className="hidden h-5 w-px bg-line sm:block" />
        <Chip active={savedOnly} onClick={() => setSavedOnly((v) => !v)}>
          <PinIcon size={12} /> Saved only
        </Chip>
      </div>

      <div className="mt-7">
        {results.length === 0 ? (
          <EmptyState
            icon={<SearchIcon size={22} />}
            title="Nothing on this bearing"
            desc="No places match that combination of filters. Loosen the search and the city will reappear."
            action={
              filtersActive ? (
                <Button variant="outline" onClick={() => { setQuery(''); setCity('all'); setCategory('all'); setSavedOnly(false); }}>
                  <XIcon size={14} /> Clear all filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p) => (
              <PlaceCard
                key={p.id}
                place={p}
                currency={currency}
                saved={trip.savedPlaceIds.includes(p.id)}
                onToggleSave={() => toggleSave(p)}
                onAdd={() => setAdding(p)}
              />
            ))}
          </div>
        )}
      </div>

      {adding && (
        <ActivityModal
          open={Boolean(adding)}
          onClose={() => setAdding(null)}
          trip={trip}
          fixedPlace={adding}
          initialDayId={trip.days.find((d) => d.city === adding.city)?.id ?? trip.days[0]?.id}
          onSave={(dayId, activity) => {
            if (!trip.savedPlaceIds.includes(adding.id)) savePlace(trip.id, adding.id);
            addActivity(trip.id, dayId, activity);
            push('success', 'Added to the plan', `"${activity.title}" at ${activity.time}.`);
            setAdding(null);
          }}
        />
      )}
    </div>
  );
}
