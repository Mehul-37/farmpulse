export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type StressType = 'Water Stress' | 'Nutrient Deficiency' | 'Pest Risk' | 'None';
export type CropType = 'Wheat' | 'Rice' | 'Cotton' | 'Sugarcane';

export interface Farm {
    id: string;
    farmerName: string;
    phone: string;
    village: string;
    district: string;
    state: string;
    sizeAcres: number;
    cropType: CropType;
    sownDate: string;
    stage: string;
    irrigationSource: string;
    irrigationFreq: string;
    soilType: string;
    lastSeasonCrop: string;
    riskScore: number;
    riskLevel: RiskLevel;
    primaryStress: StressType;
    stressProbabilities: { water: number; nutrient: number; pest: number };
    coordinates: [number, number]; // [lat, lng]
    lastAlertDate: string | null;
    ndviBaselineDiff: number;
    rainfall14Days: number; // mm
    tempAnomaly: number; // deg C
    riskHistory: number[];
}

const firstNames = ['Ramesh', 'Suresh', 'Gurpreet', 'Harpreet', 'Manjeet', 'Rajesh', 'Vinod', 'Prakash', 'Amit', 'Sunil', 'Balwinder', 'Karamjit', 'Jagdish', 'Kuldeep', 'Surjit'];
const lastNames = ['Kumar', 'Singh', 'Sharma', 'Yadav', 'Verma', 'Kaur', 'Gill', 'Sandhu', 'Dhillon', 'Garg', 'Chauhan'];

const locations = [
    { dist: 'Ludhiana', state: 'Punjab', villages: ['Sahnewal', 'Doraha', 'Jagraon', 'Raikot'], coords: [30.9009, 75.8572] },
    { dist: 'Ambala', state: 'Haryana', villages: ['Saha', 'Barara', 'Naraingarh', 'Mullana'], coords: [30.3781, 76.7766] },
    { dist: 'Karnal', state: 'Haryana', villages: ['Nilokheri', 'Indri', 'Gharaunda', 'Taroari'], coords: [29.6856, 76.9904] },
    { dist: 'Meerut', state: 'UP', villages: ['Sardhana', 'Mawana', 'Hastinapur', 'Daurala'], coords: [28.9844, 77.7064] },
    { dist: 'Agra', state: 'UP', villages: ['Fatehabad', 'Kiraoli', 'Etmadpur', 'Kheragarh'], coords: [27.1766, 78.0080] },
    { dist: 'Jhansi', state: 'UP', villages: ['Babina', 'Mauranipur', 'Garautha', 'Moth'], coords: [25.4484, 78.5684] },
];

const crops: CropType[] = ['Wheat', 'Rice', 'Cotton', 'Sugarcane'];
const irrigationSources = ['Borewell', 'Canal', 'Rainfed', 'Tube well'];
const soilTypes = ['Sandy Loam', 'Clay Loam', 'Alluvial', 'Black Soil'];

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => +(Math.random() * (max - min) + min).toFixed(2);
const randChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateFarms = (count: number): Farm[] => {
    const farms: Farm[] = [];

    for (let i = 0; i < count; i++) {
        const loc = randChoice(locations);
        const village = randChoice(loc.villages);
        // Add some random jitter to coords so they don't overlap completely
        const lat = loc.coords[0] + randFloat(-0.2, 0.2);
        const lng = loc.coords[1] + randFloat(-0.2, 0.2);

        let riskScore = 0;
        const r = Math.random();
        if (r < 0.6) riskScore = randInt(15, 45); // Mostly low/moderate
        else if (r < 0.85) riskScore = randInt(46, 65); // Moderate/High
        else riskScore = randInt(66, 92); // High/Critical

        let riskLevel: RiskLevel = 'Low';
        if (riskScore > 30 && riskScore <= 60) riskLevel = 'Moderate';
        else if (riskScore > 60 && riskScore <= 80) riskLevel = 'High';
        else if (riskScore > 80) riskLevel = 'Critical';

        let primaryStress: StressType = 'None';
        let water = 0, nutrient = 0, pest = 0;

        if (riskScore > 30) {
            const stressR = Math.random();
            if (stressR < 0.5) {
                primaryStress = 'Water Stress';
                water = randInt(50, 85);
                nutrient = randInt(10, 30);
                pest = randInt(5, 20);
            } else if (stressR < 0.8) {
                primaryStress = 'Nutrient Deficiency';
                water = randInt(10, 30);
                nutrient = randInt(50, 80);
                pest = randInt(10, 20);
            } else {
                primaryStress = 'Pest Risk';
                water = randInt(10, 20);
                nutrient = randInt(10, 30);
                pest = randInt(50, 85);
            }
        }

        const lastAlertDate = riskScore > 60 ? new Date(Date.now() - randInt(1, 14) * 86400000).toISOString() : null;

        const riskHistory = [riskScore];
        for(let j=0; j<7; j++) {
            const prev = riskHistory[0] + randInt(-8, 8);
            riskHistory.unshift(Math.max(0, Math.min(100, prev)));
        }

        farms.push({
            id: `FARM-${1000 + i}`,
            farmerName: `${randChoice(firstNames)} ${randChoice(lastNames)}`,
            phone: `+91 ${randInt(90000, 99999)}${randInt(10000, 99999)}`,
            village,
            district: loc.dist,
            state: loc.state,
            sizeAcres: randFloat(1.5, 12),
            cropType: randChoice(crops),
            sownDate: `2023-11-${randInt(1, 28).toString().padStart(2, '0')}`,
            stage: randChoice(['Vegetative', 'Flowering', 'Grain Filling', 'Maturity']),
            irrigationSource: randChoice(irrigationSources),
            irrigationFreq: `${randInt(1, 3)}x per week`,
            soilType: randChoice(soilTypes),
            lastSeasonCrop: randChoice(crops),
            riskScore,
            riskLevel,
            primaryStress,
            stressProbabilities: { water, nutrient, pest },
            coordinates: [lat, lng],
            lastAlertDate,
            ndviBaselineDiff: randInt(-30, 5),
            rainfall14Days: randInt(0, 40),
            tempAnomaly: randFloat(-1, 3.5),
            riskHistory
        });
    }
    return farms;
};

