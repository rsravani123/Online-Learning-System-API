import React, { createContext, useContext, useReducer } from 'react';

// Toast action types
const TOAST_ACTIONS = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_TOASTS: 'CLEAR_TOASTS'
};

// Initial state
const initialState = {
  toasts: []
};

// Toast reducer
const toastReducer = (state, action) => {
  switch (action.type) {
    case TOAST_ACTIONS.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };
    case TOAST_ACTIONS.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
    case TOAST_ACTIONS.CLEAR_TOASTS:
      return {
        ...state,
        toasts: []
      };
    default:
      return state;
  }
};

// Create context
const ToastContext = createContext();

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  // Add toast function
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration
    };

    dispatch({
      type: TOAST_ACTIONS.ADD_TOAST,
      payload: toast
    });

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  // Remove toast function
  const removeToast = (id) => {
    dispatch({
      type: TOAST_ACTIONS.REMOVE_TOAST,
      payload: id
    });
  };

  // Clear all toasts
  const clearToasts = () => {
    dispatch({ type: TOAST_ACTIONS.CLEAR_TOASTS });
  };

  // Convenience methods for different toast types
  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  const value = {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
