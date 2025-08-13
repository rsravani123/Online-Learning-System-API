import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, showError, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      showSuccess('Login successful!');
      navigate(`/${result.data.user.role}`);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="card-title text-primary mb-2">Welcome Back</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-bold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control form-control-lg ${validationErrors.email ? 'is-invalid' : ''}`}
                      id="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback">
                        {validationErrors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-bold">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control form-control-lg ${validationErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {validationErrors.password && (
                      <div className="invalid-feedback">
                        {validationErrors.password}
                      </div>
                    )}
                  </div>

                  <div className="d-grid mb-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="mb-0">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-primary text-decoration-none fw-bold">
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </form>

                {/* Demo Credentials */}
                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="mb-2 text-center">Demo Credentials</h6>
                  <small className="text-muted d-block">
                    <strong>Student:</strong> student@demo.com / Password123<br/>
                    <strong>Instructor:</strong> instructor@demo.com / Password123<br/>
                    <strong>Admin:</strong> admin@demo.com / Password123
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
