import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, CheckCircle2, Activity, Leaf, ShieldAlert } from 'lucide-react';

export default function VisionAI() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const analyzeImage = async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedImage);

        try {
            const response = await fetch('http://localhost:8000/analyze-photo', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to analyze image');
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred while analyzing the image.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-main flex items-center gap-2">
                    <ScanLine size={24} className="text-primary" />
                    Crop Disease Detection AI
                </h1>
                <p className="text-text-muted text-sm mt-1">
                    Upload a photo of a crop leaf to identify diseases and nutrient deficiencies in real-time.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                
                {/* Upload Section */}
                <div className="bg-surface-1 rounded-xl border border-border p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-text-main mb-4">Input Image</h2>
                    
                    {!selectedImage ? (
                        <div 
                            className="border-2 border-dashed border-border rounded-xl h-[300px] flex flex-col items-center justify-center bg-surface-2/50 hover:bg-surface-2 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageSelect} 
                                accept="image/*" 
                                className="hidden" 
                            />
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-text-main font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-text-muted text-sm">SVG, PNG, JPG or GIF (max. 5MB)</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden border border-border h-[300px] bg-black/5 flex items-center justify-center">
                                <img src={imagePreview!} alt="Selected crop" className="max-h-full max-w-full object-contain" />
                                <button 
                                    onClick={() => { setSelectedImage(null); setImagePreview(null); setResult(null); }}
                                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-text-main p-1.5 rounded-lg hover:bg-background transition-colors border border-border/50 text-xs font-medium"
                                >
                                    Change Image
                                </button>
                            </div>
                            
                            <button
                                onClick={analyzeImage}
                                disabled={isAnalyzing}
                                className={`w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors ${
                                    isAnalyzing ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
                                }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing Models...
                                    </>
                                ) : (
                                    <>
                                        <ScanLine size={18} />
                                        Run Disease Detection
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="bg-surface-1 rounded-xl border border-border shadow-sm flex flex-col min-h-[400px]">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-text-main">AI Analysis Results</h2>
                        <p className="text-sm text-text-muted mt-1">MobileNetV2 classification engine</p>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                        {error ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                                <AlertCircle size={40} className="text-red-500 mb-3" />
                                <p className="text-red-500 font-medium">Analysis Failed</p>
                                <p className="text-red-500/80 text-sm mt-1">{error}</p>
                            </div>
                        ) : result ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                
                                <div className={`p-5 rounded-xl border flex items-start gap-4 ${
                                    result.is_healthy 
                                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                                        : 'bg-rose-500/10 border-rose-500/20'
                                }`}>
                                    <div className={`p-2 rounded-lg ${
                                        result.is_healthy ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                                    }`}>
                                        {result.is_healthy ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${result.is_healthy ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {result.detected_condition}
                                        </h3>
                                        <p className="text-sm text-text-muted mt-0.5">
                                            {result.is_healthy 
                                                ? 'No significant diseases or nutritional deficiencies detected.' 
                                                : 'Critical attention required to prevent yield loss.'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-surface-2 p-4 rounded-xl border border-border">
                                        <div className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <Activity size={14} /> Confidence Score
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-bold text-text-main">{result.confidence}%</span>
                                        </div>
                                        <div className="w-full bg-border h-1.5 rounded-full mt-3 overflow-hidden">
                                            <div 
                                                className="h-full bg-primary" 
                                                style={{ width: `${result.confidence}%` }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-surface-2 p-4 rounded-xl border border-border">
                                        <div className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <ShieldAlert size={14} /> Stress Category
                                        </div>
                                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm font-medium border capitalize bg-orange-500/10 text-orange-500 border-orange-500/20 mt-1">
                                            {result.stress_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-surface-2 p-4 rounded-xl border border-border col-span-2">
                                         <div className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <Leaf size={14} /> Crop Detected
                                        </div>
                                        <p className="text-lg font-medium text-text-main capitalize">{result.crop_detected}</p>
                                    </div>
                                </div>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <div>
                                    <p className="text-text-main font-medium">Processing Image...</p>
                                    <p className="text-text-muted text-sm mt-1">Extracting features and classifying disease</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text-muted shrink-0 min-h-[300px]">
                                <ImageIcon size={48} className="mb-4 opacity-20" />
                                <p className="font-medium">No Image Analyzed</p>
                                <p className="text-sm mt-1 max-w-[250px] mx-auto">Upload an image on the left to see the AI inference results here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple icon for scan line
function ScanLine({ size = 24, className = "" }: { size?: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" x2="17" y1="12" y2="12" />
        </svg>
    )
}
