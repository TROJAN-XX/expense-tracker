import React from 'react';
import './EmptyState.css';

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">{icon || '📭'}</div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && (
        <div className="empty-action">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
