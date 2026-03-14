import { Activity, Bell, Map as MapIcon, TriangleAlert, LucideIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { getDashboardKPIs, ndviTrendData, riskDistributionData, stressTypeData, mockAlerts } from '../data/mockData';
import { formatDistanceToNow } from 'date-fns';

export default function Overview() {
    const kpis = getDashboardKPIs();

    return (
        <div className="p-8 pb-20 max-w-[1600px] w-full mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-main flex items-center gap-2">
                        Overview Dashboard
                    </h1>
                    <p className="text-text-muted text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 text-sm bg-surface-2 border border-border px-4 py-2 rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-text-muted">Last satellite sync:</span>
                    <span className="text-text-main font-medium">2 hours ago</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Registered Farms" value={kpis.totalFarms} icon={MapIcon} />
                <KPICard title="High Risk Farms" value={kpis.highRiskFarms} icon={TriangleAlert} valueColor="text-[#EF4444]" bgIcon="bg-[#EF4444]/10" textIcon="text-[#EF4444]" borderIcon="border-[#EF4444]/20" />
                <KPICard title="Alerts Sent This Week" value={kpis.alertsSentThisWeek} icon={Bell} valueColor="text-[#F59E0B]" bgIcon="bg-[#F59E0B]/10" textIcon="text-[#F59E0B]" borderIcon="border-[#F59E0B]/20" />
                <KPICard title="Average Crop Health" value={`${kpis.avgCropHealth}/100`} icon={Activity} valueColor="text-[#22C55E]" bgIcon="bg-[#22C55E]/10" textIcon="text-[#22C55E]" borderIcon="border-[#22C55E]/20" />
            </div>

            <div className="grid lg:grid-cols-5 gap-6">

                {/* Left Column 60% */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Crop Health Trend */}
                    <div className="bg-surface-1 rounded-[12px] border border-border p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-text-main mb-6">Crop Health Trend (Average NDVI)</h2>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ndviTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                                    <XAxis dataKey="week" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis domain={[50, 100]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                                        itemStyle={{ color: '#22C55E' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#22C55E"
                                        strokeWidth={3}
                                        dot={{ fill: 'var(--surface-1)', stroke: '#22C55E', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#22C55E', stroke: 'var(--surface-1)', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Risk Distribution */}
                    <div className="bg-surface-1 rounded-[12px] border border-border p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-text-main mb-6">Risk Distribution This Week</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={riskDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--surface-2)', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {riskDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column 40% */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Active Alerts Feed */}
                    <div className="bg-surface-1 rounded-[12px] border border-border overflow-hidden flex flex-col shadow-sm max-h-[400px]">
                        <div className="p-5 border-b border-border">
                            <h2 className="text-base font-semibold text-text-main">Active Alerts</h2>
                        </div>
                        <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                            {mockAlerts.slice(0, 5).map((alert, i) => (
                                <div key={alert.id} className="flex gap-4 p-4 rounded-xl bg-surface-2 border border-border hover:border-gray-500 transition-colors relative overflow-hidden group">
                                    {i < 2 && (
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#F59E0B]/5 blur-xl group-hover:bg-[#F59E0B]/10 transition-colors"></div>
                                    )}
                                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${i < 2 ? 'bg-[#EF4444] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-[#F59E0B]'}`} />
                                    <div className="flex-1 space-y-1 z-10">
                                        <div className="flex items-start justify-between">
                                            <p className="text-sm font-medium text-text-main">{alert.farmerName}</p>
                                            <span className="text-[10px] text-text-muted mt-0.5">
                                                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted">{alert.village}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${alert.riskScore > 80 ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                                                }`}>
                                                Risk: {alert.riskScore}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-1 text-text-muted border border-border">
                                                {alert.stressType}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stress Type Breakdown */}
                    <div className="bg-surface-1 rounded-[12px] border border-border p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-text-main mb-2">Stress Type Breakdown</h2>
                        <div className="h-64 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                                        itemStyle={{ color: 'var(--text-main)' }}
                                    />
                                    <Pie
                                        data={stressTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stressTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                <span className="text-2xl font-bold text-text-main">100%</span>
                                <span className="text-xs text-text-muted">Analyzed</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-2">
                            {stressTypeData.map(item => (
                                <div key={item.name} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                    <span className="text-xs text-text-muted">{item.name} ({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

interface KPICardProps {
    title: string;
    value: React.ReactNode;
    icon: LucideIcon;
    valueColor?: string;
    bgIcon?: string;
    textIcon?: string;
    borderIcon?: string;
}

function KPICard({ title, value, icon: Icon, valueColor = "text-text-main", bgIcon = "bg-surface-2", textIcon = "text-text-muted", borderIcon = "border-border" }: KPICardProps) {
    return (
        <div className="bg-surface-1 rounded-[12px] p-5 border border-border shadow-sm flex flex-col relative overflow-hidden group hover:border-gray-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-text-muted">{title}</h3>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${bgIcon} ${textIcon} ${borderIcon}`}>
                    <Icon size={16} />
                </div>
            </div>
            <div className="mt-auto">
                <span className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</span>
            </div>
        </div>
    );
}
