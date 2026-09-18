import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your financial overview' },
  '/transactions': { title: 'Transactions', subtitle: 'Manage your transactions' },
  '/budgets': { title: 'Budgets', subtitle: 'Track your spending limits' },
  '/reports': { title: 'Reports', subtitle: 'Detailed financial reports' },
  '/categories': { title: 'Categories', subtitle: 'Organize your transactions' },
  '/settings': { title: 'Settings', subtitle: 'App preferences' },
};

function Navbar({ onAddTransaction }) {
  const location = useLocation();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'ExpenseTracker', subtitle: '' };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-left">
        <div className="navbar-title">
          <h1>{pageInfo.title}</h1>
          {pageInfo.subtitle && <p className="navbar-subtitle">{pageInfo.subtitle}</p>}
        </div>
      </div>
      <div className="navbar-right">
        {/* Theme toggle */}
        <button
          className="btn btn-ghost btn-sm navbar-theme-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
          title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {resolvedTheme === 'dark' ? '☀' : '◑'}
        </button>

        {/* Add transaction (desktop only) */}
        <button
          className="btn btn-primary btn-sm navbar-add-btn"
          onClick={onAddTransaction}
        >
          <span>+</span>
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
