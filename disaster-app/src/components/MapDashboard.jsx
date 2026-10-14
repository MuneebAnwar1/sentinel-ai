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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const p1 = lat1 * (Math.PI / 180);
  const p2 = lat2 * (Math.PI / 180);
  const dp = (lat2 - lat1) * (Math.PI / 180);
  const dl = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 10);
  }, [position, map]);
  return null;
};

const MapDashboard = ({ userRole, sosRequests, setSosRequests }) => {
  const [currentCity, setCurrentCity] = useState({ lat: 31.1471, lng: 72.6824, name: "Gojra" });
  const [userData, setUserData] = useState(null); // NEW: Store logged in user info
  
  const [pakistanBorder, setPakistanBorder] = useState(null);
  const [hazards, setHazards] = useState([]);
  const [safeZones, setSafeZones] = useState([]); 
  
  const [liveWeather, setLiveWeather] = useState(null);
  const [localProviders, setLocalProviders] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]); 

  const [isScanning, setIsScanning] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState({ safe: true, message: "Fetching status..." });
  const [lastAiScan, setLastAiScan] = useState(null); 

  // NEW: Read user details and lock NGO city
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('sentinelUser') || '{}');
    setUserData(storedUser);

    if (userRole === 'relief' && storedUser.city) {
      const cityCoords = {
        "Gojra": { lat: 31.1471, lng: 72.6824 },
        "Dadu": { lat: 26.7329, lng: 67.7767 },
        "Lahore": { lat: 31.5204, lng: 74.3587 },
        "Karachi": { lat: 24.8607, lng: 67.0011 },
        "Islamabad": { lat: 33.6844, lng: 73.0479 },
        "Peshawar": { lat: 34.0151, lng: 71.5249 },
        "Multan": { lat: 30.1984, lng: 71.4687 }
      };
      if (cityCoords[storedUser.city]) {
        setCurrentCity({ ...cityCoords[storedUser.city], name: storedUser.city });
      }
    }
  }, [userRole]);

  const handleCityChange = (e) => {
    const [lat, lng, name] = e.target.value.split(',');
    setCurrentCity({ lat: parseFloat(lat), lng: parseFloat(lng), name });
    setLastAiScan(null); 
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
      
    fetch('http://127.0.0.1:8000/api/shelters')
      .then(res => res.json())
      .then(data => setSafeZones(data))
      .catch(err => console.error("Error fetching shelters:", err));
  }, []);

  useEffect(() => {
    fetch(`https://api.weatherapi.com/v1/current.json?key=403571a6640749829a152854261410&q=${currentCity.lat},${currentCity.lng}`)
      .then(res => res.json())
      .then(data => setLiveWeather(data))
      .catch(err => console.error("Error fetching weather:", err));

    fetch(`http://127.0.0.1:8000/api/providers/${currentCity.name}`)
      .then(res => res.json())
      .then(data => setLocalProviders(data))
      .catch(err => console.error("Error fetching local providers:", err));
  }, [currentCity]);

  useEffect(() => {
    if (userRole === 'admin') {
      fetch('http://127.0.0.1:8000/api/admin/users')
        .then(res => res.json())
        .then(data => setSystemUsers(data))
        .catch(err => console.error("Error fetching users:", err));
    }
  }, [userRole]);

  useEffect(() => {
    if (currentCity && hazards.length > 0) {
      let inDanger = false;
      let activeThreat = null;

      for (const hazard of hazards) {
        const distance = calculateDistance(currentCity.lat, currentCity.lng, hazard.lat, hazard.lng);
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
  }, [currentCity, hazards]);

  const handleSosTrigger = async () => {
    if (currentCity) {
      try {
        const payload = { lat: currentCity.lat, lng: currentCity.lng, people_count: 1, emergency_type: "General" };
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

  const runAiPredictionScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: currentCity.lat, lng: currentCity.lng })
      });
      
      if (!response.ok) throw new Error("Backend Model Error");
      const data = await response.json();
      
      setLastAiScan({
        risk: data.risk_percentage,
        zone: data.zone,
        action: data.action,
        time: new Date().toLocaleTimeString()
      });
      
      if (data.status === "THREAT_DETECTED") {
        setHazards([...hazards, data.disaster]);
      }
    } catch (error) {
      alert("AI Model is still loading. Please make sure the Python backend is running.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const isConfirmed = window.confirm("Are you sure you want to permanently delete this account?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSystemUsers(systemUsers.filter(user => user.id !== userId));
        alert("Account successfully removed from the system.");
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to delete user.");
      }
    } catch (error) {
      alert("Backend connection failed.");
    }
  };

  return (
    <div className="alert-container" style={{ minHeight: 'auto', paddingBottom: '40px', position: 'relative' }}>
      
      {!safetyStatus.safe && <div className="danger-edge-glow"></div>}

      {(userRole === 'citizen' || userRole === 'guest') && (
        <div style={{
          backgroundColor: safetyStatus.safe ? '#2ecc71' : '#e74c3c',
          color: 'white', textAlign: 'center', padding: '10px',
          fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 400, position: 'relative'
        }}>
          {safetyStatus.message}
        </div>
      )}

      {/* NEW: DYNAMIC HEADER BASED ON ROLE */}
      {userRole === 'relief' && userData ? (
        <h2 className="alert-header" style={{ marginTop: '10px', color: '#4da6ff', borderBottom: '2px solid #4da6ff', paddingBottom: '5px' }}>
          🏥 {userData.organization_name || userData.name} — {currentCity.name} Department
        </h2>
      ) : (
        <h2 className="alert-header" style={{ marginTop: '10px' }}>Live GIS Monitoring - Pakistan</h2>
      )}
      
      {/* CITY SELECTOR - HIDDEN FOR NGOs */}
      {userRole !== 'relief' && (
        <div style={{ position: 'absolute', top: (userRole === 'citizen' || userRole === 'guest') ? '130px' : '90px', left: '20px', zIndex: 400, backgroundColor: 'rgba(20, 20, 20, 0.8)', padding: '10px 15px', borderRadius: '8px', border: '1px solid #444' }}>
          <label style={{ color: '#4da6ff', marginRight: '10px', fontWeight: 'bold' }}>📍 Select Zone:</label>
          <select onChange={handleCityChange} style={{ padding: '6px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            <option value="31.1471,72.6824,Gojra">Gojra</option>
            <option value="26.7329,67.7767,Dadu">Dadu (Sindh - Flood Zone)</option>
            <option value="31.5204,74.3587,Lahore">Lahore</option>
            <option value="24.8607,67.0011,Karachi">Karachi</option>
            <option value="33.6844,73.0479,Islamabad">Islamabad</option>
            <option value="34.0151,71.5249,Peshawar">Peshawar</option>
            <option value="30.1984,71.4687,Multan">Multan</option>
          </select>
        </div>
      )}

      {userRole === 'admin' && (
        <button 
          onClick={runAiPredictionScan} disabled={isScanning}
          style={{
            position: 'absolute', top: '90px', left: '50%', transform: 'translateX(-50%)', zIndex: 400,
            backgroundColor: isScanning ? '#555' : '#8e44ad', color: 'white', padding: '12px 24px',
            border: '2px solid white', borderRadius: '8px', fontWeight: 'bold',
            boxShadow: isScanning ? 'none' : '0 0 15px rgba(142, 68, 173, 0.8)', 
            cursor: isScanning ? 'not-allowed' : 'pointer', transition: 'all 0.3s'
          }}
        >
          {isScanning ? '🔄 SATELLITE ANALYSIS IN PROGRESS...' : '🧠 INITIALIZE AI RISK SCAN'}
        </button>
      )}

      {(userRole === 'citizen' || userRole === 'guest') && (
        <div style={{ position: 'fixed', bottom: '40px', right: '20px', zIndex: 400, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={handleSosTrigger}
            style={{
              backgroundColor: '#ff0000', color: 'white', padding: '20px 30px',
              border: '3px solid white', borderRadius: '40px', fontWeight: 'bold',
              boxShadow: !safetyStatus.safe ? '0 0 25px rgba(255,0,0,1)' : '0 4px 10px rgba(0,0,0,0.5)', 
              cursor: 'pointer', fontSize: '1.2rem',
              animation: !safetyStatus.safe ? 'bgFlash 0.5s infinite alternate' : 'none'
            }}
          >
            🚨 SOS RESCUE
          </button>

          {userRole === 'citizen' && (
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
          )}
        </div>
      )}

      <ReportDisasterModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        userLocation={[currentCity.lat, currentCity.lng]}
        cityName={currentCity.name}
        localProviders={localProviders}
        onSubmit={(msg) => alert(`System Notice:\n${msg}`)}
      />

      <div style={{ backgroundColor: '#1e1e1e', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', marginTop: '10px' }}>
        <MapContainer center={[currentCity.lat, currentCity.lng]} zoom={10} style={{ height: "60vh", minHeight: "450px", width: "100%", borderRadius: "8px", zIndex: 10 }}>
          <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution='Map data: &copy; OpenStreetMap' />
          <RecenterMap position={[currentCity.lat, currentCity.lng]} />

          {pakistanBorder && <GeoJSON data={pakistanBorder} style={{ color: '#000000', weight: 4, fillOpacity: 0 }} />}

          {hazards.map(zone => (
            <Circle key={zone.id} center={[zone.lat, zone.lng]} radius={zone.radius} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.4, weight: 2 }}>
              <Popup><strong style={{ color: zone.color }}>🚨 {zone.type}</strong><br/>Active hazard zone.</Popup>
            </Circle>
          ))}

          <Marker position={[currentCity.lat, currentCity.lng]}>
            <Popup><strong>📍 {currentCity.name} Operational Sector</strong></Popup>
          </Marker>

          {safeZones.map(zone => (
            <Marker key={zone.id} position={[zone.lat, zone.lng]} icon={safeIcon}>
              <Popup><strong>🛡️ {zone.name}</strong><br/>Capacity: {zone.capacity}<br/>Current Occupancy: {zone.occupancy}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '24px', 
        borderRadius: '10px', 
        boxShadow: '0 6px 16px rgba(0,0,0,0.4)', 
        borderTop: '4px solid #f39c12',
        marginTop: '25px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '16px' }}>
          <h3 style={{ color: '#f39c12', margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌤️ Live Climate Telemetry — {currentCity.name} Sector
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#888', letterSpacing: '0.5px' }}>
            LAT: {currentCity.lat.toFixed(4)}° | LNG: {currentCity.lng.toFixed(4)}°
          </span>
        </div>

        {liveWeather ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img 
                src={liveWeather.current.condition.icon} 
                alt="Weather Condition" 
                style={{ width: '70px', height: '70px', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.25))' }} 
              />
              <div>
                <div style={{ fontSize: '2.4rem', fontWeight: 'bold', color: '#fff', lineHeight: 1 }}>
                  {liveWeather.current.temp_c}°C
                </div>
                <div style={{ fontSize: '1rem', color: '#aaa', marginTop: '6px' }}>
                  {liveWeather.current.condition.text} (Feels like {liveWeather.current.feelslike_c}°C)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ backgroundColor: '#242424', padding: '12px 18px', borderRadius: '8px', border: '1px solid #333', minWidth: '130px' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', display: 'block' }}>HUMIDITY</span>
                <span style={{ color: '#4da6ff', fontSize: '1.2rem', fontWeight: 'bold' }}>💧 {liveWeather.current.humidity}%</span>
              </div>
              <div style={{ backgroundColor: '#242424', padding: '12px 18px', borderRadius: '8px', border: '1px solid #333', minWidth: '130px' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', display: 'block' }}>WIND SPEED</span>
                <span style={{ color: '#2ecc71', fontSize: '1.2rem', fontWeight: 'bold' }}>💨 {liveWeather.current.wind_kph} km/h</span>
              </div>
              <div style={{ backgroundColor: '#242424', padding: '12px 18px', borderRadius: '8px', border: '1px solid #333', minWidth: '130px' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', display: 'block' }}>PRECIPITATION</span>
                <span style={{ color: '#e67e22', fontSize: '1.2rem', fontWeight: 'bold' }}>🌧️ {liveWeather.current.precip_mm} mm</span>
              </div>
              <div style={{ backgroundColor: '#242424', padding: '12px 18px', borderRadius: '8px', border: '1px solid #333', minWidth: '130px' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', display: 'block' }}>PRESSURE</span>
                <span style={{ color: '#9b59b6', fontSize: '1.2rem', fontWeight: 'bold' }}>⏱️ {liveWeather.current.pressure_mb} mb</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#aaa', fontStyle: 'italic', padding: '15px 0' }}>Establishing meteorological uplink...</div>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '24px', 
        borderRadius: '10px', 
        boxShadow: '0 6px 16px rgba(0,0,0,0.4)', 
        borderTop: '4px solid #3498db',
        marginTop: '25px'
      }}>
        <h3 style={{ color: '#3498db', marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
          <span>🏥 Active Regional Relief Units — {currentCity.name} Sector</span>
          <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{localProviders.length} Units On Standby</span>
        </h3>
        
        {localProviders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left', marginTop: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#2c3e50', color: '#4da6ff' }}>
                  <th style={{ padding: '14px' }}>Organization / Hospital Name</th>
                  <th style={{ padding: '14px' }}>Service Type</th>
                  <th style={{ padding: '14px' }}>Current Status</th>
                  <th style={{ padding: '14px' }}>Available Units</th>
                </tr>
              </thead>
              <tbody>
                {localProviders.map((ngo, index) => (
                  <tr key={ngo.id} style={{ borderBottom: '1px solid #333', backgroundColor: index % 2 === 0 ? '#222' : 'transparent' }}>
                    <td style={{ padding: '14px', fontWeight: 'bold' }}>{ngo.name}</td>
                    <td style={{ padding: '14px', color: '#bbb' }}>{ngo.type}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ 
                        backgroundColor: ngo.status.includes('Active') || ngo.status.includes('Readiness') ? '#2ecc71' : '#e67e22', 
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: '#000', fontWeight: 'bold' 
                      }}>
                        {ngo.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px', color: '#4da6ff', fontWeight: 'bold' }}>{ngo.units} Units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: '#888', fontStyle: 'italic', backgroundColor: '#1e1e1e', borderRadius: '6px', marginTop: '12px' }}>
            No locally registered NGOs or Hospitals found in the {currentCity.name} sector. National emergency services will be dispatched automatically upon incident reports.
          </div>
        )}
      </div>

      {userRole === 'admin' && (
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          padding: '24px', 
          borderRadius: '10px', 
          boxShadow: '0 6px 16px rgba(0,0,0,0.4)', 
          borderTop: '4px solid #e74c3c',
          marginTop: '25px'
        }}>
          <h3 style={{ color: '#e74c3c', marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
            <span>🔐 Admin Control Panel — System Access Registry</span>
            <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{systemUsers.length} Registered Accounts</span>
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left', marginTop: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#2c3e50', color: '#e74c3c' }}>
                  <th style={{ padding: '14px' }}>User ID</th>
                  <th style={{ padding: '14px' }}>Name / Organization</th>
                  <th style={{ padding: '14px' }}>Email / Phone</th>
                  <th style={{ padding: '14px' }}>Role</th>
                  <th style={{ padding: '14px' }}>System Action</th>
                </tr>
              </thead>
              <tbody>
                {systemUsers.map((user, index) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #333', backgroundColor: index % 2 === 0 ? '#222' : 'transparent' }}>
                    <td style={{ padding: '14px', color: '#aaa' }}>{user.id}</td>
                    <td style={{ padding: '14px', fontWeight: 'bold' }}>{user.name}</td>
                    <td style={{ padding: '14px', color: '#bbb' }}>{user.email_or_phone}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ 
                        backgroundColor: user.role === 'admin' ? '#e74c3c' : user.role === 'relief' ? '#4da6ff' : '#2ecc71', 
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: user.role === 'admin' ? '#fff' : '#000', fontWeight: 'bold', textTransform: 'capitalize'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === "1"}
                        style={{ 
                          backgroundColor: user.id === "1" ? '#333' : '#c0392b', 
                          color: user.id === "1" ? '#777' : 'white', 
                          border: 'none', padding: '6px 12px', borderRadius: '4px', 
                          cursor: user.id === "1" ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                        }}
                      >
                        {user.id === "1" ? 'Protected' : 'Revoke Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default MapDashboard;