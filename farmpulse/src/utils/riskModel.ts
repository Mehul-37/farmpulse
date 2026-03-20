// FarmPulse AI — Risk Scoring Engine (PRO v2.0)
// Implements 17-parameter weighted scoring with:
//   - ICAR Heat Stress Model
//   - CRIDA Weather-Based Pest Risk Model
//   - NDWI Water Stress Signal

export const DISTRICT_COORDS: Record<string, { lat: number, lng: number }> = {
    'Karnal': { lat: 29.6857, lng: 76.9905 },
    'Ludhiana': { lat: 30.9010, lng: 75.8573 },
    'Ambala': { lat: 30.3782, lng: 76.7767 },
    'Kurukshetra': { lat: 29.9695, lng: 76.8783 },
    'Panipat': { lat: 29.3909, lng: 76.9635 },
    'Sonipat': { lat: 28.9931, lng: 77.0151 },
    'Rohtak': { lat: 28.8955, lng: 76.5892 },
    'Hisar': { lat: 29.1492, lng: 75.7217 },
    'Sirsa': { lat: 29.5321, lng: 75.0180 },
    'Jind': { lat: 29.3167, lng: 76.3167 },
    'Patiala': { lat: 30.3398, lng: 76.3869 },
    'Bathinda': { lat: 30.2110, lng: 74.9455 },
    'Jalandhar': { lat: 31.3260, lng: 75.5762 },
    'Amritsar': { lat: 31.6340, lng: 74.8723 },
    'Faridkot': { lat: 30.6769, lng: 74.7271 },
    'Hoshiarpur': { lat: 31.5271, lng: 75.9080 }
    // More can be added here, fallback handles the rest
};

export async function getDistrictCoords(district: string): Promise<{lat: number, lng: number}> {
    // 1. Check hardcoded map first (lightning fast, no API limits)
    if (DISTRICT_COORDS[district]) {
        return DISTRICT_COORDS[district];
    }
    
    // 2. Fallback to OpenStreetMap Nominatim API (Free, no key required)
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(district + ', India')}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            // Optionally cache it locally to avoid repeated calls
            DISTRICT_COORDS[district] = coords;
            return coords;
        }
    } catch (error) {
        console.error("Geocoding API failed", error);
    }
    
    // 3. Ultimate Fallback (Karnal coords if everything fails)
    return DISTRICT_COORDS['Karnal'];
}

export interface FarmData {
  // ── SATELLITE (3) ──
  ndviBaseline: number;
  ndviCurrent: number;
  ndwiCurrent: number;        // -1 to 1 (NDWI water index from GEE)
  
  // ── WEATHER (5) ──
  rainfallExpected: number;
  rainfallActual: number;
  tempCurrent: number;
  tempBaseline: number;
  humidity: number;
  
  // ── SOIL & HISTORICAL (4) ──
  soilMoisture: number;         // 0-100%
  soilPH: number;               // 0-14
  historicalYieldAvg: number;   // kg/acre
  soilOrganicCarbon: number;    // 0-5% (Target: >1.5%)

  // ── OPERATIONS (4) ──
  cropType: string;
  growthStage: string;
  irrigationFrequency: number;
  cropRotation: boolean;
  
  // ── OBSERVATIONAL (1) ──
  symptom: string;
}

// ──────────────────────────────────────────────────
// ICAR Heat Stress Model
// Uses crop-specific temperature thresholds from ICAR research.
// Returns a 0–95% heat stress probability.
// ──────────────────────────────────────────────────
export function calculateHeatStress(
  tempCurrent: number,
  cropType: string,
  growthStage: string
): number {
  // ICAR critical temperature thresholds (°C) by crop
  const thresholds: Record<string, Record<string, number>> = {
    wheat:     { flowering: 30, growing: 33, just_sown: 35, near_harvest: 34 },
    rice:      { flowering: 35, growing: 38, just_sown: 40, near_harvest: 38 },
    cotton:    { flowering: 38, growing: 40, just_sown: 42, near_harvest: 40 },
    sugarcane: { flowering: 36, growing: 38, just_sown: 40, near_harvest: 38 },
  };

  const cropThresholds = thresholds[cropType] || thresholds['wheat'];
  const threshold = cropThresholds[growthStage] || cropThresholds['growing'];

  if (tempCurrent <= threshold) {
    // Below threshold — mild stress only if close to it
    const proximity = (threshold - tempCurrent);
    if (proximity < 3) {
      // Within 3°C of threshold: 5–15% stress
      return Math.round(15 - (proximity / 3) * 10);
    }
    return 0;
  }

  // Above threshold — stress scales linearly
  const overshoot = tempCurrent - threshold;
  // Each °C above threshold adds ~12% stress, capped at 95%
  const stress = Math.min(Math.round(40 + overshoot * 12), 95);
  return stress;
}

