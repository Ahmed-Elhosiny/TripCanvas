import { format, parseISO } from 'date-fns';
import type { Currency, DistanceUnit } from '../types';

let counter = 0;
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ---------------- money ---------------- */

const RATES: Record<Currency, number> = { EUR: 1, USD: 1.09, GBP: 0.85 };
const SYMBOL: Record<Currency, string> = { EUR: '€', USD: '$', GBP: '£' };

export function convert(eur: number, currency: Currency): number {
  return eur * RATES[currency];
}

export function toEur(value: number, currency: Currency): number {
  return value / RATES[currency];
}

export function currencySymbol(currency: Currency): string {
  return SYMBOL[currency];
}

export function money(eur: number, currency: Currency = 'EUR', opts?: { sign?: boolean }): string {
  const value = convert(eur, currency);
  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat('en-US').format(Math.abs(rounded));
  const sign = opts?.sign && eur > 0 ? '+' : eur < 0 ? '−' : '';
  return `${sign}${SYMBOL[currency]}${formatted}`;
}

/* ---------------- dates ---------------- */

export function fmtDate(iso: string, pattern = 'MMM d'): string {
  return format(parseISO(iso), pattern);
}

export function fmtDateFull(iso: string): string {
  return format(parseISO(iso), 'EEEE · MMMM d');
}

export function fmtRange(startIso: string, endIso: string): string {
  const s = parseISO(startIso);
  const e = parseISO(endIso);
  return `${format(s, 'MMM d')} — ${format(e, 'MMM d, yyyy')}`;
}

export function daysInclusive(startIso: string, endIso: string): number {
  const ms = parseISO(endIso).getTime() - parseISO(startIso).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

export function addDaysIso(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return format(d, 'yyyy-MM-dd');
}

export function rangeIso(startIso: string, endIso: string): string[] {
  const n = daysInclusive(startIso, endIso);
  return Array.from({ length: n }, (_, i) => addDaysIso(startIso, i));
}

/* ---------------- time ---------------- */

export function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minToTime(min: number): string {
  const m = Math.max(0, Math.min(23 * 60 + 59, Math.round(min)));
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function durationLabel(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/* ---------------- distance ---------------- */

export function distLabel(km: number, unit: DistanceUnit): string {
  if (unit === 'mi') return `${(km * 0.621371).toFixed(1)} mi`;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
