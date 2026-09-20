import React, { useEffect, useRef } from 'react';

interface RiskGlowShaderProps {
  riskScore: number; // 0 to 100
  size?: number;
  className?: string;
}

export const RiskGlowShader: React.FC<RiskGlowShaderProps> = ({
  riskScore,
  size = 360,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let angle = 0;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      if (!prefersReducedMotion) {
        angle += 0.02 + (riskScore / 100) * 0.04;
      }
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Color selection based on risk: 0-30 green/blue, 30-70 amber, 70-100 crimson red
      let r1 = 91, g1 = 143, b1 = 255; // #5B8FFF
      let r2 = 34, g2 = 197, b2 = 94;  // #22C55E

      if (riskScore > 65) {
        // Red / Crimson alert
        r1 = 239; g1 = 68; b1 = 68;    // #EF4444
        r2 = 249; g2 = 115; b2 = 22;   // #F97316
      } else if (riskScore > 30) {
        // Amber warning
        r1 = 245; g1 = 158; b1 = 11;   // #F59E0B
        r2 = 234; g2 = 179; b2 = 8;    // Yellow
      }

      const pulse = prefersReducedMotion ? 1.0 : Math.sin(angle * 2) * 0.15 + 0.85;
      const radius = (width / 2) * 0.9 * pulse;
      const intensity = 0.25 + (riskScore / 100) * 0.55;

      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
      gradient.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, ${intensity})`);
      gradient.addColorStop(0.45, `rgba(${r2}, ${g2}, ${b2}, ${intensity * 0.5})`);
      gradient.addColorStop(0.8, `rgba(${r1}, ${g1}, ${b1}, ${intensity * 0.15})`);
      gradient.addColorStop(1, 'rgba(11, 15, 20, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [riskScore]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 blur-xl transition-opacity duration-500 ${className}`}
      style={{
        opacity: Math.max(0.4, riskScore / 100),
      }}
    />
  );
};
