import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Fencing Score Tracker</h1>
        <p>Track your fencing bouts, analyze performance, and improve your game</p>
      </div>
      <div className="features">
        <div className="feature-card">
          <h2>Register Students</h2>
          <p>Add up to 50 students to track their progress</p>
          <Link to="/register" className="button">Register Now</Link>
        </div>
        <div className="feature-card">
          <h2>Track Bouts</h2>
          <p>Record scores and outcomes for each match</p>
          <Link to="/bout" className="button">Start Tracking</Link>
        </div>
        <div className="feature-card">
          <h2>View Statistics</h2>
          <p>Analyze performance and track improvement</p>
          <Link to="/statistics" className="button">View Stats</Link>
        </div>
      </div>
    </div>
  );
}

export default Home; 