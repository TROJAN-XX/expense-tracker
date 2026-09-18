import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { loadData, saveData, clearData } from '../utils/storage';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  SAMPLE_TRANSACTIONS,
  SAMPLE_BUDGETS,
} from '../data/defaultData';

// ─── Initial State ────────────────────────────────────────────────────────────
const buildInitialState = () => {
  const saved = loadData();

  if (saved && saved.transactions !== undefined) {
    // Returning user
    return {
      transactions: saved.transactions || [],
      categories: saved.categories && saved.categories.length > 0
        ? saved.categories
        : DEFAULT_CATEGORIES,
      budgets: saved.budgets || [],
      settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
      isFirstRun: false,
    };
  }

  // First run - load sample data
  return {
    transactions: SAMPLE_TRANSACTIONS,
    categories: DEFAULT_CATEGORIES,
    budgets: SAMPLE_BUDGETS,
    settings: DEFAULT_SETTINGS,
    isFirstRun: true,
  };
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function expenseReducer(state, action) {
  switch (action.type) {
    // Transactions
    case 'ADD_TRANSACTION': {
      const tx = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { ...state, transactions: [tx, ...state.transactions] };
    }
    case 'UPDATE_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id
            ? { ...t, ...action.payload, updatedAt: new Date().toISOString() }
            : t
        ),
      };
    }
    case 'DELETE_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    }

    // Categories
    case 'ADD_CATEGORY': {
      const cat = { ...action.payload, id: generateId() };
      return { ...state, categories: [...state.categories, cat] };
    }
    case 'UPDATE_CATEGORY': {
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };
    }
    case 'DELETE_CATEGORY': {
      const { categoryId, replacementId } = action.payload;
      const newTransactions = state.transactions.map(t =>
        t.categoryId === categoryId ? { ...t, categoryId: replacementId } : t
      );
      const newBudgets = state.budgets.filter(b => b.categoryId !== categoryId);
      const newCategories = state.categories.filter(c => c.id !== categoryId);
      return { ...state, categories: newCategories, transactions: newTransactions, budgets: newBudgets };
    }

    // Budgets
    case 'ADD_BUDGET': {
      const budget = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, budgets: [...state.budgets, budget] };
    }
    case 'UPDATE_BUDGET': {
      return {
        ...state,
        budgets: state.budgets.map(b =>
          b.id === action.payload.id ? { ...b, ...action.payload } : b
        ),
      };
    }
    case 'DELETE_BUDGET': {
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };
    }

    // Settings
    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.payload } };
    }

    // Reset
    case 'RESET_DATA': {
      clearData();
      return {
        transactions: [],
        categories: DEFAULT_CATEGORIES,
        budgets: [],
        settings: DEFAULT_SETTINGS,
        isFirstRun: false,
      };
    }

    // Import
    case 'IMPORT_DATA': {
      const imported = action.payload;
      return {
        ...state,
        transactions: imported.transactions || state.transactions,
        categories: imported.categories && imported.categories.length > 0
          ? imported.categories
          : state.categories,
        budgets: imported.budgets || state.budgets,
        settings: { ...state.settings, ...(imported.settings || {}) },
        isFirstRun: false,
      };
    }

    // External sync (from another tab via storage event)
    case 'SYNC_FROM_STORAGE': {
      return {
        ...state,
        transactions: action.payload.transactions || state.transactions,
        categories: action.payload.categories || state.categories,
        budgets: action.payload.budgets || state.budgets,
        settings: action.payload.settings || state.settings,
      };
    }

    case 'DISMISS_FIRST_RUN': {
      return { ...state, isFirstRun: false };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, null, buildInitialState);

  // Persist to localStorage whenever state changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      // Always save on first render to initialize storage with sample data
      saveData({
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        settings: state.settings,
      });
      isFirstRender.current = false;
      return;
    }
    saveData({
      transactions: state.transactions,
      categories: state.categories,
      budgets: state.budgets,
      settings: state.settings,
    });
  }, [state.transactions, state.categories, state.budgets, state.settings]);

  // Multi-tab synchronization via storage event
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'expenseTrackerData' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          dispatch({ type: 'SYNC_FROM_STORAGE', payload: data });
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // BroadcastChannel for same-origin faster sync (optional, with fallback)
  useEffect(() => {
    if (!window.BroadcastChannel) return;
    const channel = new BroadcastChannel('expense_tracker_sync');
    channel.onmessage = (e) => {
      if (e.data && e.data.type === 'STATE_UPDATE') {
        dispatch({ type: 'SYNC_FROM_STORAGE', payload: e.data.payload });
      }
    };
    return () => channel.close();
  }, []);

  // ─── Action creators ────────────────────────────────────────────────────────
  const addTransaction = useCallback((data) => dispatch({ type: 'ADD_TRANSACTION', payload: data }), []);
  const updateTransaction = useCallback((data) => dispatch({ type: 'UPDATE_TRANSACTION', payload: data }), []);
  const deleteTransaction = useCallback((id) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }), []);

  const addCategory = useCallback((data) => dispatch({ type: 'ADD_CATEGORY', payload: data }), []);
  const updateCategory = useCallback((data) => dispatch({ type: 'UPDATE_CATEGORY', payload: data }), []);
  const deleteCategory = useCallback((categoryId, replacementId) =>
    dispatch({ type: 'DELETE_CATEGORY', payload: { categoryId, replacementId } }), []);

  const addBudget = useCallback((data) => dispatch({ type: 'ADD_BUDGET', payload: data }), []);
  const updateBudget = useCallback((data) => dispatch({ type: 'UPDATE_BUDGET', payload: data }), []);
  const deleteBudget = useCallback((id) => dispatch({ type: 'DELETE_BUDGET', payload: id }), []);

  const updateSettings = useCallback((data) => dispatch({ type: 'UPDATE_SETTINGS', payload: data }), []);
  const resetData = useCallback(() => dispatch({ type: 'RESET_DATA' }), []);
  const importData = useCallback((data) => dispatch({ type: 'IMPORT_DATA', payload: data }), []);
  const dismissFirstRun = useCallback(() => dispatch({ type: 'DISMISS_FIRST_RUN' }), []);

  const value = {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    updateSettings,
    resetData,
    importData,
    dismissFirstRun,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpense() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpense must be used inside ExpenseProvider');
  return ctx;
}

export default ExpenseContext;
