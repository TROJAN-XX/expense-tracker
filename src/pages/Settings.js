import React, { useState, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import { exportJSON, exportCSV, readFileAsText } from '../utils/exportUtils';
import { importDataFromJSON } from '../utils/storage';
import { getStorageInfo, APP_VERSION_STRING } from '../utils/storage';
import { CURRENCIES, DATE_FORMATS } from '../data/defaultData';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import './Settings.css';

function Section({ title, children }) {
  return (
    <div className="card settings-section">
      <h2 className="settings-section-title">{title}</h2>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="setting-row">
      <div className="setting-info">
        <span className="setting-label">{label}</span>
        {description && <span className="setting-desc">{description}</span>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

function ImportPreviewModal({ isOpen, summary, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Preview" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="import-preview-grid">
          <div className="import-stat"><span className="import-stat-val">{summary?.transactions}</span><span>Transactions</span></div>
          <div className="import-stat"><span className="import-stat-val">{summary?.categories}</span><span>Categories</span></div>
          <div className="import-stat"><span className="import-stat-val">{summary?.budgets}</span><span>Budgets</span></div>
        </div>
        {summary?.exportedAt && (
          <p className="text-muted text-sm text-center">
            Exported on: {new Date(summary.exportedAt).toLocaleString()}
          </p>
        )}
        <div className="import-warning">
          ⚠ This will replace all existing data. This action cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Import Data</button>
        </div>
      </div>
    </Modal>
  );
}

function Settings() {
  const { settings, updateSettings, resetData, importData, transactions, categories, budgets } = useExpense();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const fileRef = useRef(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const storageInfo = getStorageInfo();

  const handleThemeChange = (t) => {
    setTheme(t);
    updateSettings({ theme: t });
  };

  const handleExportJSON = () => {
    try {
      exportJSON({ transactions, categories, budgets, settings });
      toast.success('Data exported successfully');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportCSV = () => {
    try {
      exportCSV(transactions, categories);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('CSV export failed');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    try {
      const text = await readFileAsText(file);
      const result = importDataFromJSON(text);
      if (!result.valid) {
        toast.error(`Import failed: ${result.error}`);
        return;
      }
      setImportSummary(result.summary);
      setPendingImport(result.data);
    } catch {
      toast.error('Failed to read file');
    }
  };

  const handleConfirmImport = () => {
    importData(pendingImport);
    toast.success('Data imported successfully');
    setImportSummary(null);
    setPendingImport(null);
  };

  const handleReset = () => {
    resetData();
    toast.success('All data has been reset');
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Customize your app experience</p>
        </div>
      </div>

      {/* Appearance */}
      <Section title="🎨 Appearance">
        <SettingRow label="Theme" description="Choose your preferred color scheme">
          <div className="theme-options">
            {['dark', 'light', 'system'].map(t => (
              <button
                key={t}
                className={`theme-option ${theme === t ? 'active' : ''}`}
                onClick={() => handleThemeChange(t)}
              >
                {t === 'dark' ? '🌙' : t === 'light' ? '☀' : '⊙'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Currency & Format */}
      <Section title="💰 Currency & Format">
        <SettingRow label="Currency" description="Default currency for all amounts">
          <select
            className="form-select settings-select"
            value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value })}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
            ))}
          </select>
        </SettingRow>
        <div className="divider" />
        <SettingRow label="Date Format" description="How dates are displayed throughout the app">
          <select
            className="form-select settings-select"
            value={settings.dateFormat}
            onChange={(e) => updateSettings({ dateFormat: e.target.value })}
          >
            {DATE_FORMATS.map(f => (
              <option key={f.value} value={f.value}>{f.label} — {f.example}</option>
            ))}
          </select>
        </SettingRow>
      </Section>

      {/* Transactions */}
      <Section title="↕ Transactions">
        <SettingRow label="Default Transaction Type" description="Pre-selected type when adding a transaction">
          <div className="tab-group" style={{ width: 200 }}>
            <button
              type="button"
              className={`tab-btn expense ${settings.defaultTransactionType === 'expense' ? 'active' : ''}`}
              onClick={() => updateSettings({ defaultTransactionType: 'expense' })}
            >Expense</button>
            <button
              type="button"
              className={`tab-btn income ${settings.defaultTransactionType === 'income' ? 'active' : ''}`}
              onClick={() => updateSettings({ defaultTransactionType: 'income' })}
            >Income</button>
          </div>
        </SettingRow>
        <div className="divider" />
        <SettingRow label="Transactions per Page" description="How many transactions to show per page">
          <select
            className="form-select settings-select"
            value={settings.transactionsPerPage}
            onChange={(e) => updateSettings({ transactionsPerPage: Number(e.target.value) })}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </SettingRow>
      </Section>

      {/* Budget Alerts */}
      <Section title="◎ Budget Alerts">
        <SettingRow label="Enable Budget Alerts" description="Show warnings when approaching budget limits">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.budgetAlerts}
              onChange={(e) => updateSettings({ budgetAlerts: e.target.checked })}
            />
            <span className="toggle-slider" />
          </label>
        </SettingRow>
        {settings.budgetAlerts && (
          <>
            <div className="divider" />
            <SettingRow label="Warning Threshold" description="Show warning when budget is this % used">
              <div className="threshold-input">
                <input
                  type="number"
                  className="form-input"
                  style={{ width: 80 }}
                  min={10} max={95}
                  value={settings.budgetWarningThreshold}
                  onChange={(e) => updateSettings({ budgetWarningThreshold: Number(e.target.value) })}
                />
                <span className="text-muted">%</span>
              </div>
            </SettingRow>
            <div className="divider" />
            <SettingRow label="Critical Threshold" description="Show critical alert when budget is this % used">
              <div className="threshold-input">
                <input
                  type="number"
                  className="form-input"
                  style={{ width: 80 }}
                  min={50} max={100}
                  value={settings.budgetCriticalThreshold}
                  onChange={(e) => updateSettings({ budgetCriticalThreshold: Number(e.target.value) })}
                />
                <span className="text-muted">%</span>
              </div>
            </SettingRow>
          </>
        )}
      </Section>

      {/* Data */}
      <Section title="💾 Data Management">
        <SettingRow label="Export JSON Backup" description="Download all your data as a JSON file">
          <button className="btn btn-ghost btn-sm" onClick={handleExportJSON}>⬇ Export JSON</button>
        </SettingRow>
        <div className="divider" />
        <SettingRow label="Export Transactions CSV" description="Download transactions as a spreadsheet">
          <button className="btn btn-ghost btn-sm" onClick={handleExportCSV}>⬇ Export CSV</button>
        </SettingRow>
        <div className="divider" />
        <SettingRow label="Import JSON Backup" description="Restore data from a previous backup">
          <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>⬆ Import JSON</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />
        </SettingRow>
        <div className="divider" />
        <SettingRow label="Reset All Data" description="Permanently delete all transactions, budgets, and categories">
          <button className="btn btn-danger btn-sm" onClick={() => setResetOpen(true)}>⚠ Reset Data</button>
        </SettingRow>
      </Section>

      {/* About */}
      <Section title="ℹ About">
        <div className="about-grid">
          <div className="about-item">
            <span className="about-label">App Version</span>
            <span className="about-value">v{APP_VERSION_STRING}</span>
          </div>
          <div className="about-item">
            <span className="about-label">Storage Used</span>
            <span className="about-value">{storageInfo.kb} KB</span>
          </div>
          <div className="about-item">
            <span className="about-label">Transactions</span>
            <span className="about-value">{transactions.length}</span>
          </div>
          <div className="about-item">
            <span className="about-label">Categories</span>
            <span className="about-value">{categories.length}</span>
          </div>
        </div>

        <div className="divider" />

        <div className="privacy-notice">
          <div className="privacy-notice-header">
            <span className="privacy-icon">🔒</span>
            <strong>Privacy-First by Design</strong>
          </div>
          <p>
            Your financial data is stored locally in your browser. ExpenseTracker does not require
            an account, does not send your data to any server, and works completely offline after
            initial load.
          </p>
          <div className="privacy-tags">
            <span className="privacy-tag">✓ No Backend</span>
            <span className="privacy-tag">✓ No Database</span>
            <span className="privacy-tag">✓ No Tracking</span>
            <span className="privacy-tag">✓ Offline First</span>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div className="settings-footer">
        <strong>ExpenseTracker</strong>
        <p>Your money. Your control.</p>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="This will permanently delete all locally stored transactions, budgets and categories. This action cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        variant="danger"
        requireTyped="RESET"
      />

      <ImportPreviewModal
        isOpen={!!importSummary}
        summary={importSummary}
        onClose={() => { setImportSummary(null); setPendingImport(null); }}
        onConfirm={handleConfirmImport}
      />
    </div>
  );
}

export default Settings;
