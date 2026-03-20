import { useState, useRef, useEffect } from 'react';
import { mockFarms, Farm } from '../data/mockData';
import { Search, X, Upload, Loader2, Info } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function FarmProfiles() {
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            const farm = mockFarms.find(f => f.id === id);
            if (farm) {
                setSelectedFarm(farm);
            }
        }
    }, [searchParams]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload and Analyze
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('http://localhost:8000/analyze-photo', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setAnalysisResult(data);
        } catch (error) {
            console.error("Failed to analyze photo", error);
        } finally {
            setIsAnalyzing(false);
        }
    };


    const filtered = mockFarms.filter(f =>
        f.farmerName.toLowerCase().includes(search.toLowerCase()) ||
        f.id.toLowerCase().includes(search.toLowerCase()) ||
        f.village.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500 h-full flex flex-col relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-main">Farm Profiles</h1>
                    <p className="text-text-muted text-sm mt-1">Directory of all registered and monitored plots</p>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-text-muted" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search name, ID, village..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-surface-1 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-main w-64 focus:outline-none focus:border-gray-500 transition-colors"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-surface-1 rounded-[12px] border border-border shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-surface-1 z-10 box-border border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Farm ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Farmer Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Village & District</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Crop</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Score</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Primary Stress</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map(farm => (
                                <tr key={farm.id} className="hover:bg-surface-2 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-medium text-text-muted">{farm.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-text-main">{farm.farmerName}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-text-main">{farm.village}</div>
                                        <div className="text-xs text-text-muted">{farm.district}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-main">{farm.cropType}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${farm.riskScore > 65 ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                                            farm.riskScore > 40 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' :
                                                'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'
                                            }`}>
                                            {farm.riskScore}/100
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted">{farm.primaryStress}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedFarm(farm)}
                                            className="text-sm text-text-main bg-surface-2 hover:bg-border border border-border px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Side Panel Overlay */}
            {selectedFarm && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedFarm(null)}></div>
                    <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-surface-1 border-l border-border z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-text-main">Farm Profile</h2>
                                <button onClick={() => setSelectedFarm(null)} className="p-2 hover:bg-surface-2 rounded-full text-text-muted hover:text-text-main transition-colors cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center text-2xl font-bold text-text-muted">
                                        {selectedFarm.farmerName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-main">{selectedFarm.farmerName}</h3>
                                        <p className="text-sm text-text-muted">{selectedFarm.phone.replace(/(\d{5})$/, 'XXXX$1').slice(0, 8)}XXXX</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className="bg-surface-2 p-3 rounded-xl border border-border">
                                        <span className="block text-xs text-text-muted mb-1">Location</span>
                                        <span className="text-sm font-medium text-text-main">{selectedFarm.village}, {selectedFarm.district}</span>
                                    </div>
                                    <div className="bg-surface-2 p-3 rounded-xl border border-border">
                                        <span className="block text-xs text-text-muted mb-1">Farm Size</span>
                                        <span className="text-sm font-medium text-text-main">{selectedFarm.sizeAcres} Acres</span>
                                    </div>
                                    <div className="bg-surface-2 p-3 rounded-xl border border-border">
                                        <span className="block text-xs text-text-muted mb-1">Crop & Stage</span>
                                        <span className="text-sm font-medium text-text-main">{selectedFarm.cropType} • {selectedFarm.stage}</span>
                                    </div>
                                    <div className="bg-surface-2 p-3 rounded-xl border border-border">
                                        <span className="block text-xs text-text-muted mb-1">Irrigation</span>
                                        <span className="text-sm font-medium text-text-main">{selectedFarm.irrigationSource}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Score */}
                            <div className="bg-surface-2 p-6 rounded-[12px] border border-border mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-text-main">Current Risk Score</h4>
                                        <div className="group relative flex items-center z-10">
                                            <Info size={16} className="text-text-muted hover:text-text-main cursor-help transition-colors" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 bg-surface-1 border border-border shadow-2xl rounded-lg p-3 z-50">
                                                <p className="text-xs text-text-main leading-relaxed">
                                                    Score is {selectedFarm.riskScore} because {selectedFarm.ndviBaselineDiff < 0 ? `NDVI is ${Math.abs(selectedFarm.ndviBaselineDiff)}% below baseline` : 'NDVI is tracking normally'}, combined with {selectedFarm.rainfall14Days < 20 ? 'sub-optimal' : 'adequate'} recent rainfall ({selectedFarm.rainfall14Days}mm) and a temperature anomaly of {selectedFarm.tempAnomaly > 0 ? '+' : ''}{selectedFarm.tempAnomaly}°C.
                                                </p>
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-1 border-b border-r border-border transform rotate-45"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${selectedFarm.riskScore > 65 ? 'bg-[#EF4444] text-white' :
                                        selectedFarm.riskScore > 40 ? 'bg-[#F59E0B] text-white' :
                                            'bg-[#22C55E] text-white'
                                        }`}>
                                        {selectedFarm.riskScore}/100
                                    </span>
                                </div>

                                {/* Horizontal Risk Bar */}
                                <div className="h-2 w-full bg-border rounded-full overflow-hidden mb-6">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${selectedFarm.riskScore}%`,
                                            backgroundColor: selectedFarm.riskScore > 65 ? '#EF4444' : selectedFarm.riskScore > 40 ? '#F59E0B' : '#22C55E'
                                        }}
                                    />
                                </div>

                                {/* 8-Week Trend Sparkline */}
                                {selectedFarm.riskHistory && (
                                    <div className="mb-6 bg-surface-1 p-4 rounded-xl border border-border">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">8-Week Trend</span>
                                        </div>
                                        <div className="h-12 w-full relative">
                                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                                <polyline
                                                    fill="none"
                                                    stroke={selectedFarm.riskScore > 65 ? '#EF4444' : selectedFarm.riskScore > 40 ? '#F59E0B' : '#22C55E'}
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                    points={selectedFarm.riskHistory.map((val, i, arr) => `${(i / (arr.length - 1)) * 100},${100 - val}`).join(' ')}
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-muted">Water Stress Probability</span>
                                        <span className="text-text-main font-medium">{selectedFarm.stressProbabilities.water}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-muted">Nutrient Deficiency</span>
                                        <span className="text-text-main font-medium">{selectedFarm.stressProbabilities.nutrient}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-muted">Pest Risk</span>
                                        <span className="text-text-main font-medium">{selectedFarm.stressProbabilities.pest}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Satellite Metrics */}
                            <div className="mb-8">
                                <h4 className="font-semibold text-text-main mb-4">Satellite Signals</h4>
                                <div className="space-y-3">
                                    <div className="bg-surface-2 border border-border p-4 rounded-[12px] flex items-center justify-between">
                                        <div>
                                            <p className="text-text-muted text-xs">NDVI vs Baseline</p>
                                            <p className={`text-sm font-medium mt-1 ${selectedFarm.ndviBaselineDiff < -10 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                                                {selectedFarm.ndviBaselineDiff}% {selectedFarm.ndviBaselineDiff < 0 ? 'below' : 'above'} expected
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="bg-surface-2 border border-border p-4 rounded-[12px] flex-1">
                                            <p className="text-text-muted text-xs">Rainfall (14d)</p>
                                            <p className="text-text-main text-sm font-medium mt-1">{selectedFarm.rainfall14Days} mm</p>
                                        </div>
                                        <div className="bg-surface-2 border border-border p-4 rounded-[12px] flex-1">
                                            <p className="text-text-muted text-xs">Temp Anomaly</p>
                                            <p className={`text-sm font-medium mt-1 ${selectedFarm.tempAnomaly > 1.5 ? 'text-[#EF4444]' : 'text-text-main'}`}>
                                                {selectedFarm.tempAnomaly > 0 ? '+' : ''}{selectedFarm.tempAnomaly}°C
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Photo Analysis */}
                            {selectedFarm.riskScore > 65 && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-text-main mb-4">Satellite Validation Result</h4>
                                    
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    
                                    {uploadedImage ? (
                                        <div className="bg-surface-2 border border-[#22C55E]/20 rounded-[12px] p-1 overflow-hidden relative">
                                            <div 
                                                className="h-48 bg-cover bg-center rounded-lg relative"
                                                style={{ backgroundImage: `url(${uploadedImage})` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4">
                                                    {isAnalyzing ? (
                                                        <div className="flex items-center gap-2 text-white">
                                                            <Loader2 className="animate-spin text-[#22C55E]" size={16} />
                                                            <span className="text-sm">Running PlantVillage Model...</span>
                                                        </div>
                                                    ) : analysisResult ? (
                                                        <div className="text-white text-xs space-y-1.5 w-full">
                                                            {analysisResult.error ? (
                                                                <p className="font-semibold text-[#EF4444]">Validation Failed: {analysisResult.error}</p>
                                                            ) : (
                                                                <>
                                                                    <div className="flex justify-between items-center w-full mb-1">
                                                                        <p className="font-bold text-[#22C55E] text-sm uppercase tracking-wide">Validation Complete</p>
                                                                        <span className={`px-2 py-0.5 rounded font-bold ${analysisResult.is_healthy ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                                                                            {analysisResult.is_healthy ? 'Healthy' : analysisResult.stress_type.toUpperCase().replace('_', ' ')}
                                                                        </span>
                                                                    </div>
                                                                    <div className="bg-black/40 p-2 rounded backdrop-blur-sm border border-white/10">
                                                                        <p><span className="text-white/60">Detection:</span> {analysisResult.detected_condition}</p>
                                                                        <p><span className="text-white/60">Crop:</span> {analysisResult.crop_detected}</p>
                                                                        <p><span className="text-white/60">Confidence:</span> {analysisResult.confidence}%</p>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => { setUploadedImage(null); setAnalysisResult(null); }}
                                                className="absolute top-2 right-2 bg-black/60 hover:bg-black p-1.5 rounded-full text-white backdrop-blur-sm transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-surface-2 border border-border border-dashed hover:border-[#22C55E]/50 rounded-[12px] flex flex-col items-center justify-center h-40 text-center px-6 transition-colors cursor-pointer group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-surface-1 group-hover:bg-[#22C55E]/10 flex items-center justify-center mb-3 transition-colors">
                                                <Upload size={18} className="text-text-muted group-hover:text-[#22C55E] transition-colors" />
                                            </div>
                                            <p className="text-sm font-medium text-text-main mb-1">Upload crop photo for satellite validation</p>
                                            <p className="text-xs text-text-muted mb-4">Uses HuggingFace PlantVillage model</p>
                                            <span className="text-xs font-medium bg-text-main text-background px-4 py-2 rounded-lg group-hover:opacity-80 transition-colors">
                                                Select Image
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
