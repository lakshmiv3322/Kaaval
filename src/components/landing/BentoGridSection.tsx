import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Languages,
  Activity,
  PhoneCall,
  FileText,
  Database,
  HeartHandshake,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const BentoGridSection: React.FC = () => {
  // Cycle for Tile A (languages)
  const [langIndex, setLangIndex] = useState(0);
  const languageSamples = [
    {
      lang: 'தமிழ் (Tamil)',
      script: 'அம்மா, இது போலியான அழைப்பு. போனை வையுங்கள், நான் பேசுகிறேன்.',
      trans: 'Mom, this is a fake call. Hang up, I am speaking.',
    },
    {
      lang: 'हिंदी (Hindi)',
      script: 'माँ, यह फर्जी कॉल है। तुरंत फोन काट दें, मैं बात करता हूँ।',
      trans: 'Mom, this is a fraudulent call. Disconnect right now, I will handle it.',
    },
    {
      lang: 'తెలుగు (Telugu)',
      script: 'అమ్మా, ఇది మోసపూరిత కాల్. వెంటనే ఫోన్ పెట్టేయండి, నేను చూసుకుంటాను.',
      trans: 'Mom, this is a scam call. Hang up immediately, I will take care of it.',
    },
    {
      lang: 'English',
      script: 'Mom, this is a fake police call. Disconnect now, I am on the line.',
      trans: 'Direct clear spoken intervention prompt.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLangIndex((prev) => (prev + 1) % languageSamples.length);
    }, 3600);
    return () => clearInterval(timer);
  }, [languageSamples.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight font-sans">
          Built for the reality of{' '}
          <span className="font-serif italic text-[#C7D7FF] font-normal">
            modern extortion.
          </span>
        </h2>
        <p className="mt-4 text-[17px] sm:text-[18px] text-[#CBD5E1] leading-[1.6]">
          Every feature is designed around elder dignity, regional languages, and rapid family intervention.
        </p>
      </div>

      {/* 6-Tile Asymmetric Bento Grid (12 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Tile A (Large, 7 cols): Speaks their language */}
        <div
          onMouseMove={handleMouseMove}
          className="spotlight-card md:col-span-12 lg:col-span-7 rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative min-h-[320px]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 flex items-center justify-center text-[#5B8FFF] mb-6">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-semibold text-white tracking-tight font-sans">
              Speaks their language
            </h3>
            <p className="mt-2 text-sm sm:text-base text-[#9CA3AF] max-w-lg leading-relaxed">
              Extortionists switch between English, Hindi, and regional tongues to intimidate. Kaaval recognizes vocabulary shifts and speaks warnings in mother tongue.
            </p>
          </div>

          {/* Crossfading Script Box */}
          <div className="mt-8 p-5 rounded-2xl bg-[#0B0F14] border border-[#1E293B] relative overflow-hidden min-h-[110px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={langIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#5B8FFF] mb-1.5">
                  <span>{languageSamples[langIndex].lang}</span>
                  <span className="text-[#9CA3AF]">Voice Prompt</span>
                </div>
                <p className="text-base sm:text-lg font-medium text-white leading-snug">
                  &ldquo;{languageSamples[langIndex].script}&rdquo;
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1 italic">
                  {languageSamples[langIndex].trans}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Tile B (5 cols): Explains every score */}
        <div
          onMouseMove={handleMouseMove}
          className="spotlight-card md:col-span-12 lg:col-span-5 rounded-3xl p-8 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 flex items-center justify-center text-[#5B8FFF] mb-6">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-semibold text-white tracking-tight font-sans">
              Explains every score
            </h3>
            <p className="mt-2 text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
              No black-box risk numbers. Kaaval attributes risk directly to observed psychological tactics.
            </p>
          </div>

          {/* Animated Mini Bar List */}
          <div className="mt-8 space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-mono text-[#CBD5E1] mb-1">
                <span>Authority Claim (Fake Police)</span>
                <span className="text-amber-400 font-bold">+25%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#0B0F14] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '70%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-[#CBD5E1] mb-1">
                <span>Secrecy &amp; Video Isolation</span>
                <span className="text-red-400 font-bold">+30%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#0B0F14] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '85%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-red-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-[#CBD5E1] mb-1">
                <span>Urgent Arrest Threat</span>
                <span className="text-red-400 font-bold">+15%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#0B0F14] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '50%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-red-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tile C (4 cols): One tap to join */}
        <div
          onMouseMove={handleMouseMove}
          className="spotlight-card md:col-span-6 lg:col-span-4 rounded-3xl p-8 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 flex items-center justify-center text-[#5B8FFF] mb-6">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight font-sans">
              One tap to join
            </h3>
            <p className="mt-2 text-sm text-[#9CA3AF] leading-relaxed">
              When threats cross threshold, your phone receives an urgent ring. Tap once to barge in and confront the caller.
            </p>
          </div>

          {/* Three-Avatar Bridge Animation */}
          <div className="mt-8 p-4 rounded-2xl bg-[#0B0F14] border border-[#1E293B] flex items-center justify-around relative">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                Mom
              </div>
              <span className="text-[10px] text-[#9CA3AF] mt-1 font-mono">Protected</span>
            </div>

            <div className="h-[2px] w-12 bg-gradient-to-r from-emerald-500 to-[#5B8FFF] relative">
              <span className="w-2 h-2 rounded-full bg-[#5B8FFF] absolute -top-[3px] left-1/2 -translate-x-1/2 animate-ping" />
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#5B8FFF]/20 border border-[#5B8FFF]/40 flex items-center justify-center text-[#5B8FFF] font-bold text-xs">
                You
              </div>
              <span className="text-[10px] text-[#5B8FFF] mt-1 font-mono">Barge-in</span>
            </div>
          </div>
        </div>

        {/* Tile D (4 cols): Evidence in one click */}
        <div
          onMouseMove={handleMouseMove}
          className="spotlight-card md:col-span-6 lg:col-span-4 rounded-3xl p-8 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 flex items-center justify-center text-[#5B8FFF] mb-6">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight font-sans">
              Evidence in one click
            </h3>
            <p className="mt-2 text-sm text-[#9CA3AF] leading-relaxed">
              Automatic audit trails ready for police complaint at cybercrime.gov.in and immediate bank dispute filings.
            </p>
          </div>

          {/* Paper-style preview card */}
          <div className="mt-8 p-3.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] font-mono text-xs text-[#CBD5E1] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] pb-1 border-b border-[#1E293B]">
              <span>INCIDENT #1049</span>
              <span className="text-red-400">Section 420 Claim</span>
            </div>
            <p className="text-[11px] text-[#9CA3AF]">
              Timestamp: 11:24:32 AM IST
            </p>
            <p className="text-[11px] text-white font-sans">
              &bull; 2 flagged coercion tactics archived
            </p>
          </div>
        </div>

        {/* Tile E (4 cols): Learns from every call */}
        <div
          onMouseMove={handleMouseMove}
          className="spotlight-card md:col-span-12 lg:col-span-4 rounded-3xl p-8 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 flex items-center justify-center text-[#5B8FFF] mb-6">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight font-sans">
              Learns from every call
            </h3>
            <p className="mt-2 text-sm text-[#9CA3AF] leading-relaxed">
              Scam syndicates evolve scripts weekly. Kaaval maps emerging phrase variations across cyber extortion rings.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[#1E293B]">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">
              1,420+
            </span>
            <p className="text-xs text-[#9CA3AF] mt-1 font-mono">
              Verified tactics in reference library (demo dataset)
            </p>
          </div>
        </div>

        {/* Tile F (Full span, 12 cols): Made for elders */}
        <div
          onMouseMove={handleMouseMove}
          className="spotlight-card md:col-span-12 rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8"
        >
          <div className="max-w-xl">
            <div className="w-10 h-10 rounded-xl bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 flex items-center justify-center text-[#5B8FFF] mb-6">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight font-sans">
              Made for elders. No passwords, no complex menus.
            </h3>
            <p className="mt-3 text-[17px] text-[#9CA3AF] leading-relaxed">
              When an elder feels frightened, they don’t need an error log or technical setup. One prominent button connects them directly to their daughter or son.
            </p>
          </div>

          {/* Giant Button Mockup */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-lg tracking-wide shadow-xl shadow-red-900/40 flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer">
              <PhoneCall className="w-6 h-6 animate-pulse" />
              <span>Call my child</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
