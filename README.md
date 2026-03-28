# FarmPulse 🌾

Welcome to **FarmPulse**, a platform designed for agricultural monitoring and risk assessment!

This project is built using modern tech stacks including **Vite + React + TailwindCSS** for the frontend, and **FastAPI** coupled with modern ML/Data pipelines (PyTorch, Transformers, Google Earth Engine API) for the backend.

## 🚀 Project Structure

The main codebase resides within the `farmpulse/` directory.

- **`farmpulse/src/`** - Contains the React frontend logic and UI components.
  - Features high-quality dashboards, mapping interfaces (`FarmMap.tsx`), and risk analysis tools (`RiskCalculator.tsx`).
- **`farmpulse/backend/`** - Contains the Python backend logic.
  - Powered by **FastAPI** (`main.py`)
  - Integrates with Google Earth Engine for satellite/NDVI data (`services/satellite.py`)
  - Uses machine learning pipelines to analyze agricultural risk profiles (`services/risk_model.py`)

## 🛠️ Setup & Installation

### Option 1: Using the automated scripts

1. Use standard npm commands to start the React frontend:
   ```bash
   cd farmpulse
   npm install
   npm run dev
   ```
2. For the Python backend:
   ```bash
   cd farmpulse/backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

## 🌍 Features
- **Satellite Integration:** Retrieves NDVI values based on latitude/longitude using Google Earth Engine.
- **Dynamic Risk Modeling:** Computes risk profiles using advanced agricultural parameters.
- **Farm Profiling:** Map views for inspecting different farms and agricultural profiles.

---
*Built with ❤️ for Agricultural Innovation.*
