import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import './StudentRegistration.css';

function StudentRegistration() {
  const { students, addStudent } = useStudents();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    level: 'beginner',
    club: ''
  });

  // Add these arrays for generating random data
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Riley', 'Quinn', 'Avery', 'Parker'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const clubs = ['Salle D\'Armes', 'Elite Fencing', 'Royal Fencers', 'Sword Masters', 'Academy of Fence'];
  const levels = ['beginner', 'intermediate', 'advanced'];

  const generateDummyStudent = () => {
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomClub = clubs[Math.floor(Math.random() * clubs.length)];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const randomAge = Math.floor(Math.random() * (30 - 12 + 1)) + 12; // Age between 12-30

    setFormData({
      name: `${randomFirstName} ${randomLastName}`,
      age: randomAge,
      level: randomLevel,
      club: randomClub
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (students.length >= 50) {
      alert('Maximum number of students (50) reached');
      return;
    }
    addStudent(formData);
    setFormData({ name: '', age: '', level: 'beginner', club: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="registration-container">
      <h1>Student Registration</h1>
      <div className="registration-count">
        Registered Students: {students.length}/50
      </div>
      
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="level">Experience Level</label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="club">Club</label>
          <input
            type="text"
            id="club"
            name="club"
            value={formData.club}
            onChange={handleChange}
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="button">Register Student</button>
          <button 
            type="button" 
            className="button button-secondary" 
            onClick={generateDummyStudent}
          >
            Generate Dummy Student
          </button>
        </div>
      </form>

      <div className="students-list">
        <h2>Registered Students</h2>
        {students.map(student => (
          <div key={student.id} className="student-card">
            <h3>{student.name}</h3>
            <p>Age: {student.age}</p>
            <p>Level: {student.level}</p>
            <p>Club: {student.club}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentRegistration; 