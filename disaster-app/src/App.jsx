import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import Navbar from './components/Navbar';
import AlertScreen from './components/AlertScreen';
import MapDashboard from './components/MapDashboard';
import RedAlertOverlay from './components/RedAlertOverlay';
import AIModelDetails from './components/AIModelDetails';
import DataSheetSummary from './components/DataSheetSummary';
import AboutUs from './components/AboutUs';
import './App.css';

function MainDashboard({ userRole, isEmergencyActive, setIsEmergencyActive, sosRequests, setSosRequests }) {
  const criticalEvent = {
    type: "Flash Flood Warning",
    severity: "CRITICAL",
    confidence: "98%"
  };

  return (
    <div>
      <RedAlertOverlay 
        isActive={isEmergencyActive} 
        dismissAlert={() => setIsEmergencyActive(false)} 
        alertDetails={criticalEvent}
      />
      <MapDashboard 
        userRole={userRole} 
        sosRequests={sosRequests} 
        setSosRequests={setSosRequests}
      />
      <AlertScreen />
    </div>
  );
}

function App() {
  // START AS A GUEST BY DEFAULT (Frictionless UX)
  const [userRole, setUserRole] = useState('guest'); 
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [sosRequests, setSosRequests] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // FETCH ACTIVE SOS FROM FASTAPI BACKEND ON LOAD
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/sos/active')
      .then(res => res.json())
      .then(data => setSosRequests(data))
      .catch(err => console.error("Error fetching backend SOS data:", err));
  }, []);

  const triggerSystemAlert = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setIsEmergencyActive(true);
    }, 4000);
  };

  return (
    <Router>
      <div style={{ backgroundColor: '#121212', minHeight: '100vh', position: 'relative' }}>
        
        {showToast && (
          <div className="toast-notification">
            <div className="toast-header">
              <span>📱 <strong>SENTINEL AI - GOV ALERT</strong></span>
              <small>Just now</small>
            </div>
            <div className="toast-body">
              <strong>EMERGENCY:</strong> AI has detected an imminent flash flood in the Gojra sector. Evacuate to the nearest high-ground safe zone immediately. 
            </div>
          </div>
        )}

        <Routes>
          {/* Default Route Now Goes Straight to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* WelcomeScreen is now a dedicated Login/Register page */}
          <Route path="/login" element={<WelcomeScreen setUserRole={setUserRole} />} />

          <Route
            path="/*"
            element={
              <>
                <Navbar 
                  userRole={userRole} 
                  setUserRole={setUserRole} // Passed so Navbar can handle Logout/Login routing
                  onSimulateAlert={triggerSystemAlert} 
                />
                <Routes>
                  <Route 
                    path="/dashboard" 
                    element={
                      <MainDashboard 
                        userRole={userRole}
                        isEmergencyActive={isEmergencyActive}
                        setIsEmergencyActive={setIsEmergencyActive}
                        sosRequests={sosRequests}
                        setSosRequests={setSosRequests}
                      />
                    } 
                  />
                  <Route path="/ai-model" element={<AIModelDetails />} />
                  <Route 
                    path="/datasheet" 
                    element={
                      <DataSheetSummary 
                        userRole={userRole} 
                        sosRequests={sosRequests} 
                        setSosRequests={setSosRequests} 
                      />
                    } 
                  />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;