const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');

// Load environment variables
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning-system1');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('Cleared existing data');

    // Create demo users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'John Smith',
        email: 'instructor@demo.com',
        password: 'password123',
        role: 'instructor'
      },
      {
        name: 'Jane Doe',
        email: 'instructor2@demo.com',
        password: 'password123',
        role: 'instructor'
      },
      {
        name: 'Student One',
        email: 'student@demo.com',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Alice Johnson',
        email: 'student2@demo.com',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Bob Wilson',
        email: 'student3@demo.com',
        password: 'password123',
        role: 'student'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Created demo users');

    // Find instructors
    const instructors = createdUsers.filter(user => user.role === 'instructor');
    const students = createdUsers.filter(user => user.role === 'student');

    // Create demo courses
    const courses = [
      {
        title: 'Complete JavaScript Course',
        description: 'Learn JavaScript from basics to advanced concepts including ES6, async/await, and modern frameworks.',
        category: 'Programming',
        level: 'Beginner',
        price: 89.99,
        duration: 40,
        instructor: instructors[0]._id,
        instructorName: instructors[0].name,
        enrolledStudents: [students[0]._id, students[1]._id],
        enrollmentCount: 2,
        rating: 4.5,
        reviews: [
          {
            user: students[0]._id,
            rating: 5,
            comment: 'Excellent course! Very well explained.',
            createdAt: new Date()
          },
          {
            user: students[1]._id,
            rating: 4,
            comment: 'Good content but could use more examples.',
            createdAt: new Date()
          }
        ]
      },
      {
        title: 'React Development Masterclass',
        description: 'Master React.js with hooks, context, redux, and build real-world applications.',
        category: 'Programming',
        level: 'Intermediate',
        price: 129.99,
        duration: 60,
        instructor: instructors[0]._id,
        instructorName: instructors[0].name,
        enrolledStudents: [students[0]._id],
        enrollmentCount: 1,
        rating: 4.8,
        reviews: [
          {
            user: students[0]._id,
            rating: 5,
            comment: 'Amazing course! Learned so much about React.',
            createdAt: new Date()
          }
        ]
      },
      {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the principles of user interface and user experience design with practical projects.',
        category: 'Design',
        level: 'Beginner',
        price: 79.99,
        duration: 30,
        instructor: instructors[1]._id,
        instructorName: instructors[1].name,
        enrolledStudents: [students[1]._id, students[2]._id],
        enrollmentCount: 2,
        rating: 4.2,
        reviews: [
          {
            user: students[1]._id,
            rating: 4,
            comment: 'Great introduction to design principles.',
            createdAt: new Date()
          }
        ]
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming with focus on data analysis, pandas, numpy, and visualization.',
        category: 'Programming',
        level: 'Intermediate',
        price: 99.99,
        duration: 45,
        instructor: instructors[1]._id,
        instructorName: instructors[1].name,
        enrolledStudents: [students[2]._id],
        enrollmentCount: 1,
        rating: 4.7,
        reviews: []
      },
      {
        title: 'Digital Marketing Strategy',
        description: 'Comprehensive guide to digital marketing including SEO, social media, and content marketing.',
        category: 'Marketing',
        level: 'Beginner',
        price: 69.99,
        duration: 25,
        instructor: instructors[0]._id,
        instructorName: instructors[0].name,
        enrolledStudents: [],
        enrollmentCount: 0,
        rating: 0,
        reviews: []
      },
      {
        title: 'Advanced Machine Learning',
        description: 'Deep dive into machine learning algorithms, neural networks, and AI applications.',
        category: 'Science',
        level: 'Advanced',
        price: 199.99,
        duration: 80,
        instructor: instructors[1]._id,
        instructorName: instructors[1].name,
        enrolledStudents: [],
        enrollmentCount: 0,
        rating: 0,
        reviews: []
      }
    ];

    const createdCourses = await Course.create(courses);
    console.log('Created demo courses');

    // Update user enrollments
    for (const student of students) {
      const enrolledCourseIds = createdCourses
        .filter(course => course.enrolledStudents.includes(student._id))
        .map(course => course._id);
      
      await User.findByIdAndUpdate(student._id, {
        enrolledCourses: enrolledCourseIds
      });
    }

    // Update instructor created courses
    for (const instructor of instructors) {
      const createdCourseIds = createdCourses
        .filter(course => course.instructor.toString() === instructor._id.toString())
        .map(course => course._id);
      
      await User.findByIdAndUpdate(instructor._id, {
        createdCourses: createdCourseIds
      });
    }

    console.log('Updated user-course relationships');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Demo Credentials:');
    console.log('👑 Admin: admin@demo.com / password123');
    console.log('👨‍🏫 Instructor: instructor@demo.com / password123');
    console.log('👩‍🏫 Instructor 2: instructor2@demo.com / password123');
    console.log('👨‍🎓 Student: student@demo.com / password123');
    console.log('👩‍🎓 Student 2: student2@demo.com / password123');
    console.log('👨‍🎓 Student 3: student3@demo.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
