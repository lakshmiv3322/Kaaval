import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'motion/react';
import { PhoneMockup } from './PhoneMockup';
import { Shield, Users, Radio, AlertOctagon, CheckCircle2, PhoneCall } from 'lucide-react';

export const NinetySecondsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Active step index: 0, 1, 2, 3, 4
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const step = Math.min(4, Math.floor(latest * 5));
      setActiveStep(step);
    });
    return () => unsubscribe();
  }, [scrollYProgress, shouldReduceMotion]);

  const steps = [
    {
      titlePrefix: 'The call',
      serifKey: 'comes in.',
      titleSuffix: '',
      description:
        'An unknown number rings your mother’s phone. The caller sounds calm, polite, and completely official.',
      stageRisk: 12,
      tactic: null,
    },
    {
      titlePrefix: 'They claim to be',
      serifKey: 'police.',
      titleSuffix: '',
      description:
        'They cite badge numbers, Supreme Court orders, and CBI headquarters to engineer immediate psychological compliance.',
      stageRisk: 28,
      tactic: 'Authority claim',
    },
    {
      titlePrefix: 'They make it feel',
      serifKey: 'urgent.',
      titleSuffix: '',
      description:
        'Fabricated legal notices under Money Laundering Act Section 420 trigger immediate panic and disorientation.',
      stageRisk: 58,
      tactic: 'Arrest threat',
    },
    {
      titlePrefix: 'They say:',
      serifKey: 'tell no one.',
      titleSuffix: '',
      description:
        'The core coercion trap: ‘You are placed under Digital Arrest. Turn on Skype video now and do not alert your family.’',
      stageRisk: 92,
      tactic: 'Secrecy demand',
    },
    {
      titlePrefix: 'Kaaval',
      serifKey: 'breaks the silence.',
      titleSuffix: '',
      description:
        'Before intimidation turns into a bank transfer, Kaaval issues on-screen native language warnings and rings your phone with a one-tap join.',
      stageRisk: 92,
      tactic: 'Emergency Family Bridge',
    },
  ];

  // If user prefers reduced motion, render a clean vertical sequential list
  if (shouldReduceMotion) {
    return (
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#5B8FFF] uppercase">
            Defensive Architecture
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-white tracking-tight font-sans">
            The Ninety Seconds
          </h2>
          <p className="mt-3 text-[17px] text-[#9CA3AF] leading-relaxed">
            How a digital arrest scam evolves, and how Kaaval intercepts it before funds leave the account.
          </p>
        </div>

        <div className="space-y-12">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#11161D] border border-[#1E293B] grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-7">
                <span className="text-xs font-mono text-[#5B8FFF]">0{idx + 1} / 05</span>
                <h3 className="text-2xl sm:text-3xl font-semibold text-white mt-2">
                  {st.titlePrefix}{' '}
                  <span className="font-serif italic text-[#C7D7FF] font-normal">
                    {st.serifKey}
                  </span>{' '}
                  {st.titleSuffix}
                </h3>
                <p className="mt-3 text-[17px] text-[#9CA3AF] leading-relaxed max-w-[62ch]">
                  {st.description}
                </p>
              </div>
              <div className="md:col-span-5 flex justify-center items-start h-[558px]">
                <div className="scale-90 origin-top">
                  <PhoneMockup manualStep={idx + 1} staticAlert isHeroLoop={false} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Scroll-driven sticky stage (400vh on desktop, 280vh on tablet, 220vh on mobile)
  const isRedStage = activeStep === 3;
  const isBridgeStage = activeStep === 4;

  return (
    <div
      id="how-it-works"
      ref={containerRef}
      className="relative h-[220vh] sm:h-[280vh] lg:h-[400vh]"
    >
      {/* Sticky Stage Viewport */}
      <div
        className={`sticky top-0 h-screen w-full flex items-center overflow-hidden px-4 sm:px-6 lg:px-8 transition-colors duration-700 ${
          isRedStage
            ? 'bg-[#150D10]'
            : 'bg-[#0B0F14]'
        }`}
      >
        {/* Subtle background red pulse during step 4 (screen-shake simulation) */}
        {isRedStage && (
          <div className="pointer-events-none absolute inset-0 bg-red-600/10 animate-pulse" />
        )}

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Progress Indicator (Left side dots) */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-6">
            <div className="w-[2px] h-48 bg-[#1E293B] relative rounded-full overflow-hidden">
              <motion.div
                className="w-full bg-[#5B8FFF] rounded-full"
                style={{
                  height: `${(activeStep / 4) * 100}%`,
                  transition: 'height 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((dot) => (
                <div
                  key={dot}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeStep === dot
                      ? 'bg-[#5B8FFF] scale-125 ring-4 ring-[#5B8FFF]/20'
                      : activeStep > dot
                      ? 'bg-[#5B8FFF]/60'
                      : 'bg-[#1E293B]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Left Column: Big editorial storytelling sentence */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <span className="text-xs font-mono text-[#5B8FFF] mb-3">
              SCENARIO PROGRESSION — 0{activeStep + 1} / 05
            </span>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={isRedStage ? 'animate-[shake_0.3s_ease-in-out]' : ''}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.15] font-sans">
                  {steps[activeStep].titlePrefix}{' '}
                  <span className="font-serif italic text-[#C7D7FF] font-normal">
                    {steps[activeStep].serifKey}
                  </span>{' '}
                  {steps[activeStep].titleSuffix}
                </h2>

                <p className="mt-5 text-[17px] sm:text-[18px] text-[#CBD5E1] leading-[1.6] max-w-[54ch]">
                  {steps[activeStep].description}
                </p>

                {/* Tactic Pill */}
                {steps[activeStep].tactic && (
                  <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#11161D] border border-[#1E293B] text-xs font-medium text-[#CBD5E1]">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Identified Threat: {steps[activeStep].tactic}</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Phone(s) Display */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Primary Elder Phone */}
            <div className="h-[496px] sm:h-[589px] flex justify-center items-start">
              <motion.div
                animate={{
                  x: isBridgeStage ? -40 : 0,
                  scale: isBridgeStage ? 0.9 : 1,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 h-[496px] sm:h-[589px] flex justify-center items-start"
              >
                <div className="scale-[0.8] origin-top sm:scale-95 transition-transform">
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
                  initial={{ opacity: 0, x: 80, scale: 0.85 }}
                  animate={{ opacity: 1, x: 50, scale: 0.9 }}
                  exit={{ opacity: 0, x: 80, scale: 0.85 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute z-20 hidden sm:block top-10"
                >
                  <div className="w-[280px] h-[520px] rounded-[44px] p-2 bg-[#162232] border-2 border-[#5B8FFF]/60 shadow-2xl flex flex-col justify-between p-4 text-center">
                    {/* Family Phone Header */}
                    <div className="pt-4">
                      <div className="w-10 h-10 rounded-full bg-[#5B8FFF] mx-auto flex items-center justify-center text-white mb-2 shadow-lg shadow-[#5B8FFF]/40">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-[#5B8FFF] uppercase">
                        Family Sentinel
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">
                        Emergency Alert
                      </h4>
                      <p className="text-xs text-[#CBD5E1]">
                        Mother&apos;s line intercepted
                      </p>
                    </div>

                    {/* 3-Way Bridge Diagram */}
                    <div className="p-3 rounded-2xl bg-[#0B0F14] border border-[#5B8FFF]/30 my-4 space-y-3">
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
                    <div className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-2">
                      <PhoneCall className="w-4 h-4 animate-bounce" />
                      <span>Speaking with Mother</span>
                    </div>

                    <div className="w-20 h-1 bg-white/20 rounded-full mx-auto" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
