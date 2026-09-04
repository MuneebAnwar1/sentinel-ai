import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = ({ setUserRole }) => {
  const navigate = useNavigate();
  
  // Controls which form is visible: 'select', 'login', 'register', or 'admin'
  const [authMode, setAuthMode] = useState('select');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen'); // 'citizen' or 'relief'
  const [adminKey, setAdminKey] = useState('');

  // 1. GUEST ACCESS (No Login Required)
  const handleGuestAccess = () => {
    setUserRole('citizen');
    navigate('/dashboard');
  };

  // 2. REGISTER NEW USER / NGO
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email_or_phone: email,
          password: password,
          role: role
        })
      });
      
      const data = await response.json();
      
      if (data.status === "PENDING") {
        alert(data.message); // NGOs must wait for admin approval
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

  // 3. LOGIN REGISTERED USER
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_phone: email,
          password: password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.detail); // Shows "Invalid credentials" or "Pending approval"
      } else {
        setUserRole(data.role);
        navigate('/dashboard');
      }
    } catch (error) {
      alert("Backend connection failed. Is Uvicorn running?");
    }
  };

  // 4. ADMIN UNIQUE KEY LOGIN
  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Unique Key for Hackathon Demo
    if (adminKey === "SENTINEL-2026") {
      setUserRole('admin');
      navigate('/dashboard');
    } else {
      alert("Invalid Administrator Key.");
    }
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#121212', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '20px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '3rem', color: '#4da6ff', marginBottom: '10px', textShadow: '0 0 20px rgba(77, 166, 255, 0.5)' }}>
          🛡️ SENTINEL AI
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
          AI-Powered Disaster Prediction & Local Emergency Alerts
        </p>
      </div>

      <div style={{
        backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)', width: '100%', maxWidth: '400px',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        
        {/* --- MAIN SELECTION SCREEN --- */}
        {authMode === 'select' && (
          <>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #333', paddingBottom: '15px', textAlign: 'center' }}>
              Select Access Level
            </h3>
            
            <button onClick={handleGuestAccess} style={{ backgroundColor: '#2ecc71', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              👤 Continue as Guest (Citizen)
            </button>
            
            <button onClick={() => setAuthMode('login')} style={{ backgroundColor: '#3498db', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              ✉️ Login / Register (Citizen & NGO)
            </button>
            
            <div style={{ textAlign: 'center', color: '#555', margin: '5px 0', fontSize: '0.9rem' }}>— OR —</div>
            
            <button onClick={() => setAuthMode('admin')} style={{ backgroundColor: '#9b59b6', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              🔐 NDMA Admin Portal
            </button>
          </>
        )}

        {/* --- LOGIN SCREEN --- */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: '0', textAlign: 'center', color: '#3498db' }}>Account Login</h3>
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#121212', border: '1px solid #444', color: 'white' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#121212', border: '1px solid #444', color: 'white' }} />
            <button type="submit" style={{ backgroundColor: '#3498db', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#aaa', margin: 0 }}>
              Don't have an account? <span style={{ color: '#3498db', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setAuthMode('register')}>Register</span>
            </p>
            <button type="button" onClick={() => setAuthMode('select')} style={{ backgroundColor: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', marginTop: '10px' }}>← Back</button>
          </form>
        )}

        {/* --- REGISTER SCREEN --- */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: '0', textAlign: 'center', color: '#3498db' }}>Create Account</h3>
            <input type="text" placeholder="Full Name / NGO Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#121212', border: '1px solid #444', color: 'white' }} />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#121212', border: '1px solid #444', color: 'white' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#121212', border: '1px solid #444', color: 'white' }} />
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#121212', border: '1px solid #444', color: 'white' }}>
              <option value="citizen">Standard User (Citizen)</option>
              <option value="relief">Relief NGO / First Responder</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#2ecc71', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Register</button>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#aaa', margin: 0 }}>
              Already registered? <span style={{ color: '#3498db', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setAuthMode('login')}>Login</span>
            </p>
            <button type="button" onClick={() => setAuthMode('select')} style={{ backgroundColor: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', marginTop: '10px' }}>← Back</button>
          </form>
        )}

        {/* --- ADMIN KEY SCREEN --- */}
        {authMode === 'admin' && (
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: '0', textAlign: 'center', color: '#9b59b6' }}>Admin Authorization</h3>
            <p style={{ fontSize: '0.9rem', color: '#aaa', textAlign: 'center', margin: '0' }}>Please enter your unique government authorization key.</p>
            <input type="password" placeholder="Unique Auth Key" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#121212', border: '1px solid #9b59b6', color: 'white', textAlign: 'center', letterSpacing: '2px' }} />
            <button type="submit" style={{ backgroundColor: '#9b59b6', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Authorize</button>
            <button type="button" onClick={() => setAuthMode('select')} style={{ backgroundColor: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', marginTop: '10px' }}>← Back</button>
          </form>
        )}

      </div>
    </div>
  );
};

export default WelcomeScreen;