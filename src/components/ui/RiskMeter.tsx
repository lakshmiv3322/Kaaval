import React from 'react';
import { motion } from 'motion/react';

interface RiskMeterProps {
  score: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  size = 'md',
  showGlow = true
}) => {
  // Clamp score
  const safeScore = Math.min(100, Math.max(0, score));

  // Determine color and status
  let color = '#22C55E'; // green
  let statusText = 'NORMAL CALL';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (safeScore > 65) {
    color = '#EF4444'; // red
    statusText = 'HIGH RISK SCAM';
    badgeBg = 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse';
  } else if (safeScore > 30) {
    color = '#F59E0B'; // amber
    statusText = 'SUSPICIOUS SCRIPT';
    badgeBg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }

  const radius = size === 'lg' ? 104 : size === 'md' ? 76 : 50;
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 10 : 7;
  const circumference = 2 * Math.PI * radius;
  // Use semi-arc (around 240 degrees)
  const arcLength = circumference * 0.72;
  const strokeDashoffset = arcLength - (arcLength * safeScore) / 100;

  const width = (radius + strokeWidth) * 2;
  const height = width;
  const glowOpacity = 0.08 + (safeScore / 100) * 0.28;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* SVG Arc Gauge */}
      <div
        className="relative"
        style={{
          width,
          height,
          filter: showGlow ? `drop-shadow(0 0 ${8 + safeScore * 0.12}px ${color}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')})` : undefined,
        }}
      >
        <svg
          className="w-full h-full -rotate-[126deg] transform"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Background Track */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active Animated Track */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-mono tracking-wider text-[#CBD5E1] uppercase">
            Threat Level
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <motion.span
              key={safeScore}
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`font-mono font-bold tabular-nums tracking-tight ${
                size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-4xl' : 'text-2xl'
              }`}
              style={{ color }}
            >
              {safeScore}
            </motion.span>
            <span className="font-mono text-sm text-[#9CA3AF]">/100</span>
          </div>
          <span
            className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border ${badgeBg}`}
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
};
