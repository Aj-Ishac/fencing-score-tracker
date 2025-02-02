import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../context/DataContext';

function BoutTracker() {
  const { fencers, bouts, addBout, loading, error } = useData();
  const [boutData, setBoutData] = useState({
    fencer1_id: '',
    fencer2_id: '',
    score1: '',
    score2: '',
    notes: '',
    timestamp: new Date().toISOString()
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Memoize the confusion matrix calculation to prevent unnecessary recalculations
  const matrix = useMemo(() => {
    const matrix = {};
    
    fencers.forEach(fencer1 => {
      matrix[fencer1.id] = {};
      fencers.forEach(fencer2 => {
        matrix[fencer1.id][fencer2.id] = {
          pointsScored: 0,
          totalBouts: 0
        };
      });
    });

    bouts.forEach(bout => {
      const { fencer1_id, fencer2_id, score1, score2 } = bout;
      matrix[fencer1_id][fencer2_id].pointsScored += parseInt(score1);
      matrix[fencer2_id][fencer1_id].pointsScored += parseInt(score2);
      matrix[fencer1_id][fencer2_id].totalBouts += 1;
      matrix[fencer2_id][fencer1_id].totalBouts += 1;
    });

    return matrix;
  }, [fencers, bouts]);

  // Memoize fencer name lookup to prevent unnecessary calculations
  const fencerNameMap = useMemo(() => {
    return fencers.reduce((acc, fencer) => {
      acc[fencer.id] = fencer.name;
      return acc;
    }, {});
  }, [fencers]);

  const getFencerName = useCallback((id) => {
    return fencerNameMap[id] || 'Unknown Fencer';
  }, [fencerNameMap]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Validate score inputs
    if ((name === 'score1' || name === 'score2') && value !== '') {
      const score = parseInt(value);
      if (score < 0 || score > 5) return;
    }
    
    // Validate fencer2 selection
    if (name === 'fencer2_id' && value === boutData.fencer1_id) {
      return;
    }
    
    setBoutData(prev => ({
      ...prev,
      [name]: value
    }));
  }, [boutData.fencer1_id]);

  const resetBoutForm = useCallback(() => {
    setBoutData({
      fencer1_id: '',
      fencer2_id: '',
      score1: '',
      score2: '',
      notes: '',
      timestamp: new Date().toISOString()
    });
  }, []);

  const showSuccessMessage = useCallback((message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (boutData.fencer1_id === boutData.fencer2_id) {
      alert('Please select different fencers');
      return;
    }
    try {
      await addBout(boutData);
      resetBoutForm();
      showSuccessMessage('Bout recorded successfully!');
    } catch (err) {
      console.error('Error adding bout:', err);
    }
  };

  const simulateRandomBout = async () => {
    if (fencers.length < 2) {
      alert('Need at least 2 registered fencers to simulate a bout');
      return;
    }

    try {
      // Get two random different fencers using Fisher-Yates shuffle
      const getRandomFencers = () => {
        const indices = new Set();
        while (indices.size < 2) {
          indices.add(Math.floor(Math.random() * fencers.length));
        }
        return Array.from(indices).map(index => fencers[index]);
      };
      
      const [fencer1, fencer2] = getRandomFencers();

      const simulatedBout = {
        fencer1_id: fencer1.id.toString(),
        fencer2_id: fencer2.id.toString(),
        score1: Math.floor(Math.random() * 6),
        score2: Math.floor(Math.random() * 6),
        notes: BOUT_NOTES[Math.floor(Math.random() * BOUT_NOTES.length)],
        timestamp: new Date().toISOString()
      };

      await addBout(simulatedBout);
      showSuccessMessage('Bout simulated successfully!');
    } catch (err) {
      console.error('Error simulating bout:', err);
    }
  };

  // Move note templates outside component to prevent recreation
  const BOUT_NOTES = [
    'Clean bout with good technique',
    'Aggressive attacks from both sides',
    'Strong defensive performance',
    'Multiple double touches',
    'Fast-paced exchanges',
    'Technical bout with strategic play',
    'Good footwork from both fencers',
    'High intensity throughout'
  ];

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center p-4 text-airbnb-foggy font-airbnb">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-airbnb-rausch bg-red-50 rounded-airbnb font-airbnb">Error: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-airbnb">

      <div className="bg-white p-6 rounded-airbnb shadow-airbnb hover:shadow-airbnb-hover transition-shadow duration-200 mb-8 h-[calc(100vh-theme(spacing.28))] flex flex-col">
        <h1 className="text-airbnb-hof text-3xl font-bold mb-12">Bout Tracker</h1>
        
        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-airbnb shadow-lg transition-opacity duration-500 flex items-center" 
               role="alert">
            <span className="mr-2">{successMessage}</span>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-green-700 hover:text-green-900 ml-auto"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col justify-between flex-grow">
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6 mb-48">  {/* First fencer group */}
              <div>
                <label htmlFor="fencer1_id" className="block mb-2 text-airbnb-hof text-sm font-medium">
                  Fencer 1
                </label>
                <select
                  id="fencer1_id"
                  name="fencer1_id"
                  value={boutData.fencer1_id}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition appearance-none bg-white"
                >
                  <option value="">Select Fencer 1</option>
                  {fencers.map(fencer => (
                    <option key={fencer.id} value={fencer.id}>
                      #{fencer.id} {fencer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="score1" className="block mb-2 text-airbnb-hof text-sm font-medium">
                  Score
                </label>
                <input
                  type="number"
                  id="score1"
                  name="score1"
                  value={boutData.score1}
                  onChange={handleChange}
                  required
                  min="0"
                  max="5"
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof placeholder-airbnb-foggy focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-6">  {/* Second fencer group - removed mb-auto */}
              <div>
                <label htmlFor="fencer2_id" className="block mb-2 text-airbnb-hof text-sm font-medium">
                  Fencer 2
                </label>
                <select
                  id="fencer2_id"
                  name="fencer2_id"
                  value={boutData.fencer2_id}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition appearance-none bg-white"
                >
                  <option value="">Select Fencer 2</option>
                  {fencers
                    .filter(fencer => fencer.id.toString() !== boutData.fencer1_id)
                    .map(fencer => (
                      <option key={fencer.id} value={fencer.id}>
                        #{fencer.id} {fencer.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor="score2" className="block mb-2 text-airbnb-hof text-sm font-medium">
                  Score
                </label>
                <input
                  type="number"
                  id="score2"
                  name="score2"
                  value={boutData.score2}
                  onChange={handleChange}
                  required
                  min="0"
                  max="5"
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof placeholder-airbnb-foggy focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-[0.8] px-6 py-3 bg-airbnb-rausch text-white rounded-airbnb hover:bg-airbnb-rausch/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Record Bout
            </button>
            <button
              type="button"
              onClick={simulateRandomBout}
              disabled={loading || fencers.length < 2}
              className="flex-[0.2] px-6 py-3 bg-white border border-airbnb-hof text-airbnb-hof rounded-airbnb hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Simulate
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-airbnb shadow-airbnb overflow-hidden mb-8">
          <h2 className="text-airbnb-hof text-2xl font-semibold p-6 border-b">Head-to-Head Results</h2>
          <div className="overflow-x-auto p-6">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Fencer</th>
                  {fencers.map(fencer => (
                    <th key={fencer.id} className="px-4 py-2 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">
                      #{fencer.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fencers.map(fencer1 => (
                  <tr key={fencer1.id}>
                    <td className="px-4 py-2 text-sm font-medium text-airbnb-hof whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-airbnb-babu font-mono text-sm mr-2">#{fencer1.id}</span>
                        <span>{fencer1.name}</span>
                      </div>
                    </td>
                    {fencers.map(fencer2 => (
                      <td key={fencer2.id} className="px-4 py-2 text-sm text-airbnb-foggy text-center">
                        {fencer1.id === fencer2.id ? 
                          <span className="text-gray-300">-</span> : 
                          matrix[fencer1.id][fencer2.id].totalBouts > 0 ?
                          <span className={matrix[fencer1.id][fencer2.id].pointsScored > matrix[fencer2.id][fencer1.id].pointsScored ? 'text-airbnb-babu font-medium' : ''}>
                            {matrix[fencer1.id][fencer2.id].pointsScored === 5 ? '✓' : matrix[fencer1.id][fencer2.id].pointsScored}
                          </span> :
                          <span className="text-gray-300">0</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="text-airbnb-hof text-2xl font-semibold mb-6">Bout History</h2>
        <div className="bg-white rounded-airbnb shadow-airbnb overflow-hidden">
          <div className="overflow-x-auto max-h-[800px]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-6 text-xs font-medium text-airbnb-foggy uppercase tracking-wider bg-gray-50">Date & Time</th>
                  <th className="px-6 py-6 text-xs font-medium text-airbnb-foggy uppercase tracking-wider bg-gray-50">Fencer 1</th>
                  <th className="px-6 py-6 text-xs font-medium text-airbnb-foggy uppercase tracking-wider bg-gray-50">Score</th>
                  <th className="px-6 py-6 text-xs font-medium text-airbnb-foggy uppercase tracking-wider bg-gray-50">Fencer 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 overflow-y-auto">
                {bouts.map(bout => {
                  const isWinner1 = bout.score1 > bout.score2;
                  const isWinner2 = bout.score2 > bout.score1;
                  
                  return (
                    <tr key={bout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy">
                        {formatDate(bout.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${isWinner1 ? 'font-medium text-airbnb-hof' : 'text-airbnb-foggy'}`}>
                          <span className="text-airbnb-babu font-mono text-sm mr-2">#{bout.fencer1_id}</span>
                          {getFencerName(bout.fencer1_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-airbnb-hof">
                        {bout.score1} - {bout.score2}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${isWinner2 ? 'font-medium text-airbnb-hof' : 'text-airbnb-foggy'}`}>
                          <span className="text-airbnb-babu font-mono text-sm mr-2">#{bout.fencer2_id}</span>
                          {getFencerName(bout.fencer2_id)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {bouts.length === 0 && (
            <div className="text-center py-8 text-airbnb-foggy">
              No bouts recorded yet. Start by recording a bout or simulate one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoutTracker; 