import React from 'react';
import { ShieldCheck, Mic } from 'lucide-react';

interface FooterProps {
  onNavigate?: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white/70 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>సహాయక్</span>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">VOICE FORM ASSISTANT</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                An educational demonstration. Not an official government portal. Nothing is submitted to any department, and no supporting document is verified automatically.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              Voice audio and text you enter are processed securely for real-time speech transcription and translation. You stay in control: answers stay in your local browser workspace and you can delete sessions at any time.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            Built for Telugu speakers across Telangana & Andhra Pradesh • Designed for accessibility.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate?.('settings')}
              className="hover:text-slate-700 transition-colors cursor-pointer"
            >
              Privacy & Settings
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="hover:text-slate-700 transition-colors cursor-pointer"
            >
              Device Workspace
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
