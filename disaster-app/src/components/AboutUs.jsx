import React from 'react';

const AboutUs = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', padding: '60px 20px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
        
        <h1 style={{ fontSize: '2.5rem', color: '#4da6ff', marginBottom: '20px', textAlign: 'center', textShadow: '0 0 20px rgba(77, 166, 255, 0.3)' }}>
          About SENTINEL AI
        </h1>
        
        <h3 style={{ color: '#2ecc71', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '30px' }}>
          The Core Problem
        </h3>
        <p style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1.1rem' }}>
          Traditional disaster management is entirely reactive. Government agencies and relief organizations typically deploy resources <em>after</em> the devastation has occurred. During the critical early hours of a climate crisis, communication networks fail, data becomes disorganized, and citizens are left without hyper-local, immediate danger awareness.
        </p>

        <h3 style={{ color: '#2ecc71', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '30px' }}>
          Our Mission
        </h3>
        <p style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1.1rem' }}>
          SENTINEL AI bridges the critical gap between predictive data science and ground-level rescue coordination. We built a proactive, full-stack disaster management system that predicts extreme weather events before they strike. By combining a 17-feature machine learning model with real-time Geographic Information Systems (GIS), we provide actionable, visual threat data to the people who need it most.
        </p>

        <h3 style={{ color: '#2ecc71', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '30px' }}>
          System Capabilities
        </h3>
        <ul style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1.1rem', paddingLeft: '20px' }}>
          <li><strong>Proactive Intelligence:</strong> Live API weather telemetry fed directly into an optimized XGBoost classification engine.</li>
          <li><strong>Verified Rescue Pipelines:</strong> A secure platform ensuring only vetted NGOs and NDMA administrators can access and dispatch units to active citizen SOS broadcasts.</li>
          <li><strong>Dynamic Scalability:</strong> Built on React and FastAPI, the system is designed to handle high traffic and rapid coordinate rendering during nationwide emergencies.</li>
        </ul>

      </div>
    </div>
  );
};

export default AboutUs;