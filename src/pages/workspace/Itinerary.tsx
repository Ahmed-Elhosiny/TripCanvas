import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, closestCenter, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Activity, Trip } from '../../types';
import { CITIES, CATEGORY_META } from '../../types';
import { useToast, useTripStore } from '../../store/store';
import { distLabel, durationLabel, fmtDate, fmtDateFull, minToTime, money, timeToMin } from '../../lib/format';
import { pathKm } from '../../lib/geo';
import { MapCanvas } from '../../components/MapCanvas';
import type { MapMarker } from '../../components/MapCanvas';
import { ActivityModal } from '../../components/modals';
import { Badge, Button, Dropdown, EmptyState, IconBtn, Tip } from '../../components/ui';
import { CalendarIcon, CategoryIcon, ChevronRightIcon, ClockIcon, GripIcon, MapIcon, NoteIcon, PencilIcon, PinIcon, PlusIcon, SparkIcon, TrashIcon } from '../../components/icons';
import { tabPath } from './Workspace';

/* ---------------- helpers ---------------- */

function computeDropTime(acts: Activity[], movedId: string): string | null {
  const idx = acts.findIndex((a) => a.id === movedId);
  if (idx === -1) return null;
  const prev = acts[idx - 1];
  const next = acts[idx + 1];
  let t: number;
  if (prev && next) t = (timeToMin(prev.time) + prev.durationMin + timeToMin(next.time)) / 2;
  else if (prev) t = timeToMin(prev.time) + prev.durationMin + 45;
  else if (next) t = Math.max(6 * 60, timeToMin(next.time) - 90);
  else return null;
  t = Math.round(t / 5) * 5;
  return minToTime(Math.max(0, Math.min(23 * 60 + 55, t)));
}

/* ---------------- activity row ---------------- */

function ActivityRow({
  activity,
  index,
  currency,
  highlight,
  onEdit,
  onMove,
  onDelete,
  onHover,
  grip,
  days,
  currentDayId,
}: {
  activity: Activity;
  index: number;
  currency: 'EUR' | 'USD' | 'GBP';
  highlight: boolean;
  onEdit: () => void;
  onMove: (toDayId: string) => void;
  onDelete: () => void;
  onHover: (on: boolean) => void;
  grip?: Record<string, unknown>;
  days: Trip['days'];
  currentDayId: string;
}) {
  const meta = CATEGORY_META[activity.category];
  return (
    <div className="group relative flex gap-3.5 sm:gap-4" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      {/* timeline spine */}
      <div className="flex w-[52px] shrink-0 flex-col items-end pt-3.5 sm:w-[60px]">
        <span className="tnum font-mono text-[12.5px] font-bold text-persimmon">{activity.time}</span>
        <span className="mt-1 font-mono text-[9px] font-bold tracking-wider text-fog">+{durationLabel(activity.durationMin)}</span>
      </div>
      <div className="relative flex flex-col items-center">
        <span className="z-10 mt-4 h-3 w-3 rounded-full border-[3px] bg-chalk" style={{ borderColor: meta.color }} />
        <span className="w-px flex-1 bg-line group-last:hidden" />
      </div>
      <div
        className={`mb-3 min-w-0 flex-1 rounded-xl border bg-bone p-3.5 transition-all duration-200 sm:p-4 ${
          highlight ? 'border-persimmon/60 shadow-lift -translate-y-0.5' : 'border-line shadow-card group-hover:border-ink/20'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <button
            className="mt-0.5 -ml-1 cursor-grab touch-none text-fog/70 transition-colors hover:text-ink active:cursor-grabbing"
            aria-label={`Drag ${activity.title}`}
            {...(grip ?? {})}
          >
            <GripIcon size={16} />
          </button>
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${meta.color}22`, color: meta.color }}>
            <CategoryIcon category={activity.category} size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2.5">
              <h4 className="truncate font-display text-[16.5px] font-semibold leading-snug text-ink">{activity.title}</h4>
              <span className="tnum ml-auto shrink-0 font-mono text-[12px] font-bold text-moss">{activity.cost > 0 ? money(activity.cost, currency) : '—'}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-semibold text-fog">
              <Badge className="px-1.5 py-0" >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                <span style={{ color: meta.color }}>{meta.label}</span>
              </Badge>
              {activity.placeId && (
                <span className="flex items-center gap-1"><PinIcon size={11} /> on map</span>
              )}
              <span className="flex items-center gap-1"><ClockIcon size={11} /> until {minToTime(timeToMin(activity.time) + activity.durationMin)}</span>
            </div>
            {activity.note && (
              <p className="mt-2 flex items-start gap-1.5 text-[12.5px] italic leading-snug text-moss">
                <NoteIcon size={13} className="mt-0.5 shrink-0 text-fog" /> {activity.note}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
            <Tip label="Edit">
              <IconBtn label="Edit activity" className="h-8 w-8" onClick={onEdit}>
                <PencilIcon size={14} />
              </IconBtn>
            </Tip>
            <Dropdown
              label={`More options for ${activity.title}`}
              button={
                <IconBtn label="Move or delete" className="h-8 w-8">
                  <ChevronRightIcon size={14} />
                </IconBtn>
              }
              items={[
                ...days
                  .filter((d) => d.id !== currentDayId)
                  .map((d) => ({
                    label: `Move to ${fmtDate(d.date, 'EEE MMM d')}`,
                    icon: <CalendarIcon size={14} />,
                    onClick: () => onMove(d.id),
                  })),
                { label: 'Delete', icon: <TrashIcon size={14} />, danger: true, onClick: onDelete },
              ]}
            />
          </div>
        </div>
      </div>
      {/* index chip */}
      <span className="sr-only">Stop {index + 1}</span>
    </div>
  );
}

/* ---------------- sortable wrapper ---------------- */

function SortableActivityRow(props: Omit<Parameters<typeof ActivityRow>[0], 'grip'> & { sortableId: string }) {
  const { sortableId, ...rest } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortableId });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? 'relative z-30 opacity-40' : ''}>
      <ActivityRow {...rest} grip={{ ...attributes, ...listeners }} />
    </li>
  );
}

