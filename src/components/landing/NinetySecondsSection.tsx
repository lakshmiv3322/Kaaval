import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneMockup } from './PhoneMockup';
import {
  Users,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

export const NinetySecondsSection: React.FC = () => {
  // Active step index: 0, 1, 2, 3, 4
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = [
    {
      label: 'Call Inception',
      titlePrefix: 'The call',
      serifKey: 'comes in.',
      titleSuffix: '',
      description:
        'An unknown number rings your mother’s phone. The caller sounds calm, polite, and completely official.',
      stageRisk: 12,
      tactic: null,
      severityColor: 'text-[#9CA3AF]',
    },
    {
      label: 'Police Claim',
      titlePrefix: 'They claim to be',
      serifKey: 'police.',
      titleSuffix: '',
      description:
        'They cite badge numbers, Supreme Court orders, and CBI headquarters to engineer immediate psychological compliance.',
      stageRisk: 28,
      tactic: 'Authority claim',
      severityColor: 'text-amber-400',
    },
    {
      label: 'Legal Panic',
      titlePrefix: 'They make it feel',
      serifKey: 'urgent.',
      titleSuffix: '',
      description:
        'Fabricated legal notices under Money Laundering Act Section 420 trigger immediate panic and disorientation.',
      stageRisk: 58,
      tactic: 'Arrest threat',
      severityColor: 'text-orange-400',
    },
    {
      label: 'Secrecy Trap',
      titlePrefix: 'They say:',
      serifKey: 'tell no one.',
      titleSuffix: '',
      description:
        'The core coercion trap: ‘You are placed under Digital Arrest. Turn on Skype video now and do not alert your family.’',
      stageRisk: 92,
      tactic: 'Secrecy demand',
      severityColor: 'text-red-400',
    },
    {
      label: 'Family Bridge',
      titlePrefix: 'Kaaval',
      serifKey: 'breaks the silence.',
      titleSuffix: '',
      description:
        'Before intimidation turns into a bank transfer, Kaaval issues on-screen native language warnings and rings your phone with a one-tap join.',
      stageRisk: 92,
      tactic: 'Emergency Family Bridge',
      severityColor: 'text-emerald-400',
    },
  ];

  // Auto-play timer through stages
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  const handleStepSelect = (idx: number) => {
    setActiveStep(idx);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
    setIsPlaying(false);
  };

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
    setIsPlaying(false);
  };

  const isRedStage = activeStep === 3;
  const isBridgeStage = activeStep === 4;

  return (
    <section id="how-it-works" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11161D] border border-[#1E293B] text-xs font-mono text-[#5B8FFF] uppercase tracking-wider mb-4">
          Defensive Architecture
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight font-sans">
          The Ninety Seconds
        </h2>
        <p className="mt-3 text-[16px] sm:text-[17px] text-[#9CA3AF] leading-relaxed">
          How a digital arrest scam evolves, and how Kaaval intercepts it before funds leave the account.
        </p>
      </div>

      {/* Interactive Step Navigator */}
      <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#11161D]/80 border border-[#1E293B] p-2 sm:p-2.5 rounded-2xl backdrop-blur-sm">
        {/* Step Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {steps.map((st, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleStepSelect(idx)}
                className={`relative px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#5B8FFF] text-white shadow-md shadow-[#5B8FFF]/25'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-[#1E293B]/60'
                }`}
              >
                <span className={`font-mono text-[11px] ${isActive ? 'text-white/80' : 'text-[#64748B]'}`}>
                  0{idx + 1}
                </span>
                <span className="whitespace-nowrap">{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stepper Controls (Prev, Play/Pause, Next) */}
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous scenario step"
            className="p-2 rounded-lg bg-[#1E293B]/50 hover:bg-[#1E293B] text-[#CBD5E1] hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause progression' : 'Play progression'}
            className="px-2.5 py-2 rounded-lg bg-[#1E293B]/50 hover:bg-[#1E293B] text-[#CBD5E1] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Auto</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next scenario step"
            className="p-2 rounded-lg bg-[#1E293B]/50 hover:bg-[#1E293B] text-[#CBD5E1] hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        className={`relative rounded-3xl border transition-colors duration-700 p-6 sm:p-10 lg:p-12 overflow-hidden ${
          isRedStage
            ? 'bg-[#150D10] border-red-900/40'
            : isBridgeStage
            ? 'bg-[#0E1724] border-emerald-900/40'
            : 'bg-[#0E131A] border-[#1E293B]'
        }`}
      >
        {/* Subtle background glow */}
        {isRedStage && (
          <div className="pointer-events-none absolute inset-0 bg-red-600/10 animate-pulse" />
        )}
        {isBridgeStage && (
          <div className="pointer-events-none absolute inset-0 bg-emerald-500/5" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Big editorial storytelling sentence & explanation */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono text-[#5B8FFF]">
                SCENARIO PROGRESSION — 0{activeStep + 1} / 05
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E293B]" />
              <span className="text-xs font-mono text-[#9CA3AF]">
                {steps[activeStep].label}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={isRedStage ? 'animate-[shake_0.3s_ease-in-out]' : ''}
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-[1.2] font-sans min-h-[72px] sm:min-h-[88px] flex items-center">
                  <span>
                    {steps[activeStep].titlePrefix}{' '}
                    <span className="font-serif italic text-[#C7D7FF] font-normal">
                      {steps[activeStep].serifKey}
                    </span>{' '}
                    {steps[activeStep].titleSuffix}
                  </span>
                </h3>

                <p className="mt-4 text-[16px] sm:text-[17px] text-[#CBD5E1] leading-[1.6] max-w-[54ch]">
                  {steps[activeStep].description}
                </p>

                {/* Threat or Action Tactic Badge */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {steps[activeStep].tactic ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#11161D] border border-[#1E293B] text-xs font-medium text-[#CBD5E1]">
                      <span className={`w-2 h-2 rounded-full ${
                        activeStep === 4 ? 'bg-emerald-400' : 'bg-red-400'
                      }`} />
                      <span>{activeStep === 4 ? 'Intervention:' : 'Identified Threat:'} {steps[activeStep].tactic}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#11161D] border border-[#1E293B] text-xs font-medium text-[#9CA3AF]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Status: Call Initiated (Analyzing audio telemetry)</span>
                    </div>
                  )}

                  {/* Stage Jump Shortcuts */}
                  <div className="inline-flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <span>Risk:</span>
                    <span className={`font-mono font-bold ${steps[activeStep].severityColor}`}>
                      {steps[activeStep].stageRisk}/100
                    </span>
                  </div>
                </div>

                {/* Step navigation actions */}
                <div className="mt-8 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>{activeStep === steps.length - 1 ? 'Restart Scenario' : 'Next Stage'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {activeStep > 0 && (
                    <button
                      type="button"
                      onClick={() => handleStepSelect(0)}
                      className="px-3 py-2 rounded-xl text-xs text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Start over</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Phone(s) Display */}
          <div className="lg:col-span-5 flex justify-center items-center relative min-h-[520px]">
            {/* Primary Elder Phone */}
            <div className="flex justify-center items-start">
              <motion.div
                animate={{
                  x: isBridgeStage ? -30 : 0,
                  scale: isBridgeStage ? 0.92 : 1,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex justify-center items-start"
              >
                <div className="scale-[0.85] sm:scale-95 origin-top transition-transform">
                  <PhoneMockup
                    manualStep={activeStep + 1}
                    isHeroLoop={false}
                  />
                </div>
              </motion.div>
            </div>

            {/* Step 5: Second Phone (Family member Rahul) slides in */}
            <AnimatePresence>
              {isBridgeStage && (
                <motion.div
                  initial={{ opacity: 0, x: 60, scale: 0.85 }}
                  animate={{ opacity: 1, x: 40, scale: 0.9 }}
                  exit={{ opacity: 0, x: 60, scale: 0.85 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute z-20 hidden sm:block top-6"
                >
                  <div className="w-[270px] h-[500px] rounded-[40px] bg-[#162232] border-2 border-[#5B8FFF]/60 shadow-2xl flex flex-col justify-between p-4 text-center">
                    {/* Family Phone Header */}
                    <div className="pt-3">
                      <div className="w-10 h-10 rounded-full bg-[#5B8FFF] mx-auto flex items-center justify-center text-white mb-2 shadow-lg shadow-[#5B8FFF]/40">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-[#5B8FFF] uppercase">
                        Family Sentinel
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">
                        Emergency Alert
                      </h4>
                      <p className="text-xs text-[#CBD5E1]">
                        Mother&apos;s line intercepted
                      </p>
                    </div>

                    {/* 3-Way Bridge Diagram */}
                    <div className="p-3 rounded-2xl bg-[#0B0F14] border border-[#5B8FFF]/30 my-3 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>Mother (Elder)</span>
                        <span className="text-emerald-400">Connected</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>Scammer line</span>
                        <span className="text-red-400">Muted by Kaaval</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>Rahul (You)</span>
                        <span className="text-[#5B8FFF]">Joined Bridge</span>
                      </div>
                    </div>

                    {/* Connected Badge */}
                    <div className="py-2 px-3 rounded-xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                      <span>Speaking with Mother</span>
                    </div>

                    <div className="w-16 h-1 bg-white/20 rounded-full mx-auto" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
