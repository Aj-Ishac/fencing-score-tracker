import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { useSession } from '../context/SessionContext';

function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionFencers, setSessionFencers] = useState([]);
  const [availableFencers, setAvailableFencers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { activeSession, setActiveSession } = useSession();
  const [selectedFencers, setSelectedFencers] = useState(new Set());

  useEffect(() => {
    fetchSessions();
    fetchAvailableFencers();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchSessionFencers(selectedSession);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (activeSession) {
      setSelectedSession(activeSession.id);
    } else {
      setSelectedSession(null);
    }
  }, [activeSession]);

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch student counts for each session
      const sessionCounts = await Promise.all(
        sessionsData.map(async (session) => {
          const { data, error } = await supabase
            .from('session_fencers')
            .select('fencer_id')
            .eq('session_id', session.id);

          if (error) throw error;
          return {
            ...session,
            student_count: data.length
          };
        })
      );

      setSessions(sessionCounts);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message);
    }
  };

  const fetchAvailableFencers = async () => {
    try {
      const { data, error } = await supabase
        .from('fencers')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableFencers(data);
    } catch (err) {
      console.error('Error fetching fencers:', err);
    }
  };

  const fetchSessionFencers = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('session_fencers')
        .select(`
          fencer_id,
          fencers (*)
        `)
        .eq('session_id', sessionId);

      if (error) throw error;
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, student_count: data.length }
            : session
        )
      );
      
      setSessionFencers(data.map(sf => sf.fencers));
    } catch (err) {
      console.error('Error fetching session fencers:', err);
    }
  };

  const handleCreateSession = async () => {
    if (activeSession) {
      setError("Please end the current session before starting a new one");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionId = Date.now();
      const sessionName = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert([{
          id: sessionId,
          name: sessionName,
          created_by: user.id,
          student_count: 0
        }]);

      if (sessionError) throw sessionError;

      setActiveSession({ id: sessionId, name: sessionName });
      fetchSessions();
      setSelectedSession(sessionId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (activeSession?.isTemporary) {
      // If the session is temporary and being ended, just clear it without database operations
      setActiveSession(null);
      setSelectedSession(null);
      return;
    }

    // Check if the session has any fencers
    try {
      const { data, error } = await supabase
        .from('session_fencers')
        .select('fencer_id')
        .eq('session_id', activeSession.id);

      if (error) throw error;

      if (data.length === 0) {
        // If no fencers, delete the session
        await supabase
          .from('sessions')
          .delete()
          .eq('id', activeSession.id);
      }
    } catch (err) {
      console.error('Error ending session:', err);
    }

    setActiveSession(null);
    setSelectedSession(null);
    fetchSessions();
  };

  const handleFencerSelect = (fencerId) => {
    setSelectedFencers(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(fencerId)) {
        newSelected.delete(fencerId);
      } else {
        newSelected.add(fencerId);
      }
      return newSelected;
    });
  };

  const handleAddSelectedFencers = async () => {
    if (!activeSession || selectedFencers.size === 0) return;

    try {
      // If this is a temporary session, persist it first
      if (activeSession.isTemporary) {
        const { error: sessionError } = await supabase
          .from('sessions')
          .insert([{
            id: activeSession.id,
            name: activeSession.name,
            created_by: user.id,
            student_count: 0
          }]);

        if (sessionError) throw sessionError;
        
        setActiveSession({
          ...activeSession,
          isTemporary: false
        });
      }

      // Determine which fencers to add and which to remove
      const fencersToAdd = Array.from(selectedFencers)
        .filter(fencerId => !sessionFencers.some(sf => sf.id === fencerId))
        .map(fencerId => ({
          session_id: activeSession.id,
          fencer_id: fencerId
        }));

      const fencersToRemove = Array.from(selectedFencers)
        .filter(fencerId => sessionFencers.some(sf => sf.id === fencerId));

      // Add new fencers
      if (fencersToAdd.length > 0) {
        const { error: addError } = await supabase
          .from('session_fencers')
          .insert(fencersToAdd);

        if (addError) throw addError;
      }

      // Remove deselected fencers
      if (fencersToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('session_fencers')
          .delete()
          .eq('session_id', activeSession.id)
          .in('fencer_id', fencersToRemove);

        if (removeError) throw removeError;
      }

      // Clear selections after successful update
      setSelectedFencers(new Set());
      fetchSessionFencers(activeSession.id);
      fetchSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-airbnb">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-airbnb-hof text-3xl font-bold">Session Management</h1>
        {!activeSession ? (
          <button
            onClick={handleCreateSession}
            disabled={loading}
            className="px-6 py-3 bg-airbnb-rausch text-white rounded-airbnb hover:bg-airbnb-rausch/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Create Session
          </button>
        ) : (
          <button
            onClick={handleEndSession}
            className="px-6 py-3 bg-red-500 text-white rounded-airbnb hover:bg-red-600 transition text-sm font-medium"
          >
            End Session
          </button>
        )}
      </div>

      {activeSession && (
        <div className="bg-white p-6 rounded-airbnb shadow-airbnb mb-8">
          <h2 className="text-xl font-semibold text-airbnb-hof mb-6">Active Session: {activeSession.name}</h2>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {availableFencers.map(fencer => {
              const [firstName, ...lastNameParts] = fencer.name.split(' ');
              const lastName = lastNameParts.join(' ');
              const isSelected = selectedFencers.has(fencer.id);
              const isInSession = sessionFencers.some(sf => sf.id === fencer.id);
              return (
                <div
                  key={fencer.id}
                  onClick={() => handleFencerSelect(fencer.id)}
                  className={`p-4 border rounded-airbnb cursor-pointer transition-colors text-center
                    ${isInSession 
                      ? isSelected
                        ? 'border-airbnb-rausch bg-white' // In session but selected for removal
                        : 'border-airbnb-rausch bg-airbnb-rausch/10' // In session
                      : isSelected
                        ? 'border-airbnb-rausch bg-airbnb-rausch/10' // Selected to add
                        : 'border-gray-200 hover:bg-gray-50'}`} // Not in session or selected
                >
                  <div className="text-lg font-medium text-airbnb-hof">{firstName}</div>
                  <div className="text-sm text-airbnb-foggy">{lastName}</div>
                </div>
              );
            })}
            {availableFencers.length === 0 && (
              <div className="col-span-4 text-center py-8 text-airbnb-foggy">
                No fencers available
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={handleAddSelectedFencers}
              className="w-full px-6 py-3 bg-airbnb-rausch text-white rounded-airbnb hover:bg-airbnb-rausch/90 transition text-sm font-medium"
            >
              Update Session ({selectedFencers.size ? `${selectedFencers.size} fencers selected` : 'no fencers selected'})
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-airbnb shadow-airbnb">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-airbnb-hof">Session Fencers</h2>
            </div>
            <select
              value={selectedSession || ''}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="p-3 border border-gray-300 rounded-airbnb text-airbnb-hof focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition appearance-none bg-white"
              disabled={activeSession !== null}
            >
              <option value="">Select a session</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.student_count} students)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedSession && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider text-center">ID</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider text-center">Name</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider text-center">Age</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider text-center">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessionFencers.map(fencer => (
                  <tr key={fencer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-airbnb-babu font-mono">#{fencer.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-airbnb-hof font-medium">{fencer.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy text-center">
                      {fencer.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy text-center">
                      {fencer.level}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sessions; 