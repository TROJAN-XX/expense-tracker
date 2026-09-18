import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useToast } from '../components/common/Toast';
import { validateCategory } from '../utils/validation';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import './Categories.css';

const EMOJI_OPTIONS = ['🍔','🚗','🛍️','📄','🎬','🏥','📚','✈️','🛒','💆','💼','💻','🏢','📈','🎁','💰','🏠','🎮','🎵','🎨','⚽','💊','🔧','📱','🎓','🌳','🐾','☕','🍕','🌍'];

const COLOR_OPTIONS = [
  '#f97316','#3b82f6','#a855f7','#ef4444','#ec4899','#14b8a6','#6366f1','#0ea5e9',
  '#84cc16','#f43f5e','#78716c','#22c55e','#10b981','#059669','#16a34a','#4ade80',
  '#fbbf24','#fb923c','#60a5fa','#a78bfa','#f472b6','#34d399','#38bdf8','#818cf8',
];

function CategoryForm({ category, onClose, isOpen, existingNames }) {
  const { addCategory, updateCategory } = useExpense();
  const toast = useToast();
  const isEditing = !!category;

  const [form, setForm] = useState(category
    ? { name: category.name, type: category.type, icon: category.icon, color: category.color }
    : { name: '', type: 'expense', icon: '📦', color: '#f97316' }
  );
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const { valid, errors: ve } = validateCategory(form);
    if (!valid) { setErrors(ve); return; }

    // Check duplicate name (case-insensitive, excluding self)
    const isDuplicate = existingNames.some(n =>
      n.toLowerCase() === form.name.trim().toLowerCase() &&
      (!isEditing || n.toLowerCase() !== category.name.toLowerCase())
    );
    if (isDuplicate) {
      setErrors({ name: 'A category with this name already exists' });
      return;
    }

    if (isEditing) {
      updateCategory({ ...form, id: category.id });
      toast.success('Category updated');
    } else {
      addCategory(form);
      toast.success('Category created');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Category' : 'New Category'} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Type */}
        <div className="form-group">
          <label className="form-label">Type</label>
          <div className="tab-group">
            <button type="button" className={`tab-btn expense ${form.type === 'expense' ? 'active' : ''}`}
              onClick={() => setForm(f => ({ ...f, type: 'expense' }))}>Expense</button>
            <button type="button" className={`tab-btn income ${form.type === 'income' ? 'active' : ''}`}
              onClick={() => setForm(f => ({ ...f, type: 'income' }))}>Income</button>
          </div>
        </div>

        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="cat-name">Name *</label>
          <input
            id="cat-name"
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Groceries"
            maxLength={30}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        {/* Icon */}
        <div className="form-group">
          <label className="form-label">Icon</label>
          <div className="emoji-grid">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                type="button"
                className={`emoji-btn ${form.icon === emoji ? 'selected' : ''}`}
                onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                aria-label={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-grid">
            {COLOR_OPTIONS.map(color => (
              <button
                key={color}
                type="button"
                className={`color-btn ${form.color === color ? 'selected' : ''}`}
                style={{ background: color }}
                onClick={() => setForm(f => ({ ...f, color }))}
                aria-label={color}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="cat-preview">
          <span className="cat-icon" style={{ background: form.color + '22', color: form.color, width: 44, height: 44, fontSize: '1.25rem', borderRadius: 12 }}>
            {form.icon}
          </span>
          <span style={{ fontWeight: 500 }}>{form.name || 'Category Name'}</span>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEditing ? 'Save' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteCategoryDialog({ category, onClose, isOpen }) {
  const { categories, deleteCategory } = useExpense();
  const toast = useToast();
  const [replacement, setReplacement] = useState('other-expense');

  const otherCats = categories.filter(c => c.id !== category?.id && c.type === category?.type);

  const handleDelete = () => {
    deleteCategory(category.id, replacement);
    toast.success(`Category "${category.name}" deleted`);
    onClose();
  };

  if (!category) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Category" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="confirm-icon danger" style={{ margin: '0 auto' }}>⚠</div>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Move existing transactions from <strong>{category.name}</strong> to:
        </p>
        <select
          className="form-select"
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
        >
          {otherCats.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          All transactions in this category will be reassigned. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete Category</button>
        </div>
      </div>
    </Modal>
  );
}

function CategoryCard({ category }) {
  const { transactions } = useExpense();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { categories } = useExpense();

  const txCount = transactions.filter(t => t.categoryId === category.id).length;
  const existingNames = categories.map(c => c.name);

  return (
    <>
      <div className="cat-card card">
        <div className="cat-card-left">
          <span
            className="cat-icon"
            style={{ background: category.color + '22', color: category.color, width: 48, height: 48, fontSize: '1.375rem', borderRadius: 14 }}
          >
            {category.icon}
          </span>
          <div className="cat-card-info">
            <span className="cat-card-name">{category.name}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
              <span className={`badge ${category.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                {category.type}
              </span>
              <span className="text-muted text-sm">{txCount} transaction{txCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        <div className="cat-card-actions">
          <div className="cat-color-dot" style={{ background: category.color }} />
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditOpen(true)} aria-label="Edit category">✎</button>
          <button className="btn btn-ghost btn-sm btn-icon tx-delete-btn" onClick={() => setDeleteOpen(true)} aria-label="Delete category">×</button>
        </div>
      </div>

      <CategoryForm isOpen={editOpen} onClose={() => setEditOpen(false)} category={category} existingNames={existingNames} />
      <DeleteCategoryDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} category={category} />
    </>
  );
}

function Categories() {
  const { categories } = useExpense();
  const [createOpen, setCreateOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const existingNames = categories.map(c => c.name);

  const filtered = categories.filter(c => filterType === 'all' || c.type === filterType);
  const expenseCats = filtered.filter(c => c.type === 'expense');
  const incomeCats = filtered.filter(c => c.type === 'income');

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories total</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="tab-group" style={{ width: 'auto' }}>
            <button type="button" className={`tab-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>All</button>
            <button type="button" className={`tab-btn expense ${filterType === 'expense' ? 'active' : ''}`} onClick={() => setFilterType('expense')}>Expense</button>
            <button type="button" className={`tab-btn income ${filterType === 'income' ? 'active' : ''}`} onClick={() => setFilterType('income')}>Income</button>
          </div>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>+ Add Category</button>
        </div>
      </div>

      {(filterType === 'all' || filterType === 'expense') && expenseCats.length > 0 && (
        <div className="cat-section">
          <h2 className="cat-section-title">Expense Categories ({expenseCats.length})</h2>
          <div className="cat-grid">
            {expenseCats.map(c => <CategoryCard key={c.id} category={c} />)}
          </div>
        </div>
      )}

      {(filterType === 'all' || filterType === 'income') && incomeCats.length > 0 && (
        <div className="cat-section">
          <h2 className="cat-section-title">Income Categories ({incomeCats.length})</h2>
          <div className="cat-grid">
            {incomeCats.map(c => <CategoryCard key={c.id} category={c} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState icon="⊛" title="No categories" description="Create categories to organize your transactions." />
      )}

      <CategoryForm isOpen={createOpen} onClose={() => setCreateOpen(false)} existingNames={existingNames} />
    </div>
  );
}

export default Categories;
