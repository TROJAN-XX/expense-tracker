import React, { useMemo } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';
import {
  calculateIncome,
  calculateExpenses,
  calculateSavings,
  calculateSavingsRate,
} from '../../utils/calculations';
import './SummaryCards.css';

function StatCard({ title, value, icon, subtitle, trend, accent, currency }) {
  return (
    <div className={`stat-card card accent-${accent}`}>
      <div className="stat-card-header">
        <span className="stat-icon" aria-hidden="true">{icon}</span>
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-value">
        {value}
      </div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      {trend !== undefined && trend !== null && (
        <div className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% from last month
        </div>
      )}
    </div>
  );
}

function SummaryCards({ transactions }) {
  const { settings } = useExpense();
  const { currency } = settings;

  const income = useMemo(() => calculateIncome(transactions), [transactions]);
  const expenses = useMemo(() => calculateExpenses(transactions), [transactions]);
  const savings = useMemo(() => calculateSavings(transactions), [transactions]);
  const savingsRate = useMemo(() => calculateSavingsRate(transactions), [transactions]);

  return (
    <div className="summary-cards">
      <StatCard
        title="Total Balance"
        value={formatCurrency(savings, currency)}
        icon="◈"
        subtitle="Income minus expenses"
        accent="cyan"
      />
      <StatCard
        title="Total Income"
        value={formatCurrency(income, currency)}
        icon="🔺"
        subtitle={`${transactions.filter(t => t.type === 'income').length} transactions`}
        accent="green"
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(expenses, currency)}
        icon="🔻"
        subtitle={`${transactions.filter(t => t.type === 'expense').length} transactions`}
        accent="red"
      />
      <StatCard
        title="Savings Rate"
        value={`${savingsRate.toFixed(1)}%`}
        icon="◎"
        subtitle={savings >= 0 ? `${formatCurrency(savings, currency)} saved` : 'Spending more than earning'}
        accent="purple"
      />
    </div>
  );
}

export default SummaryCards;
