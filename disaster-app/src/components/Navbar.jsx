import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ userRole, setUserRole, onSimulateAlert }) => {
  const navigate = useNavigate();

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin':
        return { label: 'Admin (NDMA)', color: '#ff4c4c' };
      case 'relief':
        return { label: 'Relief Agency / NGO', color: '#4da6ff' };
      case 'citizen':
        return { label: 'Registered Citizen', color: '#2ecc71' };
      default:
        return { label: 'Guest', color: '#95a5a6' }; // Clean grey for guests
    }
  };

  const badge = getRoleBadge();

  const handleAuthAction = () => {
    if (userRole === 'guest') {
      navigate('/login'); // Send guests to the login page
    } else {
      setUserRole('guest'); // Log out the user by resetting to guest
      navigate('/dashboard'); // Keep them on the map after exiting
    }
  };

  return (
    <nav className="sentinel-navbar">
      <div className="nav-brand" onClick={() => navigate('/dashboard')}>
        <span className="brand-logo">🛡️</span>
        <span className="brand-title">SENTINEL AI</span>
      </div>

      <div className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          Live Map & Alerts
        </NavLink>
        <NavLink to="/ai-model" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          AI Model
        </NavLink>
        <NavLink to="/datasheet" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          Datasheet Summary
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          About Us
        </NavLink>
      </div>

      <div className="nav-actions">
        {/* Admin and Relief organizations can simulate or broadcast alerts */}
        {(userRole === 'admin' || userRole === 'relief') && (
          <button className="nav-alert-btn" onClick={onSimulateAlert}>
            🚨 Trigger Alert
          </button>
        )}

        <div className="role-pill" style={{ borderColor: badge.color, color: badge.color }}>
          ● {badge.label}
        </div>

        <button 
          className="logout-btn" 
          onClick={handleAuthAction}
          style={userRole === 'guest' ? { backgroundColor: '#3498db', color: 'white', border: 'none', fontWeight: 'bold' } : {}}
        >
          {userRole === 'guest' ? 'Login / Register' : 'Exit'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;