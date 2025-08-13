import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="card shadow-lg border-0">
                  <div className="card-body text-center p-5">
                    <div className="mb-4">
                      <i className="fas fa-exclamation-triangle text-danger" style={{fontSize: '4rem'}}></i>
                    </div>
                    <h2 className="card-title text-danger mb-3">Oops! Something went wrong</h2>
                    <p className="card-text text-muted mb-4">
                      We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
                    </p>
                    
                    {process.env.NODE_ENV === 'development' && (
                      <div className="alert alert-danger text-left mt-4">
                        <h6>Error Details (Development Mode):</h6>
                        <p className="mb-2"><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                        <details className="mt-2">
                          <summary>Stack Trace</summary>
                          <pre className="mt-2 text-left" style={{fontSize: '0.8rem'}}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                          </pre>
                        </details>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <button 
                        className="btn btn-primary me-3"
                        onClick={() => window.location.reload()}
                      >
                        <i className="fas fa-redo me-2"></i>
                        Refresh Page
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => window.location.href = '/'}
                      >
                        <i className="fas fa-home me-2"></i>
                        Go Home
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
