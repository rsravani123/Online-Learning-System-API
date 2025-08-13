// API utility functions for making HTTP requests

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: createHeaders(options.includeAuth !== false),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      includeAuth: false,
    }),

  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    }),

  getMe: () => apiRequest('/auth/me'),

  updateProfile: (profileData) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  changePassword: (passwordData) =>
    apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),
};

// Course API functions
export const courseAPI = {
  getCourses: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/courses${queryString ? `?${queryString}` : ''}`);
  },

  getCourse: (id) => apiRequest(`/courses/${id}`),

  createCourse: (courseData) =>
    apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),

  updateCourse: (id, courseData) =>
    apiRequest(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    }),

  deleteCourse: (id) =>
    apiRequest(`/courses/${id}`, {
      method: 'DELETE',
    }),

  enrollInCourse: (id) =>
    apiRequest(`/courses/${id}/enroll`, {
      method: 'POST',
    }),

  unenrollFromCourse: (id) =>
    apiRequest(`/courses/${id}/unenroll`, {
      method: 'POST',
    }),

  addReview: (id, reviewData) =>
    apiRequest(`/courses/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  getInstructorCourses: () => apiRequest('/courses/instructor/my-courses'),

  getEnrolledCourses: () => apiRequest('/courses/student/enrolled'),
};

// Admin API functions
export const adminAPI = {
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  getUserById: (id) => apiRequest(`/admin/users/${id}`),

  updateUser: (id, userData) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (id) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  getAllCourses: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/courses${queryString ? `?${queryString}` : ''}`);
  },

  getDashboardStats: () => apiRequest('/admin/stats'),
};

// Helper function for handling API errors
export const handleAPIError = (error, showToast) => {
  const message = error.message || 'An unexpected error occurred';
  
  if (showToast) {
    showToast(message, 'error');
  }
  
  // If token is invalid, redirect to login
  if (message.includes('token') || message.includes('unauthorized')) {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
  
  return message;
};

export default apiRequest;
