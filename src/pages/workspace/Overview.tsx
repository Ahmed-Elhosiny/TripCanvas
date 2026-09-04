import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Trip } from '../../types';
import { CITIES, EXPENSE_META } from '../../types';
import type { ExpenseCategory } from '../../types';
import { useToast, useTripStore } from '../../store/store';
import { tripPlanned, tripSpent } from '../../store/store';
import { daysInclusive, money } from '../../lib/format';
import { getPlace } from '../../data/places';
import { DaySpark } from '../../components/charts';
import { ProgressBar, Reveal, Stat } from '../../components/ui';
import { ArrowRightIcon, CalendarIcon, CameraIcon, PencilIcon, PinIcon, SparkIcon, WalletIcon } from '../../components/icons';
import { tabPath } from './Workspace';
import { CheckIcon, XIcon } from '../../components/icons';

function CityRoute({ trip }: { trip: Trip }) {
  const segs = useMemo(
    () =>
      trip.cities.map((c) => {
        const idxs = trip.days.map((d, i) => (d.city === c ? i : -1)).filter((i) => i >= 0);
        return { city: c, from: (idxs[0] ?? 0) + 1, to: (idxs[idxs.length - 1] ?? 0) + 1 };
      }),
    [trip],
  );

  return (
    <div className="flex items-start gap-0">
      {segs.map((s, i) => (
        <div key={`${s.city}-${i}`} className={`flex items-start ${i < segs.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex w-max flex-col items-center text-center">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-[3px] border-persimmon bg-chalk shadow-pop" />
            <p className="mt-2.5 font-display text-[17px] font-semibold leading-none text-ink">{CITIES[s.city].name}</p>
            <p className="mt-1.5 font-mono text-[9.5px] font-bold tracking-[0.18em] text-fog">
              DAY {s.from}
              {s.to !== s.from ? `–${s.to}` : ''}
            </p>
          </div>
          {i < segs.length - 1 && (
            <div className="relative mx-3 mt-[5px] h-[3px] flex-1 overflow-hidden rounded-full bg-mist">
              <span className="absolute inset-0 bg-line" style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--color-persimmon) 0 7px, transparent 7px 14px)' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Overview({ trip }: { trip: Trip }) {
  const { state, setBudget } = useTripStore();
  const { push } = useToast();
  const navigate = useNavigate();
  const currency = state.settings.currency;

  const spent = tripSpent(trip);
  const planned = tripPlanned(trip);
  const remaining = trip.budget - spent - planned;
  const days = daysInclusive(trip.start, trip.end);

  const counts = useMemo(() => trip.days.map((d) => d.activities.length), [trip.days]);
  const busiest = useMemo(() => counts.indexOf(Math.max(...counts)), [counts]);

  const byCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    trip.expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [trip.expenses]);

  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(String(trip.budget));

  const saveBudget = () => {
    const v = Number(budgetDraft);
    if (!v || v <= 0) return push('error', 'Invalid budget', 'Enter an amount above zero.');
    setBudget(trip.id, v);
    setEditingBudget(false);
    push('success', 'Budget updated', `The canvas now plans against ${money(v, currency)}.`);
  };

  const savedPlaces = trip.savedPlaceIds.map((id) => getPlace(id)).filter((p) => p !== undefined).slice(0, 12);

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* route + plan */}
        <Reveal className="lg:col-span-2">
          <section className="rounded-xl border border-line bg-bone p-6 shadow-card sm:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-[22px] font-semibold text-ink">The route</h2>
              <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-fog">{days} DAYS · {trip.cities.length} CITIES</p>
            </div>
            <div className="mt-7">
              <CityRoute trip={trip} />
            </div>

            <div className="mt-9 border-t border-dashed border-line pt-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-[17px] font-semibold text-ink">Plan at a glance</h3>
                <Link to={tabPath(trip.id, 'itinerary')} className="group flex items-center gap-1.5 text-[12.5px] font-bold text-pine hover:text-persimmon">
                  Open itinerary <ArrowRightIcon size={13} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <p className="mt-1 text-[12.5px] text-fog">
                Day {busiest + 1} is the busiest with {counts[busiest]} stops · {counts.reduce((a, b) => a + b, 0)} moments planned in total
              </p>
              <div className="mt-4">
                <DaySpark counts={counts} activeIndex={busiest} onSelect={() => navigate(tabPath(trip.id, 'itinerary'))} />
              </div>
            </div>
          </section>
        </Reveal>

        {/* budget snapshot */}
        <Reveal delay={100}>
          <section className="flex h-full flex-col rounded-xl border border-line bg-bone p-6 shadow-card sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[22px] font-semibold text-ink">Money</h2>
              <WalletIcon size={19} className="text-teal" />
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              {editingBudget ? (
                <span className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="number"
                    value={budgetDraft}
                    onChange={(e) => setBudgetDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
                    className="tnum w-28 rounded-lg border border-line bg-chalk px-2.5 py-1 font-display text-[24px] font-semibold text-ink outline-none focus:border-pine"
                    aria-label="Total budget"
                  />
                  <button onClick={saveBudget} aria-label="Save budget" className="text-teal hover:text-pine"><CheckIcon size={18} /></button>
                  <button onClick={() => setEditingBudget(false)} aria-label="Cancel" className="text-fog hover:text-ink"><XIcon size={16} /></button>
                </span>
              ) : (
                <>
                  <p className="tnum font-display text-[34px] font-semibold leading-none text-ink">{money(trip.budget, currency)}</p>
                  <button onClick={() => { setBudgetDraft(String(trip.budget)); setEditingBudget(true); }} aria-label="Edit budget" className="text-fog transition-colors hover:text-persimmon">
                    <PencilIcon size={15} />
                  </button>
                </>
              )}
            </div>
            <p className="mt-1 font-mono text-[10px] font-bold tracking-[0.18em] text-fog">TOTAL BUDGET</p>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-[12.5px] font-bold">
                  <span className="text-moss">Spent</span>
                  <span className="tnum font-mono text-ink">{money(spent, currency)}</span>
                </div>
                <ProgressBar value={trip.budget > 0 ? (spent / trip.budget) * 100 : 0} color="var(--color-teal)" className="mt-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-[12.5px] font-bold">
                  <span className="text-moss">Planned (itinerary)</span>
                  <span className="tnum font-mono text-ink">{money(planned, currency)}</span>
                </div>
                <ProgressBar value={trip.budget > 0 ? (planned / trip.budget) * 100 : 0} color="var(--color-saffron)" className="mt-1.5" />
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-chalk p-4">
              <p className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-fog">STILL IN THE PURSE</p>
              <p className={`tnum mt-1 font-display text-[26px] font-semibold leading-none ${remaining < 0 ? 'text-persimmon' : 'text-pine'}`}>
                {money(Math.abs(remaining), currency)}{remaining < 0 ? ' over' : ''}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {byCategory.slice(0, 3).map(([cat, amt]) => (
                <div key={cat} className="flex items-center gap-2 text-[12.5px] font-semibold text-moss">
                  <span className="h-2 w-2 rounded-[3px]" style={{ background: EXPENSE_META[cat].color }} />
                  {EXPENSE_META[cat].label}
                  <span className="tnum ml-auto font-mono text-[11.5px] font-bold text-ink">{money(amt, currency)}</span>
                </div>
              ))}
            </div>

            <Link to={tabPath(trip.id, 'budget')} className="group mt-auto flex items-center justify-center gap-2 pt-6 text-[13px] font-bold text-pine hover:text-persimmon">
              Open the ledger <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>
        </Reveal>
      </div>

      {/* saved places + quick actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <section className="rounded-xl border border-line bg-bone p-6 shadow-card sm:p-7">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[22px] font-semibold text-ink">Saved for this trip</h2>
              <Link to={tabPath(trip.id, 'discover')} className="group flex items-center gap-1.5 text-[12.5px] font-bold text-pine hover:text-persimmon">
                <PinIcon size={13} /> Discover more <ArrowRightIcon size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            {savedPlaces.length === 0 ? (
              <p className="mt-4 text-[13.5px] text-moss">Nothing saved yet — the field guide is waiting in Discover.</p>
            ) : (
              <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto pb-1">
                {savedPlaces.map((p) => (
                  <Link
                    key={p.id}
                    to={tabPath(trip.id, 'map')}
                    className="group w-[136px] shrink-0 overflow-hidden rounded-lg border border-line bg-chalk transition-all duration-300 hover:-translate-y-1 hover:shadow-pop"
                  >
                    <div className="h-20 overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-pine font-mono text-[9px] font-bold tracking-widest text-fern">{CITIES[p.city].name.toUpperCase()}</div>
                      )}
                    </div>
                    <p className="truncate px-2.5 py-2 text-[12px] font-bold text-ink">{p.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={100}>
          <section className="flex h-full flex-col rounded-xl border border-line bg-bone p-6 shadow-card sm:p-7">
            <h2 className="font-display text-[22px] font-semibold text-ink">Quick moves</h2>
            <div className="mt-5 grid flex-1 grid-cols-2 gap-3">
              {[
                { label: 'Add to plan', icon: <CalendarIcon size={17} />, to: 'itinerary' as const, tint: 'text-persimmon' },
                { label: 'Build my day', icon: <SparkIcon size={17} />, to: 'buildday' as const, tint: 'text-saffron' },
                { label: 'Log expense', icon: <WalletIcon size={17} />, to: 'budget' as const, tint: 'text-teal' },
                { label: 'Pin memory', icon: <CameraIcon size={17} />, to: 'memories' as const, tint: 'text-plum' },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={tabPath(trip.id, a.to)}
                  className="flex flex-col items-start justify-between gap-4 rounded-lg border border-line bg-chalk p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-pop"
                >
                  <span className={a.tint}>{a.icon}</span>
                  <span className="text-[13px] font-bold text-ink">{a.label}</span>
                </Link>
              ))}
            </div>
            {trip.memories.length > 0 && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-chalk p-3">
                <Stat value={trip.memories.length} label="Memories pinned" />
                <Link to={tabPath(trip.id, 'memories')} className="ml-auto text-pine hover:text-persimmon"><ArrowRightIcon size={16} /></Link>
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </div>
  );
}
