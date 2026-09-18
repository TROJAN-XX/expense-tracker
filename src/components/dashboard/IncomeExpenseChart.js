import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/currency';
import { calculateMonthlyTotals } from '../../utils/calculations';
import EmptyState from '../common/EmptyState';
import './Charts.css';

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  );
}

function IncomeExpenseChart({ transactions }) {
  const { settings } = useExpense();
  const data = useMemo(() => calculateMonthlyTotals(transactions), [transactions]);

  if (data.length === 0) {
    return (
      <div className="card chart-card">
        <div className="card-header">
          <h2 className="card-title">Income vs Expenses</h2>
        </div>
        <EmptyState icon="📊" title="No data yet" description="Add transactions to see this chart." />
      </div>
    );
  }

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h2 className="card-title">Income vs Expenses</h2>
        <div className="chart-legend">
          <span className="legend-item income">Income</span>
          <span className="legend-item expense">Expenses</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCurrency(v, settings.currency, { notation: 'compact' })}
          />
          <Tooltip content={<CustomTooltip currency={settings.currency} />} />
          <Bar dataKey="income" name="Income" fill="#4ade80" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="Expenses" fill="#f87171" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default IncomeExpenseChart;