/* ---------------- day rail item (drop target) ---------------- */

function DayRailButton({
  day,
  index,
  active,
  onClick,
}: {
  day: Trip['days'][number];
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `day:${day.id}` });
  const cost = day.activities.reduce((s, a) => s + a.cost, 0);
  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      aria-current={active}
      className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ${
        isOver
          ? 'border-persimmon bg-persimmon/10'
          : active
            ? 'border-pine bg-pine text-chalk shadow-[0_10px_24px_-12px_rgba(28,56,48,0.8)]'
            : 'border-line bg-bone hover:border-ink/25 hover:shadow-pop'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg font-mono leading-none ${active ? 'bg-chalk/15 text-chalk' : 'bg-mist/70 text-ink'}`}>
        <span className="text-[13px] font-bold">{fmtDate(day.date, 'd')}</span>
        <span className={`text-[8px] font-bold tracking-wider ${active ? 'text-fern' : 'text-fog'}`}>{fmtDate(day.date, 'MMM').toUpperCase()}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[13px] font-bold ${active ? 'text-chalk' : 'text-ink'}`}>{fmtDate(day.date, 'EEE')} · {CITIES[day.city].name}</span>
        <span className={`tnum block font-mono text-[10px] font-bold tracking-wider ${active ? 'text-fern' : 'text-fog'}`}>
          {day.activities.length} STOPS{cost > 0 ? ` · ${cost}€` : ''}
        </span>
      </span>
      {day.activities.length > 0 && (
        <span className={`h-2 w-2 shrink-0 rounded-full ${active ? 'bg-persimmon' : 'bg-line group-hover:bg-persimmon/60'}`} />
      )}
    </button>
  );
}

/* ---------------- page ---------------- */

export default function Itinerary({ trip }: { trip: Trip }) {
  const { state, moveActivity, deleteActivity, addActivity, updateActivity } = useTripStore();
  const { push } = useToast();
  const currency = state.settings.currency;

  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredAct, setHoveredAct] = useState<string | null>(null);
  const [dragTitle, setDragTitle] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; activity?: Activity }>({ open: false });

  const day = trip.days[Math.min(activeIdx, trip.days.length - 1)];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const sorted = useMemo(() => [...day.activities].sort((a, b) => timeToMin(a.time) - timeToMin(b.time)), [day.activities]);
  const dayCost = sorted.reduce((s, a) => s + a.cost, 0);
  const dayMinutes = sorted.reduce((s, a) => s + a.durationMin, 0);

  const routeCoords = useMemo(() => sorted.filter((a) => a.lat !== undefined && a.lng !== undefined), [sorted]);

  const markers: MapMarker[] = useMemo(
    () =>
      sorted
        .filter((a) => a.lat !== undefined && a.lng !== undefined)
        .map((a, i) => ({
          id: a.id,
          lat: a.lat as number,
          lng: a.lng as number,
          label: a.title,
          color: CATEGORY_META[a.category].color,
          kind: 'stop',
          index: i + 1,
        })),
    [sorted],
  );

  const walkKm = useMemo(
    () => pathKm(routeCoords.map((a) => ({ lat: a.lat as number, lng: a.lng as number }))),
    [routeCoords],
  );

  const onDragEnd = (e: DragEndEvent) => {
    setDragTitle(null);
    const { active, over } = e;
    if (!over) return;
    const actId = String(active.id).replace('act:', '');
    const overId = String(over.id);

    if (overId.startsWith('day:')) {
      const toDayId = overId.replace('day:', '');
      if (toDayId === day.id) return;
      const toDay = trip.days.find((d) => d.id === toDayId);
      moveActivity(trip.id, actId, day.id, toDayId, toDay?.activities.length ?? 0);
      push('success', 'Moved to another day', `${toDay ? fmtDate(toDay.date, 'EEE MMM d') : ''} — check the rail.`);
      return;
    }

    if (overId.startsWith('act:') && active.id !== over.id) {
      const oldIndex = sorted.findIndex((a) => a.id === actId);
      const newIndex = sorted.findIndex((a) => a.id === overId.replace('act:', ''));
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const next = arrayMove(sorted, oldIndex, newIndex);
      const newTime = computeDropTime(next, actId);
      const moved = next.find((a) => a.id === actId);
      if (moved && newTime) updateActivity(trip.id, day.id, { ...moved, time: newTime });
    }
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setDragTitle(sorted.find((a) => `act:${a.id}` === e.active.id)?.title ?? null)}
        onDragEnd={onDragEnd}
      >
      <div className="grid gap-6 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_330px]">
        {/* day rail */}
        <aside className="lg:sticky lg:top-[126px] lg:self-start">
          <h2 className="mb-3 flex items-center justify-between font-mono text-[10.5px] font-bold tracking-[0.2em] text-fog">
            DAYS
            <span className="rounded bg-mist px-1.5 py-0.5 text-ink">{trip.days.length}</span>
          </h2>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0">
            {trip.days.map((d, i) => (
              <div key={d.id} className="w-[210px] shrink-0 lg:w-full">
                <DayRailButton day={d} index={i} active={i === activeIdx} onClick={() => setActiveIdx(i)} />
              </div>
            ))}
          </div>
          <p className="mt-4 hidden rounded-lg border border-dashed border-line bg-mist/40 p-3 font-mono text-[10px] font-bold leading-relaxed tracking-wider text-fog lg:block">
            TIP — DRAG A CARD ONTO ANOTHER DAY TO MOVE IT
          </p>
        </aside>

        {/* timeline */}
        <section aria-label={`Itinerary for ${fmtDateFull(day.date)}`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10.5px] font-bold tracking-[0.22em] text-persimmon">
                {CITIES[day.city].name.toUpperCase()} · DAY {activeIdx + 1} OF {trip.days.length}
              </p>
              <h2 className="mt-1.5 font-display text-[30px] font-semibold leading-none tracking-tight text-ink sm:text-[34px]">{fmtDateFull(day.date)}</h2>
              <p className="tnum mt-2.5 font-mono text-[11px] font-bold tracking-[0.14em] text-fog">
                {sorted.length} STOPS · {durationLabel(dayMinutes)} PLANNED · {dayCost > 0 ? money(dayCost, currency) + ' EST.' : 'NO COSTS YET'}
              </p>
            </div>
            <div className="flex gap-2.5">
              <Link to={`${tabPath(trip.id, 'buildday')}?day=${day.id}`}>
                <Button variant="outline" size="md"><SparkIcon size={15} className="text-saffron" /> Build this day</Button>
              </Link>
              <Button onClick={() => setModal({ open: true })}><PlusIcon size={15} /> Add activity</Button>
            </div>
          </div>

          <div className="mt-7">
            {sorted.length === 0 ? (
              <EmptyState
                icon={<CalendarIcon size={22} />}
                title="A blank canvas"
                desc="Nothing planned for this day yet. Add a moment, or let Build my day compose the whole route for you."
                action={
                  <div className="flex flex-wrap justify-center gap-2.5">
                    <Button onClick={() => setModal({ open: true })}><PlusIcon size={14} /> Add activity</Button>
                    <Link to={tabPath(trip.id, 'discover')}>
                      <Button variant="outline"><PinIcon size={14} /> Pull from Discover</Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <>
                <SortableContext items={sorted.map((a) => `act:${a.id}`)} strategy={verticalListSortingStrategy}>
                  <ol>
                    {sorted.map((a, i) => (
                      <SortableActivityRow
                        key={a.id}
                        sortableId={`act:${a.id}`}
                        activity={a}
                        index={i}
                        currency={currency}
                        highlight={hoveredAct === a.id}
                        days={trip.days}
                        currentDayId={day.id}
                        onEdit={() => setModal({ open: true, activity: a })}
                        onMove={(toDayId) => {
                          const toDay = trip.days.find((d) => d.id === toDayId);
                          moveActivity(trip.id, a.id, day.id, toDayId, toDay?.activities.length ?? 0);
                          push('success', `Moved to ${toDay ? fmtDate(toDay.date, 'EEE MMM d') : 'another day'}`);
                        }}
                        onDelete={() => {
                          deleteActivity(trip.id, day.id, a.id);
                          push('info', 'Activity removed', `"${a.title}" is off the plan.`);
                        }}
                        onHover={(on) => setHoveredAct(on ? a.id : null)}
                      />
                    ))}
                  </ol>
                </SortableContext>
                <DragOverlay>
                  {dragTitle && (
                    <div className="rounded-xl border-2 border-persimmon bg-bone px-4 py-3 font-display text-[15px] font-semibold text-ink shadow-lift">
                      {dragTitle}
                    </div>
                  )}
                </DragOverlay>
              </>
            )}
          </div>
        </section>

        {/* live day map */}
        <aside className="hidden xl:block">
          <div className="sticky top-[126px]">
            <div className="overflow-hidden rounded-xl border border-line bg-bone shadow-card">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h3 className="font-mono text-[10.5px] font-bold tracking-[0.2em] text-fog">DAY ON THE MAP</h3>
                <Link to={tabPath(trip.id, 'map')} className="flex items-center gap-1 text-[11.5px] font-bold text-pine hover:text-persimmon">
                  <MapIcon size={13} /> Expand
                </Link>
              </div>
              <div className="h-[300px]">
                {markers.length > 0 ? (
                  <MapCanvas city={day.city} markers={markers} selectedId={hoveredAct} route={routeCoords.map((a) => ({ lat: a.lat as number, lng: a.lng as number }))} routeKey={day.id + sorted.map((a) => a.id).join('')} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 bg-mist/40 text-center">
                    <MapIcon size={26} className="text-fog" />
                    <p className="max-w-[22ch] text-[12.5px] font-semibold text-fog">Stops with coordinates appear here as a route.</p>
                  </div>
                )}
              </div>
              {markers.length > 1 && (
                <div className="flex items-center justify-between border-t border-line px-4 py-3">
                  <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-fog">WALKING EST.</span>
                  <span className="tnum font-mono text-[12px] font-bold text-ink">{distLabel(walkKm, state.settings.unit)}</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
      </DndContext>

      <ActivityModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        trip={trip}
        initialDayId={day.id}
        activity={modal.activity}
        onSave={(dayId, activity) => {
          if (modal.activity) {
            if (dayId === day.id) {
              updateActivity(trip.id, dayId, activity);
              push('success', 'Activity updated', `"${activity.title}" — saved.`);
            } else {
              deleteActivity(trip.id, day.id, activity.id);
              addActivity(trip.id, dayId, activity);
              push('success', 'Activity moved & updated', `Now on ${fmtDate(dayId === day.id ? day.date : trip.days.find((d) => d.id === dayId)?.date ?? day.date)}.`);
            }
          } else {
            addActivity(trip.id, dayId, activity);
            push('success', 'Added to the plan', `"${activity.title}" at ${activity.time}.`);
          }
        }}
      />
    </div>
  );
}
