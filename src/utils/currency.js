// Currency formatting utilities

import { CURRENCIES } from '../data/defaultData';

/**
 * Format a number as currency using Intl.NumberFormat.
 * @param {number} amount
 * @param {string} currencyCode - e.g. 'INR', 'USD'
 * @param {object} options - extra Intl options
 */
export function formatCurrency(amount, currencyCode = 'INR', options = {}) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  } catch {
    // Fallback formatting
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Format as compact currency (e.g. ₹1.2L, ₹2.5K).
 */
export function formatCompactCurrency(amount, currencyCode = 'INR') {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const abs = Math.abs(amount);
  
  if (abs >= 10000000) return `${currency.symbol}${(amount / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${currency.symbol}${(amount / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount, currencyCode);
}

/**
 * Get the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currencyCode = 'INR') {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency ? currency.symbol : '₹';
}

/**
 * Parse a currency string to a number.
 */
export function parseCurrencyInput(value) {
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
