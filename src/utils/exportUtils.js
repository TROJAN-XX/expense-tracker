// Export utilities - JSON and CSV export in the browser
import { exportDataAsJSON } from './storage';

/**
 * Trigger a browser file download with the given content.
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all application data as JSON.
 */
export function exportJSON(data) {
  const jsonStr = exportDataAsJSON(data);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(jsonStr, `expense-tracker-backup-${dateStr}.json`, 'application/json');
}

/**
 * Export transactions as CSV.
 */
export function exportCSV(transactions, categories) {
  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Unknown';
  };

  const escape = (val) => {
    const str = String(val == null ? '' : val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Notes'];
  
  const rows = transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(t => [
      escape(t.date),
      escape(t.type === 'income' ? 'Income' : 'Expense'),
      escape(getCategoryName(t.categoryId)),
      escape(t.description || ''),
      escape(t.type === 'expense' ? `-${t.amount}` : t.amount),
      escape(t.paymentMethod || ''),
      escape(t.notes || ''),
    ]);

  const csvContent = [
    headers.map(escape).join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `transactions-${dateStr}.csv`, 'text/csv');
}

/**
 * Read a file as text using the FileReader API.
 * Returns a Promise resolving to the file content string.
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
