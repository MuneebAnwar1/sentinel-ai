# Sentinel AI — Intelligent Disaster Early-Warning & Crisis Management Platform

Sentinel AI is a full-stack disaster management system engineered to predict localized flood risks and coordinate real-time emergency response. By integrating machine learning with live meteorological telemetry, the platform automates hazard zone identification and connects citizens, verified relief NGOs, and administrators through a unified geospatial interface.

---

## Key Features

- **Predictive Flood Analytics:** Uses an XGBoost regression model trained on 17 climate variables (via Open-Meteo API) to generate localized flood risk probabilities.
- **Geospatial Proximity Warnings:** Calculates client-to-hazard proximity in real time using the Haversine formula to issue targeted visual evacuation warnings.
- **One-Click Citizen SOS:** Allows citizens to bypass authentication and broadcast GPS-tagged SOS requests directly to active responders.
- **Role-Based Access Control (RBAC):** Dedicated operational dashboards for Citizens, Verified NGOs, and System Administrators.
- **Crisis Coordination Hub:** Administrative oversight for manual/automated hazard zone scans and relief organization verification workflows.

---

## Tech Stack & Architecture

| Layer | Technology | Primary Role |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Leaflet.js | Dynamic UI, state management, and geospatial mapping |
| **Backend** | Python, FastAPI, Uvicorn | REST APIs, authentication, and in-memory session dispatch |
| **Machine Learning** | XGBoost, Open-Meteo API | Meteorological data ingestion & flood probability scoring |

---

## System Architecture

```text
[ Open-Meteo Telemetry API ]
             │
             ▼
[ FastAPI Backend ] ◄──► [ XGBoost ML Pipeline ]
        │
   REST Endpoints
        │
        ▼
[ React + Vite Client ] ──► [ Leaflet Geospatial Map ] ──► [ Haversine Proximity Engine ]
```
Getting Started
Prerequisites
Node.js: v18+ and npm

Python: v3.10+ and pip

Installation & Local Run Guide
1. Backend Setup (sentinel-backend)
Open a terminal window and execute:
```
cd sentinel-backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload
```
Backend API will run at: http://127.0.0.1:8000

Interactive API Documentation (Swagger): http://127.0.0.1:8000/docs

2. Frontend Setup (disaster-app)
Open a separate terminal window and execute:
```
cd disaster-app
npm install
npm run dev
```
Client application will run at: http://localhost:5173
