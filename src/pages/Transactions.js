import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useToast } from '../components/common/Toast';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionCard from '../components/transactions/TransactionCard';
import TransactionForm from '../components/transactions/TransactionForm';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { filterTransactions } from '../utils/calculations';
import { PAYMENT_METHODS } from '../data/defaultData';
import useMediaQuery from '../hooks/useMediaQuery';
import './Transactions.css';

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'amount_desc', label: 'Highest Amount' },
  { value: 'amount_asc', label: 'Lowest Amount' },
  { value: 'desc_asc', label: 'A-Z Description' },
  { value: 'desc_desc', label: 'Z-A Description' },
];

function Transactions({ isAddOpen, setIsAddOpen }) {
  const { transactions, categories, deleteTransaction, settings } = useExpense();
  const toast = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Reset page when filters change
  const resetPage = () => setPage(1);

  const filtered = useMemo(() => {
    const base = filterTransactions(transactions, {
      type: filterType,
      categoryId: filterCategory,
      paymentMethod: filterPayment,
      search,
    });

    return base.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc': return a.date.localeCompare(b.date);
        case 'amount_desc': return b.amount - a.amount;
        case 'amount_asc': return a.amount - b.amount;
        case 'desc_asc': return (a.description || '').localeCompare(b.description || '');
        case 'desc_desc': return (b.description || '').localeCompare(a.description || '');
        case 'date_desc':
        default:
          return b.date.localeCompare(a.date) || new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [transactions, search, filterType, filterCategory, filterPayment, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  const handleDeleteConfirm = () => {
    deleteTransaction(deleteTx.id);
    toast.success('Transaction deleted');
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    resetPage();
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddOpen(true)}
        >
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card tx-filters">
        <div className="filter-row">
          {/* Search */}
          <div className="filter-search">
            <span className="search-icon">⊕</span>
            <input
              type="search"
              className="form-input search-input"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              aria-label="Search transactions"
            />
          </div>

          {/* Type */}
          <select
            className="form-select filter-select"
            value={filterType}
            onChange={handleFilterChange(setFilterType)}
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category */}
          <select
            className="form-select filter-select"
            value={filterCategory}
            onChange={handleFilterChange(setFilterCategory)}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <optgroup label="Expense">
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Income">
              {incomeCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </optgroup>
          </select>

          {/* Payment method */}
          <select
            className="form-select filter-select"
            value={filterPayment}
            onChange={handleFilterChange(setFilterPayment)}
            aria-label="Filter by payment method"
          >
            <option value="all">All Payments</option>
            {PAYMENT_METHODS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="form-select filter-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
            aria-label="Sort transactions"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {paginated.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={filtered.length === 0 && transactions.length > 0 ? 'No matching transactions' : 'No transactions yet'}
            description={
              filtered.length === 0 && transactions.length > 0
                ? 'Try adjusting your filters or search query.'
                : 'Start tracking your money by adding your first transaction.'
            }
            action={
              transactions.length === 0 && (
                <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
                  + Add Transaction
                </button>
              )
            }
          />
        ) : isMobile ? (
          <div className="mobile-tx-list">
            {paginated.map(tx => (
              <TransactionCard
                key={tx.id}
                tx={tx}
                onEdit={setEditTx}
                onDelete={setDeleteTx}
              />
            ))}
          </div>
        ) : (
          <TransactionTable
            transactions={paginated}
            onEdit={setEditTx}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '0 20px 20px' }}>
            <div className="pagination">
              <div className="pagination-info">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </div>
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5) {
                    if (page <= 3) p = i + 1;
                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                    else p = page - 2 + i;
                  }
                  return (
                    <button
                      key={p}
                      className={`page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={page === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '5px 10px' }}
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                aria-label="Items per page"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Forms */}
      <TransactionForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
      <TransactionForm
        isOpen={!!editTx}
        onClose={() => setEditTx(null)}
        editData={editTx}
      />

      {/* Delete confirmation (for mobile card view) */}
      <ConfirmDialog
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Delete "${deleteTx?.description || 'this transaction'}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

export default Transactions;
