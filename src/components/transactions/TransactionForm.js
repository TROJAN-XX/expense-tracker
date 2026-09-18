import React, { useState, useEffect } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { useToast } from '../common/Toast';
import { validateTransaction, sanitizeAmount } from '../../utils/validation';
import { getCurrencySymbol } from '../../utils/currency';
import { getTodayString } from '../../utils/dateUtils';
import { PAYMENT_METHODS } from '../../data/defaultData';
import Modal from '../common/Modal';
import './TransactionForm.css';

const EMPTY_FORM = {
  type: 'expense',
  amount: '',
  categoryId: '',
  description: '',
  date: getTodayString(),
  paymentMethod: 'UPI',
  notes: '',
};

function TransactionForm({ isOpen, onClose, editData = null }) {
  const { categories, addTransaction, updateTransaction, settings } = useExpense();
  const toast = useToast();
  const currencySymbol = getCurrencySymbol(settings.currency);
  const isEditing = !!editData;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Reset or populate form when opened
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({
          type: editData.type,
          amount: String(editData.amount),
          categoryId: editData.categoryId,
          description: editData.description || '',
          date: editData.date,
          paymentMethod: editData.paymentMethod || 'UPI',
          notes: editData.notes || '',
        });
      } else {
        setForm({
          ...EMPTY_FORM,
          type: settings.defaultTransactionType || 'expense',
          date: getTodayString(),
        });
      }
      setErrors({});
    }
  }, [isOpen, editData, settings.defaultTransactionType]);

  const filteredCategories = categories.filter(c => c.type === form.type);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'amount') value = sanitizeAmount(value);
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleTypeChange = (type) => {
    setForm(prev => ({
      ...prev,
      type,
      categoryId: '', // reset category when type changes
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateTransaction({
      ...form,
      amount: parseFloat(form.amount),
    });

    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      type: form.type,
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      description: form.description.trim(),
      date: form.date,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
    };

    if (isEditing) {
      updateTransaction({ ...payload, id: editData.id });
      toast.success('Transaction updated successfully');
    } else {
      addTransaction(payload);
      toast.success('Transaction added successfully');
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="transaction-form" noValidate>
        {/* Type selector */}
        <div className="form-group">
          <label className="form-label">Transaction Type</label>
          <div className="tab-group">
            <button
              type="button"
              className={`tab-btn expense ${form.type === 'expense' ? 'active' : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              🔻 Expense
            </button>
            <button
              type="button"
              className={`tab-btn income ${form.type === 'income' ? 'active' : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              🔺 Income
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label" htmlFor="tx-amount">Amount *</label>
          <div className="amount-input-wrapper">
            <span className="amount-prefix">{currencySymbol}</span>
            <input
              id="tx-amount"
              type="text"
              inputMode="decimal"
              className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange('amount')}
              autoComplete="off"
            />
          </div>
          {errors.amount && <span className="form-error">{errors.amount}</span>}
        </div>

        {/* Two column: Category + Date */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="tx-category">Category *</label>
            <select
              id="tx-category"
              className={`form-select ${errors.categoryId ? 'error' : ''}`}
              value={form.categoryId}
              onChange={handleChange('categoryId')}
            >
              <option value="">Select category...</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tx-date">Date *</label>
            <input
              id="tx-date"
              type="date"
              className={`form-input ${errors.date ? 'error' : ''}`}
              value={form.date}
              onChange={handleChange('date')}
              max={getTodayString()}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="tx-description">Description</label>
          <input
            id="tx-description"
            type="text"
            className="form-input"
            placeholder="What was this for?"
            value={form.description}
            onChange={handleChange('description')}
            maxLength={100}
          />
        </div>

        {/* Payment method + Notes */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="tx-payment">Payment Method *</label>
            <select
              id="tx-payment"
              className={`form-select ${errors.paymentMethod ? 'error' : ''}`}
              value={form.paymentMethod}
              onChange={handleChange('paymentMethod')}
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {errors.paymentMethod && <span className="form-error">{errors.paymentMethod}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tx-notes">Notes</label>
            <input
              id="tx-notes"
              type="text"
              className="form-input"
              placeholder="Optional notes..."
              value={form.notes}
              onChange={handleChange('notes')}
              maxLength={200}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`btn ${form.type === 'income' ? 'btn-success' : 'btn-primary'}`}>
            {isEditing ? 'Save Changes' : `Add ${form.type === 'income' ? 'Income' : 'Expense'}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TransactionForm;
