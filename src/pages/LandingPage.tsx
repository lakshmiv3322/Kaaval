import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Shield,
  PhoneCall,
  Volume2,
  Lock,
  Radio,
  FileCheck2,
  Sparkles,
  Users,
  Building2,
  CheckCircle2,
  ChevronDown,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { ShaderGradientHero } from '../components/shaders/ShaderGradientHero';
import { ShaderDivider } from '../components/shaders/ShaderDivider';
import { Shield3D } from '../components/three/Shield3D';
import { RiskMeter } from '../components/ui/RiskMeter';
import { TacticChip } from '../components/ui/TacticChip';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [heroHovered, setHeroHovered] = useState(false);
  const [miniDemoRisk, setMiniDemoRisk] = useState(74);

  return (
    <div className="relative min-h-screen bg-[#0B0F14] text-[#E5E7EB] overflow-hidden">
      {/* 1. HERO SECTION (Full Viewport Height) */}
      <section className="relative min-h-[92vh] flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        {/* Animated ShaderGradient Plane (GLSL continuous waves + grain) */}
        <ShaderGradientHero
          speedMultiplier={heroHovered ? 2.4 : 1.0}
          className="opacity-75"
        />

        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121821]/80 border border-[#5B8FFF]/30 backdrop-blur-md text-xs font-mono text-[#5B8FFF] shadow-lg shadow-[#5B8FFF]/10"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME SCAM CALL SHIELD</span>
          <span className="text-[#9CA3AF]">|</span>
          <span className="text-white">DIGITAL ARREST DEFENSE</span>
        </motion.div>

        {/* Center Content: LUMAE-style bold editorial layout */}
        <div className="z-10 max-w-4xl mx-auto text-center my-auto px-2">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-sans"
          >
            A live scam-call shield <br />
            <span className="bg-gradient-to-r from-white via-[#E5E7EB] to-[#9CA3AF] bg-clip-text text-transparent">
              for your elderly parents.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-6 text-lg sm:text-xl text-[#9CA3AF] max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Kaaval listens to calls in real time, spots deceptive coercion scripts in their native language, warns them on-screen, and alerts you with a one-tap join.
          </motion.p>

          {/* Primary CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              type="button"
              onMouseEnter={() => setHeroHovered(true)}
              onMouseLeave={() => setHeroHovered(false)}
              onClick={() => onNavigate('/demo/elder')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#5B8FFF] hover:bg-[#487CE8] text-white font-semibold text-base tracking-wide transition-all shadow-xl shadow-[#5B8FFF]/25 hover:shadow-2xl hover:shadow-[#5B8FFF]/40 flex items-center justify-center gap-2.5 active:scale-95 group cursor-pointer"
            >
              <span>See Live Demo</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#121821]/80 hover:bg-[#1A222F] text-[#E5E7EB] hover:text-white font-medium text-base border border-[#1E293B] backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <span>How It Works</span>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
            </a>
          </motion.div>

          {/* Key Metric micro-stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-12 pt-8 border-t border-[#1E293B]/50 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-xs font-mono text-[#9CA3AF]"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>Tamil, Hindi, Telugu, English</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B8FFF]" />
              <span>&lt;1.2s Acoustic Latency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5005]" />
              <span>Zero Content Stored by Default</span>
            </div>
          </motion.div>
        </div>

        {/* 3D Shield Rotating in Corner */}
        <div className="z-10 absolute bottom-6 right-6 hidden lg:flex flex-col items-center p-3 rounded-2xl bg-[#121821]/60 border border-[#1E293B]/60 backdrop-blur-xl">
          <Shield3D riskScore={heroHovered ? 80 : 25} size={110} />
          <span className="text-[10px] font-mono text-[#9CA3AF] mt-1">3D Active Sentinel</span>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <ShaderDivider />

      {/* 2. HOW IT WORKS (3-step editorial section, LUMAE-style) */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-[#5B8FFF] uppercase">
            Defensive Architecture
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight font-sans">
            How Kaaval Protects in 3 Critical Seconds
          </h2>
          <p className="mt-3 text-[#9CA3AF] text-sm sm:text-base">
            Digital Arrest scammers isolate victims using fear of immediate arrest. Kaaval detects the psychological tactics and opens an emergency bridge for family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 01 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative p-8 rounded-2xl bg-[#121821] border border-[#1E293B] hover:border-[#5B8FFF]/40 transition-all hover:-translate-y-1 shadow-lg"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-4xl font-mono font-bold text-transparent bg-gradient-to-br from-white to-[#334155] bg-clip-text">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 flex items-center justify-center text-[#5B8FFF]">
                <Volume2 className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Kaaval listens during calls.
            </h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              On-device speech recognition monitors incoming audio streams without recording personal conversations. Detects language shifts and aggressive tone changes.
            </p>
          </motion.div>

          {/* Card 02 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="group relative p-8 rounded-2xl bg-[#121821] border border-[#1E293B] hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-lg"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-4xl font-mono font-bold text-transparent bg-gradient-to-br from-white to-[#334155] bg-clip-text">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              It spots scam scripts in real time.
            </h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Our classifier flags psychological extortion: fake police badges, CBI warrants, Skype video arrest demands, and urgent secrecy commands.
            </p>
          </motion.div>

          {/* Card 03 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group relative p-8 rounded-2xl bg-[#121821] border border-[#1E293B] hover:border-red-500/40 transition-all hover:-translate-y-1 shadow-lg"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-4xl font-mono font-bold text-transparent bg-gradient-to-br from-white to-[#334155] bg-clip-text">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <Radio className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              You get alerted and can join.
            </h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              The elder sees high-contrast warnings in their mother tongue while family members receive an urgent push alert to barge in and confront the fraudster.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <ShaderDivider />

      {/* 3. LIVE DEMO PREVIEW SECTION */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-semibold tracking-widest text-[#ff5005] uppercase">
            Interactive Simulation
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight font-sans">
            See Kaaval in Action
          </h2>
          <p className="mt-2 text-[#9CA3AF] text-sm sm:text-base">
            Watch how Kaaval catches a fake police call in real time.
          </p>
        </div>

        {/* Embedded Interactive Mini-Dashboard */}
        <div className="max-w-4xl mx-auto bg-[#121821] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle backdrop glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#5B8FFF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Risk Meter Animated */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <RiskMeter score={miniDemoRisk} size="md" />
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setMiniDemoRisk(15)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                    miniDemoRisk <= 30 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-[#0B0F14] text-[#9CA3AF] border-[#1E293B]'
                  }`}
                >
                  Safe (15%)
                </button>
                <button
                  type="button"
                  onClick={() => setMiniDemoRisk(52)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                    miniDemoRisk > 30 && miniDemoRisk <= 65 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-[#0B0F14] text-[#9CA3AF] border-[#1E293B]'
                  }`}
                >
                  Suspicious (52%)
                </button>
                <button
                  type="button"
                  onClick={() => setMiniDemoRisk(78)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                    miniDemoRisk > 65 ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-[#0B0F14] text-[#9CA3AF] border-[#1E293B]'
                  }`}
                >
                  High Alert (78%)
                </button>
              </div>
            </div>

            {/* Right: Tactical Ticker & Timeline */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-mono text-red-400 font-semibold uppercase">
                    Call Under Surveillance: +91 98201 44521
                  </span>
                </div>
                <span className="text-xs font-mono text-[#9CA3AF]">00:38 elapsed</span>
              </div>

              {/* Tactic chips lighting up */}
              <div>
                <p className="text-xs font-mono text-[#9CA3AF] mb-2 uppercase">Identified Extortion Tactics:</p>
                <div className="flex flex-wrap gap-2">
                  <TacticChip
                    tactic={{
                      id: '1',
                      name: 'Authority Claim',
                      category: 'authority',
                      timestamp: '00:07',
                      confidence: 0.95,
                      severity: 'medium',
                      quote: 'Crime Branch Mumbai',
                      description: 'False police badge claim'
                    }}
                  />
                  <TacticChip
                    tactic={{
                      id: '2',
                      name: 'Urgency & Arrest Threat',
                      category: 'urgency',
                      timestamp: '00:19',
                      confidence: 0.98,
                      severity: 'high',
                      quote: 'Section 420 arrest warrant',
                      description: 'Fabricated legal allegations'
                    }}
                  />
                  <TacticChip
                    tactic={{
                      id: '3',
                      name: 'Digital Arrest Demand',
                      category: 'digital_arrest',
                      timestamp: '00:32',
                      confidence: 0.99,
                      severity: 'high',
                      quote: 'Turn on video call now',
                      description: 'Isolation and video detention'
                    }}
                  />
                </div>
              </div>

              {/* Sample Dialog transcript excerpt */}
              <div className="p-3.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-xs font-mono text-[#E5E7EB] space-y-1.5">
                <p className="text-red-400">
                  <span className="text-[#9CA3AF]">[Caller]:</span> &quot;You are under Digital Arrest. Do not disconnect this line or speak to your daughter.&quot;
                </p>
                <p className="text-emerald-400">
                  <span className="text-[#9CA3AF]">[Elder Screen]:</span> &quot;இது மோசடி அழைப்பாக இருக்கலாம். பணத்தை அனுப்ப வேண்டாம்.&quot;
                </p>
              </div>

              {/* CTA launch */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">Ready to experience the interactive simulation?</span>
                <button
                  type="button"
                  onClick={() => onNavigate('/demo/elder')}
                  className="px-5 py-2.5 rounded-xl bg-[#5B8FFF] hover:bg-[#4A7CEB] text-white text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-md shadow-[#5B8FFF]/20 transition-all active:scale-95"
                >
                  <span>Launch Full Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <ShaderDivider />

      {/* 4. FOR FAMILIES / FOR BANKS & TELCOS (Two-column editorial) */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column: For Families */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#121821] border border-[#1E293B]">
            <div className="w-12 h-12 rounded-2xl bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 flex items-center justify-center text-[#5B8FFF] mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              For families.
            </h3>
            <p className="mt-3 text-sm text-[#9CA3AF] leading-relaxed">
              Elderly parents are disproportionately targeted by fraudsters who weaponize authority symbols. Kaaval gives adult children eyes and ears without invading daily privacy.
            </p>

            <ul className="mt-6 space-y-3.5 text-sm text-[#E5E7EB]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#5B8FFF] shrink-0 mt-0.5" />
                <span><strong className="text-white">Real-time warnings in their language</strong> (Tamil, Hindi, Telugu, Kannada, English).</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#5B8FFF] shrink-0 mt-0.5" />
                <span><strong className="text-white">One-tap join to rescue the call</strong> directly from your lockscreen notification.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#5B8FFF] shrink-0 mt-0.5" />
                <span><strong className="text-white">Post-call evidence for complaints</strong> formatted for 1930 Cyber Helpline & banks.</span>
              </li>
            </ul>
          </div>

          {/* Right Column: For Banks & Telcos */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#121821] border border-[#1E293B]">
            <div className="w-12 h-12 rounded-2xl bg-[#ff5005]/15 border border-[#ff5005]/30 flex items-center justify-center text-[#ff5005] mb-6">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              For banks & telcos.
            </h3>
            <p className="mt-3 text-sm text-[#9CA3AF] leading-relaxed">
              Prevent unauthorized RTGS/NEFT outflows before funds leave accounts. Integrate Kaaval telemetry with transaction monitoring systems.
            </p>

            <ul className="mt-6 space-y-3.5 text-sm text-[#E5E7EB]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ff5005] shrink-0 mt-0.5" />
                <span><strong className="text-white">Live fraud-pattern feed</strong> mapping evolving regional impersonation rings.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ff5005] shrink-0 mt-0.5" />
                <span><strong className="text-white">Anonymized scam script library</strong> to train anti-fraud AML neural nets.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ff5005] shrink-0 mt-0.5" />
                <span><strong className="text-white">Lower chargebacks and support load</strong> through immediate verified dispute packs.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <ShaderDivider />

      {/* 5. TRUST & PRIVACY SECTION */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="inline-flex p-3 rounded-2xl bg-[#5B8FFF]/10 border border-[#5B8FFF]/30 text-[#5B8FFF] mb-6">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Privacy by design.
        </h2>
        <p className="mt-3 text-[#9CA3AF] text-sm sm:text-base max-w-xl mx-auto">
          We protect dignity and intimacy. Kaaval is built on strict boundary guarantees.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-2xl bg-[#121821] border border-[#1E293B]">
            <span className="text-xs font-mono text-[#5B8FFF] uppercase block mb-1">Acoustic Guard</span>
            <h4 className="text-sm font-semibold text-white">No Audio Saved</h4>
            <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">
              Call streams are analyzed in volatile memory. No audio waveforms or raw voice recordings are stored on servers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121821] border border-[#1E293B]">
            <span className="text-xs font-mono text-emerald-400 uppercase block mb-1">On-Device First</span>
            <h4 className="text-sm font-semibold text-white">Local Transcription</h4>
            <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">
              Whisper-grade acoustic filtering executes locally whenever mobile hardware acceleration is available.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121821] border border-[#1E293B]">
            <span className="text-xs font-mono text-amber-400 uppercase block mb-1">Consent Protocol</span>
            <h4 className="text-sm font-semibold text-white">Transparent Pairing</h4>
            <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">
              Both parent and guardian establish reciprocal consent with explicit toggle controls at any moment.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1E293B] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#9CA3AF]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-white">Kaaval</span>
          <span>•</span>
          <span>Built to protect families in the age of digital fraud.</span>
        </div>

        <div className="flex items-center gap-6">
          <button type="button" onClick={() => onNavigate('/demo/elder')} className="hover:text-white transition-colors">
            Elder View
          </button>
          <button type="button" onClick={() => onNavigate('/demo/family')} className="hover:text-white transition-colors">
            Family Hub
          </button>
          <button type="button" onClick={() => onNavigate('/demo/evidence/call-1049')} className="hover:text-white transition-colors">
            Evidence Pack
          </button>
          <span className="font-mono text-[#5B8FFF]">2026 Production Ready</span>
        </div>
      </footer>
    </div>
  );
};
