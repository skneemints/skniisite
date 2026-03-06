import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';

export const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const { isPlaying, analyser } = useMusic();

  // Stable refs so the render loop always reads the latest context values
  // without needing to restart the effect (which would reset all stars).
  const isPlayingRef = useRef(isPlaying);
  const analyserRef = useRef(analyser);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { analyserRef.current = analyser; }, [analyser]);

  const mouse = useRef({ x: 0, y: 0 });

  // Onset detection (spectral flux)
  const freqDataRef = useRef<Uint8Array | null>(null);
  const prevFreqDataRef = useRef<Uint8Array | null>(null);
  const fluxAvgRef = useRef(0);       // slow avg of flux → adaptive onset threshold
  const lastOnsetTimeRef = useRef(0); // cooldown between recorded onsets

  // Phase-locked beat clock
  const onsetTimesRef = useRef<number[]>([]); // ring buffer of recent onset timestamps
  const beatIntervalRef = useRef(0);          // ms per beat (0 = not yet locked)
  const beatPhaseRef = useRef(0);             // 0.0–1.0, wraps to fire each beat
  const lastFrameTimeRef = useRef(0);         // for computing per-frame delta

  // Beat visual effect state
  const beatRef = useRef(0); // 0–1, set to 1 on each clock tick, decays to 0

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    window.addEventListener('resize', resize);
    resize();

    const starCount = 400;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w * 4 - w * 2,
      y: Math.random() * h * 4 - h * 2,
      z: Math.random() * w,
      size: Math.random() * 2 + 0.5,
      baseSpeed: Math.random() * 0.5 + 0.1
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      const frameNow = performance.now();

      // --- Stage 1: Onset detection via spectral flux ---
      // Records *when* transients occur but does NOT directly pop the stars.
      // Flux = sum of positive spectrum changes between frames (half-wave
      // rectified so only attacks count, not decays). Volume-adaptive because
      // we threshold against a slow average of flux, not an absolute level.
      const currentAnalyser = analyserRef.current;
      if (isPlayingRef.current && currentAnalyser) {
        const binCount = currentAnalyser.frequencyBinCount;
        if (!freqDataRef.current || freqDataRef.current.length !== binCount) {
          freqDataRef.current = new Uint8Array(binCount);
          prevFreqDataRef.current = new Uint8Array(binCount);
        }
        currentAnalyser.getByteFrequencyData(freqDataRef.current);

        let flux = 0;
        const checkBins = Math.min(binCount, 64);
        for (let i = 1; i < checkBins; i++) {
          const diff = freqDataRef.current[i] - prevFreqDataRef.current![i];
          if (diff > 0) flux += diff;
        }
        flux /= checkBins * 255;

        const tmp = prevFreqDataRef.current!;
        prevFreqDataRef.current = freqDataRef.current;
        freqDataRef.current = tmp;

        fluxAvgRef.current = fluxAvgRef.current * 0.95 + flux * 0.05;

        const ratio = fluxAvgRef.current > 0.001 ? flux / fluxAvgRef.current : 0;
        if (ratio > 1.8 && flux > 0.006 && frameNow - lastOnsetTimeRef.current > 250) {
          lastOnsetTimeRef.current = frameNow;

          // Record onset timestamp in a ring buffer (keep last 12)
          const times = onsetTimesRef.current;
          times.push(frameNow);
          if (times.length > 12) times.shift();

          // Need at least 4 onsets to compute 3 intervals reliably
          if (times.length >= 4) {
            // Collect inter-onset intervals in a plausible BPM range (40–200 BPM)
            const intervals: number[] = [];
            for (let i = 1; i < times.length; i++) {
              const ioi = times[i] - times[i - 1];
              if (ioi >= 300 && ioi <= 1500) intervals.push(ioi);
            }

            if (intervals.length >= 3) {
              intervals.sort((a, b) => a - b);
              const median = intervals[Math.floor(intervals.length / 2)];

              // First lock: set immediately. After that, track changes gently
              // so the clock follows gradual tempo drift without lurching.
              if (beatIntervalRef.current === 0) {
                beatIntervalRef.current = median;
              } else {
                beatIntervalRef.current = beatIntervalRef.current * 0.85 + median * 0.15;
              }

              // Phase correction: pull the clock toward treating this onset as
              // a beat boundary (phase 0). Wrap error to [-0.5, 0.5] so we
              // always correct toward the *nearest* boundary, not just phase 0.
              const err = beatPhaseRef.current > 0.5
                ? beatPhaseRef.current - 1.0
                : beatPhaseRef.current;
              beatPhaseRef.current -= err * 0.3;
              if (beatPhaseRef.current < 0) beatPhaseRef.current += 1.0;
            }
          }
        }
      } else {
        // Music stopped — reset frame timer so resuming doesn't cause a
        // giant delta spike. Keep the interval so re-locking is faster.
        lastFrameTimeRef.current = 0;
      }

      // --- Stage 2: Phase-locked beat clock ---
      // Advances a phase accumulator at the locked tempo. When it wraps past
      // 1.0 a beat fires. This is what actually pops the stars — rhythmically
      // and at a stable tempo, regardless of how noisy the onset detection is.
      if (beatIntervalRef.current > 0 && isPlayingRef.current) {
        const frameDelta = lastFrameTimeRef.current > 0
          ? frameNow - lastFrameTimeRef.current
          : 0;
        beatPhaseRef.current += frameDelta / beatIntervalRef.current;
        if (beatPhaseRef.current >= 1.0) {
          beatPhaseRef.current -= 1.0;
          beatRef.current = 1.0;
        }
      }
      lastFrameTimeRef.current = frameNow;

      // --- Decay ---
      beatRef.current *= 0.88;

      // --- Render ---
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      const speedMultiplier = theme.starSpeed || 1;
      const direction = theme.starDirection || 'down';
      // popScale: 1.0 at rest → up to 1.5× at peak beat
      const popScale = 1 + beatRef.current * 0.5;

      stars.forEach((star) => {
        // currentSpeed is NEVER modified by beat — constant drift guaranteed
        const currentSpeed = star.baseSpeed * speedMultiplier;

        let renderX = star.x;
        let renderY = star.y;
        let renderSize = star.size * popScale;
        let opacity = 1;

        // --- Position update (pure constant-speed movement) ---
        if (direction === 'down') {
          star.y += currentSpeed;
          if (star.y > h) star.y = 0;
        } else if (direction === 'up') {
          star.y -= currentSpeed;
          if (star.y < 0) star.y = h;
        } else if (direction === 'right') {
          star.x += currentSpeed;
          if (star.x > w) star.x = 0;
        } else if (direction === 'left') {
          star.x -= currentSpeed;
          if (star.x < 0) star.x = w;
        } else if (direction === 'towards' || direction === 'away') {
          const isTowards = direction === 'towards';
          star.z += isTowards ? -currentSpeed * 5 : currentSpeed * 5;

          if (isTowards && star.z <= 0) {
            star.z = w;
            star.x = Math.random() * w * 4 - w * 2;
            star.y = Math.random() * h * 4 - h * 2;
          } else if (!isTowards && star.z >= w) {
            star.z = 1;
            star.x = Math.random() * w * 4 - w * 2;
            star.y = Math.random() * h * 4 - h * 2;
          }

          const k = 128 / (star.z || 1);
          renderX = star.x * k + w / 2;
          renderY = star.y * k + h / 2;
          const depth = 1 - star.z / w;  // 0 = far, 1 = near
          renderSize = Math.max(0.5, depth * 4 * popScale);
          opacity = depth;
        }

        // --- Mouse warp (repel) ---
        const dx = renderX - mouse.current.x;
        const dy = renderY - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const angle = Math.atan2(dy, dx);
          const force = (150 - dist) / 10;
          renderX += Math.cos(angle) * force;
          renderY += Math.sin(angle) * force;
        }

        ctx.globalAlpha = Math.max(0, opacity);
        ctx.fillStyle = theme.starColor;
        ctx.fillRect(
          Math.floor(renderX),
          Math.floor(renderY),
          Math.max(1, Math.floor(renderSize)),
          Math.max(1, Math.floor(renderSize))
        );
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme.starDirection, theme.starSpeed, theme.starColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full" 
      style={{ 
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
        backgroundColor: 'black'
      }} 
    />
  );
};