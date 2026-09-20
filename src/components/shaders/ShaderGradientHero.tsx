import React, { useEffect, useRef } from 'react';

interface ShaderGradientHeroProps {
  speedMultiplier?: number;
  interactive?: boolean;
  className?: string;
  riskScore?: number;
}

export const ShaderGradientHero: React.FC<ShaderGradientHeroProps> = ({
  speedMultiplier = 1.0,
  interactive = true,
  className = 'w-full h-full',
  riskScore = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const speedRef = useRef(speedMultiplier);
  const riskRef = useRef(riskScore);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    riskRef.current = riskScore;
  }, [riskScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
    if (!gl) return;

    // Vertex shader source
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader source (ShaderGradient-style organic waves + film grain)
    const fsSource = `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
      #else
      precision mediump float;
      #endif
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uRisk;

      // Hash function for pseudo-random grain
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      // 2D Simplex noise approximation
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = vUv;
        vec2 aspectUv = uv;
        aspectUv.x *= uResolution.x / max(uResolution.y, 1.0);

        // Interactive mouse distortion
        vec2 mouseOffset = (uMouse - 0.5) * 0.15;
        vec2 p = aspectUv + mouseOffset;

        // Multi-frequency wave synthesis
        float t = uTime * 0.35;
        float n1 = snoise(p * 1.6 + vec2(t * 0.4, -t * 0.2));
        float n2 = snoise(p * 2.8 - vec2(-t * 0.3, t * 0.5) + vec2(n1 * 0.6));
        float n3 = snoise(p * 4.2 + vec2(t * 0.2, t * 0.1) + vec2(n2 * 0.4));

        float combined = (n1 * 0.5 + n2 * 0.35 + n3 * 0.15);

        // Color palette based on ShaderGradient:
        // Warm peach/coral #ff5005, soft beige #dbba95, lavender #d0bce1, electric blue #5B8FFF, deep base #0B0F14
        vec3 cDark = vec3(0.043, 0.059, 0.078);      // #0B0F14
        vec3 cNavy = vec3(0.07, 0.094, 0.13);        // Deep surface
        vec3 cWarm1 = vec3(1.0, 0.314, 0.02);        // #ff5005 (coral/orange)
        vec3 cBeige = vec3(0.858, 0.729, 0.584);     // #dbba95 (soft cream)
        vec3 cLavender = vec3(0.816, 0.737, 0.882);  // #d0bce1 (lavender)
        vec3 cElectric = vec3(0.357, 0.561, 1.0);    // #5B8FFF (electric blue)
        vec3 cRiskRed = vec3(0.937, 0.267, 0.267);   // #EF4444 (high risk alert)

        // Dynamic interpolation between peaceful state and danger/alert state
        float riskFactor = clamp(uRisk / 100.0, 0.0, 1.0);
        vec3 accentColor = mix(cElectric, cRiskRed, riskFactor);

        // Gradient wave blending (calmed palette for text readability)
        vec3 color = mix(cDark, cNavy, smoothstep(-0.8, 0.2, combined));
        color = mix(color, cLavender * 0.5, smoothstep(0.0, 0.7, n1));
        color = mix(color, cWarm1 * 0.55, smoothstep(0.2, 0.8, n2) * (1.0 - riskFactor * 0.4));
        color = mix(color, accentColor * 0.7, smoothstep(0.4, 0.95, n3 + combined * 0.3));

        // Center vignette & depth contrast
        float dist = distance(uv, vec2(0.5, 0.45));
        color = mix(color, cDark, smoothstep(0.25, 0.95, dist) * 0.75);

        // Subtle film grain
        float grain = (hash(uv * uResolution + fract(uTime)) - 0.5) * 0.055;
        color += grain;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Compile helpers
    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
    const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
    const uRiskLoc = gl.getUniformLocation(program, 'uRisk');

    // Resize handler
    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse listener
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let startTime = performance.now();
    let accumulatedTime = 0;
    let lastTime = startTime;
    let isVisible = true;
    let isTabActive = !document.hidden;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const drawFrame = (now: number) => {
      const dt = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      accumulatedTime += dt * speedRef.current;

      gl.useProgram(program);
      gl.uniform1f(uTimeLoc, accumulatedTime);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(uMouseLoc, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uRiskLoc, riskRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const render = (now: number) => {
      if (!isVisible || !isTabActive) {
        animationFrameId = 0;
        return;
      }

      drawFrame(now);

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const startLoop = () => {
      if (!animationFrameId && isVisible && isTabActive) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
    };

    // IntersectionObserver to pause off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Tab visibility listener
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
      if (isTabActive && isVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial trigger
    if (prefersReducedMotion) {
      drawFrame(performance.now());
    } else {
      startLoop();
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      stopLoop();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      id="shader-gradient-canvas"
      className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${className}`}
    />
  );
};
