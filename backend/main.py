from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

from services.database import save_profile, get_profile
from services.risk_model import calculate_risk_score
from services.satellite import get_ndvi, get_ndwi, init_gee
from services.vision import analyze_crop_photo

app = FastAPI(
    title="FarmPulse API",
    description="Backend for FarmPulse providing satellite imagery and ML inference.",
    version="1.0.0"
)

# Initialize GEE on startup (non-fatal if credentials are missing)
try:
    init_gee()
except Exception as e:
    print(f"GEE init skipped: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FarmProfile(BaseModel):
    id: str
    data: Dict[str, Any]

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "FarmPulse Backend"}

@app.post("/onboard")
def onboard_farm(profile: FarmProfile):
    save_profile(profile.id, profile.data)
    return {"status": "success", "message": "Profile saved."}

@app.post("/predict")
def predict_risk(profile: FarmProfile):
    score_data = calculate_risk_score(profile.data)
    return {"status": "success", "risk_evaluation": score_data}

@app.post("/analyze-photo")
async def analyze_photo(file: UploadFile = File(...)):
    contents = await file.read()
    result = analyze_crop_photo(contents)
    return result

@app.get("/satellite/{lat}/{lng}")
def fetch_satellite_data(lat: float, lng: float):
    # In a real scenario we'd pass dates
    ndvi_val = get_ndvi(lat, lng, "2024-01-01", "2024-01-31")
    ndwi_val = get_ndwi(lat, lng)
    return {"ndvi": ndvi_val, "ndwi": ndwi_val}

@app.get("/farm/{id}")
def get_farm_details(id: str):
    profile = get_profile(id)
    if not profile:
        raise HTTPException(status_code=404, detail="Farm profile not found")
    return profile