// ──────────────────────────────────────────────────
// CRIDA Weather-Based Pest Risk Model
// Uses temperature + humidity combos to estimate pest pressure.
// Returns a 0–95% pest pressure score.
// ──────────────────────────────────────────────────
export function calculateCRIDAPestRisk(
  tempCurrent: number,
  humidity: number,
  cropType: string,
  symptom: string
): { totalRisk: number; aphidRisk: number; thripsRisk: number; fungalRisk: number } {
  let aphidRisk = 0;
  let thripsRisk = 0;
  let fungalRisk = 0;

  // CRIDA Rule 1: Aphid risk — Temp 25-30°C + Humidity > 80%
  if (tempCurrent >= 25 && tempCurrent <= 30 && humidity > 80) {
    aphidRisk = Math.round(30 + ((humidity - 80) / 20) * 40); // 30–70%
  } else if (tempCurrent >= 22 && tempCurrent <= 32 && humidity > 70) {
    aphidRisk = Math.round(10 + ((humidity - 70) / 30) * 20); // 10–30%
  }

  // CRIDA Rule 2: Thrips risk — Temp > 30°C + Humidity < 50%
  if (tempCurrent > 30 && humidity < 50) {
    thripsRisk = Math.round(25 + ((tempCurrent - 30) / 10) * 35 + ((50 - humidity) / 50) * 15); // 25–75%
  } else if (tempCurrent > 28 && humidity < 60) {
    thripsRisk = Math.round(5 + ((tempCurrent - 28) / 12) * 15); // 5–20%
  }

  // CRIDA Rule 3: Fungal/Blight risk — Temp 20-28°C + Humidity > 85%
  if (tempCurrent >= 20 && tempCurrent <= 28 && humidity > 85) {
    fungalRisk = Math.round(20 + ((humidity - 85) / 15) * 50); // 20–70%
  } else if (tempCurrent >= 18 && tempCurrent <= 30 && humidity > 75) {
    fungalRisk = Math.round(5 + ((humidity - 75) / 25) * 15); // 5–20%
  }

  // Boost if farmer reported pest symptom
  const symptomBoost = symptom === 'pest' ? 25 : 0;

  // Cotton and rice are particularly susceptible
  const cropMultiplier = (cropType === 'cotton' || cropType === 'rice') ? 1.15 : 1.0;

  const totalRisk = Math.min(
    Math.round(
      (Math.max(aphidRisk, thripsRisk, fungalRisk) * 0.6 +
        (aphidRisk + thripsRisk + fungalRisk) / 3 * 0.4 +
        symptomBoost) * cropMultiplier
    ),
    95
  );

  return {
    totalRisk,
    aphidRisk: Math.min(Math.round(aphidRisk * cropMultiplier), 95),
    thripsRisk: Math.min(Math.round(thripsRisk * cropMultiplier), 95),
    fungalRisk: Math.min(Math.round(fungalRisk * cropMultiplier), 95),
  };
}

// ──────────────────────────────────────────────────
// MAIN RISK SCORING ENGINE  (v2.0)
// Budget: 100 pts total
//   Vegetation (NDVI):   20 pts
//   Water Deficit:       20 pts
//   NDWI Water Signal:    5 pts
//   Thermal Stress:      10 pts
//   Heat Stress (ICAR):  10 pts
//   Soil Bio-Health:     15 pts
//   Bio/Pest Risk:       15 pts
//   Ops:                 10 pts
//   + Historical yield penalty (5 pts outside main budget)
// ──────────────────────────────────────────────────
export function calculateRiskScore(farmData: FarmData) {
  
  // 1. VEGETATION HEALTH (Coupled NDVI) - Max 20 points  [was 25]
  const ndviDeviation = (farmData.ndviBaseline - farmData.ndviCurrent) / farmData.ndviBaseline;
  const ndviScore = Math.min(Math.max(ndviDeviation * 35, 0), 20);

  // 2. WATER DEFICIT (Coupled Rainfall) - Max 20 points
  const rainfallDeficit = (farmData.rainfallExpected - farmData.rainfallActual) / farmData.rainfallExpected;
  const rainfallScore = Math.min(Math.max(rainfallDeficit * 20, 0), 20);

  // 3. NDWI WATER STRESS SIGNAL - Max 5 points  [NEW]
  // NDWI < 0.1 indicates water stress in vegetation
  const ndwiVal = farmData.ndwiCurrent ?? 0.3; // default if not provided
  let ndwiStressScore = 0;
  if (ndwiVal < 0.0) {
    ndwiStressScore = 5; // severe — no water content detected
  } else if (ndwiVal < 0.1) {
    ndwiStressScore = Math.round((0.1 - ndwiVal) / 0.1 * 5);
  } else if (ndwiVal < 0.2) {
    ndwiStressScore = Math.round((0.2 - ndwiVal) / 0.1 * 2);
  }

  // 4. THERMAL STRESS (Coupled Temp) - Max 10 points  [was 15]
  const tempAnomaly = farmData.tempCurrent - farmData.tempBaseline;
  const tempScore = Math.min(Math.max(tempAnomaly * 2, 0), 10);

  // 5. HEAT STRESS — ICAR MODEL - Max 10 points  [NEW]
  const heatStressPct = calculateHeatStress(farmData.tempCurrent, farmData.cropType, farmData.growthStage);
  const heatStressScore = Math.min(Math.round(heatStressPct / 95 * 10), 10);

  // 6. SOIL HEALTH (Coupled pH + Moisture + Carbon) - Max 15 points
  const phDeviation = Math.abs(farmData.soilPH - 6.5);
  const phScore = Math.min(phDeviation * 5, 5);
  const carbonScore = farmData.soilOrganicCarbon < 1.0 ? 5 : 0;
  const soilMoisturePenalty = farmData.soilMoisture < 20 ? 5 : 0;
  const soilScore = phScore + carbonScore + soilMoisturePenalty;

  // 7. BIOLOGICAL RISK — CRIDA PEST MODEL - Max 15 points  [ENHANCED]
  const symptomScores: Record<string, number> = {
    'none': 0, 'yellowing': 8, 'wilting': 12, 'pest': 10, 'stunted': 7, 'waterlogging': 5
  };
  const baseSymptomScore = symptomScores[farmData.symptom] || 0;
  
  // CRIDA pest calculation
  const cridaPest = calculateCRIDAPestRisk(
    farmData.tempCurrent, farmData.humidity, farmData.cropType, farmData.symptom
  );
  // Blend: symptom observation (60%) + CRIDA model (40%) to stay grounded in farmer input
  const cridaPestContribution = Math.round(cridaPest.totalRisk / 95 * 7); // max 7 pts from CRIDA
  const bioScore = Math.min(baseSymptomScore + cridaPestContribution, 15);

  // 8. OPERATIONAL RISK (Irrigation + Rotation) - Max 10 points
  const irrigationRequired: Record<string, number> = {
    'wheat_flowering': 3, 'rice_flowering': 4, 'cotton_flowering': 3
  };
  const cropStageKey = `${farmData.cropType}_${farmData.growthStage}`;
  const reqFreq = irrigationRequired[cropStageKey] || 2;
  const irrigationGap = Math.max(reqFreq - farmData.irrigationFrequency, 0);
  const irrigationPenalty = Math.min(irrigationGap * 3, 7);
  const rotationPenalty = farmData.cropRotation === false ? 3 : 0;
  const opsScore = irrigationPenalty + rotationPenalty;

  // 9. HISTORICAL RESILIENCE (Yield)
  const yieldDeficitPenalty = farmData.historicalYieldAvg < 1200 ? 5 : 0;

  // ── FINAL RAW SCORE (SUM) ──────────────────────
  const rawScore = ndviScore + rainfallScore + ndwiStressScore + tempScore + heatStressScore + soilScore + bioScore + opsScore + yieldDeficitPenalty;

  // ── GROWTH STAGE MULTIPLIER ────────────────────
  const stageMultipliers: Record<string, number> = {
    'just_sown': 0.7, 'growing': 0.9, 'flowering': 1.15, 'near_harvest': 0.8
  };
  const multiplier = stageMultipliers[farmData.growthStage] || 1.0;

  const finalScore = Math.min(Math.round(rawScore * multiplier), 100);

  // Classification
  let alertLevel: 'low' | 'moderate' | 'high' | 'critical';
  if (finalScore < 35) alertLevel = 'low';
  else if (finalScore < 55) alertLevel = 'moderate';
  else if (finalScore < 75) alertLevel = 'high';
  else alertLevel = 'critical';

  // Stress Likelihoods (all 0–95% scale)
  const waterStress = Math.min(Math.round(
    (rainfallScore / 20 * 40) + (soilMoisturePenalty / 5 * 20) + (tempScore / 10 * 15) + (ndwiStressScore / 5 * 25)
  ), 95);
  
  const nutrientDeficiency = Math.min(Math.round(
    (ndviScore / 20 * 40) + (phScore / 5 * 30) + (carbonScore / 5 * 30)
  ), 95);
  
  const pestRisk = Math.min(Math.round(
    cridaPest.totalRisk * 0.7 + (farmData.symptom === 'pest' ? 25 : 0)
  ), 95);

  const heatStress = heatStressPct; // Already 0–95%

  const breakdown = [
    { 
      factor: 'Vegetation Health (NDVI vs Baseline)', 
      value: `${Math.round(ndviDeviation * 100)}% Deviation`,
      points: Math.round(ndviScore), maxPoints: 20, isMultiplier: false 
    },
    { 
      factor: 'Water Deficit (Rainfall vs Expected)', 
      value: `${Math.round(rainfallDeficit * 100)}% Deficit`,
      points: Math.round(rainfallScore), maxPoints: 20, isMultiplier: false 
    },
    {
      factor: 'NDWI Water Signal (Sentinel-2)',
      value: `NDWI: ${ndwiVal.toFixed(3)}${ndwiVal < 0.1 ? ' ⚠️ Low' : ''}`,
      points: Math.round(ndwiStressScore), maxPoints: 5, isMultiplier: false
    },
    { 
      factor: 'Thermal Stress (Temp vs Baseline)', 
      value: `+${tempAnomaly.toFixed(1)}°C Anomaly`,
      points: Math.round(tempScore), maxPoints: 10, isMultiplier: false 
    },
    {
      factor: 'Heat Stress (ICAR Thresholds)',
      value: `${farmData.tempCurrent}°C / ${farmData.cropType} ${farmData.growthStage} → ${heatStressPct}%`,
      points: Math.round(heatStressScore), maxPoints: 10, isMultiplier: false
    },
    { 
      factor: 'Soil Bio-Health (pH, Carbon, Moisture)', 
      value: `pH ${farmData.soilPH} | Moist ${farmData.soilMoisture}%`,
      points: Math.round(soilScore), maxPoints: 15, isMultiplier: false 
    },
    { 
      factor: 'Pest & Disease (CRIDA + Symptoms)', 
      value: `${farmData.symptom === 'none' ? 'Healthy' : farmData.symptom} | Aphid ${cridaPest.aphidRisk}% Thrips ${cridaPest.thripsRisk}%`,
      points: Math.round(bioScore), maxPoints: 15, isMultiplier: false 
    },
    { 
      factor: 'Stage Multiplier', 
      value: `${farmData.growthStage} (${multiplier}x)`,
      points: 0, maxPoints: 0, isMultiplier: true 
    }
  ];

  // Determine dominant stress including the new heatStress
  let dominantStress = 'Water Stress';
  const stressVals = { 'Water Stress': waterStress, 'Nutrient Deficiency': nutrientDeficiency, 'Pest Risk': pestRisk, 'Heat Stress': heatStress };
  let maxStress = 0;
  for (const [name, val] of Object.entries(stressVals)) {
    if (val > maxStress) { maxStress = val; dominantStress = name; }
  }

  return {
    score: finalScore,
    alertLevel,
    stressTypes: { waterStress, nutrientDeficiency, pestRisk, heatStress },
    breakdown,
    dominantStress,
    ndviDeviation, rainfallDeficit, tempAnomaly,
    ndwiCurrent: ndwiVal,
    cridaPestDetail: cridaPest
  };
}

