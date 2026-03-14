import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Users, Activity, Bell, FileBarChart, Smartphone, Sprout, Moon, Sun, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navigation = [
    { name: 'Overview', to: '/overview', icon: LayoutDashboard },
    { name: 'Farm Map', to: '/map', icon: Map },
    { name: 'Farm Profiles', to: '/profiles', icon: Users },
    { name: 'Risk Analysis', to: '/risk', icon: Activity },
    { name: 'Alerts & Advisories', to: '/alerts', icon: Bell },
    { name: 'Disease Vision AI', to: '/vision', icon: Camera },
    { name: 'Institutional Report', to: '/report', icon: FileBarChart },
    { name: 'Farmer Simulator', to: '/simulator', icon: Smartphone },
];

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="w-64 bg-surface-1 border-r border-border h-full flex flex-col">
            <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30 text-primary">
                    <Sprout size={20} />
                </div>
                <span className="font-semibold text-lg text-text-main tracking-tight">FarmPulse AI</span>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }: { isActive: boolean }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-surface-2 text-text-main'
                                : 'text-text-muted hover:bg-surface-2/50 hover:text-text-main'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border space-y-3">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-2/50 hover:text-text-main transition-colors border border-transparent hover:border-border"
                >
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                </button>

                <div className="bg-surface-2 rounded-xl p-3 border border-border">
                    <p className="text-xs text-text-muted mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </span>
                        <span className="text-sm font-medium text-text-main">System Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
