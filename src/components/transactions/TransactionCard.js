import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { useToast } from '../common/Toast';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatRelativeDate } from '../../utils/dateUtils';
import ConfirmDialog from '../common/ConfirmDialog';
import './TransactionTable.css';

function TransactionCard({ tx, onEdit, onDelete }) {
  const { categories, settings } = useExpense();
  const cat = categories.find(c => c.id === tx.categoryId) || { name: 'Unknown', icon: '📦', color: '#78716c' };

  return (
    <div className="tx-card animate-slide-up">
      <div className="tx-card-left">
        <span
          className="cat-icon"
          style={{ background: cat.color + '22', fontSize: '1.25rem', width: 44, height: 44, borderRadius: 12 }}
          aria-hidden="true"
        >
          {cat.icon}
        </span>
      </div>
      <div className="tx-card-body">
        <div className="tx-card-top">
          <span className="tx-card-desc">{tx.description || cat.name}</span>
          <span className={`tx-card-amount ${tx.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>
            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, settings.currency)}
          </span>
        </div>
        <div className="tx-card-meta">
          <span>{cat.name}</span>
          <span>•</span>
          <span>{formatRelativeDate(tx.date)}</span>
          <span>•</span>
          <span>{tx.paymentMethod}</span>
        </div>
        {tx.notes && (
          <div className="tx-card-meta" style={{ marginTop: 2 }}>
            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{tx.notes}</span>
          </div>
        )}
        <div className="tx-card-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(tx)}>✎ Edit</button>
          <button className="btn btn-ghost btn-sm tx-delete-btn" onClick={() => onDelete(tx)}>× Delete</button>
        </div>
      </div>
    </div>
  );
}

export default TransactionCard;
