import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, PhoneOff, Mic, Volume2, Users, AlertTriangle } from 'lucide-react';

interface PhoneMockupProps {
  onRiskUpdate?: (risk: number) => void;
  isHeroLoop?: boolean;
  manualStep?: number; // For step-driven display in Section 2
  className?: string;
  staticAlert?: boolean; // For reduced motion
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  onRiskUpdate,
  isHeroLoop = true,
  manualStep,
  className = '',
  staticAlert = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Loop timeline state
  const [loopTime, setLoopTime] = useState(0);

  // IntersectionObserver to pause loop when off-screen
  useEffect(() => {
    if (!isHeroLoop || staticAlert) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isHeroLoop, staticAlert]);

  // 18s loop tick
  useEffect(() => {
    if (!isHeroLoop || staticAlert || !isVisible) return;

    const interval = setInterval(() => {
      setLoopTime((prev) => (prev >= 18 ? 0 : prev + 0.25));
    }, 250);

    return () => clearInterval(interval);
  }, [isHeroLoop, staticAlert, isVisible]);

  // Determine active state from manualStep OR loopTime
  let currentSec = loopTime;
  if (staticAlert) {
    currentSec = 14; // Final alert frame
  } else if (manualStep !== undefined) {
    // Map step 1..5 to specific seconds
    const stepSeconds = [0, 1.5, 4.5, 8.5, 12.5, 15];
    currentSec = stepSeconds[manualStep] ?? 1.5;
  }

  // Calculate dynamic properties based on currentSec
  let riskScore = 10;
  let timerString = '00:03';
  let transcript = 'Connecting live acoustic stream...';
  let tactics: string[] = [];
  let showRedBanner = false;
  let showFamilyJoin = false;

  if (currentSec < 2) {
    riskScore = 10;
    timerString = '00:02';
    transcript = 'Incoming line connected. Kaaval is analyzing speech patterns...';
  } else if (currentSec < 6) {
    // Authority phase
    const progress = (currentSec - 2) / 4;
    riskScore = Math.round(10 + progress * (28 - 10));
    timerString = `00:${String(Math.floor(2 + progress * 6)).padStart(2, '0')}`;
    transcript = 'Inspector Ramesh Rathore from Crime Branch Mumbai Headquarters.';
    tactics = ['Authority claim'];
  } else if (currentSec < 10) {
    // Urgency phase
    const progress = (currentSec - 6) / 4;
    riskScore = Math.round(28 + progress * (58 - 28));
    timerString = `00:${String(Math.floor(8 + progress * 11)).padStart(2, '0')}`;
    transcript = 'An arrest warrant is issued in your name under Section 420.';
    tactics = ['Authority claim', 'Arrest threat'];
  } else {
    // Digital arrest & secrecy phase (up to 18s)
    const progress = Math.min(1, (currentSec - 10) / 3);
    riskScore = Math.round(58 + progress * (92 - 58));
    timerString = '00:32';
    transcript = 'You are placed under Digital Arrest. Turn on video call immediately. Do not tell your family.';
    tactics = ['Authority claim', 'Arrest threat', 'Secrecy demand'];
    showRedBanner = true;
    showFamilyJoin = currentSec >= 12;
  }

  // Notify parent of risk change for shader sync
  useEffect(() => {
    if (onRiskUpdate) {
      onRiskUpdate(riskScore);
    }
  }, [riskScore, onRiskUpdate]);

  // Color mapping
  const riskColor =
    riskScore > 65 ? '#EF4444' : riskScore > 30 ? '#F59E0B' : '#22C55E';
  const riskLabel =
    riskScore > 65 ? 'High Alert' : riskScore > 30 ? 'Suspicious' : 'Safe';

  // SVG ring math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div
      ref={containerRef}
      className={`relative w-[300px] h-[620px] rounded-[48px] p-[10px] bg-[#161C24] border border-[#2A3442] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] select-none shrink-0 ${className}`}
    >
      {/* Outer Phone Bezel & Screen Inner */}
      <div className="w-full h-full rounded-[38px] bg-[#0B0F14] border border-[#1E2530] flex flex-col justify-between relative overflow-hidden text-[#E5E7EB] p-4 font-sans">
        
        {/* Dynamic Island Pill */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />
        </div>

        {/* Top Call Header */}
        <div className="pt-6 text-center space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#11161D] border border-[#1E293B] text-[10px] font-mono text-[#9CA3AF]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: riskColor }} />
            <span>INCOMING CALL</span>
          </div>
          <h4 className="text-base font-bold text-white tracking-tight mt-1">
            Unknown Caller
          </h4>
          <p className="text-xs font-mono text-[#9CA3AF]">+91 98201 44521</p>
          <p className="text-xs font-mono font-medium" style={{ color: riskColor }}>
            {timerString}
          </p>
        </div>

        {/* Center: Live Circular Risk Ring + Status */}
        <div className="relative my-auto flex flex-col items-center justify-center py-2 z-10">
          {/* Subtle glow behind ring */}
          <div
            className="absolute w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: riskColor }}
          />

          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-[#1E293B]"
                strokeWidth="7"
                fill="none"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={riskColor}
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset,
                  transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease',
                }}
              />
            </svg>

            {/* Score in Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-mono font-bold text-white tracking-tight">
                {riskScore}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#9CA3AF] -mt-1">
                Risk
              </span>
            </div>
          </div>

          <span
            className="mt-2 text-xs font-medium px-2 py-0.5 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: `${riskColor}18`,
              color: riskColor,
              border: `1px solid ${riskColor}40`,
            }}
          >
            {riskLabel}
          </span>

          {/* Tactic Chips Container */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-[240px] min-h-[46px]">
            <AnimatePresence>
              {tactics.map((tac) => (
                <motion.span
                  key={tac}
                  initial={{ opacity: 0, scale: 0.85, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.25 }}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#161E28] border border-[#2C3847] text-[#CBD5E1]"
                >
                  ⚠️ {tac}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Transcript Snippet */}
        <div className="z-10 bg-[#11161D]/90 border border-[#1E293B] rounded-xl p-2.5 text-left mb-2 backdrop-blur-sm min-h-[58px] flex items-center">
          <p className="text-[11px] text-[#CBD5E1] line-clamp-2 leading-relaxed italic">
            &ldquo;{transcript}&rdquo;
          </p>
        </div>

        {/* Slidedown Banners (Alert & Family Bridge) */}
        <AnimatePresence>
          {showRedBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="z-20 bg-red-600/90 text-white border border-red-400/40 rounded-xl p-2 mb-2 text-center shadow-lg"
            >
              <div className="flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-[11px] font-bold">This may be a scam call</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFamilyJoin && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="z-20 bg-[#162232] text-white border border-[#5B8FFF]/50 rounded-xl p-2 mb-2 flex items-center gap-2 shadow-xl"
            >
              <div className="w-6 h-6 rounded-full bg-[#5B8FFF] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                R
              </div>
              <div className="text-left text-[11px] leading-tight flex-1">
                <p className="font-semibold text-white">Rahul (Son)</p>
                <p className="text-[10px] text-[#5B8FFF]">Joining call to protect you...</p>
              </div>
              <Users className="w-4 h-4 text-[#5B8FFF] animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Phone Action Controls */}
        <div className="pt-2 border-t border-[#1E293B]/70 flex items-center justify-around z-10">
          <div className="w-9 h-9 rounded-full bg-[#161E28] flex items-center justify-center text-[#9CA3AF]">
            <Mic className="w-4 h-4" />
          </div>
          <div className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-900/40 cursor-pointer">
            <PhoneOff className="w-5 h-5" />
          </div>
          <div className="w-9 h-9 rounded-full bg-[#161E28] flex items-center justify-center text-[#9CA3AF]">
            <Volume2 className="w-4 h-4" />
          </div>
        </div>

        {/* Home Bar Indicator */}
        <div className="w-24 h-1 bg-white/20 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
};
