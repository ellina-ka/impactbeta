import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import './styles.css';

function Toast({ message, type = 'success', onClose }) {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />
  };

  return (
    <div className={`toast toast-${type}`} data-testid="toast">
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}

export default Toast;
