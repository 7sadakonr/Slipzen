import { format, parseISO } from 'date-fns';
import { CONSTANTS } from '../lib/constants';

export function formatCurrency(amount: number, currency: string = CONSTANTS.DEFAULT_CURRENCY, locale: string = CONSTANTS.DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, formatStr);
}

export function formatTime(dateString: string | Date): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'HH:mm');
}
