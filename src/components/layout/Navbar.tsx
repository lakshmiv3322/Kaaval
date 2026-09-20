import React from 'react';
import { Shield, Radio, LayoutGrid, Smartphone, AlertOctagon, FileCheck2, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  activeRiskScore?: number;
  hasActiveAlert?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  activeRiskScore = 0,
  hasActiveAlert = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E293B]/70 bg-[#0B0F14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 group text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B8FFF] to-[#ff5005] p-[1.5px] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0B0F14] rounded-[7px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#5B8FFF] group-hover:text-white transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white font-sans">
                Kaaval
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 text-[#5B8FFF] font-mono font-medium">
                v1.0 SHIELD
              </span>
            </div>
            <p className="text-[10px] text-[#9CA3AF] font-mono leading-none -mt-0.5 hidden sm:block">
              Digital Arrest Scam Interceptor
            </p>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121821]/80 border border-[#1E293B] rounded-full px-2 py-1">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRoute === '/'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/demo/elder')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRoute === '/demo/elder'
                ? 'bg-[#5B8FFF] text-white shadow-sm shadow-[#5B8FFF]/30'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Elder Screen
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/demo/family')}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRoute === '/demo/family'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#5B8FFF]" />
            Family Dashboard
            {hasActiveAlert && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 right-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/demo/evidence/call-1049')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRoute.startsWith('/demo/evidence')
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Evidence Pack
          </button>
        </nav>

        {/* Right Action: Split Screen Demo for Judges */}
        <div className="flex items-center gap-2.5">
          {activeRiskScore > 50 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-mono">
              <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
              <span>Risk: {activeRiskScore}%</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigate('/demo/split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
              currentRoute === '/demo/split'
                ? 'bg-[#ff5005] border-[#ff5005] text-white shadow-md shadow-[#ff5005]/20'
                : 'bg-[#121821] hover:bg-[#1A222F] border-[#1E293B] text-white'
            }`}
            title="Open side-by-side Elder + Family view for live presentation"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#5B8FFF]" />
            <span className="hidden sm:inline">Split Judge View</span>
            <span className="sm:hidden">Split</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/demo/elder')}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#5B8FFF] hover:bg-[#4A7CEB] text-white text-xs font-semibold shadow-md shadow-[#5B8FFF]/20 transition-all active:scale-95"
          >
            <span>Live Demo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
