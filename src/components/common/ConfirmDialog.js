import React, { useState } from 'react';
import Modal from './Modal';
import './ConfirmDialog.css';

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  requireTyped = null, // If set, user must type this value to confirm
}) {
  const [typedValue, setTypedValue] = useState('');
  const [loading, setLoading] = useState(false);

  const isConfirmEnabled = requireTyped ? typedValue === requireTyped : true;

  const handleConfirm = async () => {
    if (!isConfirmEnabled) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setTypedValue('');
      onClose();
    }
  };

  const handleClose = () => {
    setTypedValue('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="confirm-dialog">
        {variant === 'danger' && (
          <div className="confirm-icon danger">
            <span>⚠</span>
          </div>
        )}
        <p className="confirm-message">{message}</p>

        {requireTyped && (
          <div className="confirm-type-input">
            <p className="confirm-type-label">
              Type <strong>{requireTyped}</strong> to confirm:
            </p>
            <input
              type="text"
              className="form-input"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={requireTyped}
              autoFocus
            />
          </div>
        )}

        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={handleClose} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={`btn btn-${variant}`}
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || loading}
          >
            {loading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
