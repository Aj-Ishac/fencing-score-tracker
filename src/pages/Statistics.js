import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

function Statistics() {
  const { fencers, bouts, loading, error } = useData();
  const [selectedFencer, setSelectedFencer] = useState(null);

  const getOverallStats = () => {
    const totalBouts = bouts.length;
    const studentStats = fencers.map(fencer => {
      // Filter bouts for this fencer
      const fencerBouts = bouts.filter(bout => 
        bout.fencer1_id.toString() === fencer.id.toString() || 
        bout.fencer2_id.toString() === fencer.id.toString()
      );
      
      // Calculate wins
      const wins = fencerBouts.filter(bout => {
        if (bout.fencer1_id.toString() === fencer.id.toString()) {
          return parseInt(bout.score1) > parseInt(bout.score2);
        } else {
          return parseInt(bout.score2) > parseInt(bout.score1);
        }
      }).length;

      // Calculate total points scored
      const totalPoints = fencerBouts.reduce((sum, bout) => {
        if (bout.fencer1_id.toString() === fencer.id.toString()) {
          return sum + parseInt(bout.score1);
        } else {
          return sum + parseInt(bout.score2);
        }
      }, 0);

      // Calculate statistics
      const matches = fencerBouts.length;
      const winRate = matches > 0 ? ((wins / matches) * 100).toFixed(1) : '0.0';
      const averagePoints = matches > 0 ? (totalPoints / matches).toFixed(1) : '0.0';

      return {
        id: fencer.id,
        name: fencer.name,
        matches,
        wins,
        winRate,
        averagePoints
      };
    });

    // Sort by win rate (descending) and then by average points if win rates are equal
    studentStats.sort((a, b) => {
      const winRateDiff = parseFloat(b.winRate) - parseFloat(a.winRate);
      if (winRateDiff !== 0) return winRateDiff;
      return parseFloat(b.averagePoints) - parseFloat(a.averagePoints);
    });

    return {
      totalBouts,
      totalStudents: fencers.length,
      topFencers: studentStats.slice(0, 3),
      studentStats
    };
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById('student-performance');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      onclone: (clonedDoc) => {
        // Preserve background colors and styles in the cloned document
        const elements = clonedDoc.getElementsByClassName('bg-gray-50');
        for (let el of elements) {
          el.style.backgroundColor = '#F9FAFB';
        }
        const charts = clonedDoc.getElementsByClassName('recharts-wrapper');
        for (let chart of charts) {
          chart.style.backgroundColor = '#FFFFFF';
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${selectedFencer.name}_performance.pdf`);
  };

  const generateConfusionMatrix = () => {
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
  };

  const getFencerDetailedStats = (fencerId) => {
    if (!fencerId) return null;

    // Filter bouts for this fencer and sort by timestamp
    const fencerBouts = bouts.filter(bout => 
      bout.fencer1_id.toString() === fencerId.toString() || 
      bout.fencer2_id.toString() === fencerId.toString()
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate wins and losses
    const wins = fencerBouts.filter(bout => {
      const isFencer1 = bout.fencer1_id.toString() === fencerId.toString();
      return isFencer1 ? 
        parseInt(bout.score1) > parseInt(bout.score2) : 
        parseInt(bout.score2) > parseInt(bout.score1);
    }).length;

    // Calculate performance over time (oldest to newest)
    const performanceData = fencerBouts.map((bout, index) => {
      const isFencer1 = bout.fencer1_id.toString() === fencerId.toString();
      const score = parseInt(isFencer1 ? bout.score1 : bout.score2);
      const opponentScore = parseInt(isFencer1 ? bout.score2 : bout.score1);
      const won = isFencer1 ? 
        parseInt(bout.score1) > parseInt(bout.score2) : 
        parseInt(bout.score2) > parseInt(bout.score1);
      
      return {
        boutNumber: index + 1,
        score,
        opponentScore,
        pointDiff: score - opponentScore,
        won,
        date: new Date(bout.timestamp).toLocaleDateString(),
        opponent: getFencerName(isFencer1 ? bout.fencer2_id : bout.fencer1_id)
      };
    });

    // Calculate level-based performance
    const levelPerformance = {};
    fencerBouts.forEach(bout => {
      const isFencer1 = bout.fencer1_id.toString() === fencerId.toString();
      const opponentId = isFencer1 ? bout.fencer2_id : bout.fencer1_id;
      const opponent = fencers.find(f => f.id.toString() === opponentId.toString());
      const won = isFencer1 ? 
        parseInt(bout.score1) > parseInt(bout.score2) : 
        parseInt(bout.score2) > parseInt(bout.score1);
      
      if (opponent?.level) {
        if (!levelPerformance[opponent.level]) {
          levelPerformance[opponent.level] = { total: 0, wins: 0 };
        }
        levelPerformance[opponent.level].total++;
        if (won) levelPerformance[opponent.level].wins++;
      }
    });

    // Calculate points statistics
    const pointsStats = fencerBouts.reduce((acc, bout) => {
      const isFencer1 = bout.fencer1_id.toString() === fencerId.toString();
      const scored = parseInt(isFencer1 ? bout.score1 : bout.score2);
      const conceded = parseInt(isFencer1 ? bout.score2 : bout.score1);
      
      return {
        totalScored: acc.totalScored + scored,
        totalConceded: acc.totalConceded + conceded,
        matches: acc.matches + 1
      };
    }, { totalScored: 0, totalConceded: 0, matches: 0 });

    const totalBouts = fencerBouts.length;

    return {
      totalBouts,
      wins,
      losses: totalBouts - wins,
      winRate: totalBouts > 0 ? ((wins / totalBouts) * 100).toFixed(1) : '0.0',
      averagePointsScored: totalBouts > 0 ? (pointsStats.totalScored / totalBouts).toFixed(1) : '0.0',
      averagePointsConceded: totalBouts > 0 ? (pointsStats.totalConceded / totalBouts).toFixed(1) : '0.0',
      performanceData,
      levelPerformance,
      recentForm: performanceData.slice(-5).map(bout => bout.won).reverse()
    };
  };

  const getFencerName = (id) => {
    const fencer = fencers.find(f => f.id.toString() === id.toString());
    return fencer ? fencer.name : 'Unknown Fencer';
  };

  if (loading) {
    return <div className="flex justify-center items-center p-4 text-airbnb-foggy font-airbnb">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-4 text-airbnb-rausch bg-red-50 rounded-airbnb font-airbnb">Error: {error}</div>;
  }

  const stats = getOverallStats();
  const matrix = generateConfusionMatrix();
  const selectedFencerStats = getFencerDetailedStats(selectedFencer?.id);

  const COLORS = ['#00A699', '#FF5A5F', '#FC642D', '#484848'];

  return (
    <div className="max-w-6xl mx-auto p-6 font-airbnb">
      <h1 className="text-airbnb-hof text-3xl font-bold mb-6">Fencing Statistics</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-airbnb shadow-airbnb hover:shadow-airbnb-hover transition-shadow duration-200">
          <h3 className="text-airbnb-foggy text-sm font-medium uppercase mb-2">Total Bouts</h3>
          <p className="text-airbnb-hof text-3xl font-semibold">{stats.totalBouts}</p>
        </div>
        <div className="bg-white p-6 rounded-airbnb shadow-airbnb hover:shadow-airbnb-hover transition-shadow duration-200">
          <h3 className="text-airbnb-foggy text-sm font-medium uppercase mb-2">Total Fencers</h3>
          <p className="text-airbnb-hof text-3xl font-semibold">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-airbnb shadow-airbnb hover:shadow-airbnb-hover transition-shadow duration-200">
          <h3 className="text-airbnb-foggy text-sm font-medium uppercase mb-2">Average Points/Bout</h3>
          <p className="text-airbnb-hof text-3xl font-semibold">
            {(bouts.reduce((sum, bout) => sum + bout.score1 + bout.score2, 0) / (bouts.length * 2 || 1)).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Student Selection */}
      <div className="bg-white p-6 rounded-airbnb shadow-airbnb mb-8">
        <h2 className="text-airbnb-hof text-xl font-semibold mb-4">Student Performance Analysis</h2>
        <div className="flex items-center gap-4">
          <select
            className="flex-1 p-3 border border-gray-300 rounded-airbnb text-airbnb-hof focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition appearance-none bg-white"
            onChange={(e) => setSelectedFencer(fencers.find(f => f.id.toString() === e.target.value))}
            value={selectedFencer?.id || ""}
          >
            <option value="">Select a student to analyze</option>
            {fencers.map(fencer => (
              <option key={fencer.id} value={fencer.id}>
                #{fencer.id} {fencer.name}
              </option>
            ))}
          </select>
          {selectedFencer && (
            <button
              onClick={() => setSelectedFencer(null)}
              className="px-4 py-3 bg-white border border-airbnb-hof text-airbnb-hof rounded-airbnb hover:bg-gray-50 transition text-sm font-medium"
            >
              Back to Overview
            </button>
          )}
        </div>
      </div>

      {selectedFencer && selectedFencerStats ? (
        <div className="space-y-8">
          {/* Student Overview */}
          <div className="bg-white p-6 rounded-airbnb shadow-airbnb">
            <h3 className="text-airbnb-hof text-lg font-semibold mb-4">
              Performance Overview - {selectedFencer.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-airbnb">
                <div className="text-airbnb-foggy text-sm">Win Rate</div>
                <div className="text-airbnb-hof text-2xl font-semibold">{selectedFencerStats.winRate}%</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-airbnb">
                <div className="text-airbnb-foggy text-sm">Record</div>
                <div className="text-airbnb-hof text-2xl font-semibold">
                  {selectedFencerStats.wins}W - {selectedFencerStats.losses}L
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-airbnb">
                <div className="text-airbnb-foggy text-sm">Avg Points Scored</div>
                <div className="text-airbnb-hof text-2xl font-semibold">{selectedFencerStats.averagePointsScored}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-airbnb">
                <div className="text-airbnb-foggy text-sm">Avg Points Conceded</div>
                <div className="text-airbnb-hof text-2xl font-semibold">{selectedFencerStats.averagePointsConceded}</div>
              </div>
            </div>
          </div>

          {/* Recent Form */}
          <div className="bg-white p-6 rounded-airbnb shadow-airbnb">
            <h3 className="text-airbnb-hof text-lg font-semibold mb-4">Recent Form</h3>
            <div className="flex gap-2">
              {selectedFencerStats.recentForm.map((won, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm
                    ${won ? 'bg-airbnb-babu' : 'bg-airbnb-rausch'}`}
                >
                  {won ? 'W' : 'L'}
                </div>
              ))}
            </div>
          </div>

          {/* Performance Over Time */}
          <div className="bg-white p-6 rounded-airbnb shadow-airbnb">
            <h3 className="text-airbnb-hof text-lg font-semibold mb-4">Performance Over Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedFencerStats.performanceData} margin={{ right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="boutNumber" label={{ value: 'Bout Number', position: 'insideBottomRight', offset: -20 }} />
                  <YAxis label={{ value: 'Points', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="score" name="Points Scored" stroke="#00A699" />
                  <Line type="monotone" dataKey="opponentScore" name="Points Conceded" stroke="#FF5A5F" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Level-based Performance */}
          <div className="bg-white p-6 rounded-airbnb shadow-airbnb">
            <h3 className="text-airbnb-hof text-lg font-semibold mb-4">Performance by Opponent Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2  text-xs font-medium text-airbnb-foggy uppercase">Level</th>
                    <th className="px-4 py-2  text-xs font-medium text-airbnb-foggy uppercase">Record</th>
                    <th className="px-4 py-2  text-xs font-medium text-airbnb-foggy uppercase">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(selectedFencerStats.levelPerformance).map(([level, stats]) => (
                    <tr key={level} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-airbnb-hof">{level}</td>
                      <td className="px-4 py-2 text-sm text-airbnb-hof">
                        {stats.wins}W - {stats.total - stats.wins}L
                      </td>
                      <td className="px-4 py-2 text-sm text-airbnb-hof">
                        {((stats.wins / stats.total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(selectedFencerStats.levelPerformance).map(([level, stats]) => ({
                        name: level,
                        value: stats.total
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(selectedFencerStats.levelPerformance).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Match History */}
          <div className="bg-white p-6 rounded-airbnb shadow-airbnb">
            <h3 className="text-airbnb-hof text-lg font-semibold mb-4">Match History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2  text-xs font-medium text-airbnb-foggy uppercase">Date</th>
                    <th className="px-4 py-2  text-xs font-medium text-airbnb-foggy uppercase">Opponent</th>
                    <th className="px-4 py-2  text-xs font-medium text-airbnb-foggy uppercase">Score</th>
                    <th className="px-4 py-2  text-xs font-medium text-airbnb-foggy uppercase">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedFencerStats.performanceData.map((bout, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-airbnb-foggy">{bout.date}</td>
                      <td className="px-4 py-2 text-sm text-airbnb-hof">{bout.opponent}</td>
                      <td className="px-4 py-2 text-sm text-airbnb-hof">
                        {bout.score} - {bout.opponentScore}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          bout.won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bout.won ? 'Won' : 'Lost'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Win Rates Chart */}
          <div className="bg-white p-6 rounded-airbnb shadow-airbnb mb-8">
            <h2 className="text-airbnb-hof text-xl font-semibold mb-6">Win Rates (%)</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.studentStats} margin={{ bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="name" 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ 
                      dy: 10,
                      dx: -5
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="winRate" name="Win Rate (%)" fill="#FF5A5F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fencer Rankings */}
          <div className="bg-white rounded-airbnb shadow-airbnb overflow-hidden mb-8">
            <h2 className="text-airbnb-hof text-xl font-semibold p-6 border-b">Fencer Rankings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Fencer</th>
                    <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Matches</th>
                    <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Wins</th>
                    <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Win Rate</th>
                    <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Avg Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.studentStats.map((fencer, index) => (
                    <tr 
                      key={fencer.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedFencer(fencers.find(f => f.id === fencer.id))}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-airbnb-babu font-mono text-sm mr-2">#{fencer.id}</span>
                          <span className="text-airbnb-hof font-medium">{fencer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-hof">
                        {fencer.matches}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-hof">
                        {fencer.wins}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-hof">
                        {fencer.winRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-hof">
                        {fencer.averagePoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Head-to-Head Matrix */}
          <div className="bg-white rounded-airbnb shadow-airbnb overflow-hidden">
            <h2 className="text-airbnb-hof text-xl font-semibold p-6 border-b">Head-to-Head Results</h2>
            <div className="overflow-x-auto p-6">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2  text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Fencer</th>
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
        </>
      )}
    </div>
  );
}

export default Statistics; 