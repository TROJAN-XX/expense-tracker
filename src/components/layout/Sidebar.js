import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useExpense } from '../../context/ExpenseContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/transactions', icon: '↕', label: 'Transactions' },
  { path: '/budgets', icon: '◎', label: 'Budgets' },
  { path: '/reports', icon: '◈', label: 'Reports' },
  { path: '/categories', icon: '⊛', label: 'Categories' },
  { path: '/settings', icon: '⚙', label: 'Settings' },
];

function Sidebar({ onAddTransaction }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <span>₹</span>
        </div>
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-name">Expense</span>
            <span className="logo-name-accent">Tracker</span>
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Add Transaction button */}
      <div className="sidebar-add">
        <button
          className="btn btn-primary sidebar-add-btn"
          onClick={onAddTransaction}
          aria-label="Add transaction"
        >
          <span>+</span>
          {!collapsed && <span>Add Transaction</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
            {!collapsed && location.pathname === item.path && (
              <span className="active-indicator" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            <span className="privacy-dot" />
            <span>Local & Private</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
