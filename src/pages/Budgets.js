import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useToast } from '../components/common/Toast';
import { formatCurrency } from '../utils/currency';
import { calculateBudgetUsage } from '../utils/calculations';
import { validateBudget } from '../utils/validation';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import './Budgets.css';

const PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const EMPTY_FORM = { categoryId: '', amount: '', period: 'monthly' };

function BudgetForm({ budget, onClose, isOpen }) {
  const { categories, addBudget, updateBudget, settings } = useExpense();
  const toast = useToast();
  const isEditing = !!budget;

  const [form, setForm] = useState(budget ? {
    categoryId: budget.categoryId,
    amount: String(budget.amount),
    period: budget.period,
  } : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = (e) => {
    e.preventDefault();
    const { valid, errors: ve } = validateBudget({ ...form, amount: parseFloat(form.amount) });
    if (!valid) { setErrors(ve); return; }

    const payload = { categoryId: form.categoryId, amount: parseFloat(form.amount), period: form.period };
    if (isEditing) {
      updateBudget({ ...payload, id: budget.id });
      toast.success('Budget updated');
    } else {
      addBudget(payload);
      toast.success('Budget created');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Budget' : 'Create Budget'} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="budget-category">Category *</label>
          <select
            id="budget-category"
            className={`form-select ${errors.categoryId ? 'error' : ''}`}
            value={form.categoryId}
            onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">Select expense category...</option>
            {expenseCategories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="budget-amount">Budget Amount *</label>
          <div className="amount-input-wrapper">
            <span className="amount-prefix">₹</span>
            <input
              id="budget-amount"
              type="number"
              className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="Enter amount..."
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              min="1"
            />
          </div>
          {errors.amount && <span className="form-error">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="budget-period">Period *</label>
          <select
            id="budget-period"
            className="form-select"
            value={form.period}
            onChange={(e) => setForm(f => ({ ...f, period: e.target.value }))}
          >
            {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Save Changes' : 'Create Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BudgetCard({ budget }) {
  const { categories, transactions, settings, deleteBudget } = useExpense();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const cat = categories.find(c => c.id === budget.categoryId) || { name: 'Unknown', icon: '📦', color: '#78716c' };
  const usage = calculateBudgetUsage(budget, transactions, settings.budgetWarningThreshold, settings.budgetCriticalThreshold);

  const STATUS_LABELS = {
    safe: { label: 'On Track', className: 'safe' },
    warning: { label: 'Warning', className: 'warning' },
    critical: { label: 'Critical', className: 'danger' },
    exceeded: { label: 'Exceeded', className: 'danger' },
  };

  const statusInfo = STATUS_LABELS[usage.status];

  const handleDelete = () => {
    deleteBudget(budget.id);
    toast.success('Budget deleted');
  };

  return (
    <>
      <div className={`card budget-card status-${usage.status}`}>
        <div className="budget-card-header">
          <div className="budget-cat-info">
            <span className="cat-icon" style={{ background: cat.color + '22', color: cat.color }}>
              {cat.icon}
            </span>
            <div>
              <div className="budget-cat-name">{cat.name}</div>
              <div className="budget-period text-muted text-sm">
                {PERIODS.find(p => p.value === budget.period)?.label || budget.period}
              </div>
            </div>
          </div>
          <div className="budget-actions">
            <span className={`badge badge-${statusInfo.className}`}>{statusInfo.label}</span>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditOpen(true)} aria-label="Edit budget">✎</button>
            <button className="btn btn-ghost btn-sm btn-icon tx-delete-btn" onClick={() => setDeleteOpen(true)} aria-label="Delete budget">×</button>
          </div>
        </div>

        <div className="budget-amounts">
          <span className="budget-spent">{formatCurrency(usage.spent, settings.currency)}</span>
          <span className="budget-of text-muted"> / </span>
          <span className="budget-total">{formatCurrency(budget.amount, settings.currency)}</span>
        </div>

        <div className="progress-track" role="progressbar" aria-valuenow={usage.percentage} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`progress-fill ${usage.status === 'exceeded' ? 'exceeded' : usage.status === 'critical' ? 'critical' : usage.status === 'warning' ? 'warning' : 'safe'}`}
            style={{ width: `${Math.min(usage.percentage, 100)}%` }}
          />
        </div>

        <div className="budget-footer">
          <span className="budget-pct" style={{
            color: usage.status === 'safe' ? 'var(--success)' :
              usage.status === 'warning' ? 'var(--warning)' : 'var(--danger)'
          }}>
            {usage.rawPercentage.toFixed(1)}% used
          </span>
          <span className="text-muted text-sm">
            {usage.status === 'exceeded'
              ? `Exceeded by ${formatCurrency(usage.spent - budget.amount, settings.currency)}`
              : `${formatCurrency(usage.remaining, settings.currency)} remaining`
            }
          </span>
        </div>
      </div>

      <BudgetForm isOpen={editOpen} onClose={() => setEditOpen(false)} budget={budget} />
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Delete the ${cat.name} budget? This will not affect your transactions.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}

function Budgets() {
  const { budgets, transactions, settings } = useExpense();
  const [createOpen, setCreateOpen] = useState(false);

  // Check for budget alerts
  const alerts = budgets.filter(b => {
    if (!settings.budgetAlerts) return false;
    const usage = calculateBudgetUsage(b, transactions, settings.budgetWarningThreshold, settings.budgetCriticalThreshold);
    return usage.status === 'warning' || usage.status === 'critical' || usage.status === 'exceeded';
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">{budgets.length} active budget{budgets.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          + Create Budget
        </button>
      </div>

      {/* Budget alerts */}
      {alerts.length > 0 && settings.budgetAlerts && (
        <div className="budget-alerts">
          {alerts.map(b => {
            const usage = calculateBudgetUsage(b, transactions, settings.budgetWarningThreshold, settings.budgetCriticalThreshold);
            return (
              <div key={b.id} className={`budget-alert-item alert-${usage.status}`}>
                <span>⚠</span>
                <span>
                  {usage.status === 'exceeded'
                    ? `Budget exceeded — you went over by ${usage.rawPercentage.toFixed(0) - 100}%!`
                    : `Budget is ${usage.rawPercentage.toFixed(0)}% used — approaching your limit`
                  }
                </span>
              </div>
            );
          })}
        </div>
      )}

      {budgets.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No budgets yet"
          description="Create a budget to track your spending limits and get alerts before you overspend."
          action={
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              + Create Your First Budget
            </button>
          }
        />
      ) : (
        <div className="budgets-grid">
          {budgets.map(b => <BudgetCard key={b.id} budget={b} />)}
        </div>
      )}

      <BudgetForm isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

export default Budgets;
