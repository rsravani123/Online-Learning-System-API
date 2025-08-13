const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all courses with search and pagination
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build search query
    let query = { isPublished: true };
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Filter by category
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }
    
    // Filter by level
    if (req.query.level && req.query.level !== 'All') {
      query.level = req.query.level;
    }
    
    // Filter by price range
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      query.price = {};
      if (req.query.minPrice !== undefined) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice !== undefined) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Sort options
    let sort = {};
    switch (req.query.sort) {
      case 'title':
        sort = { title: 1 };
        break;
      case 'price_low':
        sort = { price: 1 };
        break;
      case 'price_high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort(sort)
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
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profilePicture')
      .populate('enrolledStudents', 'name email')
      .populate('reviews.user', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course'
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      price,
      duration,
      thumbnail
    } = req.body;

    // Check if course title already exists for this instructor
    const existingCourse = await Course.findOne({
      title,
      instructor: req.user.id
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'You already have a course with this title'
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      level,
      price,
      duration,
      thumbnail,
      instructor: req.user.id,
      instructorName: req.user.name
    });

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { createdCourses: course._id }
    });

    await course.populate('instructor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user owns the course or is admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('instructor', 'name email');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user owns the course or is admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Remove course from enrolled students
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    // Remove course from instructor's created courses
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { createdCourses: course._id }
    });

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Add student to course
    course.enrolledStudents.push(req.user.id);
    await course.updateEnrollmentCount();

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: course._id }
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while enrolling in course'
    });
  }
};

// @desc    Unenroll from course
// @route   POST /api/courses/:id/unenroll
// @access  Private (Student)
const unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if enrolled
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      studentId => studentId.toString() !== req.user.id
    );
    await course.updateEnrollmentCount();

    // Remove course from student's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { enrolledCourses: course._id }
    });

    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    console.error('Unenroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unenrolling from course'
    });
  }
};

// @desc    Add review to course
// @route   POST /api/courses/:id/reviews
// @access  Private (Student)
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student is enrolled
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Must be enrolled to review this course'
      });
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Course already reviewed'
      });
    }

    // Add review
    course.reviews.push({
      user: req.user.id,
      rating,
      comment
    });

    // Calculate new average rating
    const totalRating = course.reviews.reduce((acc, review) => acc + review.rating, 0);
    course.rating = totalRating / course.reviews.length;

    await course.save();
    await course.populate('reviews.user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: course.reviews[course.reviews.length - 1]
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
};

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor)
const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate('enrolledStudents', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching instructor courses'
    });
  }
};

// @desc    Get student's enrolled courses
// @route   GET /api/courses/student/enrolled
// @access  Private (Student)
const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'enrolledCourses',
      populate: {
        path: 'instructor',
        select: 'name email'
      }
    });

    res.json({
      success: true,
      count: user.enrolledCourses.length,
      data: user.enrolledCourses
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching enrolled courses'
    });
  }
};

module.exports = {
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
};
