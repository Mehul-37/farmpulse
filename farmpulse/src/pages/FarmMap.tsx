import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockFarms } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

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
    const [cropFilter, setCropFilter] = useState<string>('All');
    const [riskFilter, setRiskFilter] = useState<string>('All');
    const [districtFilter, setDistrictFilter] = useState<string>('All');

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

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 relative bg-background">
            {/* Map Container */}
            <div className="flex-1 w-full bg-surface-2 z-0">
                <MapContainer
                    center={[29.0, 76.5]} // Center approx India Punjab/UP region
                    zoom={6}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    zoomControl={false}
                >
                    <TileLayer
                        key={theme} // Force re-render of TileLayer when theme changes
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url={tileUrl}
                    />
                    {filteredFarms.map(farm => (
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
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Floating Controls Top Left */}
            <div className="absolute top-6 left-6 z-[400] bg-surface-1/90 backdrop-blur-md border border-border rounded-[12px] p-4 shadow-xl flex gap-4 pointer-events-auto">
                <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Crop Type</label>
                    <select
                        value={cropFilter}
                        onChange={e => setCropFilter(e.target.value)}
                        className="bg-surface-2 border border-border text-sm rounded-lg px-3 py-1.5 text-text-main outline-none focus:border-gray-500"
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
                        className="bg-surface-2 border border-border text-sm rounded-lg px-3 py-1.5 text-text-main outline-none focus:border-gray-500"
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
                        className="bg-surface-2 border border-border text-sm rounded-lg px-3 py-1.5 text-text-main outline-none focus:border-gray-500"
                    >
                        <option value="All">All Districts</option>
                        {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Floating Legend Top Right */}
            <div className="absolute top-6 right-6 z-[400] bg-surface-1/90 backdrop-blur-md border border-border rounded-[12px] p-4 shadow-xl pointer-events-auto">
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

            {/* Bottom Stats Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-[400] bg-surface-1 border-t border-border p-3 pointer-events-auto flex items-center justify-center">
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
