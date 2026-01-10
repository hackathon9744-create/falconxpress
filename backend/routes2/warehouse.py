from fastapi import APIRouter
from store import warehouses

router = APIRouter(prefix="/warehouse",tags=["Warehouse"])

@router.get("/status")
def status():
    return warehouses
