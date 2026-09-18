import React, { useMemo } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { generateInsights } from '../../utils/calculations';
import './SpendingInsights.css';

function SpendingInsights({ transactions }) {
  const { categories, budgets, settings } = useExpense();

  const insights = useMemo(
    () => generateInsights(transactions, categories, budgets, settings),
    [transactions, categories, budgets, settings]
  );

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Financial Insights</h2>
        <span className="insights-badge">AI-Free ✓</span>
      </div>
      <div className="insights-list">
        {insights.map((insight, i) => (
          <div key={i} className="insight-item animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <p className="insight-text">{insight}</p>
          </div>
        ))}
      </div>
      <p className="insights-disclaimer">
        Insights are calculated locally from your data. Not financial advice.
      </p>
    </div>
  );
}

export default SpendingInsights;
