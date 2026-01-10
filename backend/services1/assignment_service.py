from services1.eta_service import predict_eta
from services1.maintenance_service import maintenance_risk

def assign_vehicle(shipment, vehicles):
    best_vehicle = None
    best_score = float("inf")

    for v_id, vehicle in vehicles.items():
        risk = maintenance_risk(vehicle)
        if risk["risk_label"] == "HIGH":
            continue

        eta = predict_eta({**shipment, **vehicle})
        score = eta + (risk["risk_probability"] * 100)

        if score < best_score:
            best_score = score
            best_vehicle = v_id

    return best_vehicle
