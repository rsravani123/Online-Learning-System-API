const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllCourses,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Course management routes
router.get('/courses', getAllCourses);

// Dashboard stats
router.get('/stats', getDashboardStats);

module.exports = router;