export const mockFarms = generateFarms(55);

export const getDashboardKPIs = () => {
    const avgHealth = Math.round(mockFarms.reduce((acc, f) => acc + (100 - f.riskScore), 0) / mockFarms.length);
    return {
        totalFarms: 1247, // Hardcoded as per prompt
        highRiskFarms: 89,
        alertsSentThisWeek: 134,
        avgCropHealth: avgHealth
    };
};

export const ndviTrendData = [
    { week: 'Week 1', score: 82 },
    { week: 'Week 2', score: 83 },
    { week: 'Week 3', score: 81 },
    { week: 'Week 4', score: 80 },
    { week: 'Week 5', score: 78 },
    { week: 'Week 6', score: 75 },
    { week: 'Week 7', score: 70 },
    { week: 'Week 8', score: 62 },
    { week: 'Week 9', score: 58 },
    { week: 'Week 10', score: 63 },
    { week: 'Week 11', score: 68 },
    { week: 'Week 12', score: 71 },
];

export const riskDistributionData = [
    { name: '0-30 (Low)', value: 654, fill: '#22C55E' },
    { name: '31-60 (Moderate)', value: 382, fill: '#F59E0B' },
    { name: '61-80 (High)', value: 122, fill: '#F97316' },
    { name: '81-100 (Critical)', value: 89, fill: '#EF4444' },
];

export const stressTypeData = [
    { name: 'Water Stress', value: 48, fill: '#3B82F6' },
    { name: 'Nutrient Deficiency', value: 31, fill: '#F59E0B' },
    { name: 'Pest Risk', value: 21, fill: '#EF4444' },
];

export interface Alert {
    id: string;
    farmId: string;
    farmerName: string;
    village: string;
    stressType: StressType;
    riskScore: number;
    message: string;
    status: 'Delivered' | 'Read' | 'No Response';
    timestamp: string;
}

export const mockAlerts: Alert[] = mockFarms
    .filter(f => f.lastAlertDate)
    .slice(0, 15)
    .map((f, i) => ({
        id: `ALT-${1000 + i}`,
        farmId: f.id,
        farmerName: f.farmerName,
        village: f.village,
        stressType: f.primaryStress,
        riskScore: f.riskScore,
        message: f.primaryStress === 'Water Stress'
            ? 'Your crop is showing signs of water stress. Please irrigate within 3-4 days.'
            : f.primaryStress === 'Nutrient Deficiency'
                ? 'Nitrogen deficiency detected. Apply recommended urea dosage.'
                : 'Early pest damage visible. Monitor fields and apply pesticide if needed.',
        status: randChoice(['Delivered', 'Read', 'Read', 'No Response']) as 'Delivered' | 'Read' | 'No Response',
        timestamp: f.lastAlertDate!
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
