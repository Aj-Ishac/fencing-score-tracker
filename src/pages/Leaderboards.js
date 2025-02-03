import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { supabase } from '../services/supabaseClient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line
} from 'recharts';

function Leaderboards() {
  const { fencers, bouts, loading, error } = useData();
  const [timeframe, setTimeframe] = useState('all'); // all, month, week
  const [sortBy, setSortBy] = useState('winRate'); // winRate, totalWins, avgPoints
  const [selectedSession, setSelectedSession] = useState('all'); // 'all' or session id
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  // Calculate bout counts for each session
  const sessionsWithCounts = useMemo(() => {
    return sessions.map(session => ({
      ...session,
      boutCount: bouts.filter(bout => bout.session_id.toString() === session.id.toString()).length
    }));
  }, [sessions, bouts]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    let filteredBouts = bouts;

    // Debug logging
    console.log('Selected Session:', selectedSession);
    console.log('All Bouts:', bouts);

    // Filter by session if one is selected
    if (selectedSession !== 'all') {
      filteredBouts = bouts.filter(bout => bout.session_id.toString() === selectedSession.toString());
      console.log('Filtered Bouts by Session:', filteredBouts);
    }

    // Filter by timeframe
    filteredBouts = filteredBouts.filter(bout => {
      if (timeframe === 'all') return true;
      const boutDate = new Date(bout.timestamp);
      const diffTime = Math.abs(now - boutDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return timeframe === 'month' ? diffDays <= 30 : diffDays <= 7;
    });

    console.log('Final Filtered Bouts:', filteredBouts);

    return fencers.map(fencer => {
      const fencerBouts = filteredBouts.filter(bout => 
        bout.fencer1_id.toString() === fencer.id.toString() || 
        bout.fencer2_id.toString() === fencer.id.toString()
      );

      const wins = fencerBouts.filter(bout => {
        if (bout.fencer1_id.toString() === fencer.id.toString()) {
          return parseInt(bout.score1) > parseInt(bout.score2);
        } else {
          return parseInt(bout.score2) > parseInt(bout.score1);
        }
      }).length;

      const totalPoints = fencerBouts.reduce((sum, bout) => {
        if (bout.fencer1_id.toString() === fencer.id.toString()) {
          return sum + parseInt(bout.score1);
        } else {
          return sum + parseInt(bout.score2);
        }
      }, 0);

      const matches = fencerBouts.length;
      const winRate = matches > 0 ? ((wins / matches) * 100).toFixed(1) : '0.0';
      const avgPoints = matches > 0 ? (totalPoints / matches).toFixed(1) : '0.0';

      return {
        id: fencer.id,
        name: fencer.name,
        level: fencer.level,
        matches,
        wins,
        winRate: parseFloat(winRate),
        avgPoints: parseFloat(avgPoints),
        totalPoints
      };
    })
    .filter(fencer => fencer.matches > 0) // Only show fencers with matches in the selected session/timeframe
    .sort((a, b) => {
      if (sortBy === 'winRate') {
        const winRateDiff = b.winRate - a.winRate;
        return winRateDiff !== 0 ? winRateDiff : b.avgPoints - a.avgPoints;
      }
      return b[sortBy] - a[sortBy];
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center p-4 text-airbnb-foggy font-airbnb">Loading leaderboards...</div>;
  }

  if (error) {
    return <div className="p-4 text-airbnb-rausch bg-red-50 rounded-airbnb font-airbnb">Error: {error}</div>;
  }

  const stats = calculateStats();

  return (
    <div className="max-w-6xl mx-auto p-6 font-airbnb">
      <div className="bg-white p-6 rounded-airbnb shadow-airbnb mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-airbnb-hof text-3xl font-bold">Leaderboards</h1>
          <div className="flex gap-4">
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="p-2 border border-gray-300 rounded-airbnb"
            >
              <option value="all">All Sessions ({bouts.length} bouts)</option>
              {sessionsWithCounts.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.boutCount} bouts)
                </option>
              ))}
            </select>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="p-2 border border-gray-300 rounded-airbnb"
            >
              <option value="all">All Time</option>
              <option value="month">Past Month</option>
              <option value="week">Past Week</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-gray-300 rounded-airbnb"
            >
              <option value="winRate">Win Rate</option>
              <option value="wins">Total Wins</option>
              <option value="avgPoints">Avg Points</option>
            </select>
          </div>
        </div>

        {stats.length === 0 ? (
          <div className="text-center py-8 text-airbnb-foggy">
            No fencing data available for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase">Rank</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase">Fencer</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase">Level</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase">Win Rate</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase">Wins/Matches</th>
                  <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase">Avg Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.map((fencer, index) => (
                  <tr key={fencer.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`
                        font-bold
                        ${index === 0 ? 'text-yellow-600' : ''}
                        ${index === 1 ? 'text-gray-600' : ''}
                        ${index === 2 ? 'text-amber-700' : ''}
                      `}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <span className="text-airbnb-babu font-mono text-sm mr-2">#{fencer.id}</span>
                        <span className="font-medium text-airbnb-hof">{fencer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-airbnb-foggy">
                      {fencer.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-airbnb-hof">
                      {fencer.winRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-airbnb-foggy">
                      {fencer.wins}/{fencer.matches}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-airbnb-foggy">
                      {fencer.avgPoints.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Trend Chart */}
      {stats.length > 0 && (
        <div className="bg-white p-6 rounded-airbnb shadow-airbnb">
          <h2 className="text-xl font-semibold mb-4">
            Top Performers Trend
            {selectedSession !== 'all' && (
              <span className="text-airbnb-foggy text-sm ml-2">
                ({sessions.find(s => s.id === selectedSession)?.name})
              </span>
            )}
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.slice(0, 5)} margin={{ right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="winRate" name="Win Rate %" stroke="#FF5A5F" />
                <Line type="monotone" dataKey="avgPoints" name="Avg Points" stroke="#00A699" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboards; 