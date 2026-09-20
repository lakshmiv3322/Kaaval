import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Shield,
  PhoneCall,
  Volume2,
  Users,
  ShieldAlert,
  ArrowRight,
  Clock,
  CheckCircle2,
  Settings,
  ChevronRight,
  ExternalLink,
  Plus,
  Radio,
  FileText
} from 'lucide-react';
import { CallSession, FamilyAlert } from '../types';
import { api, getStoredCalls } from '../services/api';
import { syncBus } from '../services/syncChannel';
import { ShaderGradientHero } from '../components/shaders/ShaderGradientHero';
import { BargeInModal } from '../components/modals/BargeInModal';
import { InviteModal } from '../components/modals/InviteModal';

interface FamilyDashboardProps {
  onNavigate: (route: string) => void;
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({ onNavigate }) => {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [activeAlert, setActiveAlert] = useState<FamilyAlert | null>(null);
  const [isBargeInOpen, setIsBargeInOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [preferredLang, setPreferredLang] = useState('ta');
  const [familyMembersCount, setFamilyMembersCount] = useState(3);
  const [voiceWarningSent, setVoiceWarningSent] = useState(false);

  // Load calls on mount
  useEffect(() => {
    const loaded = getStoredCalls();
    setCalls(loaded);
  }, []);

  // Listen to live sync events
  useEffect(() => {
    const unsubscribe = syncBus.subscribe((msg) => {
      if (msg.type === 'NEW_ALERT') {
        setActiveAlert(msg.payload);
      } else if (msg.type === 'CALL_UPDATE') {
        const update = msg.payload;
        if (update.riskScore && update.riskScore > 60 && !activeAlert) {
          setActiveAlert({
            id: `alert-${Date.now()}`,
            callId: update.id || 'current',
            elderName: update.elderName || 'Mother (Kavitha)',
            timestamp: 'Just now',
            riskScore: update.riskScore,
            tactics: update.detectedTactics?.map((t) => t.name) || ['High Coercion'],
            summary: update.transcript?.[update.transcript.length - 1]?.text || 'Caller claims to be police. Threatening digital arrest.',
            status: 'active',
          });
        }
      } else if (msg.type === 'RESET_STATE') {
        setActiveAlert(null);
        setIsBargeInOpen(false);
        setVoiceWarningSent(false);
      }
    });

    return unsubscribe;
  }, [activeAlert]);

  const handleCallMomNow = () => {
    setIsBargeInOpen(true);
    syncBus.publish({
      type: 'FAMILY_BARGE_IN',
      payload: {
        callId: activeAlert?.callId || 'live',
        message: 'Family member Rahul joined the emergency conference bridge.',
      },
    });
  };

  const handleSendVoiceWarning = () => {
    setVoiceWarningSent(true);
    syncBus.publish({
      type: 'VOICE_WARNING_SENT',
      payload: {
        callId: activeAlert?.callId || 'live',
        warningText: 'அம்மா, இது போலியான அழைப்பு. போனை வையுங்கள், நான் பேசுகிறேன்! (Mom, this is a fake call. Disconnect!)',
      },
    });
  };

  const handleHangupBoth = () => {
    setIsBargeInOpen(false);
    setActiveAlert(null);
    syncBus.publish({
      type: 'CALL_UPDATE',
      payload: {
        status: 'ended',
      },
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#0B0F14] text-[#E5E7EB] py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle 3D background (very low-opacity shader gradient) */}
      <ShaderGradientHero speedMultiplier={0.5} className="opacity-20" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5B8FFF]/15 border border-[#5B8FFF]/30 flex items-center justify-center text-[#5B8FFF]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
                Family Guardian Hub
              </h1>
              <p className="text-xs sm:text-sm text-[#9CA3AF]">
                Monitoring: <strong className="text-white">Kavitha Ramaswamy (Mother)</strong> • Location: Chennai, India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative p-2.5 rounded-xl bg-[#121821] border border-[#1E293B] text-[#9CA3AF]">
              <Bell className="w-5 h-5" />
              {activeAlert && (
                <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-[#121821] absolute top-1.5 right-1.5 animate-ping" />
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121821] hover:bg-[#1A222F] border border-[#1E293B] text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#5B8FFF]" />
              <span>Invite Family Member</span>
            </button>
          </div>
        </div>

        {/* HEADER STATS ROW (Count-up animation on load) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-2xl bg-[#121821] border border-[#1E293B] shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#9CA3AF] uppercase">Active Calls Protected</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-white">
                {activeAlert ? '1' : '0'}
              </span>
              <span className="text-xs font-mono text-emerald-400">● Live Sentinel</span>
            </div>
          </motion.div>

          {/* Stat 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-2xl bg-[#121821] border border-[#1E293B] shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#9CA3AF] uppercase">Scams Intercepted Today</span>
              <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-white">
                {calls.filter((c) => c.riskScore > 65).length}
              </span>
              <span className="text-xs font-mono text-red-400">100% prevented loss</span>
            </div>
          </motion.div>

          {/* Stat 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-2xl bg-[#121821] border border-[#1E293B] shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#9CA3AF] uppercase">Family Guardians</span>
              <div className="w-8 h-8 rounded-lg bg-[#5B8FFF]/15 text-[#5B8FFF] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-white">{familyMembersCount}</span>
              <span className="text-xs font-mono text-[#9CA3AF]">Rahul, Ananya, Dr. Suresh</span>
            </div>
          </motion.div>
        </div>

        {/* LIVE ALERT PANEL (Appears when scam detected) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Real-Time Alert Feed</span>
          </h2>

          <AnimatePresence>
            {activeAlert ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="p-6 sm:p-8 rounded-3xl bg-red-950/25 border-2 border-red-500/60 shadow-2xl relative overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-red-500 text-white font-mono font-bold text-xs animate-pulse">
                        HIGH THREAT DETECTED
                      </span>
                      <span className="text-xs font-mono text-[#9CA3AF]">
                        Triggered {activeAlert.timestamp}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Possible Scam Call Detected – {activeAlert.elderName}
                    </h3>

                    <p className="text-sm sm:text-base text-red-200 max-w-2xl bg-black/40 p-3.5 rounded-xl border border-red-500/30">
                      &quot;{activeAlert.summary}&quot;
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {activeAlert.tactics.map((tac, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono"
                        >
                          ⚠️ {tac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Two Big Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
                    <button
                      type="button"
                      onClick={handleCallMomNow}
                      className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-base shadow-xl shadow-red-900/40 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
                    >
                      <PhoneCall className="w-5 h-5 animate-pulse" />
                      <span>Call Mom Now (Barge In)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendVoiceWarning}
                      disabled={voiceWarningSent}
                      className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border ${
                        voiceWarningSent
                          ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                          : 'bg-[#1E293B] hover:bg-[#2A374D] border-[#334155] text-white'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>{voiceWarningSent ? 'Voice Warning Delivered' : 'Send Voice Warning (Tamil)'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 rounded-3xl bg-[#121821] border border-[#1E293B] text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
                <h4 className="text-base font-bold text-white">No Active Alerts</h4>
                <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
                  All monitored lines are peaceful. When an elder receives a flagged call, your phone will alert you instantly with one-tap barge in.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* RECENT CALLS TIMELINE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5B8FFF]" />
              <span>Recent Calls Timeline</span>
            </h2>
            <span className="text-xs font-mono text-[#9CA3AF]">Showing last 3 monitored sessions</span>
          </div>

          <div className="bg-[#121821] border border-[#1E293B] rounded-3xl divide-y divide-[#1E293B] overflow-hidden">
            {calls.map((call) => {
              const isHigh = call.riskScore > 65;
              const isMed = call.riskScore > 30 && call.riskScore <= 65;
              const colorDot = isHigh ? 'bg-red-500' : isMed ? 'bg-amber-400' : 'bg-emerald-400';

              return (
                <div
                  key={call.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1A222F]/60 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-3 h-3 rounded-full shrink-0 flex items-center justify-center">
                      <span className={`w-3 h-3 rounded-full ${colorDot}`} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-base font-bold text-white">{call.callerLabel}</h4>
                        <span className="text-xs font-mono text-[#9CA3AF]">{call.callerNumber}</span>
                      </div>
                      <p className="text-xs text-[#9CA3AF]">
                        {call.elderName} • {call.startTime} • Duration: {call.durationSeconds}s
                      </p>
                      {call.scamType && (
                        <span className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#0B0F14] border border-[#1E293B] text-[#5B8FFF]">
                          {call.scamType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-mono text-[#9CA3AF] uppercase block">Risk Score</span>
                      <span
                        className={`text-lg font-mono font-bold ${
                          isHigh ? 'text-red-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {call.riskScore}/100
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate(`/demo/evidence/${call.id}`)}
                      className="px-4 py-2 rounded-xl bg-[#0B0F14] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#5B8FFF]" />
                      <span>View Evidence Pack</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SETTINGS SECTION (Simplified for demo) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121821] border border-[#1E293B] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E293B] flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Protection Preferences</h3>
              <p className="text-xs text-[#9CA3AF]">Customize how Kaaval alerts your family</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Toggle: Real-time alerts */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B0F14] border border-[#1E293B]">
              <div>
                <h4 className="text-sm font-semibold text-white">Real-Time Phone Alerts</h4>
                <p className="text-xs text-[#9CA3AF]">Push & high-priority emergency ring</p>
              </div>
              <button
                type="button"
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  alertsEnabled ? 'bg-[#5B8FFF]' : 'bg-[#1E293B]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                    alertsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Dropdown: Preferred language */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B0F14] border border-[#1E293B]">
              <div>
                <h4 className="text-sm font-semibold text-white">Parent Warning Language</h4>
                <p className="text-xs text-[#9CA3AF]">Broadcast voice prompts in mother tongue</p>
              </div>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#121821] border border-[#1E293B] text-white text-xs font-mono focus:border-[#5B8FFF] focus:outline-none"
              >
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="en">English</option>
                <option value="te">Telugu (తెలుగు)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Barge-In Modal */}
      <BargeInModal
        isOpen={isBargeInOpen}
        elderName="Kavitha Ramaswamy (Mother)"
        callerLabel={activeAlert?.tactics[0] || 'Suspected Fraudster Line'}
        callerNumber="+91 98201 44521"
        onClose={() => setIsBargeInOpen(false)}
        onHangupBoth={handleHangupBoth}
      />

      {/* Invite Family Guardian Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={(name) => {
          setFamilyMembersCount((prev) => prev + 1);
        }}
      />
    </div>
  );
};
