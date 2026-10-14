import React, { useState } from 'react';

const ReportDisasterModal = ({ isOpen, onClose, userLocation, cityName, localProviders, onSubmit }) => {
  const [emergencyType, setEmergencyType] = useState('Flood');
  const [peopleCount, setPeopleCount] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState('auto');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Find the name of the selected provider for the success message
    const providerName = selectedProvider === 'auto' 
      ? 'Auto-Route to Nearest' 
      : localProviders.find(p => p.id.toString() === selectedProvider)?.name || 'Unknown';

    const payload = {
      lat: userLocation[0],
      lng: userLocation[1],
      emergency_type: emergencyType,
      people_count: parseInt(peopleCount),
      city: cityName,
      provider_id: selectedProvider === 'auto' ? null : parseInt(selectedProvider),
      target_provider_name: providerName
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      onSubmit(data.message);
      onClose();
    } catch (error) {
      alert("Failed to submit report. Please check backend connection.");
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex',
      justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '12px',
        width: '100%', maxWidth: '450px', color: 'white', border: '1px solid #444',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
      }}>
        <h2 style={{ marginTop: 0, color: '#e74c3c', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          📢 Report Local Incident
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Current City Zone:</label>
            <input type="text" value={cityName} disabled style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#2a2a2a', color: '#4da6ff', border: '1px solid #444', fontWeight: 'bold', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Target Specific NGO/Hospital:</label>
            <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: '1px solid #555', boxSizing: 'border-box' }}>
              <option value="auto">⚡ Auto-Route to Nearest Available</option>
              {localProviders.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} ({provider.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Emergency Type:</label>
            <select value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: '1px solid #555', boxSizing: 'border-box' }}>
              <option value="Flood">Severe Flooding</option>
              <option value="Medical">Medical Emergency</option>
              <option value="Structural">Collapsed Structure</option>
              <option value="Fire">Fire / Explosion</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportDisasterModal;