import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import type { Activity, AppState, Day, Expense, Memory, Settings, Trip } from '../types';
import { buildSeedState } from '../data/seed';
import { rangeIso, uid } from '../lib/format';

const STORAGE_KEY = 'tripcanvas:v1';

/* ------------------------------------------------------------------ */
/*  Trip store                                                         */
/* ------------------------------------------------------------------ */

type MutateAction = { mutate: (state: AppState) => AppState };

function reducer(state: AppState, action: MutateAction): AppState {
  return action.mutate(state);
}

function loadInitial(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.trips) && parsed.settings) return parsed;
    }
  } catch {
    /* corrupted storage — fall back to seed */
  }
  return buildSeedState();
}

function patchTrip(state: AppState, tripId: string, fn: (trip: Trip) => Trip): AppState {
  return { ...state, trips: state.trips.map((t) => (t.id === tripId ? fn(t) : t)) };
}

function patchDay(trip: Trip, dayId: string, fn: (day: Day) => Day): Trip {
  return { ...trip, days: trip.days.map((d) => (d.id === dayId ? fn(d) : d)) };
}

export interface TripInput {
  name: string;
  cover?: string;
  start: string;
  end: string;
  cities: Trip['cities'];
  budget: number;
}

interface StoreValue {
  state: AppState;
  createTrip: (input: TripInput) => Trip;
  deleteTrip: (tripId: string) => void;
  savePlace: (tripId: string, placeId: string) => void;
  unsavePlace: (tripId: string, placeId: string) => void;
  addActivity: (tripId: string, dayId: string, activity: Activity) => void;
  updateActivity: (tripId: string, dayId: string, activity: Activity) => void;
  deleteActivity: (tripId: string, dayId: string, activityId: string) => void;
  moveActivity: (tripId: string, activityId: string, fromDayId: string, toDayId: string, toIndex: number) => void;
  reorderActivity: (tripId: string, dayId: string, from: number, to: number) => void;
  setDayActivities: (tripId: string, dayId: string, activities: Activity[]) => void;
  addExpense: (tripId: string, item: Expense) => void;
  updateExpense: (tripId: string, item: Expense) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  setBudget: (tripId: string, amount: number) => void;
  addMemory: (tripId: string, memory: Memory) => void;
  deleteMemory: (tripId: string, memoryId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — non-fatal */
    }
  }, [state]);

  const createTrip = useCallback((input: TripInput): Trip => {
    const cities = input.cities.length > 0 ? input.cities : (['rome'] as Trip['cities']);
    const dates = rangeIso(input.start, input.end);
    const per = Math.floor(dates.length / cities.length);
    const days: Day[] = dates.map((date, i) => ({
      id: uid('day'),
      date,
      city: cities[Math.min(cities.length - 1, Math.floor(i / Math.max(1, per)))],
      activities: [],
    }));
    const trip: Trip = {
      id: uid('trip'),
      name: input.name,
      cover: input.cover,
      start: input.start,
      end: input.end,
      cities,
      budget: input.budget,
      status: 'draft',
      savedPlaceIds: [],
      days,
      expenses: [],
      memories: [],
    };
    dispatch({ mutate: (s) => ({ ...s, trips: [trip, ...s.trips] }) });
    return trip;
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      createTrip,
      deleteTrip: (tripId) => dispatch({ mutate: (s) => ({ ...s, trips: s.trips.filter((t) => t.id !== tripId) }) }),
      savePlace: (tripId, placeId) =>
        dispatch({
          mutate: (s) =>
            patchTrip(s, tripId, (t) =>
              t.savedPlaceIds.includes(placeId) ? t : { ...t, savedPlaceIds: [...t.savedPlaceIds, placeId] },
            ),
        }),
      unsavePlace: (tripId, placeId) =>
        dispatch({ mutate: (s) => patchTrip(s, tripId, (t) => ({ ...t, savedPlaceIds: t.savedPlaceIds.filter((p) => p !== placeId) })) }),
      addActivity: (tripId, dayId, activity) =>
        dispatch({ mutate: (s) => patchTrip(s, tripId, (t) => patchDay(t, dayId, (d) => ({ ...d, activities: [...d.activities, activity] }))) }),
      updateActivity: (tripId, dayId, activity) =>
        dispatch({
          mutate: (s) =>
            patchTrip(s, tripId, (t) =>
              patchDay(t, dayId, (d) => ({ ...d, activities: d.activities.map((a) => (a.id === activity.id ? activity : a)) })),
            ),
        }),
      deleteActivity: (tripId, dayId, activityId) =>
        dispatch({
          mutate: (s) => patchTrip(s, tripId, (t) => patchDay(t, dayId, (d) => ({ ...d, activities: d.activities.filter((a) => a.id !== activityId) }))),
        }),
      moveActivity: (tripId, activityId, fromDayId, toDayId, toIndex) =>
        dispatch({
          mutate: (s) =>
            patchTrip(s, tripId, (t) => {
              const from = t.days.find((d) => d.id === fromDayId);
              const item = from?.activities.find((a) => a.id === activityId);
              if (!item) return t;
              const stripped: Trip = {
                ...t,
                days: t.days.map((d) =>
                  d.id === fromDayId ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) } : d,
                ),
              };
              return {
                ...stripped,
                days: stripped.days.map((d) => {
                  if (d.id !== toDayId) return d;
                  const next = [...d.activities];
                  next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, item);
                  return { ...d, activities: next };
                }),
              };
            }),
        }),
      reorderActivity: (tripId, dayId, from, to) =>
        dispatch({
          mutate: (s) =>
            patchTrip(s, tripId, (t) =>
              patchDay(t, dayId, (d) => {
                const next = [...d.activities];
                const [item] = next.splice(from, 1);
                next.splice(to, 0, item);
                return { ...d, activities: next };
              }),
            ),
        }),
      setDayActivities: (tripId, dayId, activities) =>
        dispatch({ mutate: (s) => patchTrip(s, tripId, (t) => patchDay(t, dayId, (d) => ({ ...d, activities }))) }),
      addExpense: (tripId, item) =>
        dispatch({ mutate: (s) => patchTrip(s, tripId, (t) => ({ ...t, expenses: [...t.expenses, item] })) }),
      updateExpense: (tripId, item) =>
        dispatch({ mutate: (s) => patchTrip(s, tripId, (t) => ({ ...t, expenses: t.expenses.map((e) => (e.id === item.id ? item : e)) })) }),
      deleteExpense: (tripId, expenseId) =>
        dispatch({ mutate: (s) => patchTrip(s, tripId, (t) => ({ ...t, expenses: t.expenses.filter((e) => e.id !== expenseId) })) }),
      setBudget: (tripId, amount) => dispatch({ mutate: (s) => patchTrip(s, tripId, (t) => ({ ...t, budget: amount })) }),
      addMemory: (tripId, memory) =>
        dispatch({ mutate: (s) => patchTrip(s, tripId, (t) => ({ ...t, memories: [memory, ...t.memories] })) }),
      deleteMemory: (tripId, memoryId) =>
        dispatch({ mutate: (s) => patchTrip(s, tripId, (t) => ({ ...t, memories: t.memories.filter((m) => m.id !== memoryId) })) }),
      updateSettings: (patch) => dispatch({ mutate: (s) => ({ ...s, settings: { ...s.settings, ...patch } }) }),
      resetAll: () => dispatch({ mutate: () => buildSeedState() }),
    }),
    [state, createTrip],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useTripStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useTripStore must be used within TripProvider');
  return ctx;
}

/* ---------------- selectors ---------------- */

export function tripSpent(trip: Trip): number {
  return trip.expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function tripPlanned(trip: Trip): number {
  return trip.days.reduce((sum, d) => sum + d.activities.reduce((s, a) => s + a.cost, 0), 0);
}

export function tripActivityCount(trip: Trip): number {
  return trip.days.reduce((sum, d) => sum + d.activities.length, 0);
}

/* ------------------------------------------------------------------ */
/*  Toasts                                                             */
/* ------------------------------------------------------------------ */

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  desc?: string;
}

interface ToastValue {
  toasts: Toast[];
  push: (kind: ToastKind, title: string, desc?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, title: string, desc?: string) => {
      const id = uid('toast');
      setToasts((prev) => [...prev.slice(-3), { id, kind, title, desc }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
