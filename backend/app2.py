from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes2 import manager2, warehouse, driver, customer

app = FastAPI(title="LogiSync Backend")

# ✅ ADD THIS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(manager2.router, prefix="/manager")
app.include_router(warehouse.router, prefix="/warehouse")
app.include_router(driver.router, prefix="/driver")
app.include_router(customer.router, prefix="/customer")

@app.get("/")
def root():
    return {"status": "LogiSync backend running"}
