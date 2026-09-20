import React from 'react';

interface AudioWaveVisualizerProps {
  isActive?: boolean;
  riskScore?: number;
  className?: string;
  barsCount?: number;
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  isActive = true,
  riskScore = 0,
  className = '',
  barsCount = 28,
}) => {
  const bars = Array.from({ length: barsCount });

  return (
    <div className={`flex items-center justify-center gap-1 h-8 ${className}`}>
      {bars.map((_, i) => {
        // dynamic height oscillation
        const delay = (i * 0.08) % 1;
        const duration = 0.6 + ((i % 4) * 0.2);
        const color = riskScore > 65 ? '#EF4444' : riskScore > 30 ? '#F59E0B' : '#5B8FFF';

        return (
          <div
            key={i}
            className="w-1 rounded-full transition-all"
            style={{
              backgroundColor: color,
              height: isActive ? '100%' : '15%',
              opacity: isActive ? 0.85 : 0.25,
              animation: isActive ? `wavePulse ${duration}s ease-in-out ${delay}s infinite alternate` : 'none',
              transformOrigin: 'center',
            }}
          />
        );
      })}
      <style>{`
        @keyframes wavePulse {
          0% { transform: scaleY(0.2); }
          50% { transform: scaleY(0.95); }
          100% { transform: scaleY(0.35); }
        }
      `}</style>
    </div>
  );
};
