// Calculation engine - all financial computations live here
// Keep pure functions, no side effects, no UI imports

import { isWithinRange, getYearMonth, formatMonthLabel } from './dateUtils';

/**
 * Filter transactions by date range and optional filters.
 */
export function filterTransactions(transactions, { startDate, endDate, type, categoryId, paymentMethod, search } = {}) {
  return transactions.filter(t => {
    if (!isWithinRange(t.date, startDate, endDate)) return false;
    if (type && type !== 'all' && t.type !== type) return false;
    if (categoryId && categoryId !== 'all' && t.categoryId !== categoryId) return false;
    if (paymentMethod && paymentMethod !== 'all' && t.paymentMethod !== paymentMethod) return false;
    if (search && search.trim()) {
      const q = search.toLowerCase();
      const fields = [t.description, t.notes, t.paymentMethod, String(t.amount)];
      const matches = fields.some(f => f && f.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Calculate total income from a list of transactions.
 */
export function calculateIncome(transactions) {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
}

/**
 * Calculate total expenses from a list of transactions.
 */
export function calculateExpenses(transactions) {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
}

/**
 * Calculate net savings (income - expenses).
 */
export function calculateSavings(transactions) {
  return calculateIncome(transactions) - calculateExpenses(transactions);
}

/**
 * Calculate savings rate as percentage (0-100).
 */
export function calculateSavingsRate(transactions) {
  const income = calculateIncome(transactions);
  if (income === 0) return 0;
  const savings = calculateSavings(transactions);
  return Math.max(0, (savings / income) * 100);
}

/**
 * Calculate balance (total income - total expenses for all time).
 */
export function calculateBalance(transactions) {
  return calculateSavings(transactions);
}

/**
 * Calculate spending grouped by category.
 * Returns array of { categoryId, total, count, percentage }
 */
export function calculateCategorySpending(transactions, categories) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  
  const grouped = {};
  expenses.forEach(t => {
    if (!grouped[t.categoryId]) grouped[t.categoryId] = { total: 0, count: 0 };
    grouped[t.categoryId].total += t.amount;
    grouped[t.categoryId].count += 1;
  });

  return Object.entries(grouped)
    .map(([catId, data]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        categoryId: catId,
        name: cat ? cat.name : 'Unknown',
        icon: cat ? cat.icon : '📦',
        color: cat ? cat.color : '#78716c',
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Calculate income grouped by category.
 */
export function calculateIncomeByCategory(transactions, categories) {
  const income = transactions.filter(t => t.type === 'income');
  const total = income.reduce((s, t) => s + t.amount, 0);
  
  const grouped = {};
  income.forEach(t => {
    if (!grouped[t.categoryId]) grouped[t.categoryId] = { total: 0, count: 0 };
    grouped[t.categoryId].total += t.amount;
    grouped[t.categoryId].count += 1;
  });

  return Object.entries(grouped)
    .map(([catId, data]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        categoryId: catId,
        name: cat ? cat.name : 'Unknown',
        icon: cat ? cat.icon : '💰',
        color: cat ? cat.color : '#22c55e',
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Get top N spending categories.
 */
export function calculateTopCategories(transactions, categories, limit = 5) {
  return calculateCategorySpending(transactions, categories).slice(0, limit);
}

/**
 * Calculate spending by payment method.
 */
export function calculatePaymentMethodSpending(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const total = expenses.reduce((s, t) => s + t.amount, 0);

  const grouped = {};
  expenses.forEach(t => {
    const method = t.paymentMethod || 'Other';
    if (!grouped[method]) grouped[method] = { total: 0, count: 0 };
    grouped[method].total += t.amount;
    grouped[method].count += 1;
  });

  return Object.entries(grouped)
    .map(([method, data]) => ({
      method,
      total: data.total,
      count: data.count,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Calculate average daily spending.
 */
export function calculateAverageDailySpending(transactions, startDate, endDate) {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return 0;

  const total = expenses.reduce((s, t) => s + t.amount, 0);
  let days = 1;
  
  if (startDate && endDate) {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
  } else if (expenses.length > 0) {
    const dates = expenses.map(t => new Date(t.date + 'T00:00:00'));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    days = Math.max(1, Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
  }

  return total / days;
}

/**
 * Find the largest single expense.
 */
export function calculateLargestExpense(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null);
}

/**
 * Calculate monthly income vs expense totals for bar chart.
 * Returns array of { month, income, expense } sorted chronologically.
 */
export function calculateMonthlyTotals(transactions) {
  const grouped = {};

  transactions.forEach(t => {
    const key = getYearMonth(t.date);
    if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
    if (t.type === 'income') grouped[key].income += t.amount;
    if (t.type === 'expense') grouped[key].expense += t.amount;
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      label: formatMonthLabel(month + '-01'),
      income: data.income,
      expense: data.expense,
    }));
}

/**
 * Calculate daily expense totals for trend chart.
 */
export function calculateDailyTotals(transactions) {
  const grouped = {};

  transactions.filter(t => t.type === 'expense').forEach(t => {
    if (!grouped[t.date]) grouped[t.date] = 0;
    grouped[t.date] += t.amount;
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}

/**
 * Calculate budget usage for a given budget.
 * Returns { spent, remaining, percentage, status }
 */
export function calculateBudgetUsage(budget, transactions, warningThreshold = 70, criticalThreshold = 90) {
  // Filter transactions to budget's category within the budget period
  const now = new Date();
  let startDate;
  
  switch (budget.period) {
    case 'daily': {
      startDate = now.toISOString().split('T')[0];
      break;
    }
    case 'weekly': {
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      startDate = start.toISOString().split('T')[0];
      break;
    }
    case 'yearly': {
      startDate = `${now.getFullYear()}-01-01`;
      break;
    }
    case 'monthly':
    default: {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }
  }

  const endDate = now.toISOString().split('T')[0];

  const relevant = transactions.filter(t =>
    t.type === 'expense' &&
    t.categoryId === budget.categoryId &&
    isWithinRange(t.date, startDate, endDate)
  );

  const spent = relevant.reduce((s, t) => s + t.amount, 0);
  const remaining = Math.max(0, budget.amount - spent);
  const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const rawPercentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  let status = 'safe';
  if (rawPercentage >= 100) status = 'exceeded';
  else if (rawPercentage >= criticalThreshold) status = 'critical';
  else if (rawPercentage >= warningThreshold) status = 'warning';

  return { spent, remaining, percentage, rawPercentage, status };
}

/**
 * Generate financial insights from the data.
 * Returns array of insight strings.
 */
export function generateInsights(transactions, categories, budgets, settings = {}) {
  const insights = [];
  const now = new Date();
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const today = now.toISOString().split('T')[0];
  
  // Last month dates
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStart = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`;
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  const thisMonthTx = transactions.filter(t => isWithinRange(t.date, thisMonthStart, today));
  const lastMonthTx = transactions.filter(t => isWithinRange(t.date, lastMonthStart, lastMonthEnd));

  const thisMonthExpenses = calculateExpenses(thisMonthTx);
  const lastMonthExpenses = calculateExpenses(lastMonthTx);
  const thisMonthIncome = calculateIncome(thisMonthTx);

  // Savings rate insight
  const savingsRate = calculateSavingsRate(thisMonthTx);
  if (thisMonthIncome > 0) {
    if (savingsRate >= 30) {
      insights.push(`🎉 Great job! Your savings rate this month is ${savingsRate.toFixed(0)}%.`);
    } else if (savingsRate > 0) {
      insights.push(`💡 Your savings rate this month is ${savingsRate.toFixed(0)}%. Try to target 30% or more.`);
    } else {
      insights.push(`⚠️ You're spending more than you earn this month. Review your expenses.`);
    }
  }

  // Month-over-month comparison
  if (lastMonthExpenses > 0) {
    const diff = thisMonthExpenses - lastMonthExpenses;
    if (diff > 0) {
      insights.push(`📈 You've spent ₹${diff.toLocaleString('en-IN')} more than last month.`);
    } else if (diff < 0) {
      insights.push(`📉 You've spent ₹${Math.abs(diff).toLocaleString('en-IN')} less than last month. Keep it up!`);
    }
  }

  // Top category
  const catSpending = calculateCategorySpending(thisMonthTx, categories);
  if (catSpending.length > 0) {
    insights.push(`🏆 Your highest spending category this month is ${catSpending[0].name}.`);
  }

  // Largest transaction
  const largest = calculateLargestExpense(thisMonthTx);
  if (largest) {
    insights.push(`💳 Your largest expense this month was ₹${largest.amount.toLocaleString('en-IN')} on ${largest.description}.`);
  }

  // Average daily spending
  const avgDaily = calculateAverageDailySpending(thisMonthTx, thisMonthStart, today);
  if (avgDaily > 0) {
    insights.push(`📅 Your average daily expense this month is ₹${Math.round(avgDaily).toLocaleString('en-IN')}.`);
  }

  // Budget warnings
  budgets.forEach(budget => {
    const usage = calculateBudgetUsage(budget, transactions);
    const cat = categories.find(c => c.id === budget.categoryId);
    const catName = cat ? cat.name : 'Unknown';
    if (usage.status === 'exceeded') {
      insights.push(`🚨 You've exceeded your ${catName} budget by ₹${(usage.spent - budget.amount).toLocaleString('en-IN')}.`);
    } else if (usage.status === 'critical') {
      insights.push(`⚠️ Your ${catName} budget is ${usage.rawPercentage.toFixed(0)}% used — almost at the limit!`);
    }
  });

  if (insights.length === 0) {
    insights.push('💰 Start adding transactions to see your financial insights here.');
  }

  return insights;
}
