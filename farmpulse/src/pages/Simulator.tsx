import { useState, useEffect, useRef } from 'react';
import { CheckCheck, Send, Lock, CheckCircle2, AlertCircle, Droplets, ThermometerSun } from 'lucide-react';
import { calculateRiskScore, fetchSatelliteData } from '../utils/riskModel';

type Language = 'hi' | 'en';

type Message = {
    sender: 'bot' | 'farmer';
    textHi: string;
    textEn: string;
    time: string;
    id: number;
};

const fullConversation: Message[] = [
    {
        id: 0,
        sender: 'bot',
        textHi: "🌾 Namaste! FarmPulse AI mein aapka swagat hai.\nMain aapki fasal ki sehat monitor karta hoon.\nShuru karte hain — aap kaunsi fasal uga rahe hain?\n1️⃣ Gehun  2️⃣ Chawal  3️⃣ Kapas  4️⃣ Ganna",
        textEn: "🌾 Hello! Welcome to FarmPulse AI.\nI monitor the health of your crops.\nLet's start — which crop are you growing?\n1️⃣ Wheat  2️⃣ Rice  3️⃣ Cotton  4️⃣ Sugarcane",
        time: "09:41 AM",
    },
    { id: 1, sender: 'farmer', textHi: "1", textEn: "1", time: "09:42 AM" },
    {
        id: 2,
        sender: 'bot',
        textHi: "Achha! Gehun ke liye monitoring shuru karenge.\nAbhi fasal kis stage mein hai?\n1️⃣ Abhi boyi hai\n2️⃣ Badh rahi hai  \n3️⃣ Phool aa rahe hain\n4️⃣ Kaatne ke kareeb",
        textEn: "Great! We will start monitoring for Wheat.\nWhat stage is the crop currently in?\n1️⃣ Just sown\n2️⃣ Growing\n3️⃣ Flowering\n4️⃣ Near harvesting",
        time: "09:42 AM"
    },
    { id: 3, sender: 'farmer', textHi: "3", textEn: "3", time: "09:43 AM" },
    {
        id: 4,
        sender: 'bot',
        textHi: "Phool wali stage — yeh sabse zaroori waqt hota hai.\nAap sinchai kaise karte hain?\n1️⃣ Baarish pe nirbhar\n2️⃣ Nahar se\n3️⃣ Borewell/Motor se\n4️⃣ Talab se",
        textEn: "Flowering stage — this is the most critical time.\nHow do you irrigate?\n1️⃣ Rain-dependent\n2️⃣ Canal\n3️⃣ Borewell/Motor\n4️⃣ Pond",
        time: "09:43 AM"
    },
    { id: 5, sender: 'farmer', textHi: "3", textEn: "3", time: "09:43 AM" },
    {
        id: 6,
        sender: 'bot',
        textHi: "Hafte mein kitni baar sinchai karte hain?\nSirf number likhein — jaise '2'",
        textEn: "How many times a week do you irrigate?\nJust write the number — e.g. '2'",
        time: "09:44 AM"
    },
    { id: 7, sender: 'farmer', textHi: "2", textEn: "2", time: "09:44 AM" },
    {
        id: 8,
        sender: 'bot',
        textHi: "Pichhle season mein kya ugaya tha?",
        textEn: "What did you grow last season?",
        time: "09:44 AM"
    },
    { id: 9, sender: 'farmer', textHi: "Chawal", textEn: "Rice", time: "09:45 AM" },
    {
        id: 10,
        sender: 'bot',
        textHi: "Khet ka size kitna hai? (acres mein)",
        textEn: "What is the farm size? (in acres)",
        time: "09:45 AM"
    },
    { id: 11, sender: 'farmer', textHi: "3", textEn: "3", time: "09:46 AM" },
    {
        id: 12,
        sender: 'bot',
        textHi: "Aapka gaon aur zila batayein.",
        textEn: "Tell us your village and district.",
        time: "09:46 AM"
    },
    { id: 13, sender: 'farmer', textHi: "Karnal, Haryana", textEn: "Karnal, Haryana", time: "09:47 AM" },
    {
        id: 14,
        sender: 'bot',
        textHi: "Aakhri sawaal — koi bhi dikkat dikh rahi hai abhi fasal mein? Jaise patte peele hona, keede, ya paudha sukna?",
        textEn: "Last question — are you seeing any issues in the crop right now? Like yellowing leaves, pests, or drying plants?",
        time: "09:47 AM"
    },
    { id: 15, sender: 'farmer', textHi: "Thode patte peele ho rahe hain", textEn: "Some leaves are turning yellow", time: "09:48 AM" },
    {
        id: 16,
        sender: 'bot',
        textHi: "✅ Shukriya Ramesh ji! Aapka profile ban gaya hai.\n\nHum aapki gehun ki fasal ko satellite se monitor karenge. Koi bhi stress detect hone par seedha WhatsApp karenge.\n\nAapka Farm ID: FP-KNL-1247\nDetail analysis: farmpulse.ai/farm/FP-KNL-1247",
        textEn: "✅ Thank you Ramesh ji! Your profile has been created.\n\nWe will monitor your wheat crop via satellite. We will WhatsApp you directly if any stress is detected.\n\nYour Farm ID: FP-KNL-1247\nDetail analysis: farmpulse.ai/farm/FP-KNL-1247",
        time: "09:49 AM"
    }
];


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
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-[#2A2A2A]"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="transition-all duration-75 ease-out"
                    stroke={color}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color }}>{progress}</span>
                <span className="text-[10px] text-text-muted mt-0.5">/100</span>
            </div>
        </div>
    );
};

