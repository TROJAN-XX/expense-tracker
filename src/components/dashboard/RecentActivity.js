import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate } from '../../utils/dateUtils';
import EmptyState from '../common/EmptyState';
import './RecentActivity.css';

function RecentActivity({ transactions, onAddTransaction }) {
  const { categories, settings } = useExpense();

  const recent = transactions.slice(0, 8);

  const getCategory = (catId) => categories.find(c => c.id === catId) || { name: 'Unknown', icon: '📦', color: '#78716c' };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Activity</h2>
        {recent.length > 0 && (
          <span className="text-muted text-sm">{transactions.length} total</span>
        )}
      </div>
      {recent.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No transactions yet"
          description="Start tracking by adding your first transaction."
          action={
            <button className="btn btn-primary" onClick={onAddTransaction}>
              + Add Transaction
            </button>
          }
        />
      ) : (
        <div className="activity-list">
          {recent.map(tx => {
            const cat = getCategory(tx.categoryId);
            return (
              <div key={tx.id} className="activity-item">
                <span
                  className="cat-icon activity-icon"
                  style={{ background: cat.color + '22', color: cat.color }}
                  aria-hidden="true"
                >
                  {cat.icon}
                </span>
                <div className="activity-info">
                  <span className="activity-desc">{tx.description || cat.name}</span>
                  <span className="activity-meta">
                    {cat.name} • {formatRelativeDate(tx.date)} • {tx.paymentMethod}
                  </span>
                </div>
                <span className={`activity-amount ${tx.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount, settings.currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;
