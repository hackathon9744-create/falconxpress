import joblib
import numpy as np

model = joblib.load("models1/eta_model.joblib")

def predict_eta(data: dict):
    X = np.array([[
        data["distance_km"],
        data["route_type"],
        data["day_of_week"],
        data["vehicle_type"],
        data["driver_experience_yrs"],
        data["vehicle_age_yrs"],
        data["warehouse_delay_min"],
        data["traffic_level"],
        data["weather_severity"],
        data["cargo_weight_t"],
        data["hour_sin"],
        data["hour_cos"],
        data["is_peak"]
    ]])

    eta = model.predict(X)[0]

    return {
        "eta_minutes": round(float(eta), 2),
        "confidence": max(60, min(95, 95 - data["traffic_level"] * 20))
    }