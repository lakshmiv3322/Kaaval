import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, AlertTriangle, Lock, Video, DollarSign, UserX } from 'lucide-react';
import { DetectedTactic } from '../../types';

interface TacticChipProps {
  tactic: DetectedTactic;
  onClick?: () => void;
}

export const TacticChip: React.FC<TacticChipProps> = ({ tactic, onClick }) => {
  const getIcon = () => {
    switch (tactic.category) {
      case 'authority':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      case 'urgency':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      case 'secrecy':
        return <Lock className="w-3.5 h-3.5 text-purple-400" />;
      case 'digital_arrest':
      case 'video_demand':
        return <Video className="w-3.5 h-3.5 text-red-500" />;
      case 'financial':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <UserX className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    if (tactic.severity === 'high') return 'border-red-500/50 bg-red-500/10 text-red-200';
    if (tactic.severity === 'medium') return 'border-amber-500/50 bg-amber-500/10 text-amber-200';
    return 'border-blue-500/40 bg-blue-500/10 text-blue-200';
  };

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap ${getBorderColor()}`}
      title={`${tactic.name}: ${tactic.description}`}
    >
      <span className="p-0.5 rounded-full bg-black/40">{getIcon()}</span>
      <span>{tactic.name}</span>
      {tactic.timestamp && (
        <span className="text-[10px] font-mono opacity-60">
          [{tactic.timestamp}]
        </span>
      )}
    </motion.button>
  );
};
