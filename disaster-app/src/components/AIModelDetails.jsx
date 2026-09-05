import React from 'react';

const AiModel = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', padding: '40px 20px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '10px' }}>
          SENTINEL AI Predictive Engine
        </h1>
        <div style={{ height: '1px', backgroundColor: '#333', width: '100%', maxWidth: '800px', margin: '0 auto' }}></div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Card 1: The XGBoost Model */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', borderTop: '4px solid #3498db', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
          <h3 style={{ color: '#fff', marginTop: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textAlign: 'center' }}>
            🌊 Extreme Weather & Flood Prediction
          </h3>
          <p style={{ color: '#aaa', lineHeight: '1.6', textAlign: 'center', fontSize: '0.95rem' }}>
            Replaces standard weather forecasts with a highly specialized machine learning classification engine. It evaluates live inputs from the Open-Meteo API—including maximum temperatures, continuous precipitation sums, and wind speeds—to output exact flood probability percentages.
          </p>
          <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#ccc' }}>
            <strong>Model:</strong> XGBoost Classification Engine<br/>
            <strong>Features:</strong> 17 Dynamic Climatic Variables<br/>
            <strong>Inference:</strong> Sub-second API Resolution
          </div>
        </div>

        {/* Card 2: Geospatial Mapping */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', borderTop: '4px solid #e67e22', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
          <h3 style={{ color: '#fff', marginTop: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textAlign: 'center' }}>
            📍 Dynamic Geospatial Threat Mapping
          </h3>
          <p style={{ color: '#aaa', lineHeight: '1.6', textAlign: 'center', fontSize: '0.95rem' }}>
            Translates the AI's mathematical flood probability into visual hazard radiuses on a live GIS dashboard. The system instantly recalculates a citizen's physical proximity to active disaster zones, automatically triggering localized warnings.
          </p>
          <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#ccc' }}>
            <strong>Algorithm:</strong> Haversine Spatial Distance Formula<br/>
            <strong>Mapping:</strong> React-Leaflet GeoJSON<br/>
            <strong>Alert Trigger:</strong> Autonomous Area Intersection
          </div>
        </div>

        {/* Card 3: Backend & Architecture */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', borderTop: '4px solid #2ecc71', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
          <h3 style={{ color: '#fff', marginTop: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textAlign: 'center' }}>
            🛡️ Secure Rescue Coordination
          </h3>
          <p style={{ color: '#aaa', lineHeight: '1.6', textAlign: 'center', fontSize: '0.95rem' }}>
            A high-performance backend pipeline designed to prevent data saturation during a crisis. Features a strict authorization hierarchy that securely bridges the communication gap between citizens broadcasting SOS signals and verified NGO first responders.
          </p>
          <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#ccc' }}>
            <strong>Architecture:</strong> Python FastAPI REST API<br/>
            <strong>Security:</strong> Role-Based Access Control (RBAC)<br/>
            <strong>Integration:</strong> Serialized ML Endpoints
          </div>
        </div>

      </div>
    </div>
  );
};

export default AiModel;