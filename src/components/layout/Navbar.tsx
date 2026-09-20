import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, Cpu, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  activeRiskScore?: number;
  hasActiveAlert?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [systemMode, setSystemMode] = useState<'live-hybrid' | 'simulation'>('simulation');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    api.getSystemStatus().then((res) => {
      if (mounted) {
        setSystemMode(res.mode);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const isLanding = currentRoute === '/';
  const showBackground = !isLanding || isScrolled;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    if (!isLanding) {
      onNavigate('/');
      setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        showBackground
          ? 'bg-[#0B0F14]/85 backdrop-blur-md border-b border-[#1E293B]/70 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Wordmark Left */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 group text-left cursor-pointer min-h-[44px] min-w-[44px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14] active:scale-[0.98] transition-transform"
          aria-label="Kaaval Home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#5B8FFF]/15 border border-[#5B8FFF]/40 flex items-center justify-center text-[#5B8FFF] group-hover:bg-[#5B8FFF]/25 transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white font-sans">
            Kaaval
          </span>
        </button>

        {/* 3 Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a
            href="#how-it-works"
            onClick={(e) => handleAnchorClick(e, '#how-it-works')}
            className="text-[#9CA3AF] hover:text-white transition-colors min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FFF] rounded-md px-1"
          >
            How it works
          </a>
          <a
            href="#for-families"
            onClick={(e) => handleAnchorClick(e, '#for-families')}
            className="text-[#9CA3AF] hover:text-white transition-colors min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FFF] rounded-md px-1"
          >
            For families
          </a>
          <a
            href="#for-banks"
            onClick={(e) => handleAnchorClick(e, '#for-banks')}
            className="text-[#9CA3AF] hover:text-white transition-colors min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FFF] rounded-md px-1"
          >
            For banks
          </a>
          <button
            type="button"
            onClick={() => onNavigate('/how-it-deploys')}
            className={`transition-colors min-h-[44px] inline-flex items-center px-1 text-sm font-medium ${
              currentRoute === '/how-it-deploys' ? 'text-[#5B8FFF]' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Deployment
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/privacy')}
            className={`transition-colors min-h-[44px] inline-flex items-center px-1 text-sm font-medium ${
              currentRoute === '/privacy' ? 'text-[#5B8FFF]' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/demo/eval')}
            className={`transition-colors min-h-[44px] inline-flex items-center px-1 text-sm font-medium ${
              currentRoute === '/demo/eval' ? 'text-[#5B8FFF]' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Benchmark
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/demo/judge')}
            className={`transition-colors min-h-[44px] inline-flex items-center px-1 text-sm font-medium ${
              currentRoute === '/demo/judge' ? 'text-[#5B8FFF]' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Judge Bench
          </button>
        </nav>

        {/* Primary Action Button: Live Demo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Mode Badge for Judges */}
          <div
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#11161D] border border-[#1E293B] text-[11px] font-mono text-[#9CA3AF]"
            title={
              systemMode === 'live-hybrid'
                ? 'Hybrid Mode: Gemini 3.8 Flash + Live Rule Engine'
                : 'Simulation Mode: Offline-ready. Real Rule Engine (<1ms) & PII Redaction. Telecom & Gemini simulated.'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                systemMode === 'live-hybrid' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[#CBD5E1]">
              {systemMode === 'live-hybrid' ? 'Hybrid AI Active' : 'Simulation Mode'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/demo/split')}
            className="hidden sm:inline-flex min-h-[44px] px-3 py-2 rounded-xl bg-[#161F2E] hover:bg-[#1E293B] border border-[#1E293B] text-[#E5E7EB] text-xs sm:text-sm font-medium transition-all items-center gap-2 cursor-pointer"
          >
            <span>Split Demo</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/demo/elder')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#5B8FFF] hover:bg-[#487CE8] text-white text-xs sm:text-sm font-medium shadow-md shadow-[#5B8FFF]/20 transition-all flex items-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14] cursor-pointer"
          >
            <span>Live demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

