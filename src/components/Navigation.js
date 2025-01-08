import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="navigation">
      <ul>
        <li>
          <Link to="/">Student Registration</Link>
        </li>
        <li>
          <Link to="/bout-tracker">Bout Tracker</Link>
        </li>
        <li>
          <Link to="/statistics">Statistics</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation; 