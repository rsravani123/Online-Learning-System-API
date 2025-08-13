import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoadingSpinner = () => {
  const { isLoading } = useAuth();

  if (!isLoading) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999
      }}
    >
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-3">
          <h5 className="text-primary">Loading...</h5>
          <p className="text-muted">Please wait while we process your request</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
