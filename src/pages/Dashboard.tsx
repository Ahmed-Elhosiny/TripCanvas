import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Trip } from '../types';
import { CITIES, STATUS_META } from '../types';
import { useToast, useTripStore } from '../store/store';
import { tripSpent } from '../store/store';
import { daysInclusive, fmtRange, money } from '../lib/format';
import { AppShell } from '../components/AppShell';
import { Badge, Button, EmptyState, ProgressBar, Reveal, Stat } from '../components/ui';
import { CreateTripModal } from '../components/modals';
import { ArrowRightIcon, CalendarIcon, CompassIcon, PinIcon, PlusIcon, WalletIcon } from '../components/icons';
import { useI18n } from '../i18n/translations';

function RouteLine({ cities }: { cities: Trip['cities'] }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] font-bold tracking-[0.14em] text-moss">
      {cities.map((c, i) => (
        <span key={`${c}-${i}`} className="flex items-center gap-2">
          <span className="uppercase text-ink">{CITIES[c].name}</span>
          {i < cities.length - 1 && <ArrowRightIcon size={11} className="text-persimmon" />}
        </span>
      ))}
    </p>
  );
}

function TripCard({ trip, currency, delay }: { trip: Trip; currency: import('../types').Currency; delay: number }) {
  const days = daysInclusive(trip.start, trip.end);
  const spent = tripSpent(trip);
  const pct = trip.budget > 0 ? (spent / trip.budget) * 100 : 0;
  const status = STATUS_META[trip.status];

  return (
    <Reveal delay={delay}>
      <Link
        to={`/trip/${trip.id}/overview`}
        className="group block overflow-hidden rounded-xl border border-line bg-bone shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
      >
        <div className="relative h-48 overflow-hidden">
          {trip.cover ? (
            <img src={trip.cover} alt={trip.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
          ) : (
            <div className="flex h-full items-center justify-center bg-pine">
              <CompassIcon size={44} className="text-fern" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <Badge className={`absolute left-3 top-3 ${status.className}`}>{status.label}</Badge>
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-3">
            <h3 className="font-display text-[24px] font-semibold leading-none text-chalk drop-shadow">{trip.name}</h3>
            <span className="tnum shrink-0 font-mono text-[10.5px] font-bold tracking-wider text-chalk/90">{days} DAYS</span>
          </div>
        </div>
        <div className="p-5">
          <RouteLine cities={trip.cities} />
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-fog">
            <CalendarIcon size={13} /> {fmtRange(trip.start, trip.end)}
          </p>
          <div className="mt-4 flex items-center gap-4 border-t border-line/70 pt-3.5">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-moss">
              <PinIcon size={13} className="text-persimmon" />
              <span className="tnum">{trip.savedPlaceIds.length}</span> places
            </span>
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-moss">
              <WalletIcon size={13} className="text-teal" />
              <span className="tnum">
                {money(spent, currency)} / {money(trip.budget, currency)}
              </span>
            </span>
            <span className="ml-auto font-mono text-[10px] font-bold tracking-[0.16em] text-persimmon opacity-0 transition-all duration-300 group-hover:opacity-100">
              OPEN →
            </span>
          </div>
          <ProgressBar value={pct} color={pct > 92 ? 'var(--color-persimmon)' : 'var(--color-teal)'} className="mt-3" />
        </div>
      </Link>
    </Reveal>
  );
}

export default function Dashboard() {
  const { state, createTrip } = useTripStore();
  const { push } = useToast();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const currency = state.settings.currency;

  const [featured, ...rest] = state.trips;

  const totals = useMemo(
    () => ({
      places: state.trips.reduce((s, t) => s + t.savedPlaceIds.length, 0),
      activities: state.trips.reduce((s, t) => s + t.days.reduce((a, d) => a + d.activities.length, 0), 0),
    }),
    [state.trips],
  );

  return (
    <AppShell
      trail={
        <p className="truncate font-mono text-[11px] font-bold tracking-[0.2em] text-moss">
          YOUR ATLAS <span className="text-line">/</span> <span className="text-ink">{state.trips.length} TRIPS</span>
        </p>
      }
    >
      <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] text-persimmon">
              <span className="h-px w-8 bg-persimmon" /> THE COLLECTION
            </p>
            <h1 className="mt-3 font-display text-[40px] font-semibold leading-none tracking-tight text-ink sm:text-[52px]">Your Atlas</h1>
            <p className="mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-moss">
              Every journey on one shelf — {totals.places} saved places and {totals.activities} planned moments across {state.trips.length} trips.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex gap-6 sm:gap-8">
              <Stat value={state.trips.length} label="Trips" />
              <Stat value={totals.places} label="Places" />
              <Stat value={totals.activities} label="Moments" />
            </div>
          </Reveal>
        </div>

        {state.trips.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon={<CompassIcon size={24} />}
              title="No trips yet"
              desc="Your atlas is empty — a blank canvas waiting for coordinates. Plot your first journey."
              action={<Button onClick={() => setCreating(true)}><PlusIcon size={15} /> Create a trip</Button>}
            />
          </div>
        ) : (
          <>
            {/* featured trip */}
            {featured && (
              <Reveal className="mt-10">
                <div
                  role="link"
                  tabIndex={0}
                  aria-label={`Open ${featured.name} workspace`}
                  onClick={() => navigate(`/trip/${featured.id}/overview`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/trip/${featured.id}/overview`)}
                  className="group grid cursor-pointer overflow-hidden rounded-2xl border border-line bg-bone shadow-card transition-all duration-300 hover:shadow-lift lg:grid-cols-12"
                >
                  <div className="relative h-64 overflow-hidden lg:col-span-7 lg:h-auto">
                    {featured.cover && <img src={featured.cover} alt={featured.name} className="kb absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent lg:bg-gradient-to-r" />
                    <Badge className={`absolute left-4 top-4 ${STATUS_META[featured.status].className}`}>{STATUS_META[featured.status].label}</Badge>
                    <div className="absolute bottom-4 left-4 lg:hidden">
                      <h2 className="font-display text-[32px] font-semibold text-chalk">{featured.name}</h2>
                    </div>
                  </div>
                  <div className="flex flex-col p-6 sm:p-8 lg:col-span-5">
                    <p className="font-mono text-[10.5px] font-bold tracking-[0.22em] text-persimmon">LATEST EXPEDITION</p>
                    <h2 className="mt-2 hidden font-display text-[38px] font-semibold leading-none tracking-tight text-ink lg:block">{featured.name}</h2>
                    <div className="mt-3">
                      <RouteLine cities={featured.cities} />
                      <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-fog">
                        <CalendarIcon size={14} /> {fmtRange(featured.start, featured.end)}
                      </p>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                      <Stat value={daysInclusive(featured.start, featured.end)} label="Days" />
                      <Stat value={featured.cities.length} label="Cities" />
                      <Stat value={featured.savedPlaceIds.length} label="Places" />
                      <Stat value={money(featured.budget, currency)} label="Budget" accent />
                    </div>
                    <div className="mt-auto pt-7">
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-[10.5px] font-bold tracking-[0.16em] text-fog">BUDGET USED</span>
                        <span className="tnum font-mono text-[11.5px] font-bold text-ink">
                          {money(tripSpent(featured), currency)} <span className="text-fog">/ {money(featured.budget, currency)}</span>
                        </span>
                      </div>
                      <ProgressBar
                        value={featured.budget > 0 ? (tripSpent(featured) / featured.budget) * 100 : 0}
                        className="mt-2"
                        color="var(--color-teal)"
                      />
                      <div className="mt-6 flex flex-wrap gap-2.5">
                        <Button size="sm">Open workspace <ArrowRightIcon size={13} /></Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/trip/${featured.id}/itinerary`); }}>
                          Itinerary
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/trip/${featured.id}/map`); }}>
                          Map
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            )}

            {/* the rest + create tile */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {rest.map((t, i) => (
                <TripCard key={t.id} trip={t} currency={currency} delay={i * 90} />
              ))}
              <Reveal delay={rest.length * 90}>
                <button
                  onClick={() => setCreating(true)}
                  className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-line bg-mist/30 p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-persimmon/50 hover:bg-persimmon/5"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-bone text-persimmon shadow-pop">
                    <PlusIcon size={22} />
                  </span>
                  <span>
                    <span className="block font-display text-[21px] font-semibold text-ink">Plot something new</span>
                    <span className="mt-1 block text-[13px] font-medium text-moss">A weekend, a month, a maybe-someday.</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-persimmon">NEW TRIP →</span>
                </button>
              </Reveal>
            </div>
          </>
        )}
      </div>

      <CreateTripModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(input) => {
          const created = createTrip(input);
          push('success', `"${created.name}" is on the map`, `${daysInclusive(created.start, created.end)} blank days, ready for plans.`);
          navigate(`/trip/${created.id}/overview`);
        }}
      />
    </AppShell>
  );
}