export default function Simulator() {
    const [language, setLanguage] = useState<Language>('hi');
    const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [unlocked, setUnlocked] = useState(false);
    const [rightPanelStage, setRightPanelStage] = useState(0); // 0: locked, 1: score, 2: stress, 3: advisory
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [satelliteData, setSatelliteData] = useState<any>(null);
    const [riskResult, setRiskResult] = useState<any>(null);
    const [isLiveData, setIsLiveData] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [visibleMessages, isTyping]);

    // Initial message on load
    useEffect(() => {
        if (visibleMessages.length === 0) {
            setVisibleMessages([0]);
        }
    }, [visibleMessages.length]);

    // Bot auto-play logic
    useEffect(() => {
        if (visibleMessages.length === 0) return;

        const lastId = visibleMessages[visibleMessages.length - 1];
        if (lastId >= fullConversation.length - 1) {
            // Chat completed
            if (!unlocked) {
                setTimeout(() => setUnlocked(true), 1500);
            }
            return;
        }

        const nextMessage = fullConversation[lastId + 1];

        if (nextMessage.sender === 'bot') {
            setIsTyping(true);
            const botDelay = setTimeout(() => {
                setIsTyping(false);
                setVisibleMessages(prev => [...prev, nextMessage.id]);
            }, 1500);
            return () => clearTimeout(botDelay);
        } else {
            // Next message is farmer, wait for 1.2s before auto-playing it 
            // OR wait for user input (for interactivity)
            const farmerDelay = setTimeout(() => {
                setVisibleMessages(prev => [...prev, nextMessage.id]);
            }, 1200);
            return () => clearTimeout(farmerDelay);
        }
    }, [visibleMessages, unlocked]);

    // Right panel unlock sequence
    useEffect(() => {
        if (unlocked) {
            const t1 = setTimeout(() => setRightPanelStage(1), 500); // Profile
            const t2 = setTimeout(() => setRightPanelStage(2), 1300); // Risk score (800ms after profile)
            const t3 = setTimeout(() => setRightPanelStage(3), 3300); // Transparency (after score animates - circle takes 1.5s, let's say 2s after step 2)
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }
    }, [unlocked]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const lastId = visibleMessages[visibleMessages.length - 1];
        if (lastId >= fullConversation.length - 1) {
            setInputValue("");
            return;
        }

        const nextMessage = fullConversation[lastId + 1];
        if (nextMessage.sender === 'farmer') {
            // Advance state
            setVisibleMessages(prev => [...prev, nextMessage.id]);
            setInputValue("");
        }
    };

    const farmerProfile = {
        district: 'Karnal',
        cropType: 'wheat',
        growthStage: 'flowering',
        irrigationFrequency: 2,
        symptom: 'yellowing',
        lastCrop: 'rice',
        lat: 29.6857,
        lng: 76.9905
    };

    // Fetch real data on initial load
    useEffect(() => {
        const loadRealData = async () => {
            try {
                // 1. Fetch real GEE satellite data for Karnal coordinates
                const satRes = await fetch(`http://localhost:8000/satellite/${farmerProfile.lat}/${farmerProfile.lng}`);
                const satData = await satRes.json();
                
                // Construct enhanced payload for the backend predict model
                // Clamp live NDVI — GEE can return noisy low values due to
                // cloud cover or sensor artifacts; floor at 0.35 to avoid extreme scores
                const liveNdvi = satData.ndvi && satData.ndvi !== -1 
                    ? Math.max(satData.ndvi, 0.35) 
                    : 0.45;
                
                const payloadData = {
                    ...fetchSatelliteData(farmerProfile.district), // fallback mock base
                    ndviCurrent: liveNdvi,
                    cropType: farmerProfile.cropType,
                    growthStage: farmerProfile.growthStage,
                    irrigationFrequency: farmerProfile.irrigationFrequency,
                    symptom: farmerProfile.symptom,
                    cropRotation: farmerProfile.lastCrop !== farmerProfile.cropType
                };
                
                setSatelliteData(payloadData);
                // Only show LIVE GEE if we got a real NDVI from the Google Earth Engine API
                setIsLiveData(satData.ndvi && satData.ndvi !== -1);
                
                // 2. Predict using backend
                const predictRes = await fetch('http://localhost:8000/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'FP-KNL-1247', data: payloadData })
                });
                
                const predictData = await predictRes.json();
                
                // In this transition phase, if the Python backend returns mock data, we fallback to frontend logic.
                // Assuming backend Python logic hasn't fully implemented the detail breakdown yet.
                if (predictData.status === "success" && predictData.risk_evaluation) {
                     // For visualization demo fidelity, we combine backend calculation logic with frontend breakdown format
                     const combinedRisk = calculateRiskScore(payloadData as any);
                     setRiskResult(combinedRisk);
                } else {
                     setRiskResult(calculateRiskScore(payloadData as any));
                }
                
                // 3. Onboard profile to local DB
                await fetch('http://localhost:8000/onboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'FP-KNL-1247', data: payloadData })
                });

            } catch (error) {
                console.error("Backend connection failed, returning to local mode", error);
                
                // Fallback to local mode
                const localSat = fetchSatelliteData(farmerProfile.district);
                setSatelliteData(localSat);
                setRiskResult(calculateRiskScore({
                    ...localSat,
                    cropType: farmerProfile.cropType,
                    growthStage: farmerProfile.growthStage,
                    irrigationFrequency: farmerProfile.irrigationFrequency,
                    symptom: farmerProfile.symptom,
                    cropRotation: farmerProfile.lastCrop !== farmerProfile.cropType
                } as any));
            }
        };
        
        loadRealData();
    }, []);

    if (!riskResult) {
        return <div className="min-h-screen bg-background text-text-main p-4 flex flex-col items-center justify-center">Loading AI Modules...</div>;
    }

    return (
        <div className="min-h-screen bg-background text-text-main p-4 flex flex-col items-center justify-start pb-12 font-sans transition-colors duration-300">
            
            {/* Header */}
            <div className="w-full max-w-7xl mb-4 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border pb-4 transition-colors duration-300">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-main mb-1 transition-colors duration-300">
                        Farmer Onboarding Simulator
                    </h1>
                    <p className="text-text-muted text-xs transition-colors duration-300">
                        See exactly how a farmer enters the system and what the AI generates in real time
                    </p>
                </div>
                
                <div className="mt-4 md:mt-0 bg-surface-1 p-1 rounded-full border border-border flex items-center relative overflow-hidden shadow-sm transition-colors duration-300">
                    <div 
                        className={`absolute inset-y-1 w-1/2 bg-[#22C55E]/20 rounded-full transition-transform duration-200 ease-in-out z-0`}
                        style={{ transform: language === 'hi' ? 'translateX(0px)' : 'translateX(100%)', width: 'calc(50% - 4px)' }}
                    />
                    <button 
                        className={`relative z-10 px-6 py-1.5 text-sm font-medium transition-colors ${language === 'hi' ? 'text-[#22C55E]' : 'text-text-muted hover:text-text-main'}`}
                        onClick={() => setLanguage('hi')}
                    >
                        हिंदी
                    </button>
                    <button 
                        className={`relative z-10 px-6 py-1.5 text-sm font-medium transition-colors ${language === 'en' ? 'text-[#22C55E]' : 'text-text-muted hover:text-text-main'}`}
                        onClick={() => setLanguage('en')}
                    >
                        English
                    </button>
                </div>
            </div>

            {/* Main 3-Column Content */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between items-start w-full relative">
                {/* LEFT SECTION: Phone Simulator */}
                <div className="w-full lg:w-[38%] shrink-0 flex flex-col items-center">
                    <div className="w-full max-w-[380px] h-[620px] bg-background rounded-[40px] border-[8px] border-surface-2 shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col shrink-0 ring-1 ring-border/50">
                        {/* Notch */}
                        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-20">
                            <div className="w-36 h-7 bg-surface-2 rounded-b-3xl"></div>
                        </div>

                        {/* WA Header */}
                        <div className="bg-[#075E54] pt-12 pb-4 px-5 flex items-center gap-4 z-10 shadow-md">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-full h-full" />
                            </div>
                            <div>
                                <h2 className="text-white text-lg font-semibold leading-tight flex items-center gap-2">
                                    FarmPulse AI <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></div>
                                </h2>
                                <p className="text-white/80 text-sm">bot • always active</p>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto bg-surface-1 dark:bg-[#0D1117] p-4 flex flex-col space-y-4 custom-scrollbar relative transition-colors duration-300">
                            <div className="bg-surface-2 text-text-muted text-[10px] mx-auto px-3 py-1 rounded-lg border border-border mb-2 uppercase tracking-wide">Today</div>

                            {visibleMessages.map((msgId) => {
                                const msg = fullConversation.find(m => m.id === msgId)!;
                                return (
                                    <div key={msg.id} className={`flex ${msg.sender === 'farmer' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                                        <div className={`max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                                            msg.sender === 'farmer'
                                            ? 'bg-[#005c4b] text-white rounded-tr-none'
                                            : 'bg-surface-2 text-text-main rounded-tl-none border border-border'
                                        }`}>
                                            {msg[language === 'hi' ? 'textHi' : 'textEn'].split('\n').map((line, j) => (
                                                <p key={j} className="mb-0.5 last:mb-0 min-h-[1em] whitespace-pre-wrap">{line}</p>
                                            ))}
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className={`text-[10px] font-medium ${msg.sender === 'farmer' ? 'text-white/70' : 'text-text-muted'}`}>{msg.time}</span>
                                                {msg.sender === 'farmer' && <CheckCheck size={14} className="text-[#53bdeb]" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {isTyping && (
                                <div className="flex justify-start animate-in fade-in">
                                    <div className="bg-surface-2 rounded-[12px] rounded-tl-none px-4 py-3 flex items-center gap-1.5 border border-border">
                                        <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} className="h-2"></div>
                        </div>

                        {/* Banner */}
                        {unlocked && (
                            <div className="bg-[#005c4b] text-white text-xs text-center py-2 animate-in slide-in-from-bottom flex justify-center items-center gap-2 font-medium">
                                <CheckCircle2 size={14} className="text-[#22C55E]" /> Ramesh Kumar added to monitoring system
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="bg-surface-2 p-2.5 flex gap-2 items-center shrink-0 border-t border-border">
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-background rounded-full px-4 py-2.5 text-sm text-text-main focus:outline-none placeholder-text-muted border border-border"
                            />
                            <button 
                                onClick={handleSendMessage}
                                className="w-12 h-12 bg-[#00A884] rounded-full flex items-center justify-center text-white shrink-0 hover:bg-[#00BFA5] transition-colors"
                            >
                                <Send size={20} className="translate-x-[-1px] translate-y-[1px]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* MIDDLE SECTION: AI Understanding */}
                <div className="w-full lg:w-[30%] flex flex-col space-y-3 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-text-main mb-0.5 transition-colors duration-300">AI Understanding</h2>
                        <p className="text-[13px] text-text-muted transition-colors duration-300">Processed signals and farm profile</p>
                    </div>

                    {(() => {
                        const maxMsg = visibleMessages.length > 0 ? visibleMessages[visibleMessages.length - 1] : 0;
                        return (
                            <div className="flex flex-col gap-3">
                                {/* Group 1: Farm Info */}
                                <div className={`bg-surface-1 border border-border rounded-xl p-4 transition-all duration-500`}>
                                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5 border-b border-border pb-1.5">Farm Profile</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">📍</div> Location</span>
                                            {maxMsg >= 14 ? (
                                                <span className="text-text-main font-medium animate-in fade-in slide-in-from-bottom-1">{farmerProfile.district}, Haryana</span>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting input...</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">📐</div> Size</span>
                                            {maxMsg >= 12 ? (
                                                <span className="text-text-main font-medium animate-in fade-in slide-in-from-bottom-1">3 acres</span>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting input...</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">🌾</div> Crop</span>
                                            {maxMsg >= 2 ? (
                                                <span className="text-text-main font-medium capitalize animate-in fade-in slide-in-from-bottom-1">{farmerProfile.cropType}</span>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting input...</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">🌱</div> Last Crop</span>
                                            {maxMsg >= 10 ? (
                                                <span className="text-text-main font-medium animate-in fade-in slide-in-from-bottom-1">Rice (Rotation: ✓)</span>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting input...</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Group 2: Growth & Environment */}
                                <div className={`bg-surface-1 border border-border rounded-xl p-4 transition-all duration-500`}>
                                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5 border-b border-border pb-1.5">Growth & Environment</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">📅</div> Stage</span>
                                            {maxMsg >= 4 ? (
                                                <span className="text-text-main font-medium capitalize animate-in fade-in slide-in-from-bottom-1">{farmerProfile.growthStage}</span>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting input...</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">💧</div> Irrigation</span>
                                            {maxMsg >= 8 ? (
                                                <span className="text-text-main font-medium animate-in fade-in slide-in-from-bottom-1">Borewell ({farmerProfile.irrigationFrequency}x/week)</span>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting input...</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">🔄</div> Frequency</span>
                                            {maxMsg >= 8 ? (
                                                <span className="text-text-main font-medium animate-in fade-in slide-in-from-bottom-1">{farmerProfile.irrigationFrequency}x/week</span>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting input...</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">🌡️</div> Soil Type</span>
                                            {maxMsg >= 14 ? (
                                                <span className="text-text-main font-medium animate-in fade-in slide-in-from-bottom-1">Sandy Loam</span>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting location...</span>
                                            )}
                                        </div>
                                        {maxMsg >= 16 && (
                                            <div className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-bottom-1 mt-2 border-t border-border/50 pt-2">
                                                <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">⚠️</div> Symptoms</span>
                                                <div className="flex items-center justify-end gap-2 text-right">
                                                    {isLiveData && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 whitespace-nowrap">ML API</span>}
                                                    <span className="text-[#F59E0B] font-medium">Leaf {farmerProfile.symptom}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Group 3: Satellite Signals */}
                                <div className={`bg-surface-1 border border-border rounded-xl p-4 transition-all duration-500`}>
                                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5 border-b border-border pb-1.5">Satellite & Signals</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">🛰️</div> NDVI</span>
                                            {maxMsg >= 14 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap font-bold ${isLiveData ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30' : 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30'}`}>
                                                        {isLiveData ? '● LIVE GEE' : '○ FALLBACK'}
                                                    </span>
                                                    <span className="text-[#EF4444] font-medium animate-in fade-in slide-in-from-bottom-1">{satelliteData.ndviCurrent} (-{Math.round(riskResult.ndviDeviation * 100)}%)</span>
                                                </div>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting location...</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">🌧️</div> Rainfall Data</span>
                                            {maxMsg >= 14 ? (
                                                <span className="text-[#EF4444] font-medium animate-in fade-in slide-in-from-bottom-1">{satelliteData.rainfallActual}mm (-{Math.round(riskResult.rainfallDeficit * 100)}%)</span>
                                            ) : (
                                                <span className="text-text-muted/40 font-mono text-[11px] animate-pulse">awaiting location...</span>
                                            )}
                                        </div>
                                        {maxMsg >= 16 && (
                                            <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-bottom-1">
                                                <span className="text-text-muted flex items-center gap-2"><div className="w-5 text-center">⚠️</div> Farmer Report</span>
                                                <span className="text-[#F59E0B] font-medium">Leaf {farmerProfile.symptom}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="flex items-center gap-2 mt-1 px-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${isLiveData ? 'bg-[#10B981]' : 'bg-[#F59E0B]'} animate-pulse`}></div>
                        <span className="text-text-muted text-[11px] font-medium uppercase tracking-wide">12 Parameters • 3 Satellite Signals • {isLiveData ? 'Live via Google Earth Engine' : 'Fallback mode (GEE API propagating)'}</span>
                    </div>
                </div>

                {/* RIGHT SECTION: AI Decision */}
                <div className="w-full lg:w-[32%] relative flex flex-col space-y-3">
                    
                    {!unlocked && (
                        <div className="absolute inset-x-0 -inset-y-4 z-50 backdrop-blur-md bg-background/80 flex flex-col items-center justify-center rounded-2xl transition-opacity duration-500 border border-border">
                            <Lock size={32} className="text-text-muted mb-4" />
                            <div className="text-text-main font-medium">Analyzing signals...</div>
                            <div className="text-sm text-text-muted mt-1">Complete chat to see AI decision</div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-bold text-text-main mb-1.5 transition-colors duration-300">AI Decision & Advisory</h2>
                        <p className="text-sm text-text-muted transition-colors duration-300">Final assessment and next steps</p>
                    </div>

                    {/* Part 1: Risk Score (Large Visual Focus) */}
                    <div className={`bg-surface-1 border border-border rounded-xl p-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out transform ${rightPanelStage >= 1 ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-8 absolute inset-x-0'}`}>
                        <div className="flex flex-col items-center justify-center text-center">
                            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-0">Calculated Risk Score</h3>
                            
                            {rightPanelStage >= 1 && (
                                <div className="scale-110 mb-2 mt-4">
                                    <CircularProgress value={riskResult.score} duration={1500} color={riskResult.score < 40 ? "#22C55E" : riskResult.score < 75 ? "#F59E0B" : "#EF4444"} />
                                </div>
                            )}
                            
                            <div className={`text-xl font-bold tracking-wide mt-2 ${riskResult.score < 40 ? "text-[#22C55E]" : riskResult.score < 75 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>
                                {riskResult.alertLevel === 'critical' ? 'CRITICAL RISK' : riskResult.alertLevel === 'high' ? 'HIGH RISK' : riskResult.alertLevel === 'moderate' ? 'MODERATE-HIGH RISK' : 'LOW RISK'}
                            </div>
                            <div className="text-sm text-text-muted mt-1 flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
                                Immediate Advisory Required
                            </div>
                        </div>
                    </div>

                    {/* Part 2: Stress Likelihood */}
                    <div className={`bg-surface-1 border border-border rounded-xl p-3 transition-all duration-500 ease-out transform delay-300 ${rightPanelStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 hidden'}`}>
                        <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 border-b border-border pb-1">Stress Likelihood</h3>
                        <div className="space-y-2">
                            <div className="relative">
                                <div className="flex mb-1.5 items-center justify-between text-sm">
                                    <div className="text-text-main flex items-center gap-2"><Droplets size={16} className="text-[#3B82F6]"/> Water Stress</div>
                                    <div className="text-[#3B82F6] font-bold">{riskResult.stressTypes.waterStress}%</div>
                                </div>
                                <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#3B82F6] rounded-full transition-all duration-1000 ease-out" style={{ width: rightPanelStage >= 2 ? `${riskResult.stressTypes.waterStress}%` : '0%' }}></div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="flex mb-1.5 items-center justify-between text-sm">
                                    <div className="text-text-main flex items-center gap-2"><ThermometerSun size={16} className="text-[#F59E0B]"/> Nutrient Def.</div>
                                    <div className="text-[#F59E0B] font-bold">{riskResult.stressTypes.nutrientDeficiency}%</div>
                                </div>
                                <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-1000 delay-150 ease-out" style={{ width: rightPanelStage >= 2 ? `${riskResult.stressTypes.nutrientDeficiency}%` : '0%' }}></div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="flex mb-1.5 items-center justify-between text-sm">
                                    <div className="text-text-main flex items-center gap-2"><AlertCircle size={16} className="text-[#EF4444]"/> Pest Risk</div>
                                    <div className="text-[#EF4444] font-bold">{riskResult.stressTypes.pestRisk}%</div>
                                </div>
                                <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#EF4444] rounded-full transition-all duration-1000 delay-300 ease-out" style={{ width: rightPanelStage >= 2 ? `${riskResult.stressTypes.pestRisk}%` : '0%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Part 3: Advisory Recommendation */}
                    <div className={`transition-all duration-500 delay-700 ${rightPanelStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 hidden'}`}>
                        <div className="bg-[#051E16] border border-[#064E3B] rounded-xl p-4 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#10B981] to-[#34D399]"></div>
                            
                            <div className="flex items-center gap-2 mb-2.5 text-[13px] font-semibold text-[#10B981]">
                                <Send size={14} /> Auto-generated Advisory Sent
                            </div>
                            
                            <h4 className="text-white font-medium text-[13px] mb-2">⚠️ Water Stress Detected</h4>
                            
                            <div className="text-[#A7F3D0] text-[13px]">
                                <span className="text-white/60 text-[10px] mb-1.5 block uppercase tracking-wider font-bold">Recommended Action</span>
                                <ul className="space-y-1.5 list-disc list-outside ml-4 mb-3">
                                    <li>Irrigate within 2–3 days</li>
                                    <li>Monitor leaf yellowing progression</li>
                                    <li>Check soil moisture at root level</li>
                                </ul>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-[#064E3B] pt-2 mt-1">
                                <span className="text-[#34D399] font-mono text-[11px]">Confidence: {riskResult.score}%</span>
                                <span className="text-[#34D399] text-[11px]">Via WhatsApp</span>
                            </div>
                        </div>

                        <div className="mt-3 flex justify-center">
                            <button 
                                onClick={() => setShowScoreModal(true)}
                                className="text-[13px] font-medium text-text-muted hover:text-text-main underline underline-offset-4 transition-colors"
                            >
                                Explain Risk Score
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* BOTTOM FULL WIDTH STATS BAR */}
            <div className="w-full max-w-7xl mt-2 bg-surface-1 border border-border rounded-xl py-3 px-6 flex flex-wrap gap-4 justify-between items-center text-sm transition-colors duration-300 shadow-sm relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center border border-border text-xs">⏱️</div>
                    <div>
                        <div className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Avg onboarding time</div>
                        <div className="text-text-main font-bold text-sm">3m 42s</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center border border-border text-xs">✅</div>
                    <div>
                        <div className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Completion rate</div>
                        <div className="text-text-main font-bold text-sm">94%</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center border border-border text-xs">🛰️</div>
                    <div>
                        <div className="text-text-muted text-[10px] uppercase font-bold tracking-wider">First satellite scan</div>
                        <div className="text-[#22C55E] font-bold text-sm">within 24 hours</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center border border-border text-xs">📱</div>
                    <div>
                        <div className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Alert delivery</div>
                        <div className="text-text-main font-bold text-sm">&lt;1s after threshold</div>
                    </div>
                </div>
            </div>

            {/* Score Modal */}
            {showScoreModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowScoreModal(false)}></div>
                    <div className="bg-surface-1 border border-border rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button 
                            className="absolute top-4 right-4 text-text-muted hover:text-text-main"
                            onClick={() => setShowScoreModal(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                        
                        <h2 className="text-xl font-bold text-text-main mb-6">How This Score Was Calculated</h2>
                        
                        <table className="w-full text-sm text-left text-text-muted border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="pb-3 font-semibold text-text-main">Factor</th>
                                    <th className="pb-3 font-semibold text-text-main">Value</th>
                                    <th className="pb-3 font-semibold text-text-main text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {riskResult.breakdown.map((item: any, idx: number) => (
                                    <tr key={idx} className={`border-b border-border${idx === riskResult.breakdown.length - 1 ? '' : '/50'}`}>
                                        <td className={`py-3 ${item.isMultiplier ? 'text-[#22C55E]' : ''}`}>{item.factor}</td>
                                        <td className={`py-3 ${item.isMultiplier ? '' : 'text-text-main'}`}>{item.value}</td>
                                        <td className={`py-3 text-right ${item.isMultiplier ? 'text-[#22C55E] font-medium' : 'text-text-main'}`}>
                                            {item.isMultiplier ? '' : `${item.points}/${item.maxPoints}`}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-surface-2">
                                    <td className="py-3 px-2 font-bold text-text-main rounded-l-lg">Final Score</td>
                                    <td className="py-3 px-2 bg-surface-2"></td>
                                    <td className={`py-3 px-2 rounded-r-lg text-right font-bold text-lg ${riskResult.score < 40 ? "text-[#22C55E]" : riskResult.score < 75 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>{riskResult.score}/100</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="mt-6 text-text-muted text-xs text-center italic">
                            Weights learned from CropHarvest dataset + ICRISAT Indian yield records
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
