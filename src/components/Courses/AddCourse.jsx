import React, { useState } from 'react';
import '../../App.css'; // make sure this path is correct

const AddCourse = ({ onAdd }) => {
  const [course, setCourse] = useState({
    title: '',
    description: ''
  });

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (course.title && course.description) {
      onAdd(course);
      setCourse({ title: '', description: '' });
    }
  };

  return (
    <div className="add-course-form">
      <h3>Add New Course</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Course Title"
          value={course.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Course Description"
          value={course.description}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Course</button>
      </form>
    </div>
  );
};

export default AddCourse;
