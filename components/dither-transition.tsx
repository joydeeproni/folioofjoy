'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { animate } from 'motion';
import { useDialKit } from 'dialkit';
import { useAudio } from '@/lib/audio-context';

// Classic recursive 8x8 ordered (Bayer) dither matrix, values 0..63.
const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

// Stable hash -> [0,1). Deterministic for a given pair.
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

// Smooth value noise in [0,1] — coherent (neighbouring samples are correlated).
function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const tl = hash2(xi, yi);
  const tr = hash2(xi + 1, yi);
  const bl = hash2(xi, yi + 1);
  const br = hash2(xi + 1, yi + 1);
  const u = smooth(xf);
  const v = smooth(yf);
  const top = tl + (tr - tl) * u;
  const bot = bl + (br - bl) * u;
  return top + (bot - top) * v;
}

// Fractal Brownian motion — stacks octaves for big drifts + fine grain.
function fbm(x: number, y: number, octaves: number): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq);
    norm += amp;
    freq *= 2;
    amp *= 0.5;
  }
  return sum / norm;
}

interface DriftSettings {
  scale: number;
  spread: string;
  direction: number;
  directionStrength: number;
  grain: number;
  octaves: number;
}

interface DitherSettings {
  cellSize: number;
  gap: number;
  duration: number;
  pattern: string;
  shape: string;
  feather: number;
  drift: DriftSettings;
  easing: string;
  color: string;
}

interface Grid {
  cols: number;
  rows: number;
  cell: number;
  thresholds: Float32Array;
}

