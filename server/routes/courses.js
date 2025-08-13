const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  addReview,
  getInstructorCourses,
  getEnrolledCourses
} = require('../controllers/courseController');
const {
  validateCourse,
  validateReview
} = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes - All users
router.post('/:id/enroll', protect, authorize('student'), enrollInCourse);
router.post('/:id/unenroll', protect, authorize('student'), unenrollFromCourse);
router.post('/:id/reviews', protect, authorize('student'), validateReview, addReview);

// Protected routes - Instructors only
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), getInstructorCourses);
router.post('/', protect, authorize('instructor', 'admin'), validateCourse, createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), validateCourse, updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

// Protected routes - Students only
router.get('/student/enrolled', protect, authorize('student'), getEnrolledCourses);

module.exports = router;
