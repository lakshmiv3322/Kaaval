import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ChevronDown, CheckCircle } from 'lucide-react';
import { ShaderGradientHero } from '../shaders/ShaderGradientHero';
import { PhoneMockup } from './PhoneMockup';

interface HeroSectionProps {
  onNavigate: (route: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [heroRiskScore, setHeroRiskScore] = useState(10);
  const shouldReduceMotion = useReducedMotion();

  // Words for the staggered blur-up reveal
  const headlineWords = [
    { text: 'The', serif: false },
    { text: 'scammer', serif: false },
    { text: 'says', serif: false },
    { text: "don't", serif: true },
    { text: 'tell', serif: true },
    { text: 'anyone.', serif: true },
    { text: 'Kaaval', serif: false, newline: true },
    { text: 'tells', serif: false },
    { text: 'everyone.', serif: false },
  ];

  return (
    <section className="relative min-h-[calc(100svh-4rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 lg:py-20 overflow-hidden">
      {/* Background: ShaderGradientHero dimmed behind scrim for >= 7:1 contrast */}
      <ShaderGradientHero
        speedMultiplier={1.0 + (heroRiskScore / 100) * 1.4}
        riskScore={heroRiskScore}
        className="opacity-45"
      />

      {/* Dimming scrims for guaranteed high-contrast editorial typography */}
      <div className="pointer-events-none absolute inset-0 bg-[#0B0F14]/75 backdrop-blur-[0.5px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B0F14]/85 via-[#0B0F14]/65 to-[#0B0F14]" />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Editorial Headline & Copy */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Eyebrow Badge (The ONLY uppercase tracking mono eyebrow allowed) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11161D] border border-[#1E293B] text-xs font-mono text-[#5B8FFF] shadow-md mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wider uppercase">REAL-TIME SCAM CALL SHIELD</span>
          </motion.div>

          {/* Word-by-Word Blur-Up Reveal Headline */}
          <h1 className="text-[40px] sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1] max-w-2xl font-sans">
            {headlineWords.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.newline && <br className="hidden sm:inline" />}
                <motion.span
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1, filter: 'blur(0px)' }
                      : { opacity: 0, y: 12, filter: 'blur(8px)' }
                  }
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.65,
                    delay: shouldReduceMotion ? 0 : idx * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`inline-block mr-2.5 ${
                    item.serif
                      ? 'font-serif italic font-normal text-[#C7D7FF]'
                      : 'text-white'
                  }`}
                >
                  {item.text}
                </motion.span>
              </React.Fragment>
            ))}
          </h1>

          {/* Subtext: 1 sentence, max 22 words */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: shouldReduceMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 text-[17px] sm:text-[18px] leading-[1.6] text-[#CBD5E1] max-w-[62ch] font-normal"
          >
            Listens through your browser&apos;s speech recognition. Spots deceptive coercion scripts in regional languages, warns on-screen, and alerts family in one tap.
          </motion.p>

          {/* Two CTAs */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: shouldReduceMotion ? 0 : 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={() => onNavigate('/demo/elder')}
              className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-xl bg-[#5B8FFF] hover:bg-[#487CE8] text-white font-medium text-base shadow-lg shadow-[#5B8FFF]/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14] cursor-pointer"
            >
              <span>Watch the live demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#11161D] hover:bg-[#18202A] text-[#CBD5E1] hover:text-white font-medium text-base border border-[#1E293B] transition-all flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14]"
            >
              <span>See how it works</span>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
            </a>
          </motion.div>

          {/* Three Trust Points (Small, plain text, no mono) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: shouldReduceMotion ? 0 : 0.7,
            }}
            className="mt-10 pt-6 border-t border-[#1E293B]/70 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-sm text-[#9CA3AF]"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B8FFF]" />
              <span>Tamil, Hindi, Telugu &amp; English</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B8FFF]" />
              <span>Family joins the call in one tap</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B8FFF]" />
              <span>No audio saved by Kaaval</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Realistic Phone Mockup */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: shouldReduceMotion ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="scale-[0.85] origin-top sm:scale-100 transition-transform"
          >
            <PhoneMockup
              onRiskUpdate={setHeroRiskScore}
              isHeroLoop={!shouldReduceMotion}
              staticAlert={Boolean(shouldReduceMotion)}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
