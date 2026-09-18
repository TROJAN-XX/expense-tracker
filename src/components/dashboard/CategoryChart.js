import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/currency';
import { calculateCategorySpending } from '../../utils/calculations';
import EmptyState from '../common/EmptyState';
import './Charts.css';

const RADIAN = Math.PI / 180;

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CategoryChart({ transactions }) {
  const { settings, categories } = useExpense();

  const data = useMemo(
    () => calculateCategorySpending(transactions, categories).filter(d => d.total > 0),
    [transactions, categories]
  );

  const totalExpenses = useMemo(() => data.reduce((s, d) => s + d.total, 0), [data]);

  if (data.length === 0) {
    return (
      <div className="card chart-card">
        <div className="card-header">
          <h2 className="card-title">Spending by Category</h2>
        </div>
        <EmptyState icon="🍩" title="No expenses yet" description="Add some expenses to see the breakdown." />
      </div>
    );
  }

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h2 className="card-title">Spending by Category</h2>
      </div>
      <div className="donut-chart-wrapper">
        <ResponsiveContainer width="55%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={110}
              dataKey="total"
              nameKey="name"
              labelLine={false}
              label={renderCustomLabel}
              strokeWidth={2}
              stroke="var(--bg-card)"
            >
              {data.map((entry, index) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="chart-tooltip">
                    <p style={{ color: d.color }}>{d.icon} {d.name}</p>
                    <p className="tooltip-label">{formatCurrency(d.total, settings.currency)}</p>
                    <p className="text-muted text-sm">{d.percentage.toFixed(1)}% of expenses</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="donut-center">
          <span className="donut-total">{formatCurrency(totalExpenses, settings.currency)}</span>
          <span className="donut-label">Total Expenses</span>
        </div>

        {/* Legend */}
        <div className="donut-legend">
          {data.slice(0, 6).map(d => (
            <div key={d.categoryId} className="donut-legend-item">
              <span className="donut-legend-dot" style={{ background: d.color }} />
              <span className="donut-legend-name">{d.name}</span>
              <span className="donut-legend-pct">{d.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;
