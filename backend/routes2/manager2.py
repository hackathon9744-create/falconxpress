from fastapi import APIRouter
from services1.eta_service import predict_eta

router = APIRouter(prefix="/eta", tags=["ETA"])

@router.post("/predict")
def eta_predict(payload: dict):
    return predict_eta(payload)