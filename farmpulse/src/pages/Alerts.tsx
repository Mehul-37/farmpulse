import { useState } from 'react';
import { mockAlerts, mockFarms } from '../data/mockData';
import { CheckCheck, Check, Info, Send } from 'lucide-react';

export default function Alerts() {
    const [activeTab, setActiveTab] = useState<'sent' | 'pending'>('sent');

    const pendingFarms = mockFarms.filter(f => f.riskScore > 60 && !f.lastAlertDate).slice(0, 8);

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-text-main">Alerts & Advisories</h1>
                <p className="text-text-muted text-sm mt-1">Multi-channel communication with farmers</p>
            </div>

            <div className="flex space-x-1 bg-surface-2 p-1 rounded-xl w-max mb-8 border border-border">
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'sent'
                        ? 'bg-surface-1 text-text-main shadow-sm'
                        : 'text-text-muted hover:text-text-main'
                        }`}
                >
                    Sent Alerts History
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'pending'
                        ? 'bg-surface-1 text-text-main shadow-sm'
                        : 'text-text-muted hover:text-text-main'
                        }`}
                >
                    Pending Review
                    <span className="bg-[#EF4444] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {pendingFarms.length}
                    </span>
                </button>
            </div>

            {activeTab === 'sent' ? (
                <div className="space-y-6">
                    <div className="bg-surface-1 rounded-[12px] border border-border p-6 shadow-sm flex items-center justify-between text-center divide-x divide-border">
                        <div className="flex-1 px-4 text-left">
                            <span className="block text-3xl font-bold text-text-main mb-1">134</span>
                            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Alerts Sent This Mth</span>
                        </div>
                        <div className="flex-1 px-4">
                            <span className="block text-3xl font-bold text-text-main mb-1">89%</span>
                            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Delivery Rate</span>
                        </div>
                        <div className="flex-1 px-4">
                            <span className="block text-3xl font-bold text-text-main mb-1">67%</span>
                            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Read Rate</span>
                        </div>
                        <div className="flex-1 px-4 text-right">
                            <span className="block text-3xl font-bold text-[#22C55E] mb-1">41%</span>
                            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Acted Upon (Reported)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockAlerts.map((alert) => (
                            <div key={alert.id} className="bg-surface-1 border border-border p-4 rounded-[12px] shadow-sm hover:border-gray-500 transition-colors flex flex-col justify-between">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-text-main text-sm">{alert.farmerName}</h4>
                                        <p className="text-xs text-text-muted">{alert.village}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-text-muted whitespace-nowrap">
                                            {new Date(alert.timestamp).toLocaleDateString()}
                                        </span>
                                        <span className="text-[10px] text-text-muted whitespace-nowrap">
                                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-surface-2 border-l-2 border-[#10B981] p-3 text-xs text-text-main rounded-r-lg mb-4 italic">
                                    "{alert.message}"
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex gap-2 text-[10px] flex-wrap">
                                        <span className={`px-2 py-1 rounded bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 font-medium`}>Risk: {alert.riskScore}</span>
                                        <span className="px-2 py-1 rounded bg-surface-2 text-text-muted border border-border font-medium">{alert.stressType}</span>
                                    </div>
                                    <div className="flex items-center gap-1 pl-2 shrink-0">
                                        <span className={`text-[10px] font-medium hidden sm:inline-block ${alert.status === 'Read' ? 'text-[#3B82F6]' : alert.status === 'Delivered' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {alert.status}
                                        </span>
                                        {alert.status === 'Read' ? <CheckCheck size={14} className="text-[#3B82F6]" /> : <Check size={14} className={alert.status === 'Delivered' ? 'text-text-main' : 'text-text-muted'} />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-surface-1 rounded-[12px] border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-2 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Farmer & Location</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Risk Level</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Detection</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Reason for Hold</th>
                                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {pendingFarms.map(farm => (
                                <tr key={farm.id} className="hover:bg-surface-2 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-text-main">{farm.farmerName}</div>
                                        <div className="text-xs text-text-muted">{farm.village}, {farm.district}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${farm.riskScore > 80 ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F97316]/20 text-[#F97316]'
                                            }`}>
                                            Score: {farm.riskScore}/100
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-main">{farm.primaryStress}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded border border-[#F59E0B]/20 w-max">
                                            <Info size={12} />
                                            {Math.random() > 0.5 ? 'Awaiting second satellite pass' : 'Photo requested, not yet received'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="text-xs bg-transparent border border-border text-text-muted hover:text-text-main hover:bg-surface-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                                                Dismiss
                                            </button>
                                            <button className="text-xs bg-[#22C55E] hover:bg-[#16A34A] text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                                <Send size={12} /> Send Now
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
