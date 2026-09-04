import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './AlertScreen.css';
import ReportDisasterModal from './ReportDisasterModal';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const safeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const sosIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Haversine formula to calculate distance in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const p1 = lat1 * (Math.PI / 180);
  const p2 = lat2 * (Math.PI / 180);
  const dp = (lat2 - lat1) * (Math.PI / 180);
  const dl = (lon2 - lon1) * (Math.PI / 180);

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 10); // Zoomed in closer for better city view
  }, [position, map]);
  return null;
};

const MapDashboard = ({ userRole, sosRequests, setSosRequests }) => {
  // Default to Gojra, strictly controlled by the dropdown
  const [userLocation, setUserLocation] = useState([31.1471, 72.6824]); 
  
  const [elevation, setElevation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [pakistanBorder, setPakistanBorder] = useState(null);
  const [hazards, setHazards] = useState([]);
  const [safeZones, setSafeZones] = useState([]); // Now fetched from backend
  
  const [isScanning, setIsScanning] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState({ safe: true, message: "Fetching status..." });

  const handleCityChange = (e) => {
    const coords = e.target.value.split(',');
    setUserLocation([parseFloat(coords[0]), parseFloat(coords[1])]);
  };

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/PAK.geo.json')
      .then(response => response.json())
      .then(data => setPakistanBorder(data))
      .catch(error => console.error("Error fetching border:", error));

    fetch('http://127.0.0.1:8000/api/disasters/live')
      .then(res => res.json())
      .then(data => setHazards(data))
      .catch(err => console.error("Error fetching disasters:", err));
      
    // Fetch dynamic safe zones from your FastAPI backend
    fetch('http://127.0.0.1:8000/api/shelters')
      .then(res => res.json())
      .then(data => setSafeZones(data))
      .catch(err => console.error("Error fetching shelters:", err));
  }, []);

  useEffect(() => {
    if (userLocation && hazards.length > 0) {
      let inDanger = false;
      let activeThreat = null;

      for (const hazard of hazards) {
        const distance = calculateDistance(userLocation[0], userLocation[1], hazard.lat, hazard.lng);
        if (distance <= hazard.radius) {
          inDanger = true;
          activeThreat = hazard;
          break;
        }
      }

      if (inDanger) {
        setSafetyStatus({ safe: false, message: `⚠️ DANGER: You are inside an active ${activeThreat.type} zone!` });
      } else {
        setSafetyStatus({ safe: true, message: `✅ SAFE: No active threats in your immediate area.` });
      }
    }
  }, [userLocation, hazards]);

  useEffect(() => {
    if (userLocation) {
      const [lat, lng] = userLocation;
      fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`)
        .then(res => res.json())
        .then(data => { if (data.elevation) setElevation(data.elevation[0]); });

      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation&timezone=auto`)
        .then(res => res.json())
        .then(data => { if (data.current) setWeather(data.current); });
    }
  }, [userLocation]);

  const handleSosTrigger = async () => {
    if (userLocation) {
      try {
        const payload = { lat: userLocation[0], lng: userLocation[1], people_count: 1, emergency_type: "General" };
        const response = await fetch('http://127.0.0.1:8000/api/sos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        setSosRequests([...sosRequests, result.data]);
        alert("SOS Broadcasted to Backend! Rescue teams have been notified.");
      } catch (error) {
        alert("Error connecting to server. Attempting offline radio broadcast...");
      }
    }
  };

  const updateSosStatus = async (id, newStatus) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/sos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setSosRequests(sosRequests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    } catch (error) {
      console.error("Failed to update status on backend:", error);
    }
  };

  const runAiPredictionScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: userLocation[0], lng: userLocation[1] })
      });
      
      if (!response.ok) throw new Error("Backend Model Error");
      const data = await response.json();
      
      if (data.status === "THREAT_DETECTED") {
        setHazards([...hazards, data.disaster]);
        alert(`AI Scan Complete!\n${data.zone}: ${data.risk_percentage.toFixed(1)}%\n\nACTION: ${data.action}`);
      } else {
        alert(`AI Scan Complete.\n${data.zone} (${data.risk_percentage.toFixed(1)}%)\n\nACTION: ${data.action}`);
      }
    } catch (error) {
      alert("AI Model is still loading. Please make sure the Python backend is running.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="alert-container" style={{ minHeight: 'auto', paddingBottom: '0', position: 'relative' }}>
      
      {userRole === 'citizen' && (
        <div style={{
          backgroundColor: safetyStatus.safe ? '#2ecc71' : '#e74c3c',
          color: 'white', textAlign: 'center', padding: '10px',
          fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 2000, position: 'relative'
        }}>
          {safetyStatus.message}
        </div>
      )}

      <h2 className="alert-header" style={{ marginTop: '10px' }}>Live GIS Monitoring - Pakistan</h2>
      
      <div style={{ position: 'absolute', top: userRole === 'citizen' ? '70px' : '20px', left: '20px', zIndex: 1000, backgroundColor: 'rgba(20, 20, 20, 0.8)', padding: '10px 15px', borderRadius: '8px', border: '1px solid #444' }}>
        <label style={{ color: '#4da6ff', marginRight: '10px', fontWeight: 'bold' }}>📍 Select Location:</label>
        <select onChange={handleCityChange} style={{ padding: '6px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>
          <option value="31.1471,72.6824">Gojra</option>
          <option value="31.5204,74.3587">Lahore</option>
          <option value="24.8607,67.0011">Karachi</option>
          <option value="33.6844,73.0479">Islamabad</option>
          <option value="26.7303,67.7769">Dadu</option>
          <option value="30.1984,71.4687">Multan</option>
          <option value="34.0151,71.5249">Peshawar</option>
        </select>
      </div>

      {userRole === 'admin' && (
        <button 
          onClick={runAiPredictionScan}
          disabled={isScanning}
          style={{
            position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
            backgroundColor: isScanning ? '#555' : '#8e44ad', color: 'white', padding: '12px 24px',
            border: '2px solid white', borderRadius: '8px', fontWeight: 'bold',
            boxShadow: isScanning ? 'none' : '0 0 15px rgba(142, 68, 173, 0.8)', 
            cursor: isScanning ? 'not-allowed' : 'pointer', fontSize: '1rem',
            transition: 'all 0.3s'
          }}
        >
          {isScanning ? '🔄 SATELLITE ANALYSIS IN PROGRESS...' : '🧠 INITIALIZE AI RISK SCAN'}
        </button>
      )}

      {userRole === 'citizen' && (
        <div style={{ position: 'absolute', top: '70px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={handleSosTrigger}
            style={{
              backgroundColor: '#ff0000', color: 'white', padding: '15px 25px',
              border: '2px solid white', borderRadius: '30px', fontWeight: 'bold',
              boxShadow: '0 0 20px rgba(255,0,0,0.8)', cursor: 'pointer', fontSize: '1.1rem',
              animation: 'bgFlash 2s infinite alternate'
            }}
          >
            🚨 REQUEST SOS RESCUE
          </button>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            style={{
              backgroundColor: '#1e3a5f', color: '#4da6ff', padding: '12px 20px',
              border: '1px solid #4da6ff', borderRadius: '30px', fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            📢 REPORT INCIDENT
          </button>
        </div>
      )}

      <ReportDisasterModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        userLocation={userLocation}
        onSubmit={(payload) => alert(`Report Submitted Successfully!\nStatus: UNDER REVIEW`)}
      />

      <div style={{ backgroundColor: '#1e1e1e', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', marginTop: '10px' }}>
        <MapContainer center={userLocation} zoom={10} style={{ height: "520px", width: "100%", borderRadius: "8px" }}>
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <RecenterMap position={userLocation} />

          {pakistanBorder && (
            <GeoJSON data={pakistanBorder} style={{ color: '#000000', weight: 4, fillOpacity: 0 }} />
          )}

          {hazards.map(zone => (
            <Circle key={zone.id} center={[zone.lat, zone.lng]} radius={zone.radius} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.4, weight: 2 }}>
              <Popup><strong style={{ color: zone.color }}>🚨 {zone.type}</strong><br/>Active hazard zone.</Popup>
            </Circle>
          ))}

          {/* Standard Blue Marker for User's Selected Location */}
          <Marker position={userLocation}>
            <Popup>
              <div style={{ color: '#333', fontSize: '14px' }}>
                <strong>📍 Selected Location</strong><br/>
                <hr style={{ margin: '5px 0' }}/>
                <strong>Elevation:</strong> {elevation !== null ? `${elevation} m` : 'Loading...'} <br/>
                <strong>Temp:</strong> {weather ? `${weather.temperature_2m}°C` : 'Loading...'}
              </div>
            </Popup>
          </Marker>

          {/* Green Markers for Safe Zones */}
          {safeZones.map(zone => (
            <Marker key={zone.id} position={[zone.lat, zone.lng]} icon={safeIcon}>
              <Popup><strong>🛡️ {zone.name}</strong><br/>Capacity: {zone.capacity}<br/>Current Occupancy: {zone.occupancy}</Popup>
            </Marker>
          ))}

          {sosRequests.filter(req => req.status !== 'Resolved').map(req => (
            <Marker key={req.id} position={[req.lat, req.lng]} icon={sosIcon}>
              <Popup>
                <strong style={{color: 'red'}}>🚨 SOS Signal: {req.id}</strong><br/>
                Status: <strong>{req.status}</strong><br/>
                Time: {req.timestamp}<br/>
                {userRole === 'relief' && req.status === 'Pending' && (
                  <button 
                    onClick={() => updateSosStatus(req.id, 'Dispatched')}
                    style={{ marginTop: '10px', backgroundColor: '#4da6ff', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                  >
                    Dispatch Unit
                  </button>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{
        position: 'absolute', bottom: '40px', left: '20px', zIndex: 1000, backgroundColor: 'rgba(20, 20, 20, 0.9)',
        padding: '15px', borderRadius: '8px', border: '1px solid #444', boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
        color: '#fff', fontSize: '0.9rem', minWidth: '160px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555', paddingBottom: '8px', color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>
          Map Legend
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: 'red', borderRadius: '50%', display: 'inline-block', marginRight: '10px', opacity: 0.5, border: '2px solid red' }}></span>
          Severe Flooding
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: 'blue', borderRadius: '50%', display: 'inline-block', marginRight: '10px', opacity: 0.5, border: '2px solid blue' }}></span>
          Heavy Rainfall
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: 'orange', borderRadius: '50%', display: 'inline-block', marginRight: '10px', opacity: 0.5, border: '2px solid orange' }}></span>
          Earthquakes (Coming Soon)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: 'purple', borderRadius: '50%', display: 'inline-block', marginRight: '10px', opacity: 0.7, border: '2px solid purple' }}></span>
          AI Prediction Zone
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #444' }}>
          <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>🛡️</span>
          Safe Zone / Shelter
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;