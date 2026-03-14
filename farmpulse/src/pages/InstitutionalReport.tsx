import { FileDown, MapPin, Target, Zap, ShieldCheck } from 'lucide-react';


export default function InstitutionalReport() {
    const handleDownloadPdf = () => {
        // Use browser's native, high-quality print-to-PDF engine
        window.print();
    };

    const highRiskVillages = [
        { name: 'Sardhana', district: 'Meerut', farms: 45, score: 82, stress: 'Water Stress', action: 'Issue irrigation advisory via SMS' },
        { name: 'Mawana', district: 'Meerut', farms: 32, score: 78, stress: 'Nutrient Deficiency', action: 'Arrange soil testing camp' },
        { name: 'Nilokheri', district: 'Karnal', farms: 28, score: 75, stress: 'Pest Risk', action: 'Deploy extension officer immediately' },
        { name: 'Saha', district: 'Ambala', farms: 35, score: 71, stress: 'Water Stress', action: 'Canal release scheduling review' },
        { name: 'Jagraon', district: 'Ludhiana', farms: 52, score: 68, stress: 'Nutrient Deficiency', action: 'Distribute subsidy info for urea' },
    ];

    const wOwData = [
        { district: 'Meerut', last: 45, curr: 72, change: '+60%' },
        { district: 'Karnal', last: 42, curr: 55, change: '+30%' },
        { district: 'Jhansi', last: 62, curr: 64, change: '+3%' },
        { district: 'Ludhiana', last: 50, curr: 42, change: '-16%' },
        { district: 'Ambala', last: 48, curr: 38, change: '-20%' },
    ];

    return (
        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8 animate-in fade-in duration-500 pb-20 bg-background print:p-0 print:pb-0">

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border pb-6 print:border-none">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-main mb-1">
                        Maharashtra & Punjab Region — Weekly Crop Risk Report
                    </h1>
                    <p className="text-text-muted text-sm">For: PMFBY Insurance Division | Week of {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 bg-text-main text-background px-4 py-2 text-sm font-semibold rounded-lg hover:opacity-80 transition-colors shadow-sm cursor-pointer whitespace-nowrap print:hidden">
                    <FileDown size={16} /> Download PDF Report
                </button>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-1 p-5 rounded-[12px] border border-border shadow-sm flex flex-col items-center text-center">
                    <p className="text-sm font-medium text-text-muted mb-2">Total Monitored Farms</p>
                    <p className="text-3xl font-bold text-text-main">1,247</p>
                </div>
                <div className="bg-surface-1 p-5 rounded-[12px] border border-border shadow-sm flex flex-col items-center text-center">
                    <p className="text-sm font-medium text-text-muted mb-2">Est. Crop Area at Risk</p>
                    <p className="text-3xl font-bold text-[#F59E0B]">2,340<span className="text-lg text-text-muted font-normal ml-1">acres</span></p>
                </div>
                <div className="bg-surface-1 p-5 rounded-[12px] border border-border shadow-sm flex flex-col items-center text-center bg-gradient-to-t from-[#22C55E]/5 to-transparent">
                    <p className="text-sm font-medium text-text-muted mb-2">Projected Loss Prevention</p>
                    <p className="text-3xl font-bold text-[#22C55E]">₹1.2<span className="text-lg font-medium ml-1">Cr</span></p>
                </div>
                <div className="bg-surface-1 p-5 rounded-[12px] border border-border shadow-sm flex flex-col items-center text-center">
                    <p className="text-sm font-medium text-text-muted mb-2">Claims Risk Reduction Est.</p>
                    <p className="text-3xl font-bold text-[#3B82F6]">24%</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column 66% */}
                <div className="lg:col-span-2 space-y-8">

                    {/* High Risk Zones Table */}
                    <div className="bg-surface-1 rounded-[12px] border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border bg-surface-2">
                            <h2 className="text-lg font-semibold text-text-main flex items-center gap-2">
                                <Target size={18} className="text-[#EF4444]" /> High Risk Zones Requiring Immediate Attention
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface-1">
                                    <tr>
                                        <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase">Village/District</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase text-center">Farms</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase text-center">Avg Score</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase">Dominant Stress</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase">Government Action Rec.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {highRiskVillages.map((v) => (
                                        <tr key={v.name} className="hover:bg-surface-2">
                                            <td className="px-5 py-4">
                                                <div className="text-sm font-medium text-text-main">{v.name}</div>
                                                <div className="text-xs text-text-muted">{v.district}</div>
                                            </td>
                                            <td className="px-5 py-4 text-center text-sm font-medium text-text-main">{v.farms}</td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${v.score > 80 ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20'}`}>{v.score}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-text-muted">{v.stress}</td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-medium px-2 py-1 bg-text-main text-background rounded leading-snug tracking-tight">{v.action}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column 33% */}
                <div className="space-y-8 flex flex-col">

                    {/* Week over Week Change */}
                    <div className="bg-surface-1 border border-border rounded-[12px] shadow-sm flex flex-col p-5 h-full">
                        <h2 className="text-lg font-semibold text-text-main mb-4">Week-over-Week Change</h2>
                        <div className="flex-1 space-y-4">
                            {wOwData.map(d => {
                                const isIncrease = d.change.startsWith('+');
                                return (
                                    <div key={d.district} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                                        <span className="text-sm font-medium text-text-main">{d.district}</span>
                                        <div className="flex gap-4 text-center">
                                            <div><span className="block text-xs text-text-muted">W-{new Date().getWeek() - 1}</span><span className="text-sm font-medium">{d.last}</span></div>
                                            <div><span className="block text-xs text-text-muted">W-{new Date().getWeek()}</span><span className="text-sm font-bold">{d.curr}</span></div>
                                            <div className="w-14 items-end flex justify-end">
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isIncrease ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#22C55E]/20 text-[#22C55E]'}`}>
                                                    {isIncrease ? '▲' : '▼'} {d.change.replace('+', '').replace('-', '')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* SDG Impact Metrics */}
                    <div className="bg-surface-1 border border-border rounded-[12px] shadow-sm p-5">
                        <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#3B82F6]" /> SDG Impact Metrics
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-surface-2 p-4 rounded-xl border border-border">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-bold text-xs"><Zap size={14} /></div>
                                    <span className="text-xl font-bold text-text-main">18% <span className="text-xs font-normal text-text-muted">reduction</span></span>
                                </div>
                                <h3 className="text-sm font-medium text-text-muted ml-11">Crop Loss Prevented This Season</h3>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-xl border border-border">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold text-xs"><ShieldCheck size={14} /></div>
                                    <span className="text-xl font-bold text-text-main">847 <span className="text-xs font-normal text-text-muted">households</span></span>
                                </div>
                                <h3 className="text-sm font-medium text-text-muted ml-11">Farmer Households Protected</h3>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-xl border border-border">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center font-bold text-xs"><MapPin size={14} /></div>
                                    <span className="text-xl font-bold text-text-main">22% <span className="text-xs font-normal text-text-muted">reduction</span></span>
                                </div>
                                <h3 className="text-sm font-medium text-text-muted ml-11">Fertilizer Waste Reduced</h3>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Minimal week calculation helper for mock
declare global {
    interface Date {
        getWeek(): number;
    }
}
Date.prototype.getWeek = function () {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
