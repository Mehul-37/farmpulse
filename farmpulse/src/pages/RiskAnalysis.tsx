import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stressTrendData = [
    { week: 'W1', water: 12, nutrient: 10, pest: 4 },
    { week: 'W2', water: 15, nutrient: 11, pest: 5 },
    { week: 'W3', water: 18, nutrient: 14, pest: 6 },
    { week: 'W4', water: 22, nutrient: 16, pest: 8 },
    { week: 'W5', water: 30, nutrient: 18, pest: 10 },
    { week: 'W6', water: 45, nutrient: 20, pest: 15 },
    { week: 'W7', water: 58, nutrient: 22, pest: 18 },
    { week: 'W8', water: 65, nutrient: 24, pest: 22 },
    { week: 'W9', water: 40, nutrient: 26, pest: 35 },
    { week: 'W10', water: 28, nutrient: 25, pest: 48 },
    { week: 'W11', water: 24, nutrient: 23, pest: 55 },
    { week: 'W12', water: 20, nutrient: 20, pest: 38 },
];

const riskFactors = [
    { name: 'NDVI Deviation from Baseline', weight: '30%', desc: 'Satellite multi-spectral analysis detecting early cellular stress.', color: 'bg-indigo-500' },
    { name: 'Rainfall Deficit (14-day)', weight: '25%', desc: 'CHIRPS precipitation data vs historical 5-year average.', color: 'bg-blue-500' },
    { name: 'Land Surface Temp Anomaly', weight: '20%', desc: 'MODIS thermal infrared data detecting canopy cooling loss.', color: 'bg-rose-500' },
    { name: 'Farmer-Reported Symptoms', weight: '15%', desc: 'NLP extraction from WhatsApp bot interactions & photos.', color: 'bg-amber-500' },
    { name: 'Crop Growth Stage Multiplier', weight: '10%', desc: 'Higher sensitivity during flowering and grain filling stages.', color: 'bg-emerald-500' },
];

const districtRisk = [
    { district: 'Ludhiana', score: 42, color: 'bg-[#22C55E]' },
    { district: 'Ambala', score: 38, color: 'bg-[#22C55E]' },
    { district: 'Karnal', score: 55, color: 'bg-[#F59E0B]' },
    { district: 'Meerut', score: 72, color: 'bg-[#EF4444]' },
    { district: 'Agra', score: 81, color: 'bg-[#EF4444]' },
    { district: 'Jhansi', score: 64, color: 'bg-[#F59E0B]' },
    { district: 'Varanasi', score: 45, color: 'bg-[#F59E0B]' },
    { district: 'Patna', score: 36, color: 'bg-[#22C55E]' },
    { district: 'Indore', score: 28, color: 'bg-[#22C55E]' },
    { district: 'Nagpur', score: 51, color: 'bg-[#F59E0B]' },
];

export default function RiskAnalysis() {
    return (
        <div className="p-8 max-w-[1600px] w-full mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto">

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-main flex items-center gap-2">
                    Risk Analysis & ML Output
                </h1>
                <p className="text-text-muted text-sm mt-1">Deep dive into model calculations and macro trends</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">

                {/* ML Weights breakdown */}
                <div className="bg-surface-1 rounded-[12px] border border-border shadow-sm flex flex-col h-full">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-text-main">How Risk Score is Calculated</h2>
                        <p className="text-sm text-text-muted mt-1">Component weights for our ensemble model</p>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        {riskFactors.map(factor => (
                            <div key={factor.name} className="flex flex-col gap-2 group">
                                <div className="flex items-center justify-between">
                                    <span className="text-text-main font-medium">{factor.name}</span>
                                    <span className="text-text-main font-bold bg-surface-2 px-2 py-1 border border-border rounded-md text-sm">{factor.weight}</span>
                                </div>
                                <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full ${factor.color} bg-opacity-80 transition-all duration-1000`} style={{ width: factor.weight }} />
                                </div>
                                <p className="text-xs text-text-muted group-hover:text-text-main transition-colors">{factor.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8 flex flex-col">
                    {/* Heat map summary */}
                    <div className="bg-surface-1 rounded-[12px] border border-border shadow-sm p-6 overflow-hidden">
                        <h2 className="text-lg font-semibold text-text-main mb-2">Risk Score Distribution Map (District Level)</h2>
                        <p className="text-sm text-text-muted mb-6">Average risk score by district showing regional hotspots</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {districtRisk.map(d => (
                                <div key={d.district} className={`rounded-xl border border-border p-4 transition-transform hover:scale-105 ${d.color} bg-opacity-20 flex flex-col items-center justify-center text-center gap-1 min-h-[90px]`}>
                                    <span className="text-text-main font-bold text-2xl drop-shadow-sm">{d.score}</span>
                                    <span className="text-text-main/90 text-[11px] font-medium uppercase tracking-wider">{d.district}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Area Chart Trends */}
                    <div className="bg-surface-1 rounded-[12px] border border-border shadow-sm p-6 flex-1 min-h-[350px]">
                        <h2 className="text-lg font-semibold text-text-main mb-2">Stress Type Trends Over 12 Weeks</h2>
                        <p className="text-sm text-text-muted mb-6">Water stress peaks in weeks 6-8, pest risk rises in weeks 9-11</p>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stressTrendData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                    <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                                        itemStyle={{ color: 'var(--text-main)' }}
                                    />
                                    <Area type="monotone" dataKey="water" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Water Stress" fillOpacity={0.8} />
                                    <Area type="monotone" dataKey="nutrient" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Nutrient Deficiency" fillOpacity={0.8} />
                                    <Area type="monotone" dataKey="pest" stackId="1" stroke="#EF4444" fill="#EF4444" name="Pest Risk" fillOpacity={0.8} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[#3B82F6]"></div>
                                <span className="text-xs font-medium text-text-muted">Water Stress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[#F59E0B]"></div>
                                <span className="text-xs font-medium text-text-muted">Nutrient Deficiency</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[#EF4444]"></div>
                                <span className="text-xs font-medium text-text-muted">Pest Risk</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
