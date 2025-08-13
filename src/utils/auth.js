// Save the currently logged-in user
export const saveUser = (user) => {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
  };
  
  // Get the currently logged-in user
  export const getLoggedInUser = () => {
    return JSON.parse(localStorage.getItem('loggedInUser'));
  };
  
  // Log out the user
  export const logoutUser = () => {
    localStorage.removeItem('loggedInUser');
  };
  
  // Get all users
  export const getUsers = () => {
    return JSON.parse(localStorage.getItem('users')) || [];
  };
  
  // Save all users
  export const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };
  
  // ======== COURSE MANAGEMENT ========
  
  // Get all courses
  export const getCourses = () => {
    return JSON.parse(localStorage.getItem('courses')) || [];
  };
  
  // Save all courses
  export const saveCourses = (courses) => {
    localStorage.setItem('courses', JSON.stringify(courses));
  };
  
  // ======== STUDENT ENROLLMENT ========
  
  // Get enrolled courses for a user
  export const getEnrolledCourses = (username) => {
    const enrolled = JSON.parse(localStorage.getItem('enrollments')) || {};
    return enrolled[username] || [];
  };
  
  // Enroll a student in a course
  export const enrollInCourse = (username, courseTitle) => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments')) || {};
    if (!enrollments[username]) {
      enrollments[username] = [];
    }
    if (!enrollments[username].includes(courseTitle)) {
      enrollments[username].push(courseTitle);
    }
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
  };
  