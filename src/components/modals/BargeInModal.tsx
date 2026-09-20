import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneCall, PhoneOff, Mic, MicOff, Volume2, ShieldAlert, CheckCircle2, Radio } from 'lucide-react';
import { AudioWaveVisualizer } from '../ui/AudioWaveVisualizer';

interface BargeInModalProps {
  isOpen: boolean;
  elderName: string;
  callerLabel: string;
  callerNumber: string;
  onClose: () => void;
  onHangupBoth: () => void;
}

export const BargeInModal: React.FC<BargeInModalProps> = ({
  isOpen,
  elderName,
  callerLabel,
  callerNumber,
  onClose,
  onHangupBoth
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [warningPlayed, setWarningPlayed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Conference Bridge Established. You are live on the line.');

  if (!isOpen) return null;

  const handlePlayWarning = () => {
    setWarningPlayed(true);
    setStatusMessage('🚨 Playing Audio Override: "This call is recorded by Cyber Crime Cell. Disconnect immediately."');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-xl bg-[#121821] border border-red-500/40 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-5 border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-wider text-red-400 uppercase">
                    3-Way Rescue Bridge
                  </span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Live Intervention in Progress
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#9CA3AF] hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-[#1E293B] transition-colors"
            >
              Minimize
            </button>
          </div>

          {/* Active Participants */}
          <div className="my-6 grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-center">
              <span className="text-[10px] font-mono text-[#9CA3AF] uppercase block">Family Member</span>
              <p className="font-semibold text-white text-sm mt-0.5">You (Son)</p>
              <span className="text-[11px] text-emerald-400 font-mono">● Speaking Live</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F14] border border-emerald-500/30 text-center">
              <span className="text-[10px] font-mono text-[#9CA3AF] uppercase block">Protected Elder</span>
              <p className="font-semibold text-white text-sm mt-0.5">{elderName}</p>
              <span className="text-[11px] text-emerald-400 font-mono">● Connected</span>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/40 text-center">
              <span className="text-[10px] font-mono text-red-400 uppercase block">Suspected Scammer</span>
              <p className="font-semibold text-red-300 text-sm mt-0.5 truncate">{callerLabel}</p>
              <span className="text-[10px] font-mono text-[#9CA3AF]">{callerNumber}</span>
            </div>
          </div>

          {/* Acoustic Waveform */}
          <div className="bg-[#0B0F14]/70 border border-[#1E293B] rounded-xl p-4 my-4 flex flex-col items-center justify-center">
            <AudioWaveVisualizer isActive={true} riskScore={85} barsCount={36} className="w-full" />
            <p className="text-xs font-mono text-[#9CA3AF] mt-2 text-center">
              {statusMessage}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={handlePlayWarning}
              disabled={warningPlayed}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                warningPlayed
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-[#1E293B] hover:bg-[#2A374D] border-[#334155] text-white'
              }`}
            >
              {warningPlayed ? <CheckCircle2 className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              {warningPlayed ? 'Warning Broadcasted' : 'Broadcast Police Warning'}
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-[#1E293B] hover:bg-[#2A374D] border border-[#334155] text-white transition-all"
            >
              {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              {isMuted ? 'Unmute My Mic' : 'Mute My Mic'}
            </button>
          </div>

          {/* Big Red Hangup Scammer Line */}
          <div className="mt-4 pt-4 border-t border-[#1E293B] flex gap-3">
            <button
              type="button"
              onClick={onHangupBoth}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-red-900/30 transition-all active:scale-[0.98]"
            >
              <PhoneOff className="w-4 h-4" />
              Force Disconnect Scammer & Safeguard Mom
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
