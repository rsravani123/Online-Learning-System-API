const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  instructorName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Language', 'Other'],
    default: 'Other'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    type: Number, // in hours
    default: 0
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  enrolledStudents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [200, 'Review cannot exceed 200 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  content: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['video', 'text', 'quiz', 'assignment'],
      default: 'text'
    },
    content: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    order: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Create text index for search functionality
courseSchema.index({
  title: 'text',
  description: 'text',
  instructorName: 'text',
  category: 'text'
});

// Update enrollment count when students enroll/unenroll
courseSchema.methods.updateEnrollmentCount = function() {
  this.enrollmentCount = this.enrolledStudents.length;
  return this.save();
};

module.exports = mongoose.model('Course', courseSchema);
