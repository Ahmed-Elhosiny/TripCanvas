import { useI18n } from './translations';

/**
 * Format a number according to the current locale
 */
export function useNumberFormat() {
  const { locale } = useI18n();
  
  return {
    format: (num: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(locale, options).format(num);
    },
    formatCurrency: (amount: number, currency: string) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    },
    formatPercent: (value: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(value / 100);
    },
  };
}

/**
 * Format a date according to the current locale
 */
export function useDateFormat() {
  const { locale } = useI18n();
  
  return {
    format: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat(locale, options).format(d);
    },
    formatDate: (date: Date | string | number) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(d);
    },
    formatShortDate: (date: Date | string | number) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
      }).format(d);
    },
    formatDayName: (date: Date | string | number) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        weekday: 'short',
      }).format(d);
    },
    formatMonthName: (date: Date | string | number) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        month: 'long',
      }).format(d);
    },
    formatTime: (date: Date | string | number) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(d);
    },
  };
}

/**
 * Get relative time formatter (e.g., "2 days ago", "in 3 days")
 */
export function useRelativeTime() {
  const { locale } = useI18n();
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  return {
    format: (value: number, unit: Intl.RelativeTimeFormatUnit) => {
      return rtf.format(value, unit);
    },
    fromNow: (date: Date | string | number) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      
      const now = new Date();
      const diffMs = d.getTime() - now.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      
      if (Math.abs(diffDays) < 1) {
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        return rtf.format(diffHours, 'hour');
      } else if (Math.abs(diffDays) < 7) {
        return rtf.format(diffDays, 'day');
      } else if (Math.abs(diffDays) < 30) {
        const diffWeeks = Math.round(diffDays / 7);
        return rtf.format(diffWeeks, 'week');
      } else if (Math.abs(diffDays) < 365) {
        const diffMonths = Math.round(diffDays / 30);
        return rtf.format(diffMonths, 'month');
      } else {
        const diffYears = Math.round(diffDays / 365);
        return rtf.format(diffYears, 'year');
      }
    },
  };
}
