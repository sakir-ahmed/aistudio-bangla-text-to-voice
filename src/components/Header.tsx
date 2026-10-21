import React from 'react';
import { Volume2, Sparkles, Wand2, Mic } from 'lucide-react';

interface HeaderProps {
  activeTab: 'single' | 'dialogue';
  onTabChange: (tab: 'single' | 'dialogue') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-lg shadow-emerald-500/20 text-white font-bold">
            <Volume2 className="w-6 h-6 animate-pulse" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                ধ্বনি <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">Dhwani AI</span>
              </h1>
              <span className="text-xs text-slate-400 hidden sm:inline">• বাংলা টেক্সট টু অডিও স্টুডিও</span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>প্রাকৃতিক বাংলা কণ্ঠস্বর</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-emerald-400/90 font-medium">Gemini 3.8 Audio 24kHz</span>
            </p>
          </div>
        </div>

        {/* Studio Mode Selector */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-sm">
          <button
            onClick={() => onTabChange('single')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>একক কণ্ঠস্বর</span>
          </button>
          <button
            onClick={() => onTabChange('dialogue')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'dialogue'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>দ্বৈত কথপোকথন (সংলাপ)</span>
          </button>
        </div>

        {/* Quality Badges */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-300">
            <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>HD WAV ডাউনলোড</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>লাইভ স্টুডিও সক্রিয়</span>
          </div>
        </div>
      </div>
    </header>
  );
};
