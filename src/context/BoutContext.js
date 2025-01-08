import React, { createContext, useState, useContext } from 'react';

const BoutContext = createContext();

export function BoutProvider({ children }) {
  const [bouts, setBouts] = useState([]);

  const addBout = (bout) => {
    setBouts([...bouts, {
      ...bout,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <BoutContext.Provider value={{ bouts, addBout }}>
      {children}
    </BoutContext.Provider>
  );
}

export function useBouts() {
  const context = useContext(BoutContext);
  if (context === undefined) {
    throw new Error('useBouts must be used within a BoutProvider');
  }
  return context;
} 