import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { courseAPI, handleAPIError } from '../utils/api';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  // State management
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [enrolling, setEnrolling] = useState({});

  // Fetch courses and enrolled courses
  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, categoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load available courses
      const courseParams = {
        page: currentPage,
        limit: 6,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'All' && { category: categoryFilter })
      };
      
      const [coursesResponse, enrolledResponse] = await Promise.all([
        courseAPI.getCourses(courseParams),
        courseAPI.getEnrolledCourses()
      ]);

      setCourses(coursesResponse.data);
      setTotalPages(coursesResponse.totalPages);
      setEnrolledCourses(enrolledResponse.data);
    } catch (error) {
      handleAPIError(error, showError);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(prev => ({ ...prev, [courseId]: true }));
      
      await courseAPI.enrollInCourse(courseId);
      showSuccess('Successfully enrolled in the course!');
      
      // Refresh data
      loadData();
    } catch (error) {
      handleAPIError(error, showError);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      await courseAPI.unenrollFromCourse(courseId);
      showSuccess('Successfully unenrolled from the course');
      
      // Refresh data
      loadData();
    } catch (error) {
      handleAPIError(error, showError);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  const categories = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Science', 'Language', 'Other'];

  if (loading && courses.length === 0) {
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
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">
            <i className="fas fa-graduation-cap me-2"></i>
            Student Dashboard
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
        {/* Search and Filter Section */}
        <div className="row mb-4">
          <div className="col-md-8">
            <form onSubmit={handleSearch}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search courses by title, description, or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-select-lg"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-bookmark me-2"></i>
                  My Enrolled Courses ({enrolledCourses.length})
                </h5>
              </div>
              <div className="card-body">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-book-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h6 className="text-muted">You haven't enrolled in any courses yet</h6>
                    <p className="text-muted">Browse available courses below to get started!</p>
                  </div>
                ) : (
                  <div className="row">
                    {enrolledCourses.map((course) => (
                      <div key={course._id} className="col-md-6 col-lg-4 mb-3">
                        <div className="card h-100 border-success">
                          <div className="card-body">
                            <h6 className="card-title">{course.title}</h6>
                            <p className="card-text text-muted small">{course.description}</p>
                            <p className="mb-2">
                              <small className="text-muted">
                                <i className="fas fa-user me-1"></i>
                                {course.instructor?.name || course.instructorName}
                              </small>
                            </p>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleUnenroll(course._id)}
                            >
                              <i className="fas fa-times me-1"></i>
                              Unenroll
                            </button>
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

        {/* Available Courses Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-book me-2"></i>
                  Available Courses
                </h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading courses...</p>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-search text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h6 className="text-muted">No courses found</h6>
                    <p className="text-muted">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  <div className="row">
                    {courses.map((course) => (
                      <div key={course._id} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100 shadow-sm">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title">{course.title}</h6>
                              <span className="badge bg-primary">{course.category}</span>
                            </div>
                            <p className="card-text text-muted small">{course.description}</p>
                            
                            <div className="mb-3">
                              <small className="text-muted d-block">
                                <i className="fas fa-user me-1"></i>
                                {course.instructor?.name || course.instructorName}
                              </small>
                              <small className="text-muted d-block">
                                <i className="fas fa-signal me-1"></i>
                                {course.level}
                              </small>
                              <small className="text-muted d-block">
                                <i className="fas fa-users me-1"></i>
                                {course.enrollmentCount} students
                              </small>
                              {course.rating > 0 && (
                                <small className="text-muted d-block">
                                  <i className="fas fa-star text-warning me-1"></i>
                                  {course.rating.toFixed(1)} ({course.reviews?.length || 0} reviews)
                                </small>
                              )}
                            </div>

                            <div className="d-grid">
                              {isEnrolled(course._id) ? (
                                <button className="btn btn-secondary" disabled>
                                  <i className="fas fa-check me-1"></i>
                                  Enrolled
                                </button>
                              ) : (
                                <button
                                  className="btn btn-primary"
                                  onClick={() => handleEnroll(course._id)}
                                  disabled={enrolling[course._id]}
                                >
                                  {enrolling[course._id] ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                      Enrolling...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-plus me-1"></i>
                                      Enroll Now
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {[...Array(totalPages)].map((_, index) => (
                          <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
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

export default StudentDashboard;