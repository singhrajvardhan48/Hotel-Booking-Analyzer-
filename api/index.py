"""
Hotel Booking Analyzer - FastAPI Serverless Endpoint
Compatible with Vercel Python Runtime and standalone Uvicorn execution.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json
import os

app = FastAPI(
    title="Hotel Booking Analyzer ML API",
    description="Machine Learning API for Hotel Cancellation Risk Prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load metadata and compact model if available
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data")
METADATA_PATH = os.path.join(DATA_DIR, "models_metadata.json")
ANALYTICS_PATH = os.path.join(DATA_DIR, "analytics_data.json")
FOREST_PATH = os.path.join(DATA_DIR, "forest_model.json")

class BookingPayload(BaseModel):
    lead_time: int = 45
    stays_in_weekend_nights: int = 1
    stays_in_week_nights: int = 3
    adults: int = 2
    children: float = 0
    babies: int = 0
    previous_cancellations: int = 0
    previous_bookings_not_canceled: int = 0
    booking_changes: int = 0
    days_in_waiting_list: int = 0
    adr: float = 115.0
    required_car_parking_spaces: int = 0
    total_of_special_requests: int = 1
    hotel: str = "City Hotel"
    arrival_date_month: str = "July"
    meal: str = "BB"
    country: str = "PRT"
    market_segment: str = "Online TA"
    distribution_channel: str = "TA/TO"
    is_repeated_guest: str = "0"
    reserved_room_type: str = "A"
    deposit_type: str = "No Deposit"
    customer_type: str = "Transient"

@app.get("/api/python/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Hotel Booking Analyzer Python ML Backend",
        "version": "1.0.0"
    }

@app.get("/api/python/metadata")
def get_metadata():
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"message": "Metadata file not found"}

@app.get("/api/python/analytics")
def get_analytics():
    if os.path.exists(ANALYTICS_PATH):
        with open(ANALYTICS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"message": "Analytics file not found"}

@app.post("/api/python/predict")
def predict_risk(payload: BookingPayload):
    if not os.path.exists(FOREST_PATH):
        raise HTTPException(status_code=500, detail="Model file not found")

    with open(FOREST_PATH, "r", encoding="utf-8") as f:
        model = json.load(f)

    # Encode features
    features = []
    p_dict = payload.dict()
    for num_col in model["num_features"]:
        features.append(float(p_dict.get(num_col, 0)))

    for i, cat_col in enumerate(model["cat_features"]):
        val = str(p_dict.get(cat_col, ""))
        for cat in model["categories"][i]:
            features.append(1.0 if val == str(cat) else 0.0)

    # Traverse trees
    tree_probs = []
    for tree in model["trees"]:
        node = 0
        while tree["left"][node] != -1:
            feat_idx = tree["feature"][node]
            threshold = tree["threshold"][node]
            if features[feat_idx] <= threshold:
                node = tree["left"][node]
            else:
                node = tree["right"][node]
        tree_probs.append(tree["prob"][node])

    raw_prob = sum(tree_probs) / len(tree_probs)
    cancel_prob = round(max(0.5, min(99.5, raw_prob * 100)), 1)
    confirm_prob = round(100.0 - cancel_prob, 1)
    is_canceled = 1 if cancel_prob >= 50.0 else 0

    return {
        "prediction": is_canceled,
        "risk_level": "HIGH RISK" if is_canceled == 1 else "LOW RISK",
        "cancellation_probability": cancel_prob,
        "confirmation_probability": confirm_prob,
        "confidence_score": cancel_prob if is_canceled == 1 else confirm_prob,
        "total_nights": payload.stays_in_weekend_nights + payload.stays_in_week_nights,
        "estimated_revenue": round(payload.adr * (payload.stays_in_weekend_nights + payload.stays_in_week_nights), 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

