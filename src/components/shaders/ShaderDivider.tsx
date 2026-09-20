import React from 'react';

interface ShaderDividerProps {
  intensity?: number;
  className?: string;
}

export const ShaderDivider: React.FC<ShaderDividerProps> = ({
  intensity = 1,
  className = ''
}) => {
  return (
    <div className={`relative w-full h-[3px] overflow-hidden ${className}`}>
      {/* Base subtle line */}
      <div className="absolute inset-0 bg-[#1E293B]/60" />
      {/* Flowing animated multi-stop gradient band */}
      <div
        className="absolute inset-0 opacity-85"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #ff5005 25%, #dbba95 45%, #5B8FFF 70%, #d0bce1 85%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: `flowGradient ${8 / intensity}s ease-in-out infinite alternate`,
        }}
      />
      <style>{`
        @keyframes flowGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};
