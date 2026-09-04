import React from 'react';
import './RedAlert.css';

const RedAlertOverlay = ({ isActive, dismissAlert, alertDetails }) => {
  // If the alert is not active, render absolutely nothing
  if (!isActive) return null;

  return (
    <div className="red-alert-screen">
      <div className="red-alert-content">
        <h1 className="blinking-text">⚠️ CRITICAL WARNING ⚠️</h1>
        <h2>{alertDetails.type} Detected in Your Area</h2>
        <p className="evac-instructions">
          Immediate action required. Please proceed to the nearest high-ground safe zone immediately.
        </p>
        
        <div className="alert-details-box">
          <p><strong>Severity:</strong> {alertDetails.severity}</p>
          <p><strong>AI Confidence:</strong> {alertDetails.confidence}</p>
        </div>

        <button className="dismiss-btn" onClick={dismissAlert}>
          ACKNOWLEDGE & VIEW MAP
        </button>
      </div>
      
      {/* 
        This plays a repeating beep sound. 
        Browsers allow auto-play here because the user clicked a button to trigger it!
      */}
      <audio 
        src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" 
        autoPlay 
        loop 
      />
    </div>
  );
};

export default RedAlertOverlay;