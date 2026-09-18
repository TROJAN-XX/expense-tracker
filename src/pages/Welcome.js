import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import './Welcome.css';

function Welcome() {
  const { dismissFirstRun } = useExpense();

  return (
    <div className="welcome-page">
      <div className="welcome-card animate-scale-in">
        <div className="welcome-logo">
          <div className="welcome-logo-icon">₹</div>
        </div>
        <h1 className="welcome-title">
          Welcome to <span className="welcome-accent">ExpenseTracker</span>
        </h1>
        <p className="welcome-subtitle">
          Track your money privately. Everything stays on this device.
        </p>

        <div className="welcome-features">
          <div className="welcome-feature">
            <span className="welcome-feature-icon">📊</span>
            <div>
              <strong>Smart Dashboard</strong>
              <p>Visual insights into your finances</p>
            </div>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon">🔒</span>
            <div>
              <strong>100% Private</strong>
              <p>No account, no server, no cloud</p>
            </div>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon">📱</span>
            <div>
              <strong>Works Offline</strong>
              <p>Install as an app, use anywhere</p>
            </div>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon">💾</span>
            <div>
              <strong>Import & Export</strong>
              <p>Your data, your control</p>
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-lg welcome-cta" onClick={dismissFirstRun}>
          Start Tracking →
        </button>

        <p className="welcome-note">
          Sample data has been loaded. Feel free to clear it in Settings → Reset Data.
        </p>
      </div>
    </div>
  );
}

export default Welcome;
