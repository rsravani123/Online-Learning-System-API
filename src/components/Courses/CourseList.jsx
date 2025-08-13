import React from 'react';
import '../../App.css'; // make sure this path is correct

const CourseList = ({ courses, onEnroll, enrolled = [] }) => {
  return (
    <div className="course-list">
      <h3>Courses</h3>
      <ul>
        {courses.map((course, index) => (
          <li key={index}>
            <div>
              <strong>{course.title}</strong> - {course.description}
            </div>
            {onEnroll && (
              <button
                className="enroll-button"
                onClick={() => onEnroll(course)}
                disabled={enrolled.some((c) => c.title === course.title)}
              >
                {enrolled.some((c) => c.title === course.title) ? 'Enrolled' : 'Enroll'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseList;
