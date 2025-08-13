import React from 'react';
import { useToast } from '../context/ToastContext';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getToastClass = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      case 'info':
      default:
        return 'bg-info text-white';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  };

  return (
    <div 
      className="position-fixed top-0 end-0 p-3" 
      style={{ zIndex: 1050 }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast show mb-2 ${getToastClass(toast.type)}`}
          role="alert"
          style={{ minWidth: '300px' }}
        >
          <div className="toast-header">
            <i className={`${getIcon(toast.type)} me-2`}></i>
            <strong className="me-auto text-capitalize">{toast.type}</strong>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body">
            {toast.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
