import React, { useState, useEffect } from 'react';

const DataSheetSummary = ({ userRole, sosRequests, setSosRequests }) => {
  const [pendingNGOs, setPendingNGOs] = useState([]);

  // Fetch pending NGOs if the user is an Admin
  useEffect(() => {
    if (userRole === 'admin') {
      fetch('http://127.0.0.1:8000/api/admin/pending-ngos')
        .then(res => res.json())
        .then(data => setPendingNGOs(data))
        .catch(err => console.error("Error fetching NGOs:", err));
    }
  }, [userRole]);

  // Admin action to approve NGOs
  const approveNGO = async (userId) => {
    try {
      await fetch('http://127.0.0.1:8000/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, status: "APPROVED" })
      });
      // Remove the approved NGO from the list
      setPendingNGOs(pendingNGOs.filter(ngo => ngo.id !== userId));
      alert("Relief NGO Approved! They can now log into the system.");
    } catch (error) {
      console.error("Error approving NGO:", error);
    }
  };

  // --- CITIZEN VIEW ---
  if (userRole === 'citizen') {
    return (
      <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ color: '#e74c3c' }}>🔒 Access Denied</h2>
        <p>Citizens do not have clearance to view classified NDMA rescue data.</p>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (userRole === 'admin') {
    return (
      <div style={{ padding: '30px', color: '#fff' }}>
        <h2 style={{ color: '#9b59b6' }}>📊 NDMA System Overview</h2>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <div style={{ padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '8px', flex: 1, border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#aaa' }}>Total Active Emergencies</h3>
            <p style={{ fontSize: '2.5rem', color: '#e74c3c', fontWeight: 'bold', margin: 0 }}>{sosRequests.length}</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '8px', flex: 1, border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#aaa' }}>System Status</h3>
            <p style={{ fontSize: '2.5rem', color: '#2ecc71', fontWeight: 'bold', margin: 0 }}>ONLINE</p>
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>Pending NGO Approvals</h3>
        {pendingNGOs.length === 0 ? (
          <p style={{ color: '#aaa' }}>No pending applications at this time.</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', backgroundColor: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#333', color: '#fff' }}>
                <th style={{ padding: '15px' }}>Organization Name</th>
                <th style={{ padding: '15px' }}>Contact Email</th>
                <th style={{ padding: '15px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingNGOs.map(ngo => (
                <tr key={ngo.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '15px' }}>{ngo.name}</td>
                  <td style={{ padding: '15px' }}>{ngo.email_or_phone}</td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      onClick={() => approveNGO(ngo.id)} 
                      style={{ backgroundColor: '#2ecc71', color: 'white', padding: '8px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Verify & Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // --- NGO VIEW ---
  return (
    <div style={{ padding: '30px', color: '#fff' }}>
      <h2 style={{ color: '#3498db' }}>🚑 Active Rescue Operations Dispatch</h2>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>Detailed coordinates and status of citizen SOS broadcasts.</p>
      
      {sosRequests.length === 0 ? (
        <p>No active SOS requests.</p>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', backgroundColor: '#1e1e1e' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', color: '#fff' }}>
              <th style={{ padding: '15px' }}>SOS ID</th>
              <th style={{ padding: '15px' }}>GPS Coordinates (Lat, Lng)</th>
              <th style={{ padding: '15px' }}>Live Status</th>
            </tr>
          </thead>
          <tbody>
            {sosRequests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '15px' }}>{req.id}</td>
                <td style={{ padding: '15px', fontFamily: 'monospace', color: '#4da6ff' }}>{req.lat.toFixed(4)}, {req.lng.toFixed(4)}</td>
                <td style={{ padding: '15px', color: req.status === 'Pending' ? '#e74c3c' : '#f1c40f', fontWeight: 'bold' }}>
                  {req.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DataSheetSummary;