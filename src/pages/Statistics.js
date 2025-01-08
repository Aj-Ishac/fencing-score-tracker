import React from 'react';
import { useStudents } from '../context/StudentContext';
import './Statistics.css';

function Statistics() {
  const { students } = useStudents();

  const getStudentStats = (student) => {
    const wins = student.bouts.filter(bout => bout.won).length;
    const totalBouts = student.bouts.length;
    const winRate = totalBouts ? ((wins / totalBouts) * 100).toFixed(1) : 0;

    const pointStats = student.bouts.reduce((acc, bout) => ({
      scored: acc.scored + bout.scoreFor,
      conceded: acc.conceded + bout.scoreAgainst
    }), { scored: 0, conceded: 0 });

    const recentBouts = [...student.bouts]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(bout => ({
        result: bout.won ? 'W' : 'L',
        score: `${bout.scoreFor}-${bout.scoreAgainst}`
      }));

    return {
      bouts: totalBouts,
      wins,
      losses: totalBouts - wins,
      winRate,
      pointsScored: pointStats.scored,
      pointsConceded: pointStats.conceded,
      recentBouts
    };
  };

  return (
    <div className="statistics">
      <h1>Fencing Statistics</h1>
      
      <div className="stats-grid">
        {students.map(student => {
          const stats = getStudentStats(student);
          return (
            <div key={student.id} className="stats-card">
              <h2>{student.name}</h2>
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-label">Win Rate</span>
                  <span className="stat-value">{stats.winRate}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Record</span>
                  <span className="stat-value">
                    {stats.wins}W - {stats.losses}L
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Points</span>
                  <span className="stat-value">
                    {stats.pointsScored} / {stats.pointsConceded}
                  </span>
                </div>
              </div>

              <div className="recent-bouts">
                <h3>Recent Bouts</h3>
                <div className="bout-history">
                  {stats.recentBouts.map((bout, index) => (
                    <div 
                      key={index} 
                      className={`bout-result ${bout.result === 'W' ? 'win' : 'loss'}`}
                    >
                      {bout.result} ({bout.score})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Statistics; 