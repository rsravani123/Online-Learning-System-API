const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build search query
    let query = {};
    
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.isActive = req.query.status === 'active';
    }

    const users = await User.find(query)
      .populate('enrolledCourses', 'title')
      .populate('createdCourses', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages,
      currentPage: page,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('enrolledCourses')
      .populate('createdCourses');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove user from enrolled courses
    await Course.updateMany(
      { enrolledStudents: user._id },
      { $pull: { enrolledStudents: user._id } }
    );

    // If instructor, handle their courses
    if (user.role === 'instructor') {
      // You might want to transfer courses to another instructor or delete them
      await Course.deleteMany({ instructor: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

// @desc    Get all courses for admin
// @route   GET /api/admin/courses
// @access  Private (Admin only)
const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.isPublished = req.query.status === 'published';
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: courses.length,
      total,
      totalPages,
      currentPage: page,
      data: courses
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    
    // Get recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEnrollments = await Course.aggregate([
      {
        $match: {
          'enrolledStudents.0': { $exists: true }
        }
      },
      {
        $project: {
          enrollmentCount: { $size: '$enrolledStudents' }
        }
      },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: '$enrollmentCount' }
        }
      }
    ]);

    const totalEnrollments = recentEnrollments.length > 0 ? recentEnrollments[0].totalEnrollments : 0;

    // Get popular courses
    const popularCourses = await Course.find()
      .populate('instructor', 'name')
      .sort({ enrollmentCount: -1 })
      .limit(5);

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStudents,
          totalInstructors,
          totalCourses,
          publishedCourses,
          totalEnrollments
        },
        popularCourses,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllCourses,
  getDashboardStats
};
