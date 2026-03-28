# FarmPulse 🌾

Welcome to **FarmPulse**, an advanced Data-Driven Agricultural Monitoring & Risk Assessment Platform!

This platform is engineered to empower farmers, insurance bodies (like PMFBY), and government extension officers with real-time, actionable insights to mitigate climate, pest, and water risks.

By combining modern frontend architectures with cloud-based geostatistical services and Machine Learning workflows, FarmPulse delivers precise risk evaluations and crop health analytics at scale.

---

## 🚀 Core Features & Capabilities

### 1. Geospatial & Satellite Analytics
- **Google Earth Engine Integration**: Dynamically pulls raw multi-spectral data to compute **NDVI (Normalized Difference Vegetation Index)** on the fly.
- **Interactive Farm Mapping**: Geofence tracking and localized historical insights based on exact polygon and coordinate boundaries (`FarmMap.tsx`).

### 2. Deep Learning Crop Vision
- **On-Demand Disease Analysis**: Incorporates PyTorch and HuggingFace Transformers for analyzing leaf/crop photos.
- Detects nutrient deficiencies and pest infestations, instantly recommending immediate mitigations.

### 3. Institutional Reporting Dashboard
- **Regional Risk Heatmaps**: Aggregates individual farm risks into village and district-level insights (e.g., Meerut, Ludhiana).
- **Week-over-Week Tracking**: Helps extension officers monitor dynamic stress changes across massive agricultural belts.
- **Actionable AI Prescriptions**: Suggests high-priority interventions, such as "Deploy extension officer" or "Schedule Canal Release" based on live stress-types (e.g., Water Stress).

### 4. SDG Impact Tracking (Sustainable Development Goals)
- Track metrics contributing directly to global goals via quantifiable UI indicators.
- **SDG 2 (Zero Hunger)**: Focuses on crop loss reduction.
- **SDG 6 (Clean Water)** & **SDG 12 (Responsible Consumption)**: Optimizing fertilizer usage and water release scheduling.

---

## 📂 Project Architecture

The core monorepo setup within the `farmpulse/` directory:

- **Frontend (`farmpulse/src/`)**
  - Built with **React** + **Vite** + **TypeScript** + **TailwindCSS**.
  - **`InstitutionalReport.tsx`**: High-level administrative views & PDF export workflows.
  - **`RiskCalculator.tsx`**: Dynamic risk profiling simulation tool.
  
- **Backend (`farmpulse/backend/`)**
  - Powered by **FastAPI** (`main.py`) for highly concurrent, asynchronous data fetching.
  - **`services/satellite.py`**: Manages the GEE API hooks for NDVI data.
  - **`services/vision.py`**: Interacts with the local PyTorch pipelines for structural analysis.
  - **`services/risk_model.py`**: Consolidates weather, soil, and satellite parameters to output a composite final "Risk Score".

---

## 🛠️ Setup & Installation

### Option 1: Using the automated scripts

1. **Start the Frontend Application:**
   ```bash
   cd farmpulse
   npm install
   npm run dev
   ```
2. **Start the Backend Intelligence Engine:**
   *(Ensure you have Python 3.9+ installed and optionally set up a virtual environment)*
   ```bash
   cd farmpulse/backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
   *Note: Due to large ML libraries (`torch`, `transformers`, etc.), the installation may take a few moments.*

---
*Built with ❤️ for Agricultural Innovation and Food Security.*
