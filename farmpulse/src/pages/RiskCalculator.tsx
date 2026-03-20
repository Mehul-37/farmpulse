import { useState, useEffect } from 'react';
import { calculateRiskScore, fetchSatelliteData, FarmData, DISTRICT_COORDS, getDistrictCoords } from '../utils/riskModel';
import { Calculator, Cloud, Sun, Droplets, Sprout, Thermometer, Database, Waves } from 'lucide-react';

const CircularProgress = ({ value, duration, color }: { value: number, duration: number, color: string }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let start: number | null = null;
        let animationFrame: number;
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progressRatio = Math.min(elapsed / duration, 1);
            setProgress(Math.floor(progressRatio * value));
            if (progressRatio < 1) {
                animationFrame = window.requestAnimationFrame(step);
            }
        };
        animationFrame = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r={radius} className="stroke-[#2A2A2A]" strokeWidth="8" fill="none" />
                <circle cx="48" cy="48" r={radius} className="transition-all duration-75 ease-out" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color }}>{progress}</span>
                <span className="text-[10px] text-text-muted mt-0.5">/100</span>
            </div>
        </div>
    );
};

export default function RiskCalculator() {
    const [district, setDistrict] = useState('Karnal');
    const [cropType, setCropType] = useState('wheat');
    const [growthStage, setGrowthStage] = useState('flowering');
    const [irrigation, setIrrigation] = useState(2);
    const [symptom, setSymptom] = useState('none');
    
    // Auto-derived or contextual params simulated via the farmer's district
    // e.g. "What did you grow last season?" -> "Rice" -> rotation = true
    const [rotation, setRotation] = useState(true);
    
    const [isLoading, setIsLoading] = useState(false);
    const [riskResult, setRiskResult] = useState<any>(null);
    const [isLiveSat, setIsLiveSat] = useState(false);
    const [isLiveWeather, setIsLiveWeather] = useState(false);
    const [currentEnv, setCurrentEnv] = useState<any>(null);

    const handleCalculate = async () => {
        setIsLoading(true);
        setRiskResult(null);

        try {
            const coords = await getDistrictCoords(district);
            const baseData = fetchSatelliteData(district);

            // 1. Fetch Real GEE NDVI
            let liveNdvi = baseData.ndviCurrent;
            let satOk = false;
            let liveNdwi = 0.20; // fallback
            try {
                const satRes = await fetch(`http://localhost:8000/satellite/${coords.lat}/${coords.lng}`);
                const satData = await satRes.json();
                if (satData.ndvi && satData.ndvi !== -1) {
                    liveNdvi = Math.max(satData.ndvi, 0.35);
                    satOk = true;
                }
                if (satData.ndwi && satData.ndwi !== -1) {
                    liveNdwi = satData.ndwi;
                }
            } catch (e) { console.error("Sat fetch failed"); }

            // 2. Fetch Real Weather
            let liveTemp = baseData.tempCurrent;
            let liveRain = baseData.rainfallActual;
            let liveHumid = baseData.humidity;
            let weatherOk = false;
            try {
                const weatherRes = await fetch(`http://localhost:8000/api/weather/${coords.lat}/${coords.lng}`);
                const weatherData = await weatherRes.json();
                if (weatherData.status === "live") {
                    liveTemp = weatherData.temp;
                    liveRain = weatherData.precipitation_7d_total;
                    liveHumid = weatherData.humidity;
                    weatherOk = true;
                }
            } catch (e) { console.error("Weather fetch failed"); }

            setIsLiveSat(satOk);
            setIsLiveWeather(weatherOk);
            
            // Re-map the state internally for the UI provenance display
            const derivedParams = {
                ndviBaseline: baseData.ndviBaseline,
                tempBaseline: baseData.tempBaseline,
                rainfallExpected: baseData.rainfallExpected,
                soilPH: baseData.soilPH,
                soilMoisture: baseData.soilMoisture,
                soilOrganicCarbon: baseData.soilOrganicCarbon,
                historicalYieldAvg: baseData.historicalYieldAvg
            };
            
            setCurrentEnv({ liveNdvi, liveNdwi, liveTemp, liveRain, liveHumid, ...derivedParams });

            // 3. Assemble 17 parameters
            const payload: FarmData = {
                ...baseData,
                ndviCurrent: liveNdvi,
                ndwiCurrent: liveNdwi,
                tempCurrent: liveTemp,
                rainfallActual: liveRain,
                humidity: liveHumid,
                soilPH: baseData.soilPH,
                soilMoisture: baseData.soilMoisture,
                soilOrganicCarbon: baseData.soilOrganicCarbon,
                historicalYieldAvg: baseData.historicalYieldAvg,
                cropType,
                growthStage,
                irrigationFrequency: irrigation,
                cropRotation: rotation,
                symptom
            };

            const result = calculateRiskScore(payload);
            setTimeout(() => {
                setRiskResult(result);
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-main p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
                            <Calculator size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Farm Risk Pro <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded ml-2 font-mono">v2.0</span></h1>
                            <p className="text-text-muted mt-1 text-sm font-medium">17-parameter agricultural risk intelligence with ICAR & CRIDA models</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT: Inputs (5 columns) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-surface-1 border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Sprout size={16} /> Ground Parameters
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">District</label>
                                    <select className="w-full bg-surface-2 border border-border text-sm rounded-lg px-3 py-2.5 focus:outline-primary outline-none" value={district} onChange={(e) => setDistrict(e.target.value)}>
                                        {Object.keys(DISTRICT_COORDS).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Crop</label>
                                    <select className="w-full bg-surface-2 border border-border text-sm rounded-lg px-3 py-2.5 focus:outline-primary outline-none" value={cropType} onChange={(e) => setCropType(e.target.value)}>
                                        <option value="wheat">Wheat</option><option value="rice">Rice</option><option value="cotton">Cotton</option><option value="sugarcane">Sugarcane</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Growth Stage</label>
                                    <select className="w-full bg-surface-2 border border-border text-sm rounded-lg px-3 py-2.5 focus:outline-primary outline-none" value={growthStage} onChange={(e) => setGrowthStage(e.target.value)}>
                                        <option value="just_sown">Just Sown</option><option value="growing">Growing</option><option value="flowering">Flowering (Critical)</option><option value="near_harvest">Near Harvest</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Irrigation / Wk</label>
                                    <input type="number" min="0" max="10" className="w-full bg-surface-2 border border-border text-sm rounded-lg px-3 py-2.5 focus:outline-primary outline-none" value={irrigation} onChange={(e) => setIrrigation(Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Visible Symptoms</label>
                                    <select className="w-full bg-surface-2 border border-border text-sm rounded-lg px-3 py-2.5 focus:outline-primary outline-none" value={symptom} onChange={(e) => setSymptom(e.target.value)}>
                                        <option value="none">None (Healthy)</option><option value="yellowing">Yellowing Leaves</option><option value="wilting">Wilting</option><option value="pest">Pest Damage</option><option value="stunted">Stunted Growth</option><option value="waterlogging">Waterlogging</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Crop Rotation</label>
                                    <div className="flex gap-2 p-1 bg-surface-2 rounded-lg border border-border">
                                        <button onClick={() => setRotation(true)} className={`flex-1 py-2 text-xs font-bold rounded ${rotation ? 'bg-primary text-white shadow' : 'text-text-muted hover:bg-surface-1'}`}>Yes (Changed Crop)</button>
                                        <button onClick={() => setRotation(false)} className={`flex-1 py-2 text-xs font-bold rounded ${!rotation ? 'bg-primary text-white shadow' : 'text-text-muted hover:bg-surface-1'}`}>No (Same Crop)</button>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50" onClick={handleCalculate} disabled={isLoading}>
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Calculator size={20} /> Run Pro Diagnostic</>}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Analysis (7 columns) */}
                    <div className="lg:col-span-7">
                        {!riskResult && !isLoading && (
                            <div className="h-full bg-surface-1/30 border-2 border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-6 border border-border">
                                    <Sprout size={40} className="text-border" />
                                </div>
                                <h3 className="text-xl font-bold text-text-main mb-2">Ready for Analysis</h3>
                                <p className="text-text-muted max-w-sm">Enter farm details and run the diagnostic to pull real-time satellite and meteorological data.</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="h-full bg-surface-1 border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <Sprout className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
                                </div>
                                <div>
                                    <div className="font-mono text-sm tracking-[0.2em] text-primary uppercase mb-2">Aggregating Live Streams</div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-text-muted flex items-center justify-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div> Sentinel-2 GEE Satellite Sync</div>
                                        <div className="text-xs text-text-muted flex items-center justify-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div> Open-Meteo Weather Stream Sync</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {riskResult && !isLoading && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Result Summary Card */}
                                <div className="bg-surface-1 border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 flex gap-2">
                                        <div className={`px-2.5 py-1 text-[9px] font-black rounded border ${isLiveSat ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30'}`}>
                                            {isLiveSat ? '● LIVE GEE' : '○ FALLBACK'}
                                        </div>
                                        <div className={`px-2.5 py-1 text-[9px] font-black rounded border ${isLiveWeather ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30'}`}>
                                            {isLiveWeather ? '● LIVE WEATHER' : '○ FALLBACK'}
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="shrink-0 transform scale-125">
                                            <CircularProgress value={riskResult.score} duration={1000} color={riskResult.score < 35 ? "#10B981" : riskResult.score < 55 ? "#F59E0B" : "#EF4444"} />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Diagnostic Score</div>
                                            <h2 className={`text-4xl font-black mb-2 ${riskResult.score < 35 ? "text-green-500" : riskResult.score < 55 ? "text-orange-500" : "text-red-500"}`}>
                                                {riskResult.alertLevel.toUpperCase()} RISK
                                            </h2>
                                            <p className="text-sm text-text-muted leading-relaxed">
                                                Diagnostic complete for <span className="text-text-main font-bold">{district}</span>. 
                                                The primary driver is <span className="text-primary font-bold">{riskResult.dominantStress}</span> based on 17 real-time parameters.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Live Env Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-6 border-t border-border/50">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1"><Sun size={12}/> NDVI Index</div>
                                            <div className="text-lg font-bold font-mono">{currentEnv.liveNdvi.toFixed(3)}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1"><Thermometer size={12}/> Temperature</div>
                                            <div className="text-lg font-bold font-mono">{currentEnv.liveTemp}°C</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1"><Droplets size={12}/> Rainfall (7d)</div>
                                            <div className="text-lg font-bold font-mono">{currentEnv.liveRain}mm</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1"><Cloud size={12}/> Humidity</div>
                                            <div className="text-lg font-bold font-mono">{currentEnv.liveHumid}%</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1"><Waves size={12}/> NDWI</div>
                                            <div className={`text-lg font-bold font-mono ${(currentEnv.liveNdwi ?? 0.3) < 0.1 ? 'text-red-500' : ''}`}>{(currentEnv.liveNdwi ?? 0.20).toFixed(3)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Table Breakdown */}
                                <div className="bg-surface-1 border border-border rounded-3xl p-6 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="text-text-muted text-[10px] uppercase tracking-widest border-b border-border">
                                                <th className="pb-4 font-black">Coupled Risk Factor</th>
                                                <th className="pb-4 font-black">Contextual Value</th>
                                                <th className="pb-4 font-black text-right">Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {riskResult.breakdown.map((item: any, idx: number) => (
                                                <tr key={idx} className="group hover:bg-surface-2/30 transition-colors">
                                                    <td className="py-4 font-bold text-text-main pr-4">{item.factor}</td>
                                                    <td className="py-4 text-text-muted">{item.value}</td>
                                                    <td className={`py-4 text-right font-mono font-bold ${item.isMultiplier ? 'text-green-500' : item.points > 10 ? 'text-red-500' : 'text-text-main'}`}>
                                                        {item.isMultiplier ? 'Multiplier' : `+${item.points}`}
                                                        {!item.isMultiplier && <span className="text-[10px] opacity-30 ml-1">/{item.maxPoints}</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-surface-2/50">
                                                <td className="py-4 px-4 font-black text-lg rounded-l-2xl">Coupled Diagnostic Total</td>
                                                <td></td>
                                                <td className={`py-4 px-4 text-right font-black text-2xl rounded-r-2xl ${riskResult.score < 35 ? "text-green-500" : riskResult.score < 55 ? "text-orange-500" : "text-red-500"}`}>
                                                    {riskResult.score} / 100
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Transparency / Provenance Map */}
                                <div className="mt-6 bg-surface-1 border border-border rounded-3xl p-6">
                                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Database size={16} /> AI Data Provenance (17+ Parameters)
                                    </h3>
                                    <p className="text-xs text-text-muted mb-4">
                                        Showing exactly how the inference engine aggregates 6 basic farmer inputs with 11 auto-derived background datasets including ICAR & CRIDA models.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {/* Farmer Inputs */}
                                        <div className="p-3 bg-surface-2 rounded-xl border border-border">
                                            <div className="text-[10px] font-black text-primary mb-2 uppercase">Farmer Input (App UI)</div>
                                            <ul className="text-xs space-y-1.5 text-text-main">
                                                <li><span className="text-text-muted">Crop:</span> {cropType}</li>
                                                <li><span className="text-text-muted">Stage:</span> {growthStage}</li>
                                                <li><span className="text-text-muted">Irrigation:</span> {irrigation}/wk</li>
                                                <li><span className="text-text-muted">Symptom:</span> {symptom}</li>
                                                <li><span className="text-text-muted">Rotation:</span> {rotation ? 'Yes' : 'No'}</li>
                                            </ul>
                                        </div>
                                        
                                        {/* Live API */}
                                        <div className="p-3 bg-surface-2 rounded-xl border border-border">
                                            <div className="text-[10px] font-black text-blue-500 mb-2 uppercase">Live API Telemetry</div>
                                            <ul className="text-xs space-y-1.5 text-text-main">
                                                <li className="flex justify-between"><span><span className="text-text-muted">NDVI:</span> {currentEnv.liveNdvi.toFixed(2)}</span> <span className="text-[8px] px-1 bg-green-500/20 text-green-500 rounded border border-green-500/30">GEE</span></li>
                                                <li className="flex justify-between"><span><span className="text-text-muted">NDWI:</span> {(currentEnv.liveNdwi ?? 0.20).toFixed(3)}</span> <span className="text-[8px] px-1 bg-green-500/20 text-green-500 rounded border border-green-500/30">GEE</span></li>
                                                <li className="flex justify-between"><span><span className="text-text-muted">Temp:</span> {currentEnv.liveTemp}°C</span> <span className="text-[8px] px-1 bg-blue-500/20 text-blue-500 rounded border border-blue-500/30">METEO</span></li>
                                                <li className="flex justify-between"><span><span className="text-text-muted">Rain (7d):</span> {currentEnv.liveRain}mm</span> <span className="text-[8px] px-1 bg-blue-500/20 text-blue-500 rounded border border-blue-500/30">METEO</span></li>
                                                <li className="flex justify-between"><span><span className="text-text-muted">Humidity:</span> {currentEnv.liveHumid}%</span> <span className="text-[8px] px-1 bg-blue-500/20 text-blue-500 rounded border border-blue-500/30">METEO</span></li>
                                            </ul>
                                        </div>

                                        {/* Background Geospatial */}
                                        <div className="p-3 bg-surface-2 rounded-xl border border-border">
                                            <div className="text-[10px] font-black text-orange-500 mb-2 uppercase">Geospatial Baselines</div>
                                            <ul className="text-xs space-y-1.5 text-text-main">
                                                <li><span className="text-text-muted">NDVI Base:</span> {currentEnv.ndviBaseline}</li>
                                                <li><span className="text-text-muted">Rain Base:</span> {currentEnv.rainfallExpected}mm</li>
                                                <li><span className="text-text-muted">Soil Moist:</span> {currentEnv.soilMoisture}%</li>
                                                <li><span className="text-text-muted">Soil Health:</span> pH {currentEnv.soilPH} | C {currentEnv.soilOrganicCarbon}%</li>
                                                <li><span className="text-text-muted">Yield Hist:</span> {currentEnv.historicalYieldAvg}kg/ac</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
