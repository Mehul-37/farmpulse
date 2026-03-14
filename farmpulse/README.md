# 🌾 FarmPulse AI

**An AI-Powered Crop Stress Early Warning System for Smallholder Farmers in India.**

![FarmPulse Dashboard](https://images.unsplash.com/photo-1592982537447-669de6b92a5b?auto=format&fit=crop&q=80&w=1200)

## 📌 Overview

**FarmPulse AI** is a highly polished, production-ready frontend prototype designed to tackle one of the most critical issues in developing agricultural regions: late detection of crop stress. 

By simulating the integration of hyper-local satellite multispectral data (NDVI), climate metrics, and WhatsApp-driven field reports, FarmPulse AI provides agricultural extension workers, micro-insurance divisions, and government bodies with an intuitive "Linear/Vercel-style" dashboard to preemptively intervene before crop failure occurs.

### 🌟 Key Features

- **📊 Comprehensive Executive Dashboard**: High-level KPIs tracking farm health, alert volumes, and stress distributions.
- **🗺️ Interactive Risk Mapping (`react-leaflet`)**: Visualized heatmaps and localized stress markers across targeted districts (Punjab, Haryana, UP).
- **📈 ML Risk Profiling**: Transparent breakdown of how individual farm risk scores are calculated by simulating weighting of NDVI, rainfall anomalies, and land surface temperature.
- **⚠️ Automated Advisory Simulator**: A modeled deployment timelines of proactive agricultural SMS/WhatsApp advisories.
- **📱 Low-Friction Farmer Onboarding**: A WhatsApp chat interface simulator illustrating how zero-tech-literacy farmers can register their fields instantly.
- **📄 Institutional Reporting**: One-click generation of PDF-ready regional reports targeting Sustainable Development Goal (SDG) impact metrics.

---

## 🛠️ Technology Stack

FarmPulse AI focuses on a premium, responsive, and seamless user experience.

- **Frontend Core**: React 18, TypeScript, Vite
- **Styling UI**: Tailwind CSS v4, Lucide React Icons
- **Data Visualization**: Recharts (Trends, Distributions, Breakdowns)
- **Geospatial Mapping**: React Leaflet & CARTO Dark Matter Tiles
- **Date Utilities**: Date-fns
- **Typography/Fonts**: Inter (Google Fonts)

---

## 🚀 Getting Started

To run FarmPulse AI locally, clone the repository and execute the following commands:

```bash
# 1. Clone the repository and navigate into the project directory
cd farmpulse

# 2. Install modern dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Navigate to `http://localhost:5173` in your browser to explore the dashboard.

---

## 🎨 Design System

We prioritized a **"Dark Mode By Default"** aesthetic to reduce eye strain for analysts monitoring screens for extended periods.

- **Background**: Deep Onyx (`#0A0A0A`)
- **Surface Panels**: Elevational Greys (`#111111` to `#1A1A1A`)
- **Action Accents**: Emerald Green for Healthy states, Amber for Warnings, and Crimson Red for Critical Risks.
- **Typography**: Inter (Geometric, clean readability)
- **Border Radii**: Softened 12px cards combined with subtle 1px structural borders, avoiding heavy drop shadows.

---

## 🤝 Simulation Data

*Note: As this application is a frontend architecture prototype, no backend database or live satellite API is required to run it.* 

Instead, it relies on a sophisticated `mockData.ts` mathematical generator that produces realistic, statistically distributed datasets (randomizing coordinate jitter inside Indian bounding boxes, correlating moisture metrics with water-stress alerts, etc.) to evaluate UI states under heavy data loads. 
