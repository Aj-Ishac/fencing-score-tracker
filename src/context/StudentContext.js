import React, { createContext, useState, useContext } from 'react';

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [students, setStudents] = useState([]);

  const addStudent = (student) => {
    setStudents([...students, { 
      ...student, 
      id: Date.now(),
      bouts: [] // Initialize empty bouts array for each student
    }]);
  };

  const addBout = (bout) => {
    const { fencer1, fencer2, score1, score2 } = bout;
    const timestamp = new Date().toISOString();
    const boutId = Date.now();

    setStudents(students.map(student => {
      if (student.id === fencer1 || student.id === fencer2) {
        const isFirstFencer = student.id === fencer1;
        const boutRecord = {
          id: boutId,
          timestamp,
          opponent: isFirstFencer ? fencer2 : fencer1,
          scoreFor: isFirstFencer ? score1 : score2,
          scoreAgainst: isFirstFencer ? score2 : score1,
          won: isFirstFencer ? score1 > score2 : score2 > score1
        };
        return {
          ...student,
          bouts: [...student.bouts, boutRecord]
        };
      }
      return student;
    }));
  };

  const editBout = (boutId, newScores) => {
    const { score1, score2 } = newScores;
    
    setStudents(students.map(student => {
      const updatedBouts = student.bouts.map(bout => {
        if (bout.id === boutId) {
          const isFirstFencer = bout.scoreFor === bout.scoreAgainst ? score1 > score2 : bout.scoreFor > bout.scoreAgainst;
          return {
            ...bout,
            scoreFor: isFirstFencer ? score1 : score2,
            scoreAgainst: isFirstFencer ? score2 : score1,
            won: isFirstFencer ? score1 > score2 : score2 > score1
          };
        }
        return bout;
      });

      return {
        ...student,
        bouts: updatedBouts
      };
    }));
  };

  const deleteBout = (boutId) => {
    setStudents(students.map(student => ({
      ...student,
      bouts: student.bouts.filter(bout => bout.id !== boutId)
    })));
  };

  return (
    <StudentContext.Provider value={{ 
      students, 
      addStudent, 
      addBout,
      editBout,
      deleteBout
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
} 