import React from 'react';
import { NavLink } from 'react-router-dom';
import './MobileNavigation.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/transactions', icon: '↕', label: 'Transactions' },
  { path: '/budgets', icon: '◎', label: 'Budgets' },
  { path: '/reports', icon: '◈', label: 'Reports' },
  { path: '/settings', icon: '⚙', label: 'Settings' },
];

function MobileNavigation() {
  return (
    <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="mobile-nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNavigation;
