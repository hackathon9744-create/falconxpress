from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os

# --------------------------------------------------
# Base directory
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --------------------------------------------------
# FastAPI app
# --------------------------------------------------
app = FastAPI(title="LogiSync Carbon AI API")

# --------------------------------------------------
# CORS (Frontend-safe)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # lock later in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Load model
# --------------------------------------------------
MODEL_PATH = os.path.join(BASE_DIR, "co2_xgboost_pipeline.joblib")
model = joblib.load(MODEL_PATH)

# --------------------------------------------------
# Load historical data (optional but useful)
# --------------------------------------------------
DATA_PATH = os.path.join(BASE_DIR, "carbon_data.csv")
df = pd.read_csv(DATA_PATH)

if "co2_kg" not in df.columns:
    raise ValueError("❌ carbon_data.csv must contain 'co2_kg' column")

# --------------------------------------------------
# Request Schema (MATCHES DATASET)
# --------------------------------------------------
class CarbonPredictionRequest(BaseModel):
    distance_km: float
    avg_speed_kmh: float
    vehicle_type: str
    fuel_type: str
    load_ratio: float
    num_stops: int
    idle_time_min: float

# --------------------------------------------------
# Business logic
# --------------------------------------------------
def assess_risk(co2_kg: float):
    if co2_kg < 50:
        return "GREEN"
    elif co2_kg < 200:
        return "YELLOW"
    return "RED"

# --------------------------------------------------
# API Endpoint
# --------------------------------------------------
@app.post("/predict-co2")
def predict_carbon(payload: CarbonPredictionRequest):
    X = pd.DataFrame([{
        "distance_km": payload.distance_km,
        "avg_speed_kmh": payload.avg_speed_kmh,
        "vehicle_type": payload.vehicle_type,
        "fuel_type": payload.fuel_type,
        "load_ratio": payload.load_ratio,
        "num_stops": payload.num_stops,
        "idle_time_min": payload.idle_time_min
    }])

    predicted_co2 = float(model.predict(X)[0])
    risk = assess_risk(predicted_co2)

    return {
        "predicted_co2_kg": round(predicted_co2, 2),
        "risk_level": risk
    }

# --------------------------------------------------
# Health check
# --------------------------------------------------
@app.get("/")
def health():
    return {"status": "Carbon AI running"}