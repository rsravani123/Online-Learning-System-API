import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI, courseAPI, handleAPIError } from '../utils/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load users when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, searchTerm, userFilter, currentPage]);

  // Load courses when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'courses') {
      loadCourses();
    }
  }, [activeTab, searchTerm, courseFilter, currentPage]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      handleAPIError(error, showError);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(userFilter !== 'all' && { role: userFilter })
      };
      
      const response = await adminAPI.getAllUsers(params);
      setUsers(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      handleAPIError(error, showError);
    }
  };

  const loadCourses = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(courseFilter !== 'all' && { category: courseFilter })
      };
      
      const response = await adminAPI.getAllCourses(params);
      setCourses(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      handleAPIError(error, showError);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      showSuccess('User deleted successfully');
      loadUsers();
      if (activeTab === 'dashboard') {
        loadDashboardData();
      }
    } catch (error) {
      handleAPIError(error, showError);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await courseAPI.deleteCourse(courseId);
      showSuccess('Course deleted successfully');
      loadCourses();
      if (activeTab === 'dashboard') {
        loadDashboardData();
      }
    } catch (error) {
      handleAPIError(error, showError);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !currentStatus });
      showSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error) {
      handleAPIError(error, showError);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'courses') {
      loadCourses();
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setUserFilter('all');
    setCourseFilter('all');
    setCurrentPage(1);
  };

  if (loading && !stats) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3 text-primary">Loading admin dashboard...</h5>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="fas fa-users fa-3x me-3"></i>
                <div>
                  <h3 className="mb-0">{stats?.stats.totalUsers || 0}</h3>
                  <p className="mb-0">Total Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="fas fa-graduation-cap fa-3x me-3"></i>
                <div>
                  <h3 className="mb-0">{stats?.stats.totalStudents || 0}</h3>
                  <p className="mb-0">Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="fas fa-chalkboard-teacher fa-3x me-3"></i>
                <div>
                  <h3 className="mb-0">{stats?.stats.totalInstructors || 0}</h3>
                  <p className="mb-0">Instructors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="fas fa-book fa-3x me-3"></i>
                <div>
                  <h3 className="mb-0">{stats?.stats.totalCourses || 0}</h3>
                  <p className="mb-0">Courses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Popular Courses</h5>
            </div>
            <div className="card-body">
              {stats?.popularCourses?.length === 0 ? (
                <p className="text-muted">No courses available</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Course Title</th>
                        <th>Instructor</th>
                        <th>Students</th>
                        <th>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.popularCourses?.map((course) => (
                        <tr key={course._id}>
                          <td>{course.title}</td>
                          <td>{course.instructor?.name}</td>
                          <td>
                            <span className="badge bg-primary">{course.enrollmentCount}</span>
                          </td>
                          <td>
                            <span className="text-warning">
                              {'★'.repeat(Math.floor(course.rating))} {course.rating.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Users</h5>
            </div>
            <div className="card-body">
              {stats?.recentUsers?.length === 0 ? (
                <p className="text-muted">No recent users</p>
              ) : (
                <div className="list-group list-group-flush">
                  {stats?.recentUsers?.map((user) => (
                    <div key={user._id} className="list-group-item px-0">
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                          <i className="fas fa-user text-white"></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-0">{user.name}</h6>
                          <small className="text-muted">{user.email}</small>
                          <div>
                            <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'instructor' ? 'success' : 'primary'}`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <small className="text-muted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </small>
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
  );

  const renderUsers = () => (
    <div>
      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search users by name or email..."
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
            className="form-select"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">User Management</h5>
          <button className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'instructor' ? 'success' : 'primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${user.isActive ? 'success' : 'secondary'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`fas fa-${user.isActive ? 'pause' : 'play'}`}></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
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
  );

  const renderCourses = () => (
    <div>
      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
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
            className="form-select"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
            <option value="Marketing">Marketing</option>
            <option value="Science">Science</option>
            <option value="Language">Language</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Course Management</h5>
          <button className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Category</th>
                  <th>Students</th>
                  <th>Rating</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <div>
                        <strong>{course.title}</strong>
                        <br />
                        <small className="text-muted">{course.description.substring(0, 50)}...</small>
                      </div>
                    </td>
                    <td>{course.instructor?.name || course.instructorName}</td>
                    <td>
                      <span className="badge bg-info">{course.category}</span>
                    </td>
                    <td>
                      <span className="badge bg-primary">{course.enrollmentCount}</span>
                    </td>
                    <td>
                      <span className="text-warning">
                        {'★'.repeat(Math.floor(course.rating))} {course.rating > 0 ? course.rating.toFixed(1) : 'N/A'}
                      </span>
                    </td>
                    <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteCourse(course._id)}
                        title="Delete Course"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
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
  );

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">
            <i className="fas fa-crown me-2"></i>
            Admin Dashboard
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

      {/* Navigation Tabs */}
      <div className="container-fluid py-3">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                resetFilters();
              }}
            >
              <i className="fas fa-tachometer-alt me-2"></i>
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('users');
                setCurrentPage(1);
                resetFilters();
              }}
            >
              <i className="fas fa-users me-2"></i>
              Users
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('courses');
                setCurrentPage(1);
                resetFilters();
              }}
            >
              <i className="fas fa-graduation-cap me-2"></i>
              Courses
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'courses' && renderCourses()}
      </div>
    </div>
  );
};

export default AdminDashboard;