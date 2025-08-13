import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { courseAPI, handleAPIError } from '../utils/api';

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner',
    price: 0,
    duration: 0
  });
  const [formErrors, setFormErrors] = useState({});

  // Load instructor's courses
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getInstructorCourses();
      setCourses(response.data);
    } catch (error) {
      handleAPIError(error, showError);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!courseForm.title.trim()) {
      errors.title = 'Course title is required';
    } else if (courseForm.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!courseForm.description.trim()) {
      errors.description = 'Course description is required';
    } else if (courseForm.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (courseForm.price < 0) {
      errors.price = 'Price cannot be negative';
    }

    if (courseForm.duration < 0) {
      errors.duration = 'Duration cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      
      if (editingCourse) {
        // Update course
        await courseAPI.updateCourse(editingCourse._id, courseForm);
        showSuccess('Course updated successfully!');
      } else {
        // Create new course
        await courseAPI.createCourse(courseForm);
        showSuccess('Course created successfully!');
      }
      
      // Reset form and reload courses
      resetForm();
      loadCourses();
    } catch (error) {
      handleAPIError(error, showError);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      duration: course.duration
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await courseAPI.deleteCourse(courseId);
      showSuccess('Course deleted successfully');
      loadCourses();
    } catch (error) {
      handleAPIError(error, showError);
    }
  };

  const resetForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: 'Programming',
      level: 'Beginner',
      price: 0,
      duration: 0
    });
    setFormErrors({});
    setShowCreateForm(false);
    setEditingCourse(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Language', 'Other'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3 text-primary">Loading your dashboard...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f0f8ff, #e6ffe6)' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">
            <i className="fas fa-chalkboard-teacher me-2"></i>
            Instructor Dashboard
          </span>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">
              Welcome, <strong>{user?.name}</strong>
            </span>
            <button className="btn btn-outline-light" onClick={logout}>
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Stats Overview */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="fas fa-book fa-2x me-3"></i>
                  <div>
                    <h5 className="card-title mb-0">{courses.length}</h5>
                    <p className="card-text">Total Courses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="fas fa-users fa-2x me-3"></i>
                  <div>
                    <h5 className="card-title mb-0">
                      {courses.reduce((total, course) => total + course.enrollmentCount, 0)}
                    </h5>
                    <p className="card-text">Total Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="fas fa-star fa-2x me-3"></i>
                  <div>
                    <h5 className="card-title mb-0">
                      {courses.length > 0 
                        ? (courses.reduce((total, course) => total + course.rating, 0) / courses.length).toFixed(1)
                        : '0.0'
                      }
                    </h5>
                    <p className="card-text">Avg Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="fas fa-comments fa-2x me-3"></i>
                  <div>
                    <h5 className="card-title mb-0">
                      {courses.reduce((total, course) => total + (course.reviews?.length || 0), 0)}
                    </h5>
                    <p className="card-text">Total Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Management Section */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-graduation-cap me-2"></i>
                  My Courses
                </h5>
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => setShowCreateForm(true)}
                >
                  <i className="fas fa-plus me-1"></i>
                  Add New Course
                </button>
              </div>
              <div className="card-body">
                {/* Create/Edit Course Form */}
                {showCreateForm && (
                  <div className="card mb-4 border-success">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        {editingCourse ? 'Edit Course' : 'Create New Course'}
                      </h6>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleFormSubmit}>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Course Title *</label>
                              <input
                                type="text"
                                name="title"
                                className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                                value={courseForm.title}
                                onChange={handleInputChange}
                                placeholder="Enter course title"
                                disabled={formLoading}
                              />
                              {formErrors.title && (
                                <div className="invalid-feedback">{formErrors.title}</div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="mb-3">
                              <label className="form-label">Category</label>
                              <select
                                name="category"
                                className="form-select"
                                value={courseForm.category}
                                onChange={handleInputChange}
                                disabled={formLoading}
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="mb-3">
                              <label className="form-label">Level</label>
                              <select
                                name="level"
                                className="form-select"
                                value={courseForm.level}
                                onChange={handleInputChange}
                                disabled={formLoading}
                              >
                                {levels.map(level => (
                                  <option key={level} value={level}>{level}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label">Description *</label>
                          <textarea
                            name="description"
                            className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                            rows="4"
                            value={courseForm.description}
                            onChange={handleInputChange}
                            placeholder="Enter course description"
                            disabled={formLoading}
                          />
                          {formErrors.description && (
                            <div className="invalid-feedback">{formErrors.description}</div>
                          )}
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Price ($)</label>
                              <input
                                type="number"
                                name="price"
                                className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                                value={courseForm.price}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                disabled={formLoading}
                              />
                              {formErrors.price && (
                                <div className="invalid-feedback">{formErrors.price}</div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Duration (hours)</label>
                              <input
                                type="number"
                                name="duration"
                                className={`form-control ${formErrors.duration ? 'is-invalid' : ''}`}
                                value={courseForm.duration}
                                onChange={handleInputChange}
                                min="0"
                                disabled={formLoading}
                              />
                              {formErrors.duration && (
                                <div className="invalid-feedback">{formErrors.duration}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            type="submit"
                            className="btn btn-success"
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                {editingCourse ? 'Updating...' : 'Creating...'}
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-1"></i>
                                {editingCourse ? 'Update Course' : 'Create Course'}
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={resetForm}
                            disabled={formLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Courses List */}
                {courses.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-chalkboard text-muted mb-3" style={{ fontSize: '4rem' }}></i>
                    <h5 className="text-muted">No courses yet</h5>
                    <p className="text-muted">Create your first course to get started!</p>
                    <button
                      className="btn btn-success"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Create Your First Course
                    </button>
                  </div>
                ) : (
                  <div className="row">
                    {courses.map((course) => (
                      <div key={course._id} className="col-lg-6 mb-4">
                        <div className="card h-100 border-success">
                          <div className="card-header bg-light">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{course.title}</h6>
                                <small className="text-muted">
                                  <span className="badge bg-primary me-1">{course.category}</span>
                                  <span className="badge bg-info">{course.level}</span>
                                </small>
                              </div>
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                >
                                  Actions
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleEdit(course)}
                                    >
                                      <i className="fas fa-edit me-2"></i>Edit
                                    </button>
                                  </li>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => handleDelete(course._id)}
                                    >
                                      <i className="fas fa-trash me-2"></i>Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="card-body">
                            <p className="card-text text-muted small">{course.description}</p>
                            
                            <div className="row text-center mb-3">
                              <div className="col-4">
                                <div className="border-end">
                                  <strong className="d-block text-primary">{course.enrollmentCount}</strong>
                                  <small className="text-muted">Students</small>
                                </div>
                              </div>
                              <div className="col-4">
                                <div className="border-end">
                                  <strong className="d-block text-warning">
                                    {course.rating > 0 ? course.rating.toFixed(1) : 'N/A'}
                                  </strong>
                                  <small className="text-muted">Rating</small>
                                </div>
                              </div>
                              <div className="col-4">
                                <strong className="d-block text-success">
                                  ${course.price}
                                </strong>
                                <small className="text-muted">Price</small>
                              </div>
                            </div>

                            {course.reviews && course.reviews.length > 0 && (
                              <div className="mt-3">
                                <h6 className="mb-2">Recent Reviews:</h6>
                                {course.reviews.slice(0, 2).map((review, index) => (
                                  <div key={index} className="border-start border-success border-3 ps-3 mb-2">
                                    <div className="d-flex align-items-center mb-1">
                                      <div className="text-warning me-2">
                                        {'★'.repeat(review.rating)}
                                      </div>
                                      <small className="text-muted">
                                        by {review.user?.name || 'Anonymous'}
                                      </small>
                                    </div>
                                    <p className="mb-0 small text-muted">{review.comment}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="card-footer bg-light">
                            <small className="text-muted">
                              Created: {new Date(course.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;