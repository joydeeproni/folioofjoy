'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudio } from '@/lib/audio-context';

type VizMode = 'bars' | 'scope' | 'dots';

const MODES: VizMode[] = ['bars', 'scope', 'dots'];

interface WinampVisualizerProps {
  active: boolean;
  accentColor?: string;
  width?: number;
  height?: number;
  /** Show the little title bar + mode label (off for the inline pill version). */
  showChrome?: boolean;
  className?: string;
}

/**
 * A classic Winamp-style audio visualizer driven by the shared Web Audio
 * AnalyserNode. Click it to cycle: segmented spectrum analyzer → green
 * oscilloscope → falling-dot spectrum.
 */
export function WinampVisualizer({
  active,
  accentColor = '#00ff66',
  width = 240,
  height = 80,
  showChrome = true,
  className = '',
}: WinampVisualizerProps) {
  const { getAnalyser } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const peaksRef = useRef<number[]>([]);
  const [mode, setMode] = useState<VizMode>('bars');
  const modeRef = useRef<VizMode>(mode);
  modeRef.current = mode;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = width;
    const H = height;
    const NUM_BARS = Math.max(8, Math.floor(W / 11));
    peaksRef.current = new Array(NUM_BARS).fill(0);

    // Segmented LED gradient (green → yellow → red), classic Winamp palette.
    const grad = ctx.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, '#00ff44');
    grad.addColorStop(0.55, '#ffe000');
    grad.addColorStop(0.8, '#ff9000');
    grad.addColorStop(1, '#ff2030');

    const drawFrame = () => {
      const analyser = getAnalyser();
      ctx.fillStyle = '#040608';
      ctx.fillRect(0, 0, W, H);

      if (!analyser) {
        if (showChrome) {
          ctx.fillStyle = 'rgba(0,255,102,0.45)';
          ctx.font = '9px monospace';
          ctx.fillText('· · · awaiting signal · · ·', 14, H / 2);
        }
        rafRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const m = modeRef.current;

      if (m === 'scope') {
        const buf = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(buf);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        const step = W / buf.length;
        for (let i = 0; i < buf.length; i++) {
          const y = (buf[i] / 255) * H;
          const x = i * step;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        // Use the lower ~70% of the spectrum where music energy lives.
        const usable = Math.floor(data.length * 0.7);
        const binsPerBar = Math.max(1, Math.floor(usable / NUM_BARS));
        const gap = W > 120 ? 2 : 1;
        const barW = (W - gap * (NUM_BARS - 1)) / NUM_BARS;
        const peaks = peaksRef.current;

        for (let i = 0; i < NUM_BARS; i++) {
          let sum = 0;
          for (let j = 0; j < binsPerBar; j++) sum += data[i * binsPerBar + j];
          const v = Math.pow(sum / binsPerBar / 255, 0.85);
          const bh = v * H;
          const x = i * (barW + gap);

          if (m === 'dots') {
            peaks[i] = Math.max(peaks[i] - H * 0.02, bh);
            const dotY = H - peaks[i];
            ctx.fillStyle = grad;
            ctx.fillRect(x, dotY - 2, barW, 3);
          } else {
            ctx.fillStyle = grad;
            ctx.fillRect(x, H - bh, barW, bh);
            peaks[i] = Math.max(peaks[i] - H * 0.012, bh);
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.fillRect(x, H - peaks[i] - 2, barW, 2);
          }
        }

        // Horizontal scanlines to fake the segmented-LED look.
        ctx.fillStyle = '#040608';
        for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
      }

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, getAnalyser, accentColor, width, height, showChrome]);

  if (!active) return null;

  const cycleMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMode((cur) => MODES[(MODES.indexOf(cur) + 1) % MODES.length]);
  };

  if (!showChrome) {
    return (
      <button
        onClick={cycleMode}
        title={`Visualizer: ${mode} — click to change`}
        className={`block rounded-md overflow-hidden border border-white/10 flex-shrink-0 ${className}`}
        style={{ backgroundColor: '#040608' }}
      >
        <canvas ref={canvasRef} width={width} height={height} className="block" style={{ width, height }} />
      </button>
    );
  }

  return (
    <button
      onClick={cycleMode}
      title="Click to change visualization"
      className={`block rounded-lg overflow-hidden border border-white/15 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.02] ${className}`}
      style={{ backgroundColor: 'rgba(4,6,8,0.85)' }}
    >
      {/* Tiny classic title bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-white/[0.06]">
        <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/40">Visualizer</span>
        <span className="text-[8px] font-mono uppercase tracking-wider text-white/30">{mode}</span>
      </div>
      <canvas ref={canvasRef} width={width} height={height} className="block" style={{ width, height }} />
    </button>
  );
}
