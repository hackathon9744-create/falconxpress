import joblib
import pandas as pd

demand_model = joblib.load("models1/demand_forecast_model.pkl")

def forecast_demand(features: dict):
    df = pd.DataFrame([features])
    demand = demand_model.predict(df)[0]
    return round(float(demand), 2)
