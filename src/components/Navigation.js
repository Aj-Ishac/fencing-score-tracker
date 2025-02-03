import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';
import { supabase } from '../services/supabaseClient';

function Navigation() {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-left">
          <div className="navbar-brand">
            <img 
              src="https://frontdesk.s3.amazonaws.com/cce78873-e63b-4dfc-b34a-5a68b6a5bec7/logos/1710d6fb-123e-431d-ad59-e1e755d3d48c.png" 
              alt="Bay Area Fencing Logo" 
              className="nav-logo"
            />
            <span>Bay Area Fencing Tracker</span>
          </div>
          <ul className="nav-links">
            <li className={location.pathname === '/sessions' ? 'active' : ''}>
              <Link to="/sessions">Sessions</Link>
            </li>
            <li className={location.pathname === '/bout-tracker' ? 'active' : ''}>
              <Link to="/bout-tracker">Bout Tracker</Link>
            </li>
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/">Student Registration</Link>
            </li>
            <li className={location.pathname === '/leaderboards' ? 'active' : ''}>
              <Link to="/leaderboards">Leaderboards</Link>
            </li>
            {user && (
              <ul className="nav-links mr-4">
                <li className={`statistics-link ${location.pathname === '/statistics' ? 'active' : ''}`}>
                  <Link to="/statistics">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="unlock-icon" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                    </svg>
                    Statistics
                  </Link>
                </li>
              </ul>
            )}
          </ul>
        </div>

        <div className="nav-right">
          {user ? (
            <div className="user-menu-container" ref={dropdownRef}>
              <button
                className="user-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
                </svg>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-item text-sm text-gray-600 border-b border-gray-100 pb-2 mb-2">
                    Logged in as:<br/>
                    <span className="font-medium text-airbnb-hof">{user.email}</span>
                  </div>
                  <Link to="/admin" className="dropdown-item">
                    Admin Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="auth-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
              </svg>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation; 