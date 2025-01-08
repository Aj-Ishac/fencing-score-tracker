import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [fencers, setFencers] = useState([]);
  const [bouts, setBouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextFencerId, setNextFencerId] = useState(1);

  const addFencer = async (fencerData) => {
    try {
      const currentId = nextFencerId;
      const newFencer = {
        ...fencerData,
        id: currentId
      };
      
      setFencers(prev => [...prev, newFencer]);
      setNextFencerId(prev => prev + 1);
      
      return newFencer;
    } catch (err) {
      setError('Failed to add fencer: ' + err.message);
      throw err;
    }
  };

  const addMultipleFencers = async (fencersData) => {
    try {
      const newFencers = fencersData.map((fencerData, index) => ({
        ...fencerData,
        id: nextFencerId + index
      }));

      setFencers(prev => [...prev, ...newFencers]);
      setNextFencerId(prev => prev + fencersData.length);

      return newFencers;
    } catch (err) {
      setError('Failed to add multiple fencers: ' + err.message);
      throw err;
    }
  };

  const addBout = async (boutData) => {
    try {
      const newBout = {
        ...boutData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      setBouts(prev => [...prev, newBout]);
      return newBout;
    } catch (err) {
      setError('Failed to add bout: ' + err.message);
      throw err;
    }
  };

  const updateBout = async (boutId, updatedData) => {
    try {
      setBouts(prev => prev.map(bout => 
        bout.id === boutId ? { ...bout, ...updatedData } : bout
      ));
    } catch (err) {
      setError('Failed to update bout: ' + err.message);
      throw err;
    }
  };

  const deleteBout = async (boutId) => {
    try {
      setBouts(prev => prev.filter(bout => bout.id !== boutId));
    } catch (err) {
      setError('Failed to delete bout: ' + err.message);
      throw err;
    }
  };

  const value = {
    fencers,
    bouts,
    loading,
    error,
    addFencer,
    addMultipleFencers,
    addBout,
    updateBout,
    deleteBout
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 