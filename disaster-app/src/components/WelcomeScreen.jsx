import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = ({ setUserRole }) => {
  const navigate = useNavigate();
  
  const [authMode, setAuthMode] = useState('select');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen'); 
  const [adminKey, setAdminKey] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email_or_phone: email, password, role })
      });
      const data = await response.json();
      if (data.status === "PENDING") {
        alert(data.message); 
        setAuthMode('login');
      } else {
        alert("Registration Successful!");
        setUserRole(data.role);
        navigate('/dashboard');
      }
    } catch (error) {
      alert("Backend connection failed. Is Uvicorn running?");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_or_phone: email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.detail); 
      } else {
        setUserRole(data.role);
        navigate('/dashboard');
      }
    } catch (error) {
      alert("Backend connection failed. Is Uvicorn running?");
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminKey === "SENTINEL-2026") {
      setUserRole('admin');
      navigate('/dashboard');
    } else {
      alert("Invalid Administrator Key.");
    }
  };

  const inputStyle = {
    padding: '14px', 
    borderRadius: '8px', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    border: '1px solid #555', 
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    padding: '15px', 
    borderRadius: '8px', 
    border: 'none', 
    fontWeight: 'bold', 
    fontSize: '1rem', 
    cursor: 'pointer', 
    transition: 'transform 0.2s, boxShadow 0.2s',
    width: '100%'
  };

  return (
    <div style={{
      minHeight: '100vh', 
      background: 'radial-gradient(circle at center, #1a1a2e 0%, #121212 100%)', // Sleek dark gradient
      color: '#fff',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center', // Centers vertically on the screen
      padding: '20px', 
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#4da6ff', margin: '0 0 10px 0', textShadow: '0 0 20px rgba(77, 166, 255, 0.5)', letterSpacing: '2px' }}>
          🛡️ SENTINEL AI
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa', margin: '0' }}>
          Secure Authorization Portal
        </p>
      </div>

      {/* AUTHENTICATION BOX (Glassmorphism Effect) */}
      <div style={{
        backgroundColor: 'rgba(30, 30, 35, 0.7)', 
        backdropFilter: 'blur(10px)',
        padding: '40px', 
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', 
        width: '100%', 
        maxWidth: '420px',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px', 
        zIndex: 10
      }}>
        
        {authMode === 'select' && (
          <>
            <button 
              onClick={() => setAuthMode('login')} 
              style={{ ...buttonStyle, backgroundColor: '#3498db', color: 'white', boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)' }}
            >
              👤 Citizen / NGO Portal
            </button>
            <div style={{ textAlign: 'center', color: '#777', margin: '5px 0', fontSize: '0.9rem', letterSpacing: '1px' }}>— OR —</div>
            <button 
              onClick={() => setAuthMode('admin')} 
              style={{ ...buttonStyle, backgroundColor: '#9b59b6', color: 'white', boxShadow: '0 4px 15px rgba(155, 89, 182, 0.4)' }}
            >
              🔐 NDMA Admin Portal
            </button>
            
            <button 
              onClick={() => navigate('/dashboard')} 
              style={{ backgroundColor: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', marginTop: '15px', fontSize: '0.9rem' }}
            >
              ← Return to Live Map (Guest View)
            </button>
          </>
        )}

        {authMode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#3498db', fontSize: '1.5rem' }}>Account Login</h3>
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            <button type="submit" style={{ ...buttonStyle, backgroundColor: '#3498db', color: 'white', marginTop: '10px' }}>Login</button>
            <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#aaa', marginTop: '10px', marginBottom: '0' }}>
              Don't have an account? <span style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setAuthMode('register')}>Register</span>
            </p>
            <button type="button" onClick={() => setAuthMode('select')} style={{ backgroundColor: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', marginTop: '15px' }}>← Back to Selection</button>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#2ecc71', fontSize: '1.5rem' }}>Create Account</h3>
            <input type="text" placeholder="Full Name / NGO Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
              <option value="citizen">Standard User (Citizen)</option>
              <option value="relief">Relief NGO / First Responder</option>
            </select>
            <button type="submit" style={{ ...buttonStyle, backgroundColor: '#2ecc71', color: 'white', marginTop: '10px' }}>Register</button>
            <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#aaa', marginTop: '10px', marginBottom: '0' }}>
              Already registered? <span style={{ color: '#2ecc71', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setAuthMode('login')}>Login</span>
            </p>
            <button type="button" onClick={() => setAuthMode('select')} style={{ backgroundColor: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', marginTop: '15px' }}>← Back to Selection</button>
          </form>
        )}

        {authMode === 'admin' && (
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: '0 0 5px 0', textAlign: 'center', color: '#9b59b6', fontSize: '1.5rem' }}>Admin Authorization</h3>
            <p style={{ fontSize: '0.9rem', color: '#aaa', textAlign: 'center', margin: '0 0 15px 0' }}>Enter your encrypted government clearance key.</p>
            <input type="password" placeholder="SENTINEL-XXXX" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} required style={{ ...inputStyle, textAlign: 'center', letterSpacing: '3px', fontSize: '1.1rem' }} />
            <button type="submit" style={{ ...buttonStyle, backgroundColor: '#9b59b6', color: 'white', marginTop: '10px' }}>Authorize Access</button>
            <button type="button" onClick={() => setAuthMode('select')} style={{ backgroundColor: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', marginTop: '15px' }}>← Back to Selection</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;