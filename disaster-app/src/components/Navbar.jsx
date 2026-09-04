import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ userRole, onSimulateAlert }) => {
  const navigate = useNavigate();

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin':
        return { label: 'Admin (NDMA)', color: '#ff4c4c' };
      case 'relief':
        return { label: 'Relief Agency / NGO', color: '#4da6ff' };
      default:
        return { label: 'Citizen', color: '#2ecc71' };
    }
  };

  const badge = getRoleBadge();

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

        <button className="logout-btn" onClick={() => navigate('/')}>
          Exit
        </button>
      </div>
    </nav>
  );
};

export default Navbar;