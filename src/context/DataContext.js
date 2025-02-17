import React, { createContext, useContext, useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [fencers, setFencers] = useState([]);
  const [bouts, setBouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fencersData, boutsData] = await Promise.all([
          databaseService.getFencers(),
          databaseService.getBouts()
        ]);
        setFencers(fencersData);
        setBouts(boutsData);
      } catch (err) {
        setError('Failed to fetch data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addFencer = (fencerData) => {
    // Update local state first
    setFencers(prevFencers => [...prevFencers, { ...fencerData, id: Date.now() }]);
    
    // Then handle the API call
    databaseService.addFencer(fencerData)
      .then((newFencer) => {
        setFencers(prev => [...prev, newFencer]);
      })
      .catch((err) => {
        setError('Failed to add fencer: ' + err.message);
      });
  };

  const addMultipleFencers = (fencersData) => {
    // Update local state first
    setFencers(prevFencers => [
      ...prevFencers,
      ...fencersData.map(fencer => ({ ...fencer, id: Date.now() + Math.random() }))
    ]);
    
    // Then handle the API call
    databaseService.addMultipleFencers(fencersData)
      .then((newFencers) => {
        setFencers(prev => [...prev, ...newFencers]);
      })
      .catch((err) => {
        setError('Failed to add multiple fencers: ' + err.message);
      });
  };

  const addBout = (boutData) => {
    // Update local state first
    setBouts(prevBouts => [...prevBouts, { ...boutData, id: Date.now() }]);
    
    // Then handle the API call
    databaseService.addBout(boutData)
      .then((newBout) => {
        setBouts(prev => [newBout, ...prev]);
      })
      .catch((err) => {
        setError('Failed to add bout: ' + err.message);
      });
  };

  const updateBout = async (boutId, updatedData) => {
    try {
      setLoading(true);
      const updatedBout = await databaseService.updateBout(boutId, updatedData);
      setBouts(prev => prev.map(bout => 
        bout.id === boutId ? updatedBout : bout
      ));
    } catch (err) {
      setError('Failed to update bout: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBout = async (boutId) => {
    try {
      setLoading(true);
      await databaseService.deleteBout(boutId);
      setBouts(prev => prev.filter(bout => bout.id !== boutId));
    } catch (err) {
      setError('Failed to delete bout: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
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