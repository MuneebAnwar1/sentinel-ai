import React from 'react';
import './AlertScreen.css';

const AIModelDetails = () => {
  return (
    <div className="alert-container">
      <h2 className="alert-header">SENTINEL AI Predictive Engine</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        <div className="alert-card">
          <h3>🌊 Hydrodynamic Flood Forecast</h3>
          <p style={{ color: '#ccc', lineHeight: '1.6' }}>
            Combines live river discharge rates from the Indus River Basin with Open-Meteo precipitation models and DEM elevation to compute flash flood risks 6 to 12 hours prior to inundation.
          </p>
          <p><strong>Model:</strong> Random Forest + Hydrological Runoff Net</p>
          <p><strong>Latency:</strong> Real-time inference (30s interval)</p>
        </div>

        <div className="alert-card">
          <h3>⚡ Seismic & Structural Risk</h3>
          <p style={{ color: '#ccc', lineHeight: '1.6' }}>
            Monitors Northern faults and seismic activity across the Chaman and Main Karakoram Thrust zones to assess regional aftershock vulnerability.
          </p>
          <p><strong>Model:</strong> Recurrent Neural Network (LSTM)</p>
          <p><strong>Accuracy Threshold:</strong> &gt; 91% Confidence</p>
        </div>

        <div className="alert-card">
          <h3>🗺️ Automated Safe-Zone Routing</h3>
          <p style={{ color: '#ccc', lineHeight: '1.6' }}>
            Evaluates topographical elevation and road blockages to match affected citizens with the closest functional shelter camp.
          </p>
          <p><strong>Algorithm:</strong> Dijkstra Multi-Factor Elevation Graph</p>
        </div>

      </div>
    </div>
  );
};

export default AIModelDetails;