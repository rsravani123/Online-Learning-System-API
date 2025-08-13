import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
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
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      showSuccess('Registration successful! Welcome aboard!');
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
                  <h2 className="card-title text-primary mb-2">Create Account</h2>
                  <p className="text-muted">Join our learning community</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-bold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control form-control-lg ${validationErrors.name ? 'is-invalid' : ''}`}
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {validationErrors.name && (
                      <div className="invalid-feedback">
                        {validationErrors.name}
                      </div>
                    )}
                  </div>

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

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-bold">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control form-control-lg ${validationErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      placeholder="Create a strong password"
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

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-bold">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-control form-control-lg ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {validationErrors.confirmPassword && (
                      <div className="invalid-feedback">
                        {validationErrors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="role" className="form-label fw-bold">
                      Account Type
                    </label>
                    <select
                      name="role"
                      className="form-select form-select-lg"
                      id="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={isLoading}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Administrator</option>
                    </select>
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
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="mb-0">
                      Already have an account?{' '}
                      <Link to="/" className="text-primary text-decoration-none fw-bold">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
