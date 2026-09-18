import React, { useState, useMemo } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { useToast } from '../common/Toast';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import ConfirmDialog from '../common/ConfirmDialog';
import './TransactionTable.css';

function TransactionTable({ transactions, onEdit }) {
  const { deleteTransaction, categories, settings } = useExpense();
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || { name: 'Unknown', icon: '📦', color: '#78716c' };
  };

  const handleDelete = async () => {
    deleteTransaction(deleteTarget.id);
    toast.success('Transaction deleted');
  };

  return (
    <>
      <div className="table-container">
        <table aria-label="Transactions table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => {
              const cat = getCategoryInfo(tx.categoryId);
              return (
                <tr key={tx.id}>
                  <td className="tx-date">{formatDate(tx.date, settings.dateFormat)}</td>
                  <td>
                    <div className="tx-category">
                      <span className="cat-icon" style={{ background: cat.color + '22' }}>
                        {cat.icon}
                      </span>
                      <span className="tx-cat-name">{cat.name}</span>
                    </div>
                  </td>
                  <td className="tx-description">{tx.description || '—'}</td>
                  <td>
                    <span className={`tx-amount ${tx.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, settings.currency)}
                    </span>
                  </td>
                  <td>
                    <span className="tx-payment-badge">{tx.paymentMethod}</span>
                  </td>
                  <td className="tx-notes">{tx.notes || '—'}</td>
                  <td>
                    <div className="tx-actions">
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => onEdit(tx)}
                        aria-label={`Edit ${tx.description || 'transaction'}`}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon tx-delete-btn"
                        onClick={() => setDeleteTarget(tx)}
                        aria-label={`Delete ${tx.description || 'transaction'}`}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteTarget?.description || 'this transaction'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}

export default TransactionTable;
