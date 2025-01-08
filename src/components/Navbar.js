import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="crossed-swords">⚔️</span>
        <span>Fencing Tracker</span>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/bout">Bout Tracker</Link>
        <Link to="/statistics">Statistics</Link>
      </div>
    </nav>
  );
}

export default Navbar; 