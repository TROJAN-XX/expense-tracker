import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import SummaryCards from '../components/dashboard/SummaryCards';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import SpendingTrendChart from '../components/dashboard/SpendingTrendChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import TopCategories from '../components/dashboard/TopCategories';
import RecentActivity from '../components/dashboard/RecentActivity';
import SpendingInsights from '../components/dashboard/SpendingInsights';
import DateRangePicker from '../components/common/DateRangePicker';
import { filterTransactions } from '../utils/calculations';
import { getPresetDateRange } from '../utils/dateUtils';
import './Dashboard.css';

function Dashboard({ onAddTransaction }) {
  const { transactions } = useExpense();

  const [dateRange, setDateRange] = useState(() => {
    const range = getPresetDateRange('this_month');
    return { preset: 'this_month', start: range.start, end: range.end };
  });

  const [showRangePicker, setShowRangePicker] = useState(false);

  // Filter transactions by date range for dashboard metrics
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, {
      startDate: dateRange.start,
      endDate: dateRange.end,
    });
  }, [transactions, dateRange.start, dateRange.end]);

  // Sort recent activity by date
  const sortedRecent = useMemo(() => {
    return [...filteredTransactions].sort((a, b) =>
      b.date.localeCompare(a.date) || new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [filteredTransactions]);

  const PRESET_LABELS = {
    today: 'Today',
    yesterday: 'Yesterday',
    this_week: 'This Week',
    last_week: 'Last Week',
    this_month: 'This Month',
    last_month: 'Last Month',
    this_year: 'This Year',
    last_year: 'Last Year',
    all_time: 'All Time',
    custom: 'Custom Range',
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your financial overview</p>
        </div>
        <div className="dashboard-controls">
          <button
            className="btn btn-ghost btn-sm date-range-btn"
            onClick={() => setShowRangePicker(s => !s)}
          >
            📅 {PRESET_LABELS[dateRange.preset] || 'Date Range'}
            <span className={`chevron ${showRangePicker ? 'up' : ''}`}>▾</span>
          </button>
        </div>
      </div>

      {/* Date Range Picker dropdown */}
      {showRangePicker && (
        <div className="card date-picker-card animate-slide-down">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => {
              setDateRange(range);
              if (range.preset !== 'custom') setShowRangePicker(false);
            }}
          />
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards transactions={filteredTransactions} />

      {/* Charts Row */}
      <div className="dashboard-charts">
        <div className="charts-main">
          <IncomeExpenseChart transactions={filteredTransactions} />
          <SpendingTrendChart transactions={filteredTransactions} />
        </div>
        <div className="charts-side">
          <CategoryChart transactions={filteredTransactions} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom">
        <div className="dashboard-bottom-left">
          <TopCategories transactions={filteredTransactions} />
        </div>
        <div className="dashboard-bottom-right">
          <RecentActivity transactions={sortedRecent} onAddTransaction={onAddTransaction} />
        </div>
      </div>

      {/* Insights */}
      <div style={{ marginTop: 20 }}>
        <SpendingInsights transactions={filteredTransactions} />
      </div>
    </div>
  );
}

export default Dashboard;
