import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import './BoutTracker.css';

function BoutTracker() {
  const { students, addBout } = useStudents();
  const [selectedFencers, setSelectedFencers] = useState({ fencer1: '', fencer2: '' });
  const [scores, setScores] = useState({ fencer1: 0, fencer2: 0 });

  const handleFencerSelect = (fencer, id) => {
    setSelectedFencers(prev => ({ ...prev, [fencer]: id }));
  };

  const handleScoreChange = (fencer, value) => {
    setScores(prev => ({
      ...prev,
      [fencer]: Math.max(0, Math.min(15, parseInt(value) || 0))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFencers.fencer1 || !selectedFencers.fencer2) {
      alert('Please select both fencers');
      return;
    }

    addBout({
      fencer1: parseInt(selectedFencers.fencer1),
      fencer2: parseInt(selectedFencers.fencer2),
      score1: scores.fencer1,
      score2: scores.fencer2
    });

    // Reset form
    setSelectedFencers({ fencer1: '', fencer2: '' });
    setScores({ fencer1: 0, fencer2: 0 });
  };

  return (
    <div className="bout-tracker">
      <h1>Bout Tracker</h1>
      
      <form onSubmit={handleSubmit} className="bout-form">
        <div className="fencers-selection">
          <div className="fencer-select">
            <h2>Fencer 1</h2>
            <select 
              value={selectedFencers.fencer1}
              onChange={(e) => handleFencerSelect('fencer1', e.target.value)}
            >
              <option value="">Select Fencer 1</option>
              {students.map(student => (
                <option 
                  key={student.id} 
                  value={student.id}
                  disabled={student.id === parseInt(selectedFencers.fencer2)}
                >
                  {student.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              max="15"
              value={scores.fencer1}
              onChange={(e) => handleScoreChange('fencer1', e.target.value)}
            />
          </div>

          <div className="vs-divider">VS</div>

          <div className="fencer-select">
            <h2>Fencer 2</h2>
            <select
              value={selectedFencers.fencer2}
              onChange={(e) => handleFencerSelect('fencer2', e.target.value)}
            >
              <option value="">Select Fencer 2</option>
              {students.map(student => (
                <option 
                  key={student.id} 
                  value={student.id}
                  disabled={student.id === parseInt(selectedFencers.fencer1)}
                >
                  {student.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              max="15"
              value={scores.fencer2}
              onChange={(e) => handleScoreChange('fencer2', e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="button">Record Bout</button>
      </form>
    </div>
  );
}

export default BoutTracker; 