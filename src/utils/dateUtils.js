// Date utilities - centralized, consistent date handling

import { CURRENCIES, DATE_FORMATS } from '../data/defaultData';

/**
 * Format a date string according to user's preferred format.
 */
export function formatDate(dateStr, format = 'DD/MM/YYYY') {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00'); // prevent timezone offset
  if (isNaN(date.getTime())) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthShort = monthNames[date.getMonth()];

  switch (format) {
    case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
    case 'DD MMM YYYY': return `${day} ${monthShort} ${year}`;
    default: return `${day}/${month}/${year}`;
  }
}

/**
 * Format a date as a relative human-readable string (e.g., "Today", "Yesterday", "3 days ago").
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return formatDate(dateStr);
}

/**
 * Get today's date as YYYY-MM-DD.
 */
export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a date string falls within a given range.
 */
export function isWithinRange(dateStr, startDate, endDate) {
  if (!dateStr) return false;
  const date = new Date(dateStr + 'T00:00:00');
  if (startDate) {
    const start = new Date(startDate + 'T00:00:00');
    if (date < start) return false;
  }
  if (endDate) {
    const end = new Date(endDate + 'T00:00:00');
    if (date > end) return false;
  }
  return true;
}

/**
 * Get start and end dates for a named preset.
 */
export function getPresetDateRange(preset) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  function toStr(d) {
    return d.toISOString().split('T')[0];
  }

  function startOf(d) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
  }

  switch (preset) {
    case 'today': {
      return { start: today, end: today };
    }
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const ys = toStr(y);
      return { start: ys, end: ys };
    }
    case 'this_week': {
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      return { start: toStr(start), end: today };
    }
    case 'last_week': {
      const day = now.getDay();
      const end = new Date(now);
      end.setDate(now.getDate() - day - 1);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return { start: toStr(start), end: toStr(end) };
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toStr(start), end: today };
    }
    case 'last_month': {
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start: toStr(start), end: toStr(end) };
    }
    case 'this_year': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: toStr(start), end: today };
    }
    case 'last_year': {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return { start: toStr(start), end: toStr(end) };
    }
    case 'all_time':
    default: {
      return { start: null, end: null };
    }
  }
}

export const DATE_RANGE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'all_time', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' },
];

/**
 * Format month for chart labels.
 */
export function formatMonthLabel(dateStr) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(dateStr + 'T00:00:00');
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get YYYY-MM from a date string.
 */
export function getYearMonth(dateStr) {
  return dateStr ? dateStr.substring(0, 7) : '';
}
