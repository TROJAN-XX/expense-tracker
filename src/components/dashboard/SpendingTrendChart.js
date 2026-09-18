import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/currency';
import { calculateDailyTotals } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import EmptyState from '../common/EmptyState';
import './Charts.css';

function SpendingTrendChart({ transactions }) {
  const { settings } = useExpense();

  const data = useMemo(() => {
    const daily = calculateDailyTotals(transactions);
    return daily.slice(-30); // Last 30 days
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="card chart-card">
        <div className="card-header">
          <h2 className="card-title">Spending Trend</h2>
        </div>
        <EmptyState icon="📈" title="No data yet" description="Add transactions to see your spending trend." />
      </div>
    );
  }

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h2 className="card-title">Spending Trend</h2>
        <span className="text-muted text-sm">Last 30 days</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(d) => formatDate(d, 'DD/MM/YYYY').slice(0, 5)}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCurrency(v, settings.currency, { notation: 'compact' })}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="chart-tooltip">
                  <p className="tooltip-label">{label}</p>
                  <p style={{ color: '#f87171' }}>Spent: {formatCurrency(payload[0].value, settings.currency)}</p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#f87171"
            strokeWidth={2}
            fill="url(#spendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingTrendChart;
