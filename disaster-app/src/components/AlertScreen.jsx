
import alertsData from '../mockData/alertsData.json';
import './AlertScreen.css';

const AlertScreen = () => {
  return (
    <div className="alert-container">
      <h2 className="alert-header">Active AI Predictions & Alerts</h2>
      
      <div className="alert-grid">
        {alertsData.map((alert) => (
          <div 
            key={alert.id} 
            className={`alert-card ${alert.severity.toLowerCase()}`}
          >
            <div className="alert-top-row">
              <span className="alert-id">{alert.id}</span>
              <span className="alert-time">{alert.time}</span>
            </div>
            <h3 className="alert-type">{alert.type}</h3>
            <p className="alert-location">📍 {alert.location}</p>
            
            <div className="alert-bottom-row">
              <span className="alert-severity">{alert.severity}</span>
              <span className="alert-confidence">AI Confidence: {alert.ai_confidence}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertScreen;