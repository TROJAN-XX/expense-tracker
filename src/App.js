import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import MobileNavigation from './components/layout/MobileNavigation';
import TransactionForm from './components/transactions/TransactionForm';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';
import './index.css';

function AppShell() {
  const { isFirstRun } = useExpense();
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [txPageAddOpen, setTxPageAddOpen] = useState(false);

  if (isFirstRun) {
    return <Welcome />;
  }

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <Sidebar onAddTransaction={() => setAddTxOpen(true)} />

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navbar */}
        <Navbar onAddTransaction={() => setAddTxOpen(true)} />

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard onAddTransaction={() => setAddTxOpen(true)} />} />
          <Route path="/transactions" element={
            <Transactions
              isAddOpen={txPageAddOpen}
              setIsAddOpen={setTxPageAddOpen}
            />
          } />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />

      {/* Global Add Transaction Modal */}
      <TransactionForm
        isOpen={addTxOpen}
        onClose={() => setAddTxOpen(false)}
      />

      {/* Mobile FAB */}
      <button
        className="fab"
        onClick={() => setAddTxOpen(true)}
        aria-label="Add transaction"
        style={{ display: 'none' }} // shown via CSS on mobile
        id="mobile-fab"
      >
        +
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ExpenseProvider>
          <ToastProvider>
            <AppShell />
          </ToastProvider>
        </ExpenseProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
