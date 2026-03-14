import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex h-screen w-full bg-background text-text-main overflow-hidden font-sans">
            <div className="print:hidden">
                <Sidebar />
            </div>
            <main className="flex-1 flex flex-col h-full overflow-y-auto relative border-l border-border print:border-none print:overflow-visible">
                <Outlet />
            </main>
        </div>
    );
}
