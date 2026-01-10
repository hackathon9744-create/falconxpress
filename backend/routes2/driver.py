from fastapi import APIRouter

router = APIRouter(prefix="/driver", tags=["Driver"])

@router.post("/start-trip")
def start_trip(order_id: str):
    return {"message": f"Trip started for order {order_id}"}

@router.post("/report-issue")
def report_issue(order_id: str, issue: str):
    return {
        "order_id": order_id,
        "issue": issue,
        "status": "Reported"
    }

@router.post("/end-trip")
def end_trip(order_id: str):
    return {"message": f"Trip ended for order {order_id}"}
