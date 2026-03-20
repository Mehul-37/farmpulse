import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockFarms } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

const createLiveIcon = () => {
    const html = `
    <div class="relative flex h-6 w-6 items-center justify-center">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
    </div>
  `;
    return L.divIcon({
        html,
        className: 'custom-leaflet-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

const createCustomIcon = (riskScore: number) => {
    let color = '#22C55E';
    if (riskScore > 40 && riskScore <= 65) color = '#F59E0B';
    else if (riskScore > 65) color = '#EF4444';

    const html = `
    <div style="
      background-color: ${color};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 10px ${color}80;
    "></div>
  `;

    return L.divIcon({
        html,
        className: 'custom-leaflet-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -8]
    });
};

export default function FarmMap() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [mapMode, setMapMode] = useState<'risk' | 'live'>('risk');
    const [cropFilter, setCropFilter] = useState<string>('All');
    const [riskFilter, setRiskFilter] = useState<string>('All');
    const [districtFilter, setDistrictFilter] = useState<string>('All');
    
    // Live Mode State
    const [liveNdvi, setLiveNdvi] = useState<number | null>(null);
    const [liveNdviLoading, setLiveNdviLoading] = useState(false);

    const runSatelliteScan = async () => {
        setLiveNdviLoading(true);
        try {
            const response = await fetch('http://localhost:8000/satellite/29.6857/76.9905');
            const data = await response.json();
            if (data && data.ndvi !== undefined) {
                 setLiveNdvi(data.ndvi);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLiveNdviLoading(false);
        }
    };

    // Auto-run scan when switching to live mode for the first time
    useEffect(() => {
        if (mapMode === 'live' && liveNdvi === null) {
            runSatelliteScan();
        }
    }, [mapMode, liveNdvi]);

    const filteredFarms = mockFarms.filter(f => {
        if (cropFilter !== 'All' && f.cropType !== cropFilter) return false;
        if (riskFilter !== 'All') {
            if (riskFilter === 'Low' && f.riskScore > 40) return false;
            if (riskFilter === 'Moderate' && (f.riskScore <= 40 || f.riskScore > 65)) return false;
            if (riskFilter === 'High' && f.riskScore <= 65) return false;
        }
        if (districtFilter !== 'All' && f.district !== districtFilter) return false;
        return true;
    });

    const highCount = filteredFarms.filter(f => f.riskScore > 65).length;
    const modCount = filteredFarms.filter(f => f.riskScore > 40 && f.riskScore <= 65).length;
    const lowCount = filteredFarms.filter(f => f.riskScore <= 40).length;

    const districts = Array.from(new Set(mockFarms.map(f => f.district)));

    // Select map tiles based on the current theme
    const tileUrl = theme === 'dark'
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    const mapCenter = mapMode === 'live' ? [29.6857, 76.9905] as [number, number] : [29.0, 76.5] as [number, number];
    const mapZoom = mapMode === 'live' ? 14 : 6;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 relative bg-background">
            {/* Map Container */}
            <div className="flex-1 w-full bg-surface-2 z-0">
                <MapContainer
                    key={`${theme}-${mapMode}`} // Force remount on theme or mode change
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url={tileUrl}
                    />
                    {mapMode === 'risk' && filteredFarms.map(farm => (
                        <Marker
                            key={farm.id}
                            position={farm.coordinates}
                            icon={createCustomIcon(farm.riskScore)}
                        >
                            <Popup className="farmpulse-popup">
                                <div className="p-1 space-y-2">
                                    <div>
                                        <h3 className="font-semibold text-[15px]">{farm.farmerName}</h3>
                                        <p className="text-xs text-gray-500">{farm.village}, {farm.district}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mt-2 pt-2 border-t border-gray-100">
                                        <div>
                                            <span className="block text-xs text-gray-400">Crop</span>
                                            <span className="font-medium text-gray-700">{farm.cropType}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Risk Score</span>
                                            <span className={`font-medium ${farm.riskScore > 65 ? 'text-red-600' : farm.riskScore > 40 ? 'text-amber-500' : 'text-green-600'}`}>{farm.riskScore}/100</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="block text-xs text-gray-400">Primary Stress</span>
                                            <span className="font-medium text-gray-700">{farm.primaryStress}</span>
                                        </div>
                                        {farm.lastAlertDate && (
                                            <div className="col-span-2">
                                                <span className="block text-xs text-gray-400">Last Alert</span>
                                                <span className="font-medium text-gray-700">{new Date(farm.lastAlertDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/profiles?id=${farm.id}`)}
                                        className="w-full mt-3 py-1.5 bg-surface-2 hover:bg-border border border-border text-text-main rounded text-xs font-medium transition-colors cursor-pointer"
                                    >
                                        View Full Profile
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    
                    {mapMode === 'live' && (
                        <Marker
                            position={[29.6857, 76.9905]}
                            icon={createLiveIcon()}
                        >
                            <Popup className="farmpulse-popup">
                                <div className="p-2 space-y-3 min-w-[220px]">
                                    <div className="flex items-center justify-between border-b border-border pb-2">
                                        <div>
                                            <h3 className="font-semibold text-[15px] flex items-center gap-1.5">
                                               🌾 Karnal Wheat Farm 
                                            </h3>
                                            <p className="text-xs text-text-muted mt-0.5">Nilokheri, Karnal</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                            🛰️ LIVE
                                        </span>
                                    </div>
                                    
                                    <div className="bg-surface-2 p-3 rounded-lg border border-border flex flex-col items-center justify-center min-h-[80px]">
                                        <div className="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">Current NDVI</div>
                                        {liveNdviLoading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                                <span className="text-xs text-primary animate-pulse font-medium">Scanning GEE...</span>
                                            </div>
                                        ) : liveNdvi !== null ? (
                                            <div className="flex items-end gap-2">
                                                <span className="text-4xl font-black text-green-500 drop-shadow-sm">{liveNdvi.toFixed(2)}</span>
                                                <span className="text-xs text-green-600/70 dark:text-green-400/70 font-medium mb-1.5 bg-green-500/10 px-1.5 py-0.5 rounded">Healthy</span>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-text-muted italic text-center px-2">Click below to fetch latest satellite data</div>
                                        )}
                                    </div>

                                    <button
                                        onClick={runSatelliteScan}
                                        disabled={liveNdviLoading}
                                        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        {liveNdviLoading ? (
                                            <>Processing...</>
                                        ) : (
                                            <>🛰️ Run Satellite Scan</>
                                        )}
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            const karnalFarm = mockFarms.find(f => f.district === 'Karnal') || mockFarms[0];
                                            navigate(`/profiles?id=${karnalFarm.id}`);
                                        }}
                                        className="w-full py-1.5 bg-surface-2 hover:bg-border border border-border text-text-main rounded text-xs font-medium transition-colors cursor-pointer"
                                    >
                                        View Full Profile
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {/* Floating Controls Top Left - Mode Toggle & Filters */}
            <div className="absolute top-6 left-6 z-[400] flex flex-col gap-3 pointer-events-auto">
                {/* Map Mode Toggle */}
                <div className="bg-surface-1/90 backdrop-blur-md border border-border rounded-[12px] p-1.5 shadow-xl flex items-center w-max">
                    <button 
                      onClick={() => setMapMode('risk')}
                      className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 ${mapMode === 'risk' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main hover:bg-surface-2'}`}
                    >
                      Regional Risk Map
                    </button>
                    <button 
                      onClick={() => setMapMode('live')}
                      className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 flex items-center gap-2 ${mapMode === 'live' ? 'bg-green-600 text-white shadow-md' : 'text-text-muted hover:text-text-main hover:bg-surface-2'}`}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Live NDVI Scan
                    </button>
                </div>

                {/* Filters (Only in Risk Mode) */}
                {mapMode === 'risk' && (
                    <div className="bg-surface-1/90 backdrop-blur-md border border-border rounded-[12px] p-4 shadow-xl flex gap-4 animate-in slide-in-from-top-2">
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1">Crop Type</label>
                            <select
                                value={cropFilter}
                                onChange={e => setCropFilter(e.target.value)}
                                className="bg-surface-2 border border-border text-sm rounded-lg px-3 py-1.5 text-text-main outline-none focus:border-gray-500 min-w-[120px]"
                            >
                                <option value="All">All Crops</option>
                                <option value="Wheat">Wheat</option>
                                <option value="Rice">Rice</option>
                                <option value="Cotton">Cotton</option>
                                <option value="Sugarcane">Sugarcane</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1">Risk Level</label>
                            <select
                                value={riskFilter}
                                onChange={e => setRiskFilter(e.target.value)}
                                className="bg-surface-2 border border-border text-sm rounded-lg px-3 py-1.5 text-text-main outline-none focus:border-gray-500 min-w-[120px]"
                            >
                                <option value="All">All Levels</option>
                                <option value="Low">Low (0-40)</option>
                                <option value="Moderate">Moderate (41-65)</option>
                                <option value="High">High (66-100)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1">District</label>
                            <select
                                value={districtFilter}
                                onChange={e => setDistrictFilter(e.target.value)}
                                className="bg-surface-2 border border-border text-sm rounded-lg px-3 py-1.5 text-text-main outline-none focus:border-gray-500 min-w-[120px]"
                            >
                                <option value="All">All Districts</option>
                                {districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Legend Top Right */}
            {mapMode === 'risk' && (
                <div className="absolute top-6 right-6 z-[400] bg-surface-1/90 backdrop-blur-md border border-border rounded-[12px] p-4 shadow-xl pointer-events-auto animate-in fade-in">
                    <h4 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Risk Level</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#EF4444] border border-white dark:border-transparent"></div>
                            <span className="text-sm text-text-main">High (66-100)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#F59E0B] border border-white dark:border-transparent"></div>
                            <span className="text-sm text-text-main">Moderate (41-65)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#22C55E] border border-white dark:border-transparent"></div>
                            <span className="text-sm text-text-main">Low (0-40)</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Stats Bar */}
            {mapMode === 'risk' ? (
                <div className="absolute bottom-0 left-0 right-0 z-[400] bg-surface-1 border-t border-border p-3 pointer-events-auto flex items-center justify-center animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-6 text-sm text-text-muted">
                        <span className="font-medium text-text-main">Showing {filteredFarms.length} farms</span>
                        <span className="h-4 w-px bg-border"></span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
                            <span>{highCount} high risk</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                            <span>{modCount} moderate</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
                            <span>{lowCount} low</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="absolute bottom-0 left-0 right-0 z-[400] bg-surface-1 border-t border-border p-3 pointer-events-auto flex items-center justify-center animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="font-medium text-text-main">Live Sentinel-2 Connection Active</span>
                        <span className="text-text-muted text-xs">| Point: 29.6857°N, 76.9905°E (Karnal, Haryana)</span>
                    </div>
                </div>
            )}

            {/* Global CSS overrides for Leaflet Popup to match dark theme */}
            <style>{`
        .farmpulse-popup .leaflet-popup-content-wrapper {
          background-color: var(--surface-1);
          color: var(--text-main);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .farmpulse-popup .leaflet-popup-tip {
          background-color: var(--surface-1);
        }
      `}</style>
        </div>
    );
}
