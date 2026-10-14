import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = ({ setUserRole }) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('login'); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [organization, setOrganization] = useState('');
  const [city, setCity] = useState('Gojra'); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_or_phone: email, password: password })
      });
      const data = await response.json();

      if (!response.ok) {
        alert(`Login Failed: ${data.detail || "Invalid credentials"}`);
        return;
      }

      alert(`Welcome back, ${data.name}!`);
      
      // NEW: Save user data for the dashboard
      localStorage.setItem('sentinelUser', JSON.stringify(data)); 
      
      setUserRole(data.role);
      navigate('/dashboard');
    } catch (error) {
      alert("Backend connection failed.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name, email_or_phone: email, password: password, role: role,
          organization_name: role === 'relief' ? organization : null,
          city: role === 'relief' ? city : null 
        })
      });
      const data = await response.json();

      if (!response.ok) {
        alert(`Registration Failed: Please fill all required fields correctly.`);
        return;
      }

      if (data.status === "PENDING") {
        alert(data.message); 
        setAuthMode('login');
      } else if (data.status === "APPROVED") {
        alert("Registration Successful!");
        
        // NEW: Save user data for the dashboard
        localStorage.setItem('sentinelUser', JSON.stringify(data));
        
        setUserRole(data.role);
        navigate('/dashboard');
      }
    } catch (error) {
      alert("Backend connection failed.");
    }
  };

  const handleGuestAccess = () => {
    localStorage.removeItem('sentinelUser'); // Clear old data for guests
    setUserRole('guest');
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', color: 'white', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#e74c3c', margin: '0 0 10px 0', fontSize: '2rem' }}>🛡️ SENTINEL AI</h1>
          <p style={{ color: '#aaa', margin: 0 }}>Disaster Early-Warning & Relief</p>
        </div>

        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {authMode === 'register' && (
            <>
              <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #444' }} />
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #444' }}>
                <option value="citizen">Citizen (Standard)</option>
                <option value="relief">NGO / Relief Organization</option>
              </select>
              
              {role === 'relief' && (
                <>
                  <input type="text" placeholder="Organization Name" required value={organization} onChange={(e) => setOrganization(e.target.value)} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #444', boxSizing: 'border-box' }} />
                  <select value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #444', boxSizing: 'border-box' }}>
                    <option value="Gojra">Gojra</option>
                    <option value="Dadu">Dadu (Sindh - Flood Zone)</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Multan">Multan</option>
                  </select>
                </>
              )}
            </>
          )}

          <input type="text" placeholder="Email or Phone Number" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #444' }} />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #444' }} />

          <button type="submit" style={{ padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
            {authMode === 'login' ? 'Secure Login' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: '#aaa', textDecoration: 'underline', cursor: 'pointer' }}>
            {authMode === 'login' ? "Need an account? Register here" : "Already have an account? Login"}
          </button>
        </div>

        <hr style={{ borderColor: '#333', margin: '25px 0' }} />

        <button type="button" onClick={handleGuestAccess} style={{ width: '100%', padding: '12px', backgroundColor: '#2ecc71', color: '#121212', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          🌐 Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;