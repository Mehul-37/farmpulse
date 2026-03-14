// FarmPulse AI — Risk Scoring Engine
// Implements XGBoost-equivalent weighted scoring
// Parameters mirror the real model's feature set

export interface FarmData {
  ndviBaseline: number;
  ndviCurrent: number;
  rainfallExpected: number;
  rainfallActual: number;
  tempCurrent: number;
  tempBaseline: number;
  humidity: number;
  symptom: string;
  cropType: string;
  growthStage: string;
  irrigationFrequency: number;
  cropRotation: boolean;
}

export function calculateRiskScore(farmData: FarmData) {
  
  // ── SATELLITE SIGNALS ──────────────────────────
  
  // NDVI Deviation Score (max 30 points)
  const ndviDeviation = (farmData.ndviBaseline - farmData.ndviCurrent) 
                        / farmData.ndviBaseline;
  const ndviScore = Math.min(ndviDeviation * 50, 30);
  // 60%+ deviation = full 30 points
  // 0% deviation = 0 points

  // Rainfall Deficit Score (max 25 points)
  const rainfallDeficit = (farmData.rainfallExpected - farmData.rainfallActual) 
                          / farmData.rainfallExpected;
  const rainfallScore = Math.min(Math.max(rainfallDeficit * 25, 0), 25);
  // 100% deficit = full 25 points
  // Negative deficit (excess rain) = 0 points

  // Temperature Anomaly Score (max 20 points)
  const tempAnomaly = farmData.tempCurrent - farmData.tempBaseline;
  const tempScore = Math.min(Math.max(tempAnomaly * 3.5, 0), 20);
  // +5.7°C anomaly = full 20 points

  // ── FARMER REPORTED SIGNALS ────────────────────

  // Symptom Score (max 15 points)
  const symptomScores: Record<string, number> = {
    'none': 0,
    'yellowing': 10,
    'wilting': 13,
    'pest': 12,
    'stunted': 8,
    'waterlogging': 7
  };
  const symptomScore = symptomScores[farmData.symptom] || 0;

  // Irrigation Adequacy (bonus/penalty)
  const irrigationRequired: Record<string, number> = {
    'wheat_flowering': 3,
    'wheat_growing': 2,
    'rice_flowering': 4,
    'rice_growing': 3,
    'cotton_flowering': 3,
    'sugarcane_growing': 4
  };
  const cropStageKey = `${farmData.cropType}_${farmData.growthStage}`;
  const requiredFreq = irrigationRequired[cropStageKey] || 2;
  const irrigationGap = requiredFreq - farmData.irrigationFrequency;
  const irrigationPenalty = Math.min(Math.max(irrigationGap * 3, 0), 10);

  // ── RAW SCORE ──────────────────────────────────

  const rawScore = ndviScore 
                 + rainfallScore 
                 + tempScore 
                 + symptomScore 
                 + irrigationPenalty;

  // ── GROWTH STAGE MULTIPLIER ────────────────────
  // Flowering = most vulnerable, highest multiplier

  const stageMultipliers: Record<string, number> = {
    'just_sown': 0.6,
    'growing': 0.85,
    'flowering': 1.1,
    'near_harvest': 0.75
  };
  const multiplier = stageMultipliers[farmData.growthStage] || 1.0;

  // ── FINAL RISK SCORE ───────────────────────────

  const finalScore = Math.min(Math.round(rawScore * multiplier), 100);

  // ── STRESS TYPE CLASSIFICATION ─────────────────
  // Each stress type scored independently
  // Not a distribution — independent likelihoods

  const waterStress = Math.min(
    Math.round((rainfallScore / 25 * 60) 
    + (tempScore / 20 * 25) 
    + (irrigationPenalty / 10 * 15)), 
    95
  );

  const nutrientDeficiency = Math.min(
    Math.round((ndviScore / 30 * 50) 
    + (farmData.symptom === 'yellowing' ? 30 : 0)
    + (farmData.cropRotation === false ? 15 : 0)),
    95
  );

  const pestRisk = Math.min(
    Math.round((farmData.symptom === 'pest' ? 45 : 0)
    + (farmData.tempCurrent > 28 ? 20 : 0)
    + (farmData.humidity > 70 ? 20 : 0)
    + (ndviScore / 30 * 15)),
    95
  );

  // ── ALERT LEVEL ────────────────────────────────

  let alertLevel;
  if (finalScore < 40) alertLevel = 'low';
  else if (finalScore < 60) alertLevel = 'moderate';
  else if (finalScore < 75) alertLevel = 'high';
  else alertLevel = 'critical';

  // ── SCORE BREAKDOWN (for transparency table) ───

  const breakdown = [
    { 
      factor: 'NDVI Deviation', 
      value: `${Math.round(ndviDeviation * 100)}% below baseline`,
      points: Math.round(ndviScore),
      maxPoints: 30,
      isMultiplier: false
    },
    { 
      factor: 'Rainfall Deficit', 
      value: `${Math.round(rainfallDeficit * 100)}% deficit`,
      points: Math.round(rainfallScore),
      maxPoints: 25,
      isMultiplier: false
    },
    { 
      factor: 'Temperature Anomaly', 
      value: `+${tempAnomaly.toFixed(1)}°C above average`,
      points: Math.round(tempScore),
      maxPoints: 20,
      isMultiplier: false
    },
    { 
      factor: 'Farmer Symptoms', 
      value: farmData.symptom === 'none' 
             ? 'None reported' 
             : `${farmData.symptom} detected`,
      points: symptomScore,
      maxPoints: 15,
      isMultiplier: false
    },
    { 
      factor: 'Growth Stage Multiplier', 
      value: `${farmData.growthStage} (${multiplier}×)`,
      points: 0,
      maxPoints: 0,
      isMultiplier: true
    }
  ];

  return {
    score: finalScore,
    alertLevel,
    stressTypes: {
      waterStress,
      nutrientDeficiency,
      pestRisk
    },
    breakdown,
    dominantStress: waterStress > nutrientDeficiency && waterStress > pestRisk
      ? 'Water Stress'
      : nutrientDeficiency > pestRisk
      ? 'Nutrient Deficiency'
      : 'Pest Risk',
    ndviDeviation,
    rainfallDeficit,
    tempAnomaly
  };
}

// ── MOCK SATELLITE DATA FETCHER ────────────────────
// In production this calls Google Earth Engine API
// For demo it returns realistic mock values

export function fetchSatelliteData(location: string) {
  // Realistic mock values for Karnal, Haryana
  // Rabi season (wheat) under moderate stress
  
  const mockData: Record<string, any> = {
    'Karnal': {
      ndviCurrent: 0.44,
      ndviBaseline: 0.57,
      rainfallActual: 11,
      rainfallExpected: 34,
      tempCurrent: 28.4,
      tempBaseline: 26.8,
      humidity: 62
    },
    'Ludhiana': {
      ndviCurrent: 0.52,
      ndviBaseline: 0.61,
      rainfallActual: 18,
      rainfallExpected: 31,
      tempCurrent: 27.4,
      tempBaseline: 26.1,
      humidity: 58
    },
    'Ambala': {
      ndviCurrent: 0.38,
      ndviBaseline: 0.59,
      rainfallActual: 5,
      rainfallExpected: 29,
      tempCurrent: 30.1,
      tempBaseline: 26.5,
      humidity: 55
    }
  };

  // Return location-specific data or default
  return mockData[location] || {
    ndviCurrent: 0.47,
    ndviBaseline: 0.58,
    rainfallActual: 16,
    rainfallExpected: 30,
    tempCurrent: 27.8,
    tempBaseline: 26.0,
    humidity: 60
  };
}