export function fetchSatelliteData(location: string) {
  const mockData: Record<string, any> = {
    'Karnal': {
      ndviCurrent: 0.44, ndviBaseline: 0.57, rainfallActual: 11, rainfallExpected: 34,
      tempCurrent: 28.4, tempBaseline: 26.8, humidity: 62,
      soilMoisture: 24, soilPH: 7.1, historicalYieldAvg: 1850, soilOrganicCarbon: 1.2,
      ndwiCurrent: 0.18
    },
    'Ludhiana': {
      ndviCurrent: 0.52, ndviBaseline: 0.61, rainfallActual: 18, rainfallExpected: 31,
      tempCurrent: 27.4, tempBaseline: 26.1, humidity: 58,
      soilMoisture: 31, soilPH: 6.8, historicalYieldAvg: 1920, soilOrganicCarbon: 1.4,
      ndwiCurrent: 0.24
    }
  };
  return mockData[location] || {
    ndviCurrent: 0.47, ndviBaseline: 0.58, rainfallActual: 16, rainfallExpected: 30,
    tempCurrent: 27.8, tempBaseline: 26.0, humidity: 60,
    soilMoisture: 28, soilPH: 7.0, historicalYieldAvg: 1700, soilOrganicCarbon: 1.1,
    ndwiCurrent: 0.20
  };
}
