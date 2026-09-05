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

export function money(eur: number, currency: Currency = 'EUR', locale = 'en-US'): string {
  const value = convert(eur, currency);
  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));
  return formatted;
}

/* ---------------- dates ---------------- */

export function fmtDate(iso: string, pattern = 'MMM d', locale = 'en-US'): string {
  const date = parseISO(iso);
  
  // Use Intl for locale-aware formatting
  if (locale === 'ar-SA') {
    const arabicMonths: Record<string, string> = {
      'Jan': 'يناير', 'Feb': 'فبراير', 'Mar': 'مارس', 'Apr': 'أبريل',
      'May': 'مايو', 'Jun': 'يونيو', 'Jul': 'يوليو', 'Aug': 'أغسطس',
      'Sep': 'سبتمبر', 'Oct': 'أكتوبر', 'Nov': 'نوفمبر', 'Dec': 'ديسمبر'
    };
    const enFormatted = format(date, pattern);
    // Replace month names with Arabic
    let result = enFormatted;
    for (const [en, ar] of Object.entries(arabicMonths)) {
      result = result.replace(en, ar);
    }
    return result;
  }
  
  return format(date, pattern);
}

export function fmtDateFull(iso: string, locale = 'en-US'): string {
  const date = parseISO(iso);
  
  if (locale === 'ar-SA') {
    const arabicWeekdays: Record<string, string> = {
      'Monday': 'الاثنين', 'Tuesday': 'الثلاثاء', 'Wednesday': 'الأربعاء',
      'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت', 'Sunday': 'الأحد'
    };
    const arabicMonths: Record<string, string> = {
      'January': 'يناير', 'February': 'فبراير', 'March': 'مارس', 'April': 'أبريل',
      'May': 'مايو', 'June': 'يونيو', 'July': 'يوليو', 'August': 'أغسطس',
      'September': 'سبتمبر', 'October': 'أكتوبر', 'November': 'نوفمبر', 'December': 'ديسمبر'
    };
    
    const enFormatted = format(date, 'EEEE · MMMM d');
    let result = enFormatted;
    
    for (const [en, ar] of Object.entries(arabicWeekdays)) {
      result = result.replace(en, ar);
    }
    for (const [en, ar] of Object.entries(arabicMonths)) {
      result = result.replace(en, ar);
    }
    
    return result;
  }
  
  return format(date, 'EEEE · MMMM d');
}

export function fmtRange(startIso: string, endIso: string, locale = 'en-US'): string {
  const s = parseISO(startIso);
  const e = parseISO(endIso);
  
  if (locale === 'ar-SA') {
    return `${fmtDate(startIso, 'MMM d', locale)} — ${fmtDate(endIso, 'MMM d, yyyy', locale)}`;
  }
  
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

export function durationLabel(min: number, locale = 'en-US'): string {
  if (locale === 'ar-SA') {
    if (min < 60) return `${min} دقيقة`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (m === 0) return `${h} ساعة`;
    return `${h} ساعة و${m} دقيقة`;
  }
  
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/* ---------------- distance ---------------- */

export function distLabel(km: number, unit: DistanceUnit, locale = 'en-US'): string {
  if (locale === 'ar-SA') {
    if (unit === 'mi') return `${(km * 0.621371).toFixed(1)} ميل`;
    return km < 1 ? `${Math.round(km * 1000)} م` : `${km.toFixed(1)} كم`;
  }
  
  if (unit === 'mi') return `${(km * 0.621371).toFixed(1)} mi`;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
