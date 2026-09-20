import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  PhoneCall,
  PhoneOff,
  AlertTriangle,
  Play,
  RotateCcw,
  Volume2,
  Users,
  Mic,
  MicOff,
  Shield,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
  Lock,
  Cpu,
  Zap,
  Send,
  HelpCircle,
  X
} from 'lucide-react';
import { CallSession, DetectedTactic, TranscriptChunk, AnalysisResult } from '../types';
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

const highlightTranscript = (text: string) =>
  text.split(/(Inspector|Crime Branch|arrest|warrant|Digital Arrest|Skype|do not|transfer|surveillance|CBI|Police|Escrow|OTP)/gi).map((part, index) => {
    const highlighted = /^(Inspector|Crime Branch|arrest|warrant|Digital Arrest|Skype|do not|transfer|surveillance|CBI|Police|Escrow|OTP)$/i.test(part);
    return highlighted ? (
      <mark key={`${part}-${index}`} className="rounded bg-red-500/25 px-1 text-red-100 font-semibold">
        {part}
      </mark>
    ) : (
      part
    );
  });

export const ElderScreen: React.FC<ElderScreenProps> = ({ onNavigate }) => {
  const reduceMotion = useReducedMotion();
  const [selectedScenarioId, setSelectedScenarioId] = useState('digital-arrest-cbi');
  const [selectedLanguage, setSelectedLanguage] = useState<'ta' | 'hi' | 'en' | 'te'>('ta');
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [childAlertState, setChildAlertState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [liveTranscript, setLiveTranscript] = useState<TranscriptChunk[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isRiskShaking, setIsRiskShaking] = useState(false);

  // Analysis metadata
  const [analysisMeta, setAnalysisMeta] = useState<{
    engine: 'gemini' | 'heuristics';
    latencyMs: number;
    wasRedacted: boolean;
    redactedTypes: string[];
    redactedCount: number;
  }>({
    engine: 'heuristics',
    latencyMs: 12,
    wasRedacted: false,
    redactedTypes: [],
    redactedCount: 0,
  });

  // Live Mic Mode State
  const [isMicConsentOpen, setIsMicConsentOpen] = useState(false);
  const [isLiveMicActive, setIsLiveMicActive] = useState(false);
  const [micLanguage, setMicLanguage] = useState<'ta-IN' | 'hi-IN' | 'en-IN'>('ta-IN');
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // "Try to Fool It" Judge Testing Bench State
  const [isJudgeBenchOpen, setIsJudgeBenchOpen] = useState(false);
  const [customJudgeInput, setCustomJudgeInput] = useState('');
  const [isTestingCustom, setIsTestingCustom] = useState(false);

  const previousRiskRef = useRef(0);
  const scenario = SCENARIO_PRESETS.find((s) => s.id === selectedScenarioId) || SCENARIO_PRESETS[0];

  const [familyWarning, setFamilyWarning] = useState<string | null>(null);
  const timerRef = useRef(0);
  const sessionRef = useRef<CallSession | null>(null);

  useEffect(() => { timerRef.current = timerSeconds; }, [timerSeconds]);
  useEffect(() => { sessionRef.current = callSession; }, [callSession]);

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechRecognitionSupported(false);
      }
    }
  }, []);

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
        speakAlert(text);
        setTimeout(() => setFamilyWarning(null), 12000);
      } else if (msg.type === 'FAMILY_HANGUP') {
        setIsPlaying(false);
        stopLiveMic();
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
    if ((isPlaying || isLiveMicActive) && callSession?.status === 'in-progress') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isLiveMicActive, callSession?.status]);

  // Spoken warning using SpeechSynthesis
  const speakAlert = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.95;
      if (selectedLanguage === 'ta') utt.lang = 'ta-IN';
      else if (selectedLanguage === 'hi') utt.lang = 'hi-IN';
      else utt.lang = 'en-IN';
      window.speechSynthesis.speak(utt);
    } catch (_e) {
      // safe fallback
    }
  };

  /**
   * UNIFIED PIPELINE FOR ALL INPUTS (Replay, Live Mic, Pasted Judge Text)
   * Redacts -> POST /api/demo/call/analyze -> updates tactics and risk -> alerts family if >= 65
   */
  const processUtterance = useCallback(
    async (speaker: 'caller' | 'elder' | 'agent', text: string, translation?: string) => {
      let currentSession = sessionRef.current;
      if (!currentSession) {
        currentSession = await api.startCall(selectedScenarioId);
        sessionRef.current = currentSession;
        setCallSession(currentSession);
      }

      const timestamp = formatTime(timerRef.current);
      const newChunk: TranscriptChunk = {
        id: `chunk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp,
        speaker,
        text,
        translation,
      };

      // Append to live transcript
      setLiveTranscript((prev) => {
        const next = [...prev, newChunk];
        return next;
      });

      // Rolling transcript text for context
      const fullText = [...(sessionRef.current?.transcript || []), newChunk]
        .map((c) => `${c.speaker === 'caller' ? 'Caller' : 'Elder'}: ${c.text}`)
        .join('\n');

      // Send through pipeline
      const analysis = await api.analyzeCall({
        callId: currentSession.id,
        transcriptText: fullText,
        callerNumber: currentSession.callerNumber,
        callerLabel: currentSession.callerLabel,
        isFamily: selectedScenarioId === 'safe-call-daughter',
        previousRiskScore: currentSession.riskScore,
      });

      setAnalysisMeta({
        engine: analysis.engine,
        latencyMs: analysis.latencyMs,
        wasRedacted: Boolean(analysis.wasRedacted),
        redactedTypes: analysis.redactedTypes || [],
        redactedCount: analysis.redactedCount || 0,
      });

      const updatedRisk = analysis.riskScore;
      const updatedLevel = analysis.riskLevel;
      const updatedTactics = analysis.tactics;
      const shouldAlert = updatedRisk >= 65 && !currentSession.alertTriggered;

      const updatedSession: CallSession = {
        ...currentSession,
        riskScore: updatedRisk,
        riskLevel: updatedLevel,
        detectedTactics: updatedTactics,
        transcript: [...currentSession.transcript, newChunk],
        alertTriggered: currentSession.alertTriggered || shouldAlert,
      };

      sessionRef.current = updatedSession;
      setCallSession(updatedSession);

      if (shouldAlert) {
        const alertPayload = {
          id: `alert-${Date.now()}`,
          callId: currentSession.id,
          elderName: currentSession.elderName,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          riskScore: updatedRisk,
          tactics: updatedTactics.map((t) => t.name),
          summary: analysis.summary || text,
          status: 'active' as const,
        };
        syncBus.publish({ type: 'NEW_ALERT', payload: alertPayload });
        api.triggerFamilyAlert(alertPayload);

        // Audio vocal warning
        const regional = REGIONAL_WARNINGS[selectedLanguage] || REGIONAL_WARNINGS.en;
        speakAlert(`${regional.title}. ${regional.subtitle}`);
      }

      syncBus.publish({ type: 'CALL_UPDATE', payload: updatedSession });
    },
    [selectedScenarioId, selectedLanguage]
  );

  // Scripted scenario step-by-step playback
  useEffect(() => {
    if (!isPlaying || currentChunkIndex >= scenario.chunks.length - 1) return;

    const nextIndex = currentChunkIndex + 1;
    const chunkData = scenario.chunks[nextIndex];

    const timeout = setTimeout(() => {
      setCurrentChunkIndex(nextIndex);
      processUtterance(chunkData.speaker, chunkData.text, chunkData.translation);
    }, chunkData.delayMs / speedMultiplier);

    return () => clearTimeout(timeout);
  }, [isPlaying, currentChunkIndex, scenario, speedMultiplier, processUtterance]);

  // Live Mic Functions (Web Speech API)
  const startLiveMic = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = micLanguage;

      recognition.onstart = () => {
        setIsLiveMicActive(true);
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const spokenText = lastResult[0].transcript.trim();
          if (spokenText) {
            processUtterance('caller', spokenText);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setIsLiveMicActive(false);
          alert('Microphone permission was denied. Please allow microphone access to use Live Mic Mode.');
        }
      };

      recognition.onend = () => {
        // Auto-restart if still flagged active
        if (isLiveMicActive) {
          try {
            recognition.start();
          } catch (_e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsLiveMicActive(true);
      setIsMicConsentOpen(false);

      if (!callSession || callSession.status === 'ended') {
        handleStartCall();
      }
    } catch (e) {
      console.error('Failed to start speech recognition', e);
    }
  };

  const stopLiveMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {}
      recognitionRef.current = null;
    }
    setIsLiveMicActive(false);
  };

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
    stopLiveMic();
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
    stopLiveMic();
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
          summary: 'Elder pressed "Call My Son" emergency intervention button.',
          status: 'active',
        },
      });
    }
  };

  const handleTestJudgeSentence = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customJudgeInput.trim()) return;

    setIsTestingCustom(true);
    if (!callSession || callSession.status === 'ended') {
      await handleStartCall();
    }
    await processUtterance('caller', customJudgeInput.trim());
    setCustomJudgeInput('');
    setIsTestingCustom(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentRisk = callSession?.riskScore || 0;
  const isCallActive = callSession?.status === 'in-progress' || callSession?.status === 'barged-in';
  const currentWarning = REGIONAL_WARNINGS[selectedLanguage] || REGIONAL_WARNINGS.en;

  // Visual shake feedback on danger crossing
  useEffect(() => {
    const crossedDanger = previousRiskRef.current < 65 && currentRisk >= 65;
    previousRiskRef.current = currentRisk;
    if (!crossedDanger || reduceMotion) return;

    setIsRiskShaking(true);
    const shakeTimer = window.setTimeout(() => setIsRiskShaking(false), 300);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([200, 100, 200]);

    if (hasInteracted && !isMuted && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        const gain = context.createGain();
        gain.gain.setValueAtTime(0.04, context.currentTime);
        gain.connect(context.destination);
        [660, 440].forEach((freq, idx) => {
          const osc = context.createOscillator();
          osc.frequency.value = freq;
          osc.type = 'sine';
          osc.connect(gain);
          osc.start(context.currentTime + idx * 0.12);
          osc.stop(context.currentTime + idx * 0.12 + 0.09);
        });
        window.setTimeout(() => void context.close(), 500);
      }
    }
    return () => window.clearTimeout(shakeTimer);
  }, [currentRisk, hasInteracted, isMuted, reduceMotion]);

  return (
    <motion.div
      id="elder-screen-root"
      onPointerDown={() => {
        setHasInteracted(true);
        if (!hasInteracted) setIsMuted(false);
      }}
      animate={{ x: isRiskShaking ? [0, -3, 3, 0] : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative min-h-[calc(100vh-4rem)] text-[#E5E7EB] flex flex-col justify-between overflow-hidden transition-[background-color] duration-700"
      style={{ backgroundColor: currentRisk >= 65 ? '#1C0E12' : currentRisk >= 30 ? '#1B1710' : '#0B0F14' }}
    >
      {/* Background Subtle Shader Gradient */}
      <ShaderGradientHero
        speedMultiplier={isCallActive ? 1.4 + (currentRisk / 100) * 1.5 : 0.6}
        riskScore={currentRisk}
        className="opacity-35"
      />

      {/* TOP STATUS & ENGINE BAR */}
      <header className="relative z-10 w-full border-b border-[#1E293B]/70 bg-[#121821]/80 backdrop-blur-md px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5B8FFF]/20 border border-[#5B8FFF]/40 flex items-center justify-center text-[#5B8FFF]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">Kaaval Elder Shield</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                ACTIVE PROTECTION
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] font-mono">
              Protected: Kavitha Ramaswamy (68 yrs) • Chennai
            </p>
          </div>
        </div>

        {/* Engine Badge, Latency & Redaction Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Engine Badge */}
          <div
            id="engine-badge"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B0F14] border border-[#1E293B] text-xs font-mono"
            title={`Real detection engine: ${analysisMeta.engine}`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#5B8FFF]" />
            <span className="text-[#9CA3AF]">Engine:</span>
            <span className="text-white font-bold">
              {analysisMeta.engine === 'gemini' ? 'Gemini 3.8 Flash' : 'Offline Heuristics'}
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 rounded">
              {analysisMeta.latencyMs}ms
            </span>
          </div>

          {/* Privacy Redaction Chip */}
          {analysisMeta.wasRedacted && (
            <div
              id="redacted-chip"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-[11px] font-mono text-indigo-300"
              title="Aadhaar/Phone/OTP redacted before sending to LLM"
            >
              <Lock className="w-3 h-3" />
              <span>Redacted ({analysisMeta.redactedCount})</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            id="sound-toggle-button"
            onClick={() => setIsMuted((muted) => !muted)}
            className="flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#26303C] bg-[#0B0F14]/80 px-2.5 text-xs font-semibold text-white hover:bg-[#1E293B]"
            aria-pressed={isMuted}
          >
            <Volume2 className={`h-3.5 w-3.5 ${isMuted ? 'text-[#9CA3AF]' : 'text-[#5B8FFF]'}`} />
            <span>{isMuted ? 'Muted' : 'Spoken'}</span>
          </button>

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
          </div>
        </div>
      </header>

      {/* PERSISTENT LISTENING / CALL STATUS BANNER */}
      <div className="relative z-10 w-full bg-[#121821]/90 border-b border-[#1E293B] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isLiveMicActive || isCallActive ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span className="font-semibold text-white">
            {isLiveMicActive
              ? 'Kaaval is listening (Speakerphone Mode) — Cellular, WhatsApp & Skype Protected'
              : isCallActive
              ? 'Call in Progress — Real-time Acoustic Script Analysis'
              : 'Idle — Ready to screen incoming calls'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Mic Toggle Button */}
          <button
            type="button"
            id="live-mic-button"
            onClick={() => {
              if (isLiveMicActive) {
                stopLiveMic();
              } else {
                setIsMicConsentOpen(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
              isLiveMicActive
                ? 'bg-red-600 border-red-400 text-white animate-pulse'
                : 'bg-[#1E293B] hover:bg-[#2A374D] border-[#334155] text-[#E5E7EB]'
            }`}
          >
            {isLiveMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-[#9CA3AF]" />}
            <span>{isLiveMicActive ? 'Stop Live Mic' : 'Start Live Mic'}</span>
          </button>

          {/* Judge Testing Bench Toggle */}
          <button
            type="button"
            id="judge-bench-toggle"
            onClick={() => setIsJudgeBenchOpen(!isJudgeBenchOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#5B8FFF]/15 hover:bg-[#5B8FFF]/25 border border-[#5B8FFF]/30 text-[#8EB2FF] text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Judge Test Bench</span>
          </button>
        </div>
      </div>

      {/* JUDGE ADVERSARIAL TESTING BENCH (Collapsible) */}
      <AnimatePresence>
        {isJudgeBenchOpen && (
          <motion.div
            id="judge-test-bench"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-20 bg-[#0c131d] border-b border-[#1E293B] px-4 sm:px-8 py-4 overflow-hidden"
          >
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5B8FFF]" />
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    Judge Adversarial Evaluation Bench ("Try to Fool It")
                  </h4>
                </div>
                <span className="text-[11px] text-[#9CA3AF] font-mono">
                  Real API pipeline execution (Redaction → Hybrid Engine → Substring Verified)
                </span>
              </div>

              {/* Quick Prompt Presets */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCustomJudgeInput('This is DCP Crime Branch. Non-bailable arrest warrant issued under Section 420. Do not disconnect the line.')}
                  className="px-2.5 py-1 rounded-lg bg-[#121821] hover:bg-[#1E293B] border border-red-500/30 text-red-300"
                >
                  ⚡ Digital Arrest Threat
                </button>
                <button
                  type="button"
                  onClick={() => setCustomJudgeInput('Hi Ma, I just transferred 5,000 to your bank account for vegetables. Did you take your blood pressure medicine?')}
                  className="px-2.5 py-1 rounded-lg bg-[#121821] hover:bg-[#1E293B] border border-emerald-500/30 text-emerald-300"
                >
                  🌱 Benign Family Contact
                </button>
                <button
                  type="button"
                  onClick={() => setCustomJudgeInput('Dear customer, electricity bill unpaid. Power will be disconnected tonight at 9:30 PM. Call this number immediately.')}
                  className="px-2.5 py-1 rounded-lg bg-[#121821] hover:bg-[#1E293B] border border-amber-500/30 text-amber-300"
                >
                  ⚠️ Fake Electricity Bill
                </button>
                <button
                  type="button"
                  onClick={() => setCustomJudgeInput('Stay in your room on Skype video call for Supreme Court verification. Share OTP 948201 for clearance.')}
                  className="px-2.5 py-1 rounded-lg bg-[#121821] hover:bg-[#1E293B] border border-red-500/30 text-red-300"
                >
                  🚨 Extortion with OTP
                </button>
              </div>

              {/* Custom Input Box */}
              <form onSubmit={handleTestJudgeSentence} className="flex gap-2">
                <input
                  type="text"
                  id="judge-input-field"
                  value={customJudgeInput}
                  onChange={(e) => setCustomJudgeInput(e.target.value)}
                  placeholder="Type or paste any caller sentence to test live detection..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-white text-xs sm:text-sm focus:border-[#5B8FFF] focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  id="judge-submit-button"
                  disabled={isTestingCustom || !customJudgeInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#5B8FFF] hover:bg-[#4A7CEB] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTestingCustom ? 'Analyzing...' : 'Run Pipeline'}</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-center">
        {/* State 1: IDLE */}
        {!isCallActive && callSession?.status !== 'ended' && (
          <div className="text-center py-10">
            <div className="relative inline-block mb-6">
              <Shield3D riskScore={0} size={160} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Kaaval Shield is Guarding
            </h2>
            <p className="mt-3 text-base text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
              When an incoming call begins on cellular, WhatsApp, or Skype, Kaaval screens the speech in real-time and warns you before coercive extortion occurs.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                id="start-demo-call-button"
                onClick={handleStartCall}
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg tracking-wide shadow-xl shadow-emerald-900/30 transition-all flex items-center gap-3 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <span>Simulate Call Replay</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMicConsentOpen(true)}
                className="px-6 py-4 rounded-2xl bg-[#1E293B] hover:bg-[#2A374D] border border-[#334155] text-white font-semibold text-base flex items-center gap-2.5 transition-all"
              >
                <Mic className="w-5 h-5 text-[#5B8FFF]" />
                <span>Use Live Microphone</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: CALL IN PROGRESS */}
        {isCallActive && (
          <div className="space-y-6">
            {/* Call Status Card (High Contrast for Elders) */}
            <div className="relative bg-[#121821] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
              {/* Caller Identifier */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
                <div className="text-left">
                  <span className="text-xs font-mono text-[#9CA3AF] uppercase">Caller Connection</span>
                  <h4 className="text-xl font-black text-white tracking-tight">
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
                    {currentRisk >= 65 ? '🔴 Danger State' : currentRisk >= 30 ? '🟡 Warning State' : '🟢 Safe State'}
                  </span>
                </div>
              </div>

              {/* HIGH CONTRAST REGIONAL WARNING BANNER */}
              <AnimatePresence>
                {currentRisk >= 65 && (
                  <motion.div
                    role="alert"
                    aria-live="assertive"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative my-4 overflow-hidden rounded-2xl border-2 border-white/40 bg-[#A91524] p-6 text-center text-white shadow-2xl"
                  >
                    <div className="pointer-events-none absolute inset-3 rounded-xl border border-white/50 animate-ping" />
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <AlertTriangle className="w-7 h-7 text-yellow-300 animate-bounce" />
                      <h3 className="text-[28px] font-black leading-tight tracking-tight sm:text-[36px]">
                        {currentWarning.title}
                      </h3>
                    </div>
                    <p className="text-xl font-bold leading-7 text-white">
                      {currentWarning.subtitle}
                    </p>
                    <p className="mt-2 text-base font-semibold leading-6 text-yellow-100">
                      {currentWarning.advice}
                    </p>
                    <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        id="elder-hangup-warning-button"
                        onClick={handleEndCall}
                        className="min-h-[64px] rounded-xl bg-white px-4 text-xl font-black text-[#71101A] transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                      >
                        <PhoneOff className="w-6 h-6" />
                        <span>Hang Up Immediately</span>
                      </button>
                      <button
                        type="button"
                        id="elder-call-son-button"
                        onClick={handleCallChildNow}
                        className="min-h-[64px] rounded-xl border-2 border-white bg-transparent hover:bg-white/10 px-4 text-xl font-black text-white transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Users className="w-6 h-6" />
                        <span>Call My Son (Rahul)</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TACTIC CHIPS ROW */}
              <div className="my-4">
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#9CA3AF] mb-2 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#5B8FFF]" />
                  <span>Verified Detected Tactics:</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 min-h-[36px]">
                  {callSession?.detectedTactics.length === 0 ? (
                    <span className="text-xs text-[#9CA3AF] italic">Listening for psychological coercion...</span>
                  ) : (
                    callSession?.detectedTactics.map((tactic) => (
                      <TacticChip key={tactic.id} tactic={tactic} />
                    ))
                  )}
                </div>
              </div>

              {/* LIVE TRANSCRIPT STREAM TICKER */}
              <div className="mt-4 p-4 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-left max-h-48 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] pb-1 border-b border-[#1E293B]">
                  <span>Live Speech-to-Text Acoustic Stream</span>
                  <AudioWaveVisualizer isActive={isPlaying || isLiveMicActive} riskScore={currentRisk} barsCount={16} />
                </div>
                {liveTranscript.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] italic">Awaiting speech audio stream...</p>
                ) : (
                  liveTranscript.map((chunk, index) => (
                    <div
                      key={chunk.id}
                      className={`text-[17px] sm:text-[19px] leading-7 transition-opacity duration-300 ${
                        index === liveTranscript.length - 1 ? 'text-white' : 'text-white/50'
                      }`}
                    >
                      <span className="font-mono text-[#9CA3AF] text-xs mr-2">[{chunk.timestamp}]</span>
                      <span
                        className={
                          chunk.speaker === 'caller'
                            ? 'text-red-400 font-bold'
                            : 'text-emerald-400 font-bold'
                        }
                      >
                        {chunk.speaker === 'caller' ? 'Caller' : 'Elder'}:
                      </span>{' '}
                      <span className={index === liveTranscript.length - 1 ? 'text-white' : 'text-white/60'}>
                        {highlightTranscript(chunk.text)}
                      </span>
                      {chunk.translation && (
                        <p className="text-[12px] text-[#9CA3AF] pl-10 italic">{chunk.translation}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* BIG HELP BUTTONS */}
              <div className="mt-6 pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  id="elder-main-sos-button"
                  onClick={handleCallChildNow}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl cursor-pointer ${
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
                      ? 'Family Connected on 3-Way Bridge'
                      : 'Call My Son (Emergency SOS)'}
                  </span>
                </button>

                <button
                  type="button"
                  id="elder-main-hangup-button"
                  onClick={handleEndCall}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#1E293B] hover:bg-red-900/30 hover:border-red-500/50 border border-[#334155] text-white font-semibold text-base transition-all"
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
              The potential scam was contained. All flagged timestamps, quotes, and transcript hashes have been saved to your family evidence pack.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => onNavigate(`/demo/evidence/${callSession.id}`)}
                className="px-6 py-3.5 rounded-xl bg-[#5B8FFF] hover:bg-[#4A7CEB] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-[#5B8FFF]/25"
              >
                <span>View Evidence Pack PDF</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3.5 rounded-xl bg-[#1E293B] hover:bg-[#2A374D] text-[#E5E7EB] font-medium text-sm"
              >
                Start New Test
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER CONTROLS */}
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
              <span>Family Hub</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/demo/eval')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Eval (Phase 2)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* MIC CONSENT MODAL */}
      <AnimatePresence>
        {isMicConsentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#121821] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Live Microphone Shield</h3>
                    <p className="text-xs text-[#9CA3AF]">Speakerphone Acoustic Protection</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMicConsentOpen(false)}
                  className="text-[#9CA3AF] hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-[#CBD5E1] leading-relaxed">
                <p>
                  Kaaval captures audio via your phone or computer microphone while your call is on{' '}
                  <strong className="text-white">speakerphone</strong>.
                </p>
                <div className="p-3.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Works Across Cellular, WhatsApp & Skype</span>
                  </div>
                  <p className="text-[#9CA3AF]">
                    Because the microphone hears incoming audio broadcast over the speaker, Kaaval protects you on any carrier call, WhatsApp voice/video call, or Skype investigation interrogation.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                    <Lock className="w-4 h-4" />
                    <span>Privacy & Redaction First</span>
                  </div>
                  <p className="text-[#9CA3AF]">
                    Speech is transcribed into text. Phone numbers, bank accounts, Aadhaar digits, and OTPs are automatically redacted before tactical pattern analysis.
                  </p>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-mono text-[#9CA3AF] mb-2 uppercase">
                  Spoken Speech Recognition Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMicLanguage('ta-IN')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      micLanguage === 'ta-IN'
                        ? 'bg-[#5B8FFF] border-[#5B8FFF] text-white'
                        : 'bg-[#0B0F14] border-[#1E293B] text-[#9CA3AF]'
                    }`}
                  >
                    தமிழ் (Tamil)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMicLanguage('hi-IN')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      micLanguage === 'hi-IN'
                        ? 'bg-[#5B8FFF] border-[#5B8FFF] text-white'
                        : 'bg-[#0B0F14] border-[#1E293B] text-[#9CA3AF]'
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMicLanguage('en-IN')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      micLanguage === 'en-IN'
                        ? 'bg-[#5B8FFF] border-[#5B8FFF] text-white'
                        : 'bg-[#0B0F14] border-[#1E293B] text-[#9CA3AF]'
                    }`}
                  >
                    English (India)
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMicConsentOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#1E293B] hover:bg-[#2A374D] text-[#CBD5E1] font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={startLiveMic}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <Mic className="w-4 h-4" />
                  <span>I Consent — Enable Mic</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voice Warning from Family Toast */}
      <AnimatePresence>
        {familyWarning && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="p-4 rounded-2xl bg-[#1a0f12] border border-red-500/60 shadow-2xl shadow-red-900/40 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-red-400 mb-1">
                Emergency Voice Warning from Rahul (Son)
              </p>
              <p className="text-lg font-bold text-white leading-snug">{familyWarning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
