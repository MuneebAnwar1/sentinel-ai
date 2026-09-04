import React, { useState } from 'react';

const ReportDisasterModal = ({ isOpen, onClose, onSubmit, userLocation }) => {
  const [incidentType, setIncidentType] = useState('Flood');
  const [severity, setSeverity] = useState('Low');
  const [description, setDescription] = useState('');

  // If the modal isn't supposed to be open, don't render anything
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create the payload exactly how your backend teammate will want it
    const payload = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      type: incidentType,
      severity: severity,
      description: description,
      lat: userLocation ? userLocation[0] : null,
      lng: userLocation ? userLocation[1] : null,
      status: 'UNDER_REVIEW',
      timestamp: new Date().toLocaleTimeString()
    };

    onSubmit(payload);
    
    // Reset form and close
    setIncidentType('Flood');
    setSeverity('Low');
    setDescription('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '12px',
        width: '90%', maxWidth: '450px', border: '1px solid #333', color: '#fff',
        boxShadow: '0 15px 30px rgba(0,0,0,0.6)'
      }}>
        <h3 style={{ marginTop: 0, color: '#4da6ff', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
          📢 Report Non-SOS Incident
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#aaa' }}>Incident Type</label>
            <select 
              value={incidentType} 
              onChange={(e) => setIncidentType(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#121212', color: '#fff', border: '1px solid #444' }}
            >
              <option value="Flood">Flood / Rising Water</option>
              <option value="Heavy Rain">Heavy Rain</option>
              <option value="Blocked Road">Blocked Road</option>
              <option value="Fallen Powerline">Fallen Powerline</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#aaa' }}>Severity</label>
            <select 
              value={severity} 
              onChange={(e) => setSeverity(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#121212', color: '#fff', border: '1px solid #444' }}
            >
              <option value="Low">Low (Monitor situation)</option>
              <option value="Medium">Medium (Affecting movement)</option>
              <option value="High">High (Immediate threat)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#aaa' }}>Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details (e.g., water level rising fast near main bridge)..."
              rows="3"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#121212', color: '#fff', border: '1px solid #444', resize: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#aaa' }}>Attach Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              style={{ width: '100%', fontSize: '0.9rem', color: '#aaa' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#4da6ff', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportDisasterModal;