import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CITIES, STATUS_META } from '../../types';
import { useTripStore } from '../../store/store';
import { daysInclusive, fmtRange } from '../../lib/format';
import { AppShell } from '../../components/AppShell';
import { Badge } from '../../components/ui';
import { ArrowRightIcon, CalendarIcon, CameraIcon, CompassIcon, MapIcon, PinIcon, RouteIcon, WalletIcon } from '../../components/icons';
import Overview from './Overview';
import Itinerary from './Itinerary';
import MapView from './MapView';
import Discover from './Discover';
import BuildDay from './BuildDay';
import Budget from './Budget';
import Memories from './Memories';

export type TabId = 'overview' | 'itinerary' | 'map' | 'discover' | 'buildday' | 'budget' | 'memories';

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <CompassIcon size={15} /> },
  { id: 'itinerary', label: 'Itinerary', icon: <CalendarIcon size={15} /> },
  { id: 'map', label: 'Map', icon: <MapIcon size={15} /> },
  { id: 'discover', label: 'Discover', icon: <PinIcon size={15} /> },
  { id: 'buildday', label: 'Build my day', icon: <RouteIcon size={15} /> },
  { id: 'budget', label: 'Budget', icon: <WalletIcon size={15} /> },
  { id: 'memories', label: 'Memories', icon: <CameraIcon size={15} /> },
];

export default function Workspace() {
  const { tripId, tab } = useParams<{ tripId: string; tab?: string }>();
  const { state } = useTripStore();
  const navigate = useNavigate();
  const trip = state.trips.find((t) => t.id === tripId);
  const activeTab: TabId = (TABS.some((t) => t.id === tab) ? tab : 'overview') as TabId;

  if (!trip) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[640px] px-4 py-24 text-center">
          <CompassIcon size={40} className="mx-auto text-moss" />
          <h1 className="mt-5 font-display text-[30px] font-semibold text-ink">This trip sailed without you</h1>
          <p className="mt-2 text-[14.5px] text-moss">We can't find that itinerary in your atlas — it may have been deleted.</p>
          <Link to="/trips" className="mt-6 inline-block font-bold text-persimmon hover:text-flame">
            ← Back to your trips
          </Link>
        </div>
      </AppShell>
    );
  }

  const status = STATUS_META[trip.status];

  return (
    <AppShell
      trail={
        <p className="flex min-w-0 items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em] text-moss">
          <span className="truncate uppercase">{trip.name}</span>
          <span className="text-line">/</span>
          <span className="hidden uppercase text-ink sm:block">{activeTab === 'buildday' ? 'BUILD MY DAY' : activeTab}</span>
        </p>
      }
    >
      {/* trip header band */}
      <div className="relative overflow-hidden border-b border-line bg-deep">
        {trip.cover && (
          <>
            <img src={trip.cover} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/78 to-deep/35" />
          </>
        )}
        <div className="dark-grain absolute inset-0" />
        <div className="relative mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-x-8 gap-y-5 px-4 pb-6 pt-8 sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={status.className}>{status.label}</Badge>
              <p className="font-mono text-[10.5px] font-bold tracking-[0.2em] text-fern">
                {fmtRange(trip.start, trip.end).toUpperCase()} · {daysInclusive(trip.start, trip.end)} DAYS
              </p>
            </div>
            <h1 className="mt-2.5 font-display text-[38px] font-semibold leading-none tracking-tight text-chalk sm:text-[46px]">{trip.name}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[12px] font-bold tracking-[0.16em] text-chalk/85">
              {trip.cities.map((c, i) => (
                <span key={`${c}-${i}`} className="flex items-center gap-2.5">
                  <span className="uppercase">{CITIES[c].name}</span>
                  {i < trip.cities.length - 1 && <ArrowRightIcon size={12} className="text-persimmon" />}
                </span>
              ))}
            </p>
          </div>
          <div className="hidden items-center gap-7 md:flex">
            {[
              [daysInclusive(trip.start, trip.end), 'DAYS'],
              [trip.cities.length, 'CITIES'],
              [trip.savedPlaceIds.length, 'PLACES'],
              [trip.days.reduce((s, d) => s + d.activities.length, 0), 'MOMENTS'],
            ].map(([v, l]) => (
              <div key={l as string} className="text-right">
                <p className="tnum font-display text-[26px] font-semibold leading-none text-chalk">{v}</p>
                <p className="mt-1 font-mono text-[9.5px] font-bold tracking-[0.2em] text-fern">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* tab bar */}
      <nav className="sticky top-16 z-40 border-b border-line bg-chalk/95 backdrop-blur-md" aria-label="Trip sections">
        <div className="no-scrollbar mx-auto flex max-w-[1320px] gap-1 overflow-x-auto px-4 sm:px-6" role="tablist">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => navigate(`/trip/${trip.id}/${t.id}`)}
                className={`relative flex shrink-0 items-center gap-2 px-3.5 py-3.5 text-[13px] font-bold transition-colors ${
                  active ? 'text-persimmon' : 'text-moss hover:text-ink'
                }`}
              >
                {t.icon}
                {t.label}
                <span
                  className={`absolute inset-x-2.5 bottom-0 h-[2.5px] rounded-t-full bg-persimmon transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
                />
              </button>
            );
          })}
        </div>
      </nav>

      <div key={activeTab} className="rise-in">
        {activeTab === 'overview' && <Overview trip={trip} />}
        {activeTab === 'itinerary' && <Itinerary trip={trip} />}
        {activeTab === 'map' && <MapView trip={trip} />}
        {activeTab === 'discover' && <Discover trip={trip} />}
        {activeTab === 'buildday' && <BuildDay trip={trip} />}
        {activeTab === 'budget' && <Budget trip={trip} />}
        {activeTab === 'memories' && <Memories trip={trip} />}
      </div>
    </AppShell>
  );
}

export function tabPath(tripId: string, tab: TabId): string {
  return `/trip/${tripId}/${tab}`;
}
