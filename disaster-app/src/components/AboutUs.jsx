import React from 'react';
import './AlertScreen.css';

const AboutUs = () => {
  return (
    <div className="alert-container">
      <h2 className="alert-header">About SENTINEL AI</h2>
      <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '10px', maxWidth: '800px', lineHeight: '1.8', color: '#ddd' }}>
        <h3 style={{ color: '#ff4c4c', marginTop: 0 }}>Mission & Scope</h3>
        <p>
          <strong>SENTINEL AI</strong> is an intelligent disaster early-warning and humanitarian relief framework designed to bridge the critical information gap during national climate emergencies, severe floods, and seismic events in Pakistan.
        </p>
        
        <h3 style={{ color: '#4da6ff', marginTop: '25px' }}>Three-Tier Stakeholder Integration</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Citizens:</strong> Receive automated GIS elevation analysis, local weather alerts, emergency siren triggers, and guidance to nearest high-ground shelters.</li>
          <li><strong>Relief Associations & NGOs:</strong> Gain instant situational awareness of high-risk sectors to coordinate supply drops, boat rescue dispatches, and medical logistics.</li>
          <li><strong>Disaster Management Authorities (Admin):</strong> Monitor national risk vectors in real time and issue priority emergency overrides.</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutUs;