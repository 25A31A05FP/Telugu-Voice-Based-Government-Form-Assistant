import React from 'react';
import { Mic, FileText, Settings, LayoutDashboard, Home, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  activeSessionId?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
            <Mic className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight flex items-center gap-1.5">
              <span>సహాయక్</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">తెలుగు</span>
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              VOICE FORM ASSISTANT
            </div>
          </div>
        </button>

        {/* Navigation items */}
        <nav aria-label="Main" className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1 rounded-full border border-stone-200/60">
          <button
            onClick={() => onNavigate('home')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentRoute === 'home'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentRoute === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('documents')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentRoute === 'documents'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentRoute === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('new')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all hover:shadow cursor-pointer"
          >
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>Start application</span>
          </button>
        </div>
      </div>
    </header>
  );
};
