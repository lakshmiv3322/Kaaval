import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  PhoneOff,
  AlertTriangle,
  Play,
  RotateCcw,
  Volume2,
  Users,
  Mic,
  Shield,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { CallSession, DetectedTactic, TranscriptChunk } from '../types';
import { SCENARIO_PRESETS, REGIONAL_WARNINGS } from '../services/scamScenarios';
import { api } from '../services/api';
import { syncBus } from '../services/syncChannel';
import { Shield3D } from '../components/three/Shield3D';
import { RiskMeter } from '../components/ui/RiskMeter';
import { TacticChip } from '../components/ui/TacticChip';
import { AudioWaveVisualizer } from '../components/ui/AudioWaveVisualizer';
import { ShaderGradientHero } from '../components/shaders/ShaderGradientHero';

interface ElderScreenProps {
  onNavigate: (route: string) => void;
}

export const ElderScreen: React.FC<ElderScreenProps> = ({ onNavigate }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState('digital-arrest-cbi');
  const [selectedLanguage, setSelectedLanguage] = useState<'ta' | 'hi' | 'en' | 'te'>('ta');
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [childAlertState, setChildAlertState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [liveTranscript, setLiveTranscript] = useState<TranscriptChunk[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const scenario = SCENARIO_PRESETS.find((s) => s.id === selectedScenarioId) || SCENARIO_PRESETS[0];

  const [familyWarning, setFamilyWarning] = useState<string | null>(null);
  const timerRef = useRef(0);
  const sessionRef = useRef<CallSession | null>(null);

  // Keep refs in sync with state (read-only from effects without deps)
  useEffect(() => { timerRef.current = timerSeconds; }, [timerSeconds]);
  useEffect(() => { sessionRef.current = callSession; }, [callSession]);

  // Listen for sync messages from family dashboard
  useEffect(() => {
    const unsubscribe = syncBus.subscribe((msg) => {
      if (msg.type === 'FAMILY_BARGE_IN') {
        setChildAlertState('connected');
        if (sessionRef.current) {
          const updated: CallSession = {
            ...sessionRef.current,
            status: 'barged-in',
            bargeInActive: true,
          };
          sessionRef.current = updated;
          setCallSession(updated);
        }
      } else if (msg.type === 'VOICE_WARNING_SENT') {
        const text = msg.payload.warningText;
        setFamilyWarning(text);
        try {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text);
          utt.rate = 0.9;
          window.speechSynthesis.speak(utt);
        } catch (_e) {
          // speech unavailable — no-op
        }
        setTimeout(() => setFamilyWarning(null), 12000);
      } else if (msg.type === 'FAMILY_HANGUP') {
        setIsPlaying(false);
        if (sessionRef.current) {
          const endedSession: CallSession = {
            ...sessionRef.current,
            status: 'ended',
            durationSeconds: timerRef.current,
          };
          sessionRef.current = endedSession;
          setCallSession(endedSession);
        }
      }
    });
    return unsubscribe;
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval: any;
    if (isPlaying && callSession?.status === 'in-progress') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, callSession?.status]);

  // Step-by-step scenario player
  useEffect(() => {
    if (!isPlaying || currentChunkIndex >= scenario.chunks.length - 1) return;

    const nextIndex = currentChunkIndex + 1;
    const chunkData = scenario.chunks[nextIndex];

    const timeout = setTimeout(() => {
      const prev = sessionRef.current;
      if (!prev) return;

      const newChunk: TranscriptChunk = {
        id: `chunk-${nextIndex}`,
        timestamp: formatTime(timerRef.current),
        speaker: chunkData.speaker,
        text: chunkData.text,
        translation: chunkData.translation,
        tacticFlag: chunkData.tactic?.name,
        riskDelta: chunkData.riskScore,
      };

      const updatedTactics = chunkData.tactic
        ? [...prev.detectedTactics.filter((t) => t.id !== chunkData.tactic!.id), chunkData.tactic]
        : prev.detectedTactics;

      const updatedRisk = chunkData.riskScore;
      const updatedLevel = updatedRisk > 65 ? 'high-risk' : updatedRisk > 30 ? 'suspicious' : 'safe';

      const shouldAlert = updatedRisk >= 65 && !prev.alertTriggered;

      const updatedSession: CallSession = {
        ...prev,
        riskScore: updatedRisk,
        riskLevel: updatedLevel,
        detectedTactics: updatedTactics,
        transcript: [...prev.transcript, newChunk],
        alertTriggered: prev.alertTriggered || shouldAlert,
      };

      // Commit to ref first so subsequent callbacks see the latest session
      sessionRef.current = updatedSession;

      // Batch state updates
      setCurrentChunkIndex(nextIndex);
      setLiveTranscript((t) => [...t, newChunk]);
      setCallSession(updatedSession);

      // Side effects OUTSIDE any setState updater (safe in StrictMode)
      if (shouldAlert) {
        const alertPayload = {
          id: `alert-${Date.now()}`,
          callId: prev.id,
          elderName: prev.elderName,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          riskScore: updatedRisk,
          tactics: updatedTactics.map((t) => t.name),
          summary: chunkData.text,
          status: 'active' as const,
        };
        syncBus.publish({ type: 'NEW_ALERT', payload: alertPayload });
        api.triggerFamilyAlert(alertPayload);
      }

      syncBus.publish({ type: 'CALL_UPDATE', payload: updatedSession });
    }, chunkData.delayMs / speedMultiplier);

    return () => clearTimeout(timeout);
  }, [isPlaying, currentChunkIndex, scenario, speedMultiplier]);

  const handleStartCall = async () => {
    const newSession = await api.startCall(selectedScenarioId);
    sessionRef.current = newSession;
    timerRef.current = 0;
    setCallSession(newSession);
    setCurrentChunkIndex(-1);
    setLiveTranscript([]);
    setTimerSeconds(0);
    setIsPlaying(true);
    setChildAlertState('idle');

    syncBus.publish({
      type: 'CALL_UPDATE',
      payload: newSession,
    });
  };

  const handleEndCall = () => {
    setIsPlaying(false);
    if (callSession) {
      const endedSession: CallSession = {
        ...callSession,
        status: 'ended',
        durationSeconds: timerSeconds,
      };
      sessionRef.current = endedSession;
      setCallSession(endedSession);
      syncBus.publish({
        type: 'CALL_UPDATE',
        payload: endedSession,
      });
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentChunkIndex(-1);
    setLiveTranscript([]);
    setTimerSeconds(0);
    setChildAlertState('idle');
    sessionRef.current = null;
    setCallSession(null);
    syncBus.publish({ type: 'RESET_STATE' });
  };

  const handleCallChildNow = () => {
    setChildAlertState('calling');
    if (callSession) {
      syncBus.publish({
        type: 'NEW_ALERT',
        payload: {
          id: `sos-${Date.now()}`,
          callId: callSession.id,
          elderName: callSession.elderName,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          riskScore: Math.max(85, callSession.riskScore),
          tactics: ['Emergency SOS from Elder'],
          summary: 'Elder pressed "Call My Child Now" emergency intervention button.',
          status: 'active',
        },
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentRisk = callSession?.riskScore || 0;
  const isCallActive = callSession?.status === 'in-progress' || callSession?.status === 'barged-in';
  const currentWarning = REGIONAL_WARNINGS[selectedLanguage] || REGIONAL_WARNINGS.en;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#0B0F14] text-[#E5E7EB] flex flex-col justify-between overflow-hidden">
      {/* Background Subtle Shader Gradient */}
      <ShaderGradientHero
        speedMultiplier={isCallActive ? 1.4 + (currentRisk / 100) * 1.5 : 0.6}
        riskScore={currentRisk}
        className="opacity-35"
      />

      {/* TOP STATUS BAR */}
      <header className="relative z-10 w-full border-b border-[#1E293B]/70 bg-[#121821]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5B8FFF]/20 border border-[#5B8FFF]/40 flex items-center justify-center text-[#5B8FFF]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Kaaval Elder Shield</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E293B] text-[#9CA3AF]">
                DEMO MODE
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] font-mono">
              Protected: Kavitha Ramaswamy (68 yrs)
            </p>
          </div>
        </div>

        {/* Right Status Dot & Language Switcher */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-[#0B0F14] border border-[#1E293B] rounded-lg p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setSelectedLanguage('ta')}
              className={`px-2 py-1 rounded ${selectedLanguage === 'ta' ? 'bg-[#5B8FFF] text-white font-semibold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('hi')}
              className={`px-2 py-1 rounded ${selectedLanguage === 'hi' ? 'bg-[#5B8FFF] text-white font-semibold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('en')}
              className={`px-2 py-1 rounded ${selectedLanguage === 'en' ? 'bg-[#5B8FFF] text-white font-semibold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('te')}
              className={`px-2 py-1 rounded ${selectedLanguage === 'te' ? 'bg-[#5B8FFF] text-white font-semibold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              తెలుగు
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0F14] border border-[#1E293B] text-xs font-mono">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCallActive ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className={isCallActive ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
              {isCallActive ? 'CALL ACTIVE' : 'IDLE / PROTECTING'}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-center">
        {/* State 1: IDLE */}
        {!isCallActive && callSession?.status !== 'ended' && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <Shield3D riskScore={0} size={150} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              No Active Call
            </h2>
            <p className="mt-3 text-base text-[#9CA3AF] max-w-md mx-auto">
              When an incoming phone call begins, Kaaval will automatically listen, detect scam scripts in real-time, and protect you.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleStartCall}
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg tracking-wide shadow-xl shadow-emerald-900/30 transition-all flex items-center gap-3 mx-auto active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <span>Simulate Incoming Call</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: CALL IN PROGRESS */}
        {isCallActive && (
          <div className="space-y-6">
            {/* Call Status Card (Big, High Contrast for Elders) */}
            <div className="relative bg-[#121821] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
              {/* Caller Identifier */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
                <div className="text-left">
                  <span className="text-xs font-mono text-[#9CA3AF] uppercase">Incoming Call Line</span>
                  <h4 className="text-lg font-bold text-white tracking-tight">
                    {callSession?.callerLabel}
                  </h4>
                  <p className="text-xs font-mono text-[#9CA3AF]">{callSession?.callerNumber}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-2xl sm:text-3xl font-mono font-bold text-white">
                    <Clock className="w-5 h-5 text-[#5B8FFF]" />
                    <span>{formatTime(timerSeconds)}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">● Kaaval is Listening</span>
                </div>
              </div>

              {/* Center Risk Meter & 3D Shield */}
              <div className="my-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                <RiskMeter score={currentRisk} size="lg" />
                <div className="flex flex-col items-center">
                  <Shield3D riskScore={currentRisk} size={140} />
                  <span className="text-xs font-mono text-[#9CA3AF] mt-2">
                    {currentRisk > 65 ? '🔴 Danger State' : currentRisk > 30 ? '🟡 Warning State' : '🟢 Safe State'}
                  </span>
                </div>
              </div>

              {/* HIGH CONTRAST REGIONAL WARNING BANNER (When risk crosses threshold) */}
              <AnimatePresence>
                {currentRisk >= 55 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl bg-red-600/90 border-2 border-white/20 text-white shadow-2xl my-4 text-center animate-pulse"
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <AlertTriangle className="w-6 h-6 text-yellow-300 animate-bounce" />
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                        {currentWarning.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-white/95">
                      {currentWarning.subtitle}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-yellow-200">
                      {currentWarning.advice}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TACTIC CHIPS ROW */}
              <div className="my-4">
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#9CA3AF] mb-2 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#5B8FFF]" />
                  <span>Detected Psychological Tactics:</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 min-h-[36px]">
                  {callSession?.detectedTactics.length === 0 ? (
                    <span className="text-xs text-[#9CA3AF] italic">Listening for coercion patterns...</span>
                  ) : (
                    callSession?.detectedTactics.map((tactic) => (
                      <TacticChip key={tactic.id} tactic={tactic} />
                    ))
                  )}
                </div>
              </div>

              {/* LIVE TRANSCRIPT STREAM TICKER */}
              <div className="mt-4 p-4 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-left max-h-36 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] pb-1 border-b border-[#1E293B]">
                  <span>Live Speech-to-Text Acoustic Stream</span>
                  <AudioWaveVisualizer isActive={isPlaying} riskScore={currentRisk} barsCount={16} />
                </div>
                {liveTranscript.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] italic">Connecting to speech transcript engine...</p>
                ) : (
                  liveTranscript.map((chunk) => (
                    <div key={chunk.id} className="text-xs">
                      <span className="font-mono text-[#9CA3AF] mr-2">[{chunk.timestamp}]</span>
                      <span className={chunk.speaker === 'caller' ? 'text-red-300 font-medium' : 'text-emerald-300 font-medium'}>
                        {chunk.speaker === 'caller' ? 'Caller' : 'Elder'}:
                      </span>{' '}
                      <span className="text-white">{chunk.text}</span>
                      {chunk.translation && (
                        <p className="text-[11px] text-[#9CA3AF] pl-12 italic">{chunk.translation}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* BIG HELP BUTTON: "Call My Child Now" */}
              <div className="mt-6 pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleCallChildNow}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl cursor-pointer ${
                    childAlertState === 'calling'
                      ? 'bg-amber-500 text-black animate-pulse'
                      : childAlertState === 'connected'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40'
                  }`}
                >
                  <Users className="w-6 h-6" />
                  <span>
                    {childAlertState === 'calling'
                      ? 'Calling Rahul (Son) — Alerting Family...'
                      : childAlertState === 'connected'
                      ? 'Family Connected on Line'
                      : 'Call My Child Now (Emergency SOS)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#1E293B] hover:bg-red-900/30 hover:border-red-500/50 border border-[#334155] text-white font-semibold text-sm transition-all"
                >
                  Hang Up Call
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 3: CALL ENDED SUMMARY */}
        {callSession?.status === 'ended' && (
          <div className="bg-[#121821] border border-[#1E293B] rounded-3xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Call Terminated Safely</h3>
            <p className="text-sm text-[#9CA3AF] max-w-md mx-auto">
              The potential scam was contained. All flagged timestamps and audio transcripts have been securely archived in your family evidence pack.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => onNavigate(`/demo/evidence/${callSession.id}`)}
                className="px-6 py-3 rounded-xl bg-[#5B8FFF] hover:bg-[#4A7CEB] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-[#5B8FFF]/25"
              >
                <span>View Evidence Pack</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-[#1E293B] hover:bg-[#2A374D] text-[#E5E7EB] font-medium text-sm"
              >
                Start New Test
              </button>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM HACKATHON DEMO CONTROL PANEL (For Judges & Presenters) */}
      <footer className="relative z-10 w-full bg-[#121821] border-t border-[#1E293B] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Preset Scenario Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="font-mono text-[#9CA3AF] uppercase font-medium">Scenario:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                handleReset();
              }}
              disabled={isCallActive}
              className="px-3 py-1.5 rounded-lg bg-[#0B0F14] border border-[#1E293B] text-white text-xs font-medium focus:border-[#5B8FFF] focus:outline-none"
            >
              {SCENARIO_PRESETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Speed & Sim Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#9CA3AF]">
              <span className="font-mono uppercase">Speed:</span>
              {[1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeedMultiplier(s)}
                  className={`px-2 py-0.5 rounded text-xs font-mono ${
                    speedMultiplier === s
                      ? 'bg-[#5B8FFF] text-white font-bold'
                      : 'bg-[#0B0F14] hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-[#1E293B]" />

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B0F14] hover:bg-[#1E293B] text-[#9CA3AF] hover:text-white border border-[#1E293B] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/demo/family')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#5B8FFF]/20 text-[#5B8FFF] border border-[#5B8FFF]/40 hover:bg-[#5B8FFF]/30 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Open Family Screen</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Family Voice Warning Toast */}
      <AnimatePresence>
        {familyWarning && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="p-4 rounded-2xl bg-[#1a0f12] border border-red-500/50 shadow-2xl shadow-red-900/30 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-red-400 mb-1">
                Voice Warning from Your Family
              </p>
              <p className="text-lg font-semibold text-white leading-snug">{familyWarning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
