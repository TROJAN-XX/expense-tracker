// Validation utilities for forms

/**
 * Validate a transaction form object.
 * Returns { valid: boolean, errors: object }
 */
export function validateTransaction(data) {
  const errors = {};

  // Amount
  if (!data.amount || data.amount === '') {
    errors.amount = 'Amount is required';
  } else {
    const amt = parseFloat(data.amount);
    if (isNaN(amt) || amt <= 0) {
      errors.amount = 'Amount must be a positive number';
    } else if (amt > 999999999) {
      errors.amount = 'Amount is too large';
    }
  }

  // Type
  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.type = 'Please select a transaction type';
  }

  // Category
  if (!data.categoryId || data.categoryId.trim() === '') {
    errors.categoryId = 'Please select a category';
  }

  // Date
  if (!data.date || data.date.trim() === '') {
    errors.date = 'Date is required';
  } else {
    const d = new Date(data.date);
    if (isNaN(d.getTime())) {
      errors.date = 'Please enter a valid date';
    }
  }

  // Payment method
  if (!data.paymentMethod || data.paymentMethod.trim() === '') {
    errors.paymentMethod = 'Please select a payment method';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate a budget form object.
 */
export function validateBudget(data) {
  const errors = {};

  if (!data.categoryId || data.categoryId.trim() === '') {
    errors.categoryId = 'Please select a category';
  }

  if (!data.amount || data.amount === '') {
    errors.amount = 'Budget amount is required';
  } else {
    const amt = parseFloat(data.amount);
    if (isNaN(amt) || amt <= 0) {
      errors.amount = 'Budget must be a positive number';
    }
  }

  if (!data.period || !['daily', 'weekly', 'monthly', 'yearly'].includes(data.period)) {
    errors.period = 'Please select a period';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate a category form object.
 */
export function validateCategory(data) {
  const errors = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Category name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Category name must be at least 2 characters';
  } else if (data.name.trim().length > 30) {
    errors.name = 'Category name is too long (max 30 characters)';
  }

  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.type = 'Please select a category type';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize a number input string.
 */
export function sanitizeAmount(value) {
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  // Only allow one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  return cleaned;
}
