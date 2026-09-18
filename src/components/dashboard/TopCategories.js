import React, { useMemo } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/currency';
import { calculateTopCategories } from '../../utils/calculations';
import EmptyState from '../common/EmptyState';
import './TopCategories.css';

function TopCategories({ transactions }) {
  const { categories, settings } = useExpense();

  const topCats = useMemo(
    () => calculateTopCategories(transactions, categories, 6),
    [transactions, categories]
  );

  const maxAmount = topCats.length > 0 ? topCats[0].total : 1;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Top Spending Categories</h2>
      </div>
      {topCats.length === 0 ? (
        <EmptyState icon="📊" title="No expenses yet" description="Add expenses to see top categories." />
      ) : (
        <div className="top-cats-list">
          {topCats.map((cat, idx) => (
            <div key={cat.categoryId} className="top-cat-item">
              <div className="top-cat-rank">#{idx + 1}</div>
              <span
                className="cat-icon"
                style={{ background: cat.color + '22', color: cat.color }}
                aria-hidden="true"
              >
                {cat.icon}
              </span>
              <div className="top-cat-info">
                <div className="top-cat-row">
                  <span className="top-cat-name">{cat.name}</span>
                  <span className="top-cat-amount">
                    {formatCurrency(cat.total, settings.currency)}
                  </span>
                </div>
                <div className="progress-track" role="progressbar" aria-valuenow={cat.percentage} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="progress-fill safe"
                    style={{
                      width: `${(cat.total / maxAmount) * 100}%`,
                      background: `linear-gradient(90deg, ${cat.color}99, ${cat.color})`,
                    }}
                  />
                </div>
                <span className="top-cat-pct">{cat.percentage.toFixed(1)}% of expenses</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopCategories;
