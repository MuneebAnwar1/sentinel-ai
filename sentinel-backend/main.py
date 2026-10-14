from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import xgboost as xgb
import pandas as pd

app = FastAPI(title="SENTINEL AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the AI Model
ai_model = xgb.XGBClassifier()
ai_model.load_model("ML_Model_Purely_Dynamic_Predictors.json")

# --- MODELS ---
# Update the RegisterRequest model to accept the city
class RegisterRequest(BaseModel):
    name: str
    email_or_phone: str
    password: str
    role: str 
    organization_name: Optional[str] = None 
    city: Optional[str] = None  # NEW: Capture the NGO's operating city

# Scroll down to your register endpoint and update the user dictionary:
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    new_id = str(len(db["users"]) + 1)
    initial_status = "PENDING" if req.role == "relief" else "APPROVED"
    user = {
        "id": new_id, 
        "name": req.name, 
        "email_or_phone": req.email_or_phone, 
        "password": req.password, 
        "role": req.role, 
        "organization_name": req.organization_name, 
        "city": req.city, # NEW: Save it to the database
        "status": initial_status
    }
    db["users"].append(user)
    if initial_status == "PENDING":
        return {"status": "PENDING", "message": "Registration submitted. An Administrator must verify and approve your NGO credentials before login."}
    return {"status": "APPROVED", "user_id": new_id, "role": user["role"], "name": user["name"], "token": f"token-{time.time()}"} 

class LoginRequest(BaseModel):
    email_or_phone: str
    password: str

class UserApprovalRequest(BaseModel):
    user_id: str
    status: str 

class SOSRequest(BaseModel):
    lat: float
    lng: float
    people_count: int = 1
    emergency_type: str = "General"

class SOSUpdate(BaseModel):
    status: str

class AIPredictRequest(BaseModel):
    lat: float
    lng: float

# Regional Provider & Incident Report Models
class ReliefProvider(BaseModel):
    id: int
    name: str
    type: str  # e.g., "Medical", "Rescue", "Relief", "Ambulance"
    status: str
    units: int
    city: str

class IncidentReport(BaseModel):
    lat: float
    lng: float
    emergency_type: str
    people_count: int
    city: str
    provider_id: Optional[int] = None
    target_provider_name: Optional[str] = "Auto-Route to Nearest"

# --- IN-MEMORY DATABASE ---
db = {
    "users": [
        {"id": "1", "name": "System Admin", "email_or_phone": "admin@sentinel.gov", "password": "admin", "role": "admin", "status": "APPROVED"},
        {"id": "2", "name": "Edhi Relief Foundation", "email_or_phone": "relief@edhi.org", "password": "relief", "role": "relief", "organization_name": "Edhi Foundation", "status": "APPROVED"}
    ],
    "disasters": [
        {"id": "hz-1", "type": "Severe Flooding", "lat": 26.7303, "lng": 67.7769, "radius": 25000, "severity": "CRITICAL", "color": "red"},
        {"id": "hz-2", "type": "Heavy Rainfall", "lat": 25.3960, "lng": 68.3578, "radius": 30000, "severity": "HIGH", "color": "blue"}
    ],
    "sos_requests": [],
    "incident_reports": [],
    "providers": [
        {"id": 1, "name": "Gojra THQ Hospital", "type": "Medical", "status": "Active", "units": 4, "city": "Gojra"},
        {"id": 2, "name": "Edhi Foundation (Gojra Branch)", "type": "Ambulance", "status": "Active", "units": 2, "city": "Gojra"},
        {"id": 3, "name": "Local Flood Rescue Team", "type": "Rescue", "status": "On Standby", "units": 1, "city": "Gojra"},
        
        # --- ADD DADU PROVIDERS HERE ---
        {"id": 13, "name": "Civil Hospital Dadu (DHQ)", "type": "Medical", "status": "Emergency Readiness", "units": 12, "city": "Dadu"},
        {"id": 14, "name": "Sindh Relief & Rescue Command (Dadu)", "type": "Rescue", "status": "High Alert", "units": 20, "city": "Dadu"},
        {"id": 15, "name": "Edhi Flood Evacuation Unit (Dadu)", "type": "Ambulance / Boat", "status": "Active", "units": 10, "city": "Dadu"},
        
        {"id": 4, "name": "Mayo Hospital Emergency", "type": "Medical", "status": "High Capacity", "units": 15, "city": "Lahore"},
        {"id": 5, "name": "Rescue 1122 HQ", "type": "Rescue", "status": "Active", "units": 20, "city": "Lahore"},
        {"id": 6, "name": "Al-Khidmat Foundation", "type": "Relief", "status": "Active", "units": 8, "city": "Lahore"},
        {"id": 7, "name": "Jinnah Post Graduate Medical", "type": "Medical", "status": "Active", "units": 25, "city": "Karachi"},
        {"id": 8, "name": "Chhipa Welfare", "type": "Ambulance", "status": "High Demand", "units": 30, "city": "Karachi"},
        {"id": 9, "name": "PIMS Hospital", "type": "Medical", "status": "Active", "units": 18, "city": "Islamabad"},
        {"id": 10, "name": "Red Crescent Society", "type": "Relief", "status": "Active", "units": 12, "city": "Islamabad"},
        {"id": 11, "name": "Lady Reading Hospital", "type": "Medical", "status": "Active", "units": 14, "city": "Peshawar"},
        {"id": 12, "name": "Nishtar Hospital Emergency", "type": "Medical", "status": "Active", "units": 16, "city": "Multan"}
    ],
    "shelters": [
        {"id": "SH-GOJ", "name": "Gojra High School Camp", "lat": 31.1550, "lng": 72.6900, "capacity": 500, "occupancy": 120},
        {"id": "SH-LAH", "name": "Lahore Expo Safe Zone", "lat": 31.5300, "lng": 74.3600, "capacity": 2500, "occupancy": 450},
        {"id": "SH-KHI", "name": "Karachi Stadium Shelter", "lat": 24.8700, "lng": 67.0100, "capacity": 5000, "occupancy": 1200},
        {"id": "SH-ISB", "name": "Islamabad Jinnah Camp", "lat": 33.6900, "lng": 73.0500, "capacity": 1500, "occupancy": 300},
        {"id": "SH-DAD", "name": "Dadu Rescue Center", "lat": 26.7450, "lng": 67.7850, "capacity": 1200, "occupancy": 1150},
        {"id": "SH-MUL", "name": "Multan Fort Shelter", "lat": 30.2050, "lng": 71.4750, "capacity": 800, "occupancy": 200},
        {"id": "SH-PES", "name": "Peshawar University Camp", "lat": 34.0250, "lng": 71.5350, "capacity": 1000, "occupancy": 400}
    ]
}

# --- ALIAS ROUTES ---
@app.get("/api/disasters/active")
@app.get("/api/disasters/live")
def get_disasters():
    return db["disasters"]

@app.get("/api/users/{user_id}")
def get_user_profile(user_id: str):
    for u in db["users"]:
        if u["id"] == user_id:
            return u
    return db["users"][0]

# --- REGIONAL RELIEF PROVIDERS & INCIDENT REPORTING ---
@app.get("/api/providers/{city}", response_model=List[ReliefProvider])
def get_local_providers(city: str):
    """Fetch active NGOs and Hospitals for a selected city."""
    return [p for p in db["providers"] if p["city"].lower() == city.lower()]

@app.post("/api/reports/create")
def submit_incident_report(report: IncidentReport):
    """Handle localized citizen reports targeted to specific NGOs or local hospitals."""
    report_entry = {
        "id": f"REP-{int(time.time())}",
        **report.dict(),
        "timestamp": time.strftime("%I:%M:%S %p")
    }
    db["incident_reports"].append(report_entry)
    return {
        "status": "SUCCESS",
        "message": f"Report routed to {report.target_provider_name} in {report.city}",
        "data": report_entry
    }

# --- AI PREDICTION ENDPOINT ---
@app.post("/api/ai/predict")
def run_ai_prediction(req: AIPredictRequest):
    try:
        # Dynamic regional feature simulation
        if req.lat < 29.0:
            demo_features = {
                "latitude": [req.lat], "longitude": [req.lng],
                "precipitation_sum": [150.5], "rain_sum": [140.2],
                "wind_speed_10m_max": [25.5], "temperature_2m_max": [31.0],
                "temperature_2m_min": [24.0], "apparent_temperature_mean": [29.5],
                "precipitation_hours": [18.0], "rain_1d (mm)": [85.0],
                "rain_3d (mm)": [150.0], "rain_7d (mm)": [210.0],
                "rain_days_7d": [5.0], "max_temp": [31.0], "min_temp": [24.0],
                "wind_max": [25.5], "precip_hours": [18.0]
            }
        else:
            demo_features = {
                "latitude": [req.lat], "longitude": [req.lng],
                "precipitation_sum": [0.0], "rain_sum": [0.0],
                "wind_speed_10m_max": [5.5], "temperature_2m_max": [35.0],
                "temperature_2m_min": [22.0], "apparent_temperature_mean": [34.5],
                "precipitation_hours": [0.0], "rain_1d (mm)": [0.0],
                "rain_3d (mm)": [0.0], "rain_7d (mm)": [2.0],
                "rain_days_7d": [1.0], "max_temp": [35.0], "min_temp": [22.0],
                "wind_max": [5.5], "precip_hours": [0.0]
            }
        
        df = pd.DataFrame(demo_features)
        probabilities = ai_model.predict_proba(df)
        risk_score = float(probabilities[0][1])
        risk_percentage = risk_score * 100 
        
        if risk_score < 0.3:
            zone, color, action, status = "Safe Zone", "#00FF00", "No immediate flood threat. Stay tuned to local alerts.", "SAFE"
        elif risk_score <= 0.7:
            zone, color, action, status = "Risk Zone", "#FFA500", "Monitor water levels closely. Prepare an emergency bag.", "WARNING"
        else:
            zone, color, action, status = "Danger Zone", "purple", "High flood probability! Evacuate immediately via designated safe routes.", "THREAT_DETECTED"
            
            new_disaster = {
                "id": f"hz-ai-{int(time.time())}",
                "type": f"AI PREDICTED: {zone} ({risk_percentage:.1f}%)",
                "lat": req.lat,
                "lng": req.lng,
                "radius": 35000,
                "severity": "CRITICAL",
                "color": "purple"
            }
            db["disasters"].append(new_disaster)
            return {"status": status, "risk_percentage": risk_percentage, "zone": zone, "action": action, "disaster": new_disaster}
        
        return {"status": status, "risk_percentage": risk_percentage, "zone": zone, "action": action}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- REGISTRATION & APPROVAL WORKFLOW ---
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    new_id = str(len(db["users"]) + 1)
    initial_status = "PENDING" if req.role == "relief" else "APPROVED"
    user = {
        "id": new_id, 
        "name": req.name, 
        "email_or_phone": req.email_or_phone, 
        "password": req.password, 
        "role": req.role, 
        "organization_name": req.organization_name, 
        "city": getattr(req, 'city', 'Gojra'), 
        "status": initial_status
    }
    db["users"].append(user)
    if initial_status == "PENDING":
        return {"status": "PENDING", "message": "Registration submitted. An Administrator must verify and approve your NGO credentials before login."}
    
    # Return full user payload
    return {"status": "APPROVED", "user_id": new_id, "role": user["role"], "name": user["name"], "organization_name": user.get("organization_name", user["name"]), "city": user["city"], "token": f"token-{time.time()}"}

@app.post("/api/auth/login")
def login(req: LoginRequest):
    for u in db["users"]:
        if u["email_or_phone"] == req.email_or_phone and u["password"] == req.password:
            if u["role"] == "relief" and u["status"] != "APPROVED":
                raise HTTPException(status_code=403, detail="Account pending verification. Relief organizations must be approved by an Admin.")
            
            # Return full user payload including city
            return {"token": f"token-{time.time()}", "user_id": u["id"], "role": u["role"], "name": u["name"], "organization_name": u.get("organization_name", u["name"]), "city": u.get("city", "Gojra")}
            
    raise HTTPException(status_code=401, detail="Invalid credentials.")

@app.post("/api/auth/login")
def login(req: LoginRequest):
    for u in db["users"]:
        if u["email_or_phone"] == req.email_or_phone and u["password"] == req.password:
            if u["role"] == "relief" and u["status"] != "APPROVED":
                raise HTTPException(status_code=403, detail="Account pending verification. Relief organizations must be approved by an Admin.")
            return {"token": f"token-{time.time()}", "user_id": u["id"], "role": u["role"], "name": u["name"]}
    raise HTTPException(status_code=401, detail="Invalid credentials.")

@app.get("/api/admin/pending-ngos")
def get_pending_ngos():
    return [u for u in db["users"] if u["role"] == "relief" and u["status"] == "PENDING"]

@app.post("/api/admin/approve-user")
def approve_user(req: UserApprovalRequest):
    for u in db["users"]:
        if u["id"] == req.user_id:
            u["status"] = req.status
            return {"message": f"User {u['name']} status updated to {req.status}."}
    raise HTTPException(status_code=404, detail="User not found.")

# --- SOS ENDPOINTS ---
@app.post("/api/sos/create")
def create_sos(request: SOSRequest):
    new_sos = {
        "id": f"SOS-{str(int(time.time()))[-4:]}", 
        "lat": request.lat, 
        "lng": request.lng, 
        "people_count": request.people_count, 
        "emergency_type": request.emergency_type, 
        "status": "Pending", 
        "timestamp": time.strftime("%I:%M:%S %p")
    }
    db["sos_requests"].append(new_sos)
    return {"message": "SOS Broadcasted", "data": new_sos}

@app.get("/api/sos/active")
def get_active_sos():
    return [sos for sos in db["sos_requests"] if sos["status"] != "Resolved"]

@app.patch("/api/sos/{sos_id}/status")
def update_sos_status(sos_id: str, request: SOSUpdate):
    for sos in db["sos_requests"]:
        if sos["id"] == sos_id:
            sos["status"] = request.status
            return {"message": "Status updated", "data": sos}
    raise HTTPException(status_code=404, detail="SOS request not found")

@app.get("/api/shelters")
def get_shelters():
    return db["shelters"]

# --- ADMIN USER MANAGEMENT ENDPOINTS ---
@app.get("/api/admin/users")
def get_all_users():
    """Fetch all registered citizens, NGOs, and admins."""
    return db["users"]

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: str):
    """Delete a user from the system."""
    # Prevent deleting the main system admin so you don't lock yourself out
    if user_id == "1":
        raise HTTPException(status_code=403, detail="Cannot delete the primary System Admin.")
    
    original_count = len(db["users"])
    db["users"] = [u for u in db["users"] if u["id"] != user_id]
    
    if len(db["users"]) < original_count:
        return {"status": "SUCCESS", "message": f"User {user_id} deleted."}
    
    raise HTTPException(status_code=404, detail="User not found.")