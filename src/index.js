import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Apply theme before render to prevent flash
(function() {
  try {
    const saved = localStorage.getItem('expenseTrackerData');
    if (saved) {
      const data = JSON.parse(saved);
      const theme = data.settings?.theme || 'dark';
      let resolved = theme;
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA/offline functionality
serviceWorkerRegistration.register();
