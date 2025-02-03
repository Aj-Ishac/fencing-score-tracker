import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useSession } from '../context/SessionContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

function BoutTracker() {
  const { activeSession, setActiveSession } = useSession();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fencers, bouts, addBout, loading, error } = useData();
  const [sessionFencers, setSessionFencers] = useState([]);
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

  useEffect(() => {
    if (activeSession) {
      fetchSessionFencers();
    } else {
      setSessionFencers([]);
    }
  }, [activeSession]);

  const fetchSessionFencers = async () => {
    if (!activeSession) return;
    
    try {
      const { data, error } = await supabase
        .from('session_fencers')
        .select(`
          fencer_id,
          fencers (*)
        `)
        .eq('session_id', activeSession.id);

      if (error) throw error;
      
      setSessionFencers(data.map(sf => sf.fencers));
      
      // Clear selected fencers if they're not in the session
      setBoutData(prev => ({
        ...prev,
        fencer1_id: prev.fencer1_id && data.some(sf => sf.fencer_id.toString() === prev.fencer1_id) ? prev.fencer1_id : '',
        fencer2_id: prev.fencer2_id && data.some(sf => sf.fencer_id.toString() === prev.fencer2_id) ? prev.fencer2_id : ''
      }));
    } catch (err) {
      console.error('Error fetching session fencers:', err);
    }
  };

  // Memoize the confusion matrix calculation to prevent unnecessary recalculations
  const matrix = useMemo(() => {
    const matrix = {};
    
    sessionFencers.forEach(fencer1 => {
      matrix[fencer1.id] = {};
      sessionFencers.forEach(fencer2 => {
        matrix[fencer1.id][fencer2.id] = {
          pointsScored: 0,
          totalBouts: 0
        };
      });
    });

    bouts.forEach(bout => {
      // Only count bouts between session fencers
      if (sessionFencers.some(f => f.id.toString() === bout.fencer1_id) && 
          sessionFencers.some(f => f.id.toString() === bout.fencer2_id)) {
        const { fencer1_id, fencer2_id, score1, score2 } = bout;
        matrix[fencer1_id][fencer2_id].pointsScored += parseInt(score1);
        matrix[fencer2_id][fencer1_id].pointsScored += parseInt(score2);
        matrix[fencer1_id][fencer2_id].totalBouts += 1;
        matrix[fencer2_id][fencer1_id].totalBouts += 1;
      }
    });

    return matrix;
  }, [sessionFencers, bouts]);

  // Memoize fencer name lookup to prevent unnecessary calculations
  const fencerNameMap = useMemo(() => {
    return fencers.reduce((acc, fencer) => {
      acc[fencer.id] = fencer.name;
      return acc;
    }, {});
  }, [fencers]);

  // Filter bouts for current session
  const sessionBouts = useMemo(() => {
    if (!activeSession) return [];
    return bouts.filter(bout => bout.session_id === activeSession.id);
  }, [bouts, activeSession]);

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
    if (!activeSession) {
      showSuccessMessage("Please start a session before recording bouts");
      return;
    }
    
    try {
      // Ensure session_id is included in the bout data
      const boutWithSession = {
        ...boutData,
        session_id: activeSession.id,
        timestamp: new Date().toISOString()
      };
      
      const newBout = await addBout(boutWithSession);
      resetBoutForm();
      showSuccessMessage("Bout recorded successfully!");
    } catch (err) {
      console.error('Error recording bout:', err);
    }
  };

  const simulateRandomBout = async () => {
    if (!activeSession) {
      showSuccessMessage("Please start a session before simulating bouts");
      return;
    }

    if (sessionFencers.length < 2) {
      showSuccessMessage("Need at least 2 fencers in the session to simulate a bout");
      return;
    }

    try {
      // Get two random fencers from session fencers
      const shuffled = [...sessionFencers].sort(() => 0.5 - Math.random());
      const [fencer1, fencer2] = shuffled.slice(0, 2);

      // Generate random scores (one must be 5, the other less than 5)
      const score1 = Math.random() < 0.5 ? 5 : Math.floor(Math.random() * 5);
      const score2 = score1 === 5 ? Math.floor(Math.random() * 5) : 5;

      const simulatedBout = {
        fencer1_id: fencer1.id.toString(),
        fencer2_id: fencer2.id.toString(),
        score1,
        score2,
        session_id: activeSession.id,
        timestamp: new Date().toISOString()
      };

      const newBout = await addBout(simulatedBout);
      showSuccessMessage(`Simulated bout: ${fencer1.name} (${score1}) vs ${fencer2.name} (${score2})`);
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

  const handleCreateAndNavigate = async (e) => {
    e.preventDefault();
    try {
      const sessionId = Date.now();
      const sessionName = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Set the active session in context without persisting to DB yet
      setActiveSession({ 
        id: sessionId, 
        name: sessionName,
        created_by: user.id,
        student_count: 0,
        isTemporary: true  // Flag to indicate this session hasn't been persisted
      });
      
      navigate('/sessions');
    } catch (err) {
      console.error('Error creating session:', err);
      setSuccessMessage('Failed to create session. Please try again.');
      setShowSuccess(true);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-4 text-airbnb-foggy font-airbnb">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-airbnb-rausch bg-red-50 rounded-airbnb font-airbnb">Error: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-airbnb">
      <div className="flex justify-between items-center">
        <h1 className="text-airbnb-hof text-3xl font-bold">Bout Tracker</h1>
        <div className="text-airbnb-foggy">
          {activeSession ? (
            <span className="text-airbnb-babu font-medium">
              Current Session: {activeSession.name}
            </span>
          ) : (
            <a 
              href="#" 
              onClick={handleCreateAndNavigate}
              className="text-red-500 hover:text-red-600 cursor-pointer underline"
            >
              No Session Active - Click to Start One
            </a>
          )}
        </div>
      </div>

      {/* Main bout tracking form */}
      <div className="bg-white p-6 rounded-airbnb shadow-airbnb">
        {!activeSession ? (
          <div className="text-center py-8 text-airbnb-foggy">
            Please start a session to record bouts.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fencer Selection Row */}
            <div className="grid grid-cols-2 gap-16 relative">
              {/* Fencer 1 Column */}
              <div className="space-y-4">
                <select
                  id="fencer1_id"
                  name="fencer1_id"
                  value={boutData.fencer1_id}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition appearance-none"
                >
                  <option value="">Select Fencer 1</option>
                  {sessionFencers.map(fencer => (
                    <option key={fencer.id} value={fencer.id}>
                      {fencer.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  id="score1"
                  name="score1"
                  value={boutData.score1}
                  onChange={handleChange}
                  required
                  min="0"
                  max="5"
                  placeholder="Score"
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof placeholder-airbnb-foggy focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition"
                />
              </div>

              {/* VS Divider */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-white">
                  <span className="text-xl font-bold text-airbnb-rausch">VS</span>
                </div>
              </div>

              {/* Fencer 2 Column */}
              <div className="space-y-4">
                <select
                  id="fencer2_id"
                  name="fencer2_id"
                  value={boutData.fencer2_id}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition appearance-none"
                >
                  <option value="">Select Fencer 2</option>
                  {sessionFencers
                    .filter(fencer => fencer.id.toString() !== boutData.fencer1_id)
                    .map(fencer => (
                      <option key={fencer.id} value={fencer.id}>
                        {fencer.name}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  id="score2"
                  name="score2"
                  value={boutData.score2}
                  onChange={handleChange}
                  required
                  min="0"
                  max="5"
                  placeholder="Score"
                  className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof placeholder-airbnb-foggy focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition"
                />
              </div>
            </div>

            {/* Record and Simulate Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                type="submit"
                className="w-3/4 px-8 py-3 bg-airbnb-rausch text-white rounded-airbnb hover:bg-airbnb-rausch/90 transition text-sm font-medium"
              >
                Record
              </button>
              <button
                type="button"
                onClick={simulateRandomBout}
                className="w-1/4 px-8 py-3 bg-gray-200 text-gray-700 rounded-airbnb hover:bg-gray-300 transition text-sm font-medium"
              >
                Simulate
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-airbnb shadow-airbnb overflow-hidden mb-8">
          <h2 className="text-airbnb-hof text-2xl font-semibold p-6 border-b">Head-to-Head Results</h2>
          <div className="overflow-x-auto p-6">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Fencer</th>
                  {sessionFencers.map(fencer => (
                    <th key={fencer.id} className="px-4 py-2 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">
                      #{fencer.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessionFencers.map(fencer1 => (
                  <tr key={fencer1.id}>
                    <td className="px-4 py-2 text-sm font-medium text-airbnb-hof whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-airbnb-babu font-mono text-sm mr-2">#{fencer1.id}</span>
                        <span>{fencer1.name}</span>
                      </div>
                    </td>
                    {sessionFencers.map(fencer2 => (
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
                {sessionBouts.map(bout => {
                  const isWinner1 = bout.score1 > bout.score2;
                  const isWinner2 = bout.score2 > bout.score1;
                  
                  return (
                    <tr key={bout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy text-center">
                        {formatDate(bout.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm ${isWinner1 ? 'font-medium text-airbnb-hof' : 'text-airbnb-foggy'}`}>
                          <span className="text-airbnb-babu font-mono text-sm mr-2">#{bout.fencer1_id}</span>
                          {getFencerName(bout.fencer1_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-airbnb-hof text-center">
                        {bout.score1} - {bout.score2}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
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
          {sessionBouts.length === 0 && (
            <div className="text-center py-8 text-airbnb-foggy">
              {activeSession ? 
                "No bouts recorded in this session yet. Start by recording a bout or simulate one!" :
                "Please start a session to record bouts."
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoutTracker; 