import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <img 
              src="https://frontdesk.s3.amazonaws.com/cce78873-e63b-4dfc-b34a-5a68b6a5bec7/logos/1710d6fb-123e-431d-ad59-e1e755d3d48c.png" 
              alt="Bay Area Fencing Logo" 
              className="footer-logo"
            />
            <span>Bay Area Fencing Tracker</span>
          </div>
          <p className="footer-tagline">Track, analyze, and improve your fencing game</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-section">
            <h3>Navigation</h3>
            <ul>
              <li><Link to="/">Student Registration</Link></li>
              <li><Link to="/bout-tracker">Bout Tracker</Link></li>
              <li><Link to="/leaderboards">Leaderboards</Link></li>
              <li><Link to="/statistics">Statistics</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Bay Area Fencing</h3>
            <ul>
              <li><a href="https://bayareafencing.pike13.com/schedule#/list?dt=2025-02-02&lt=staff" target="_blank" rel="noopener noreferrer">Schedule</a></li>
              <li><a href="https://bayareafencing.pike13.com/shop" target="_blank" rel="noopener noreferrer">Plans and Passess</a></li>
              <li><a href="https://bayareafencing.pike13.com/offerings" target="_blank" rel="noopener noreferrer">Classes</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Admin</h3>
            <ul>
              <li><Link to="/auth">Sign In</Link></li>
              <li><Link to="/admin">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="contact-info">
          <div className="contact-item">
            <a href="tel:+19252360280">(925) 236-0280</a>
          </div>
          <div className="contact-item">
            <a href="mailto:info@bayareafencing.com">info@bayareafencing.com</a>
          </div>
          <div className="contact-item">
            <a href="https://www.google.com/maps/place/Bay+Area+Fencing+Club+Pleasanton/@37.6904702,-121.9001625,1231m/data=!3m2!1e3!4b1!4m6!3m5!1s0x808fe900449fe049:0x78102f851994ce56!8m2!3d37.6904702!4d-121.8975822!16s%2Fg%2F11vspnc5t_?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">5870 Stoneridge Dr Suite 6, Pleasanton, CA 94588</a>
          </div>
        </div>
        <p className="copyright">&copy; {new Date().getFullYear()} Bay Area Fencing. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer; 