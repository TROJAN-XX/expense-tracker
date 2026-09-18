// Storage utility - central localStorage access layer
// All data is stored under a single key for simplicity and portability

const STORAGE_KEY = 'expenseTrackerData';
const APP_VERSION = '1.0.0';

/**
 * Load all application data from localStorage.
 * Returns null if no data or if data is corrupted.
 */
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic schema validation
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed;
  } catch (err) {
    console.error('Failed to load data from localStorage:', err);
    return null;
  }
}

/**
 * Save all application data to localStorage.
 */
export function saveData(data) {
  try {
    const payload = {
      ...data,
      _version: APP_VERSION,
      _savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
    return false;
  }
}

/**
 * Clear all application data from localStorage.
 */
export function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
    return false;
  }
}

/**
 * Export all data as a formatted JSON string for download.
 */
export function exportDataAsJSON(data) {
  const payload = {
    appName: 'ExpenseTracker',
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      transactions: data.transactions || [],
      categories: data.categories || [],
      budgets: data.budgets || [],
      settings: data.settings || {},
    },
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Validate and import data from a JSON string.
 * Returns { valid: boolean, data: object|null, error: string|null, summary: object }
 */
export function importDataFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Allow both wrapped format (from our export) and direct format
    const importedData = parsed.data || parsed;
    
    // Validate structure
    if (typeof importedData !== 'object' || importedData === null) {
      return { valid: false, data: null, error: 'Invalid file format', summary: null };
    }

    const transactions = Array.isArray(importedData.transactions) ? importedData.transactions : [];
    const categories = Array.isArray(importedData.categories) ? importedData.categories : [];
    const budgets = Array.isArray(importedData.budgets) ? importedData.budgets : [];
    const settings = typeof importedData.settings === 'object' && importedData.settings !== null
      ? importedData.settings
      : {};

    // Validate individual transactions
    const validTransactions = transactions.filter(t => 
      t && typeof t === 'object' &&
      typeof t.id === 'string' &&
      (t.type === 'income' || t.type === 'expense') &&
      typeof t.amount === 'number' && t.amount > 0 &&
      typeof t.date === 'string'
    );

    return {
      valid: true,
      data: { transactions: validTransactions, categories, budgets, settings },
      error: null,
      summary: {
        transactions: validTransactions.length,
        categories: categories.length,
        budgets: budgets.length,
        exportedAt: parsed.exportedAt || null,
        appVersion: parsed.version || 'unknown',
      },
    };
  } catch (err) {
    return { valid: false, data: null, error: 'Could not parse JSON file', summary: null };
  }
}

/**
 * Returns an estimate of localStorage usage.
 */
export function getStorageInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([raw]).size;
    return {
      bytes,
      kb: (bytes / 1024).toFixed(2),
      mb: (bytes / 1024 / 1024).toFixed(3),
    };
  } catch {
    return { bytes: 0, kb: '0.00', mb: '0.000' };
  }
}

export const APP_VERSION_STRING = APP_VERSION;
