from fastapi import APIRouter
from store import shipments

router = APIRouter(prefix="/customer", tags=["Customer"])

@router.get("/track/{order_id}")
def track(order_id: str):
    return shipments.get(order_id, {"error": "Order not found"})
