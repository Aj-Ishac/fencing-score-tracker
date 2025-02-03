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

  const addFencer = async (fencerData) => {
    try {
      setLoading(true);
      const newFencer = await databaseService.addFencer(fencerData);
      setFencers(prev => [...prev, newFencer]);
      return newFencer;
    } catch (err) {
      setError('Failed to add fencer: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMultipleFencers = async (fencersData) => {
    try {
      setLoading(true);
      const newFencers = await Promise.all(
        fencersData.map(fencer => databaseService.addFencer(fencer))
      );
      setFencers(prev => [...prev, ...newFencers]);
      return newFencers;
    } catch (err) {
      setError('Failed to add multiple fencers: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addBout = async (boutData) => {
    try {
      setLoading(true);
      const validatedBout = {
        ...boutData,
        fencer1_id: boutData.fencer1_id.toString(),
        fencer2_id: boutData.fencer2_id.toString(),
        score1: parseInt(boutData.score1),
        score2: parseInt(boutData.score2),
        session_id: boutData.session_id,
        timestamp: boutData.timestamp || new Date().toISOString()
      };
      
      const newBout = await databaseService.addBout(validatedBout);
      setBouts(prev => [newBout, ...prev]);
      return newBout;
    } catch (err) {
      setError('Failed to add bout: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
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