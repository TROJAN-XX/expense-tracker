import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dateUtils';
import {
  calculateIncome, calculateExpenses, calculateSavings, calculateSavingsRate,
  calculateCategorySpending, calculatePaymentMethodSpending,
  calculateAverageDailySpending, calculateLargestExpense, filterTransactions,
  calculateMonthlyTotals,
} from '../utils/calculations';
import { getPresetDateRange } from '../utils/dateUtils';
import DateRangePicker from '../components/common/DateRangePicker';
import './Reports.css';

const CHART_COLORS = ['#22d3ee','#a78bfa','#fb923c','#4ade80','#f472b6','#60a5fa','#fbbf24','#34d399'];

function MetricCard({ label, value, sub, accent }) {
  return (
    <div className="card metric-card">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${accent ? `text-${accent}` : ''}`}>{value}</div>
      {sub && <div className="metric-sub text-muted text-sm">{sub}</div>}
    </div>
  );
}

function Reports() {
  const { transactions, categories, settings } = useExpense();

  const [dateRange, setDateRange] = useState(() => {
    const r = getPresetDateRange('this_month');
    return { preset: 'this_month', start: r.start, end: r.end };
  });
  const [showPicker, setShowPicker] = useState(false);

  const filtered = useMemo(() => filterTransactions(transactions, {
    startDate: dateRange.start, endDate: dateRange.end
  }), [transactions, dateRange]);

  const income = useMemo(() => calculateIncome(filtered), [filtered]);
  const expenses = useMemo(() => calculateExpenses(filtered), [filtered]);
  const savings = useMemo(() => calculateSavings(filtered), [filtered]);
  const savingsRate = useMemo(() => calculateSavingsRate(filtered), [filtered]);
  const avgDaily = useMemo(() => calculateAverageDailySpending(filtered, dateRange.start, dateRange.end), [filtered, dateRange]);
  const largest = useMemo(() => calculateLargestExpense(filtered), [filtered]);
  const catSpending = useMemo(() => calculateCategorySpending(filtered, categories), [filtered, categories]);
  const paymentSpending = useMemo(() => calculatePaymentMethodSpending(filtered), [filtered]);
  const monthlyTotals = useMemo(() => calculateMonthlyTotals(filtered), [filtered]);

  const topCat = catSpending[0];
  const incomeCount = filtered.filter(t => t.type === 'income').length;
  const expenseCount = filtered.filter(t => t.type === 'expense').length;

  const formatTooltip = (value) => formatCurrency(value, settings.currency);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Detailed financial analysis</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowPicker(s => !s)}>
          📅 {dateRange.preset === 'custom' ? 'Custom' : dateRange.preset.replace('_', ' ')}
          <span>▾</span>
        </button>
      </div>

      {showPicker && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <DateRangePicker value={dateRange} onChange={(r) => { setDateRange(r); if (r.preset !== 'custom') setShowPicker(false); }} />
        </div>
      )}

      {/* Key Metrics */}
      <div className="reports-metrics grid-4">
        <MetricCard label="Total Income" value={formatCurrency(income, settings.currency)} accent="success" sub={`${incomeCount} transactions`} />
        <MetricCard label="Total Expenses" value={formatCurrency(expenses, settings.currency)} accent="danger" sub={`${expenseCount} transactions`} />
        <MetricCard label="Net Savings" value={formatCurrency(savings, settings.currency)} accent={savings >= 0 ? 'success' : 'danger'} />
        <MetricCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} accent={savingsRate >= 30 ? 'success' : savingsRate > 0 ? 'warning' : 'danger'} />
      </div>

      <div className="reports-metrics grid-4" style={{ marginBottom: 28 }}>
        <MetricCard label="Avg Daily Expense" value={formatCurrency(Math.round(avgDaily), settings.currency)} />
        <MetricCard label="Largest Expense" value={largest ? formatCurrency(largest.amount, settings.currency) : '—'} sub={largest?.description} />
        <MetricCard label="Top Category" value={topCat?.name || '—'} sub={topCat ? formatCurrency(topCat.total, settings.currency) : undefined} />
        <MetricCard label="Total Transactions" value={filtered.length} sub={`${incomeCount} income, ${expenseCount} expense`} />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Category pie */}
        <div className="card chart-card">
          <div className="card-header"><h2 className="card-title">Spending by Category</h2></div>
          {catSpending.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>No expense data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={catSpending.slice(0, 8)} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={90} strokeWidth={2} stroke="var(--bg-card)">
                    {catSpending.slice(0, 8).map((c, i) => <Cell key={c.categoryId} fill={c.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v, settings.currency)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="reports-legend">
                {catSpending.slice(0, 6).map(c => (
                  <div key={c.categoryId} className="reports-legend-item">
                    <span className="donut-legend-dot" style={{ background: c.color }} />
                    <span className="donut-legend-name">{c.icon} {c.name}</span>
                    <span className="donut-legend-pct">{formatCurrency(c.total, settings.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Payment method pie */}
        <div className="card chart-card">
          <div className="card-header"><h2 className="card-title">Payment Methods</h2></div>
          {paymentSpending.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>No expense data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentSpending} dataKey="total" nameKey="method" cx="50%" cy="50%" outerRadius={90} strokeWidth={2} stroke="var(--bg-card)">
                    {paymentSpending.map((p, i) => <Cell key={p.method} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v, settings.currency)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="reports-legend">
                {paymentSpending.map((p, i) => (
                  <div key={p.method} className="reports-legend-item">
                    <span className="donut-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="donut-legend-name">{p.method}</span>
                    <span className="donut-legend-pct">
                      {p.percentage.toFixed(0)}% • {p.count} tx
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="card chart-card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h2 className="card-title">Monthly Overview</h2></div>
        {monthlyTotals.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>No data for this period</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTotals} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, settings.currency, { notation: 'compact' })} />
              <Tooltip formatter={formatTooltip} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10 }} />
              <Bar dataKey="income" name="Income" fill="#4ade80" radius={[6,6,0,0]} />
              <Bar dataKey="expense" name="Expenses" fill="#f87171" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Payment method table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h2 className="card-title">Payment Method Breakdown</h2></div>
        {paymentSpending.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>No expense data</p>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Method</th><th>Amount</th><th>Transactions</th><th>Share</th></tr></thead>
              <tbody>
                {paymentSpending.map((p, i) => (
                  <tr key={p.method}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="donut-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length], width: 10, height: 10, minWidth: 10, borderRadius: 3 }} />
                        {p.method}
                      </div>
                    </td>
                    <td className="amount-negative">{formatCurrency(p.total, settings.currency)}</td>
                    <td>{p.count}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-track" style={{ flex: 1, height: 6 }}>
                          <div className="progress-fill safe" style={{ width: `${p.percentage}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        </div>
                        <span className="text-sm text-muted">{p.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
