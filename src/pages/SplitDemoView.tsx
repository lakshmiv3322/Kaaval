import React from 'react';
import { ElderScreen } from './ElderScreen';
import { FamilyDashboard } from './FamilyDashboard';
import { Smartphone, Users, Sparkles, ExternalLink } from 'lucide-react';

interface SplitDemoViewProps {
  onNavigate: (route: string) => void;
}

export const SplitDemoView: React.FC<SplitDemoViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0F14] text-[#E5E7EB] flex flex-col">
      {/* Top Banner explaining judge dual view */}
      <div className="bg-[#121821] border-b border-[#1E293B] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5B8FFF] animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider font-mono">
            Hackathon Judge Live Presentation Mode
          </span>
          <span className="text-[#9CA3AF] hidden sm:inline">
            — Real-time synchronized twin screen
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#9CA3AF]">
          <span className="hidden md:inline">
            Trigger a call on the Left (Elder) → Watch the Right (Family) alert in real-time
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/demo/elder')}
            className="text-[#5B8FFF] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Single Screen Mode</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#1E293B] overflow-hidden">
        {/* Left: Elder Screen */}
        <div className="relative overflow-y-auto max-h-[88vh]">
          <div className="sticky top-0 z-30 bg-[#0B0F14]/90 backdrop-blur-md px-4 py-2 border-b border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
              <Smartphone className="w-4 h-4 text-[#5B8FFF]" />
              <span>SCREEN 1: ELDER PARENT (KAVITHA, 68)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E293B] text-emerald-400">
              TAMIL / HINDI / ENGLISH
            </span>
          </div>
          <ElderScreen embedded onNavigate={onNavigate} />
        </div>

        {/* Right: Family Dashboard */}
        <div className="relative overflow-y-auto max-h-[88vh]">
          <div className="sticky top-0 z-30 bg-[#0B0F14]/90 backdrop-blur-md px-4 py-2 border-b border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
              <Users className="w-4 h-4 text-red-400" />
              <span>SCREEN 2: FAMILY GUARDIAN (RAHUL - SON)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">
              PUSH ALERTS & ONE-TAP BARGE-IN
            </span>
          </div>
          <FamilyDashboard embedded onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};
