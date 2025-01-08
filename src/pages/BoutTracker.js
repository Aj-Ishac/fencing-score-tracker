import React, { useState } from 'react';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoutData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (boutData.fencer1_id === boutData.fencer2_id) {
      alert('Please select different fencers');
      return;
    }
    try {
      await addBout({
        ...boutData,
        score1: parseInt(boutData.score1),
        score2: parseInt(boutData.score2)
      });
      setBoutData({
        fencer1_id: '',
        fencer2_id: '',
        score1: '',
        score2: '',
        notes: '',
        timestamp: new Date().toISOString()
      });
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
      // Get two random different fencers
      const shuffledFencers = [...fencers].sort(() => Math.random() - 0.5);
      const fencer1 = shuffledFencers[0];
      const fencer2 = shuffledFencers[1];

      // Generate random scores (5-15 for winner, 0-winner's score-1 for loser)
      const winnerScore = Math.floor(Math.random() * 11) + 5; // 5-15
      const loserScore = Math.floor(Math.random() * winnerScore);

      // Randomly decide who gets the higher score
      const [score1, score2] = Math.random() < 0.5 
        ? [winnerScore, loserScore] 
        : [loserScore, winnerScore];

      const noteTemplates = [
        'Clean bout with good technique',
        'Aggressive attacks from both sides',
        'Strong defensive performance',
        'Multiple double touches',
        'Fast-paced exchanges',
        'Technical bout with strategic play',
        'Good footwork from both fencers',
        'High intensity throughout'
      ];

      const simulatedBout = {
        fencer1_id: fencer1.id.toString(),
        fencer2_id: fencer2.id.toString(),
        score1,
        score2,
        notes: noteTemplates[Math.floor(Math.random() * noteTemplates.length)],
        timestamp: new Date().toISOString()
      };

      await addBout(simulatedBout);
    } catch (err) {
      console.error('Error simulating bout:', err);
    }
  };

  const setCurrentDateTime = () => {
    setBoutData(prev => ({
      ...prev,
      timestamp: new Date().toISOString()
    }));
  };

  // Helper function to find fencer name by ID
  const getFencerName = (id) => {
    const fencer = fencers.find(f => f.id.toString() === id.toString());
    return fencer ? fencer.name : 'Unknown Fencer';
  };

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
      <h1 className="text-airbnb-hof text-3xl font-bold mb-6">Bout Tracker</h1>

      <div className="bg-white p-6 rounded-airbnb shadow-airbnb hover:shadow-airbnb-hover transition-shadow duration-200 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-6">
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
                  max="15"
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof placeholder-airbnb-foggy focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-6">
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
                  {fencers.map(fencer => (
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
                  max="15"
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof placeholder-airbnb-foggy focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="timestamp" className="block mb-2 text-airbnb-hof text-sm font-medium">
              Date & Time
            </label>
            <div className="flex gap-3 flex-wrap">
              <input
                type="datetime-local"
                id="timestamp"
                name="timestamp"
                value={boutData.timestamp.slice(0, 16)}
                onChange={handleChange}
                required
                className="flex-1 min-w-[200px] p-3 border border-gray-300 rounded-airbnb text-airbnb-hof focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition"
              />
              <button
                type="button"
                onClick={setCurrentDateTime}
                className="px-6 py-3 bg-white border border-airbnb-hof text-airbnb-hof rounded-airbnb hover:bg-gray-50 transition text-sm font-medium whitespace-nowrap"
              >
                Set Current Time
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="notes" className="block mb-2 text-airbnb-hof text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={boutData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof placeholder-airbnb-foggy focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition resize-vertical"
            />
          </div>

          <div className="flex gap-3 justify-end mt-8">
            <button
              type="button"
              onClick={simulateRandomBout}
              disabled={loading || fencers.length < 2}
              className="px-6 py-3 bg-white border border-airbnb-hof text-airbnb-hof rounded-airbnb hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Simulate Random Bout
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-airbnb-rausch text-white rounded-airbnb hover:bg-airbnb-rausch/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Record Bout
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12">
        <h2 className="text-airbnb-hof text-2xl font-semibold mb-6">Bout History</h2>
        <div className="bg-white rounded-airbnb shadow-airbnb overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Fencer 1</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Fencer 2</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
                          {getFencerName(bout.fencer1_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-airbnb-hof">
                        {bout.score1} - {bout.score2}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${isWinner2 ? 'font-medium text-airbnb-hof' : 'text-airbnb-foggy'}`}>
                          {getFencerName(bout.fencer2_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-airbnb-foggy">
                        {bout.notes}
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