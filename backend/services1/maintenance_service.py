import joblib
import pandas as pd

maintenance_model = joblib.load("models1/balanced_random_forest_maintenance_model.joblib")

def maintenance_risk(vehicle_data: dict):
    df = pd.DataFrame([vehicle_data])
    prob = maintenance_model.predict_proba(df)[0][1]

    if prob > 0.7:
        label = "HIGH"
    elif prob > 0.4:
        label = "MEDIUM"
    else:
        label = "LOW"

    return {
        "risk_probability": round(float(prob), 2),
        "risk_label": label
    }