export function DitherTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid | null>(null);
  const animRef = useRef<{ stop: () => void } | null>(null);
  const cfgRef = useRef<DitherSettings | null>(null);
  const seedRef = useRef(0);

  const pathname = usePathname();
  const { gateOpen, theme } = useAudio();

  const dial = useDialKit(
    'Dither Transition',
    {
      cellSize: [14, 4, 48, 1],
      gap: [0, 0, 24, 1],
      duration: [1550, 100, 4000, 50],
      pattern: { type: 'select', options: ['drift', 'bayer', 'random'], default: 'drift' },
      shape: { type: 'select', options: ['square', 'dot'], default: 'square' },
      feather: [0.2, 0, 0.6, 0.01],
      drift: {
        scale: [7, 2, 40, 0.5],
        spread: { type: 'select', options: ['linear', 'center', 'edges'], default: 'edges' },
        direction: [90, 0, 360, 1],
        directionStrength: [0.5, 0, 1, 0.01],
        grain: [0.2, 0, 1, 0.01],
        octaves: [3, 1, 5, 1],
      },
      easing: {
        type: 'select',
        options: ['easeOut', 'easeInOut', 'linear', 'circOut', 'backOut', 'anticipate'],
        default: 'easeOut',
      },
      useThemeColor: true,
      color: '#000000',
      varyEachTime: true,
      replay: { type: 'action', label: 'Replay' },
    },
    { onAction: (path) => { if (path === 'replay') play(); } }
  ) as unknown as Omit<DitherSettings, 'color'> & {
    useThemeColor: boolean;
    color: string;
    varyEachTime: boolean;
    replay: unknown;
  };

  // Tint the dither with the current palette's highlight when enabled.
  const ditherColor = dial.useThemeColor ? theme.accent : dial.color;

  // Keep the latest control values available to imperative callbacks.
  cfgRef.current = {
    cellSize: dial.cellSize,
    gap: dial.gap,
    duration: dial.duration,
    pattern: dial.pattern,
    shape: dial.shape,
    feather: dial.feather,
    drift: {
      scale: dial.drift.scale,
      spread: dial.drift.spread,
      direction: dial.drift.direction,
      directionStrength: dial.drift.directionStrength,
      grain: dial.drift.grain,
      octaves: Math.round(dial.drift.octaves),
    },
    easing: dial.easing,
    color: ditherColor,
  };
  const varyEachTime = dial.varyEachTime;

  const buildGrid = useCallback((cfg: DitherSettings, seed: number): Grid => {
    const cell = Math.max(2, Math.round(cfg.cellSize));
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const thresholds = new Float32Array(cols * rows);

    if (cfg.pattern === 'drift') {
      const { scale, spread, direction, directionStrength, grain, octaves } = cfg.drift;
      const radial = spread === 'center' || spread === 'edges';
      // Linear ramp setup (projection onto the wind direction).
      const a = (direction * Math.PI) / 180;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const corners = [0, (cols - 1) * dx, (rows - 1) * dy, (cols - 1) * dx + (rows - 1) * dy];
      const minP = Math.min(...corners);
      const range = Math.max(...corners) - minP || 1;
      // Radial ramp setup (distance from centre).
      const cxc = (cols - 1) / 2;
      const cyc = (rows - 1) / 2;
      const maxD = Math.hypot(cxc, cyc) || 1;
      const offX = seed * 13.7;
      const offY = seed * 7.3;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let along: number;
          if (radial) {
            const d = Math.hypot(c - cxc, r - cyc) / maxD;
            along = spread === 'center' ? d : 1 - d;
          } else {
            along = (c * dx + r * dy - minP) / range;
          }
          const n = fbm(c / scale + offX, r / scale + offY, octaves);
          let t =
            directionStrength * along +
            (1 - directionStrength) * n +
            (hash2(c + seed * 31, r + seed * 17) - 0.5) * grain;
          if (t < 0) t = 0;
          else if (t > 1) t = 1;
          thresholds[r * cols + c] = t;
        }
      }
    } else {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          thresholds[r * cols + c] =
            cfg.pattern === 'random'
              ? hash2(c, r)
              : (BAYER_8[(r % 8) * 8 + (c % 8)] + 0.5) / 64;
        }
      }
    }
    return { cols, rows, cell, thresholds };
  }, []);

  const draw = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    const cfg = cfgRef.current;
    if (!canvas || !grid || !cfg) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cols, rows, cell, thresholds } = grid;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = cfg.color;

    const feather = cfg.feather;
    const isDot = cfg.shape === 'dot';
    // Gap insets each dot within its grid cell, leaving space between dots.
    const gap = Math.min(cfg.gap, cell - 1);
    const drawn = Math.max(1, cell - gap);
    const inset = gap / 2;
    const rMax = drawn / 2;
    // Scale progress so even the highest-threshold cells fully clear at progress = 1.
    const eff = progress * (1 + feather);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = thresholds[r * cols + c];
        let a: number;
        if (feather <= 0) {
          a = eff > t ? 0 : 1;
        } else {
          a = 1 - (eff - t) / feather;
          if (a > 1) a = 1;
          else if (a < 0) a = 0;
        }
        if (a <= 0.003) continue;
        const x = c * cell;
        const y = r * cell;
        if (isDot) {
          // Halftone: dot radius encodes coverage, so cells shrink as they clear.
          ctx.globalAlpha = 1;
          const rad = a * rMax * 1.15;
          ctx.beginPath();
          ctx.arc(x + cell / 2, y + cell / 2, rad, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = a;
          // No gap: overlap by 1px to avoid seams; with a gap, inset the square.
          if (gap <= 0) ctx.fillRect(x, y, cell + 1, cell + 1);
          else ctx.fillRect(x + inset, y + inset, drawn, drawn);
        }
      }
    }
    ctx.globalAlpha = 1;
  }, []);

  const play = useCallback(() => {
    const canvas = canvasRef.current;
    const cfg = cfgRef.current;
    if (!canvas || !cfg) return;

    animRef.current?.stop();

    // Respect reduced-motion: reveal instantly, no dither.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    if (varyEachTime) seedRef.current += 1;

    // Size canvas to the viewport at device resolution.
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

    gridRef.current = buildGrid(cfg, seedRef.current);
    canvas.style.display = 'block';
    draw(0);

    animRef.current = animate(0, 1, {
      duration: Math.max(0.05, cfg.duration / 1000),
      ease: cfg.easing as 'easeOut',
      onUpdate: (v: number) => draw(v),
      onComplete: () => {
        if (canvasRef.current) canvasRef.current.style.display = 'none';
      },
    });
  }, [buildGrid, draw, varyEachTime]);

  // 1. First load — reveal whatever mounts first (the audio gate).
  useEffect(() => {
    play();
    return () => animRef.current?.stop();
  }, [play]);

  // 2. Gate dismissed (gate -> home) — reveal the home page.
  const prevGate = useRef(gateOpen);
  useEffect(() => {
    if (prevGate.current && !gateOpen) play();
    prevGate.current = gateOpen;
  }, [gateOpen, play]);

  // 3. Route change (/ <-> /work) — reveal the new page.
  const firstPath = useRef(true);
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    play();
  }, [pathname, play]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 z-[500] pointer-events-none"
      style={{ display: 'none' }}
    />
  );
}
