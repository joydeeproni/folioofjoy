'use client';

import { useEffect, useRef } from 'react';
import type { ZenConfig } from './zen-config';

// 8x8 ordered Bayer matrix (0..63) for the dither threshold.
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

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function smooth(t: number): number { return t * t * (3 - 2 * t); }
function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const tl = hash2(xi, yi), tr = hash2(xi + 1, yi);
  const bl = hash2(xi, yi + 1), br = hash2(xi + 1, yi + 1);
  const u = smooth(xf), v = smooth(yf);
  const top = tl + (tr - tl) * u;
  const bot = bl + (br - bl) * u;
  return top + (bot - top) * v;
}
function fbm(x: number, y: number): number {
  return 0.6 * valueNoise(x, y) + 0.3 * valueNoise(x * 2, y * 2) + 0.1 * valueNoise(x * 4, y * 4);
}

// One dither mark. Intensity is encoded as SIZE (alpha stays 1) so +/x/- marks
// read crisply; `sf` is the per-cell size-variation factor.
function drawMark(ctx: CanvasRenderingContext2D, shape: string, cx: number, cy: number, size: number, a: number, sf: number) {
  const len = a * sf * size;
  if (len < 0.4) return;
  const half = len * 0.5;
  switch (shape) {
    case 'square':
      ctx.fillRect(cx - half, cy - half, len, len);
      break;
    case 'minus': {
      const th = Math.max(1, size * 0.16);
      ctx.fillRect(cx - half * 0.95, cy - th / 2, len * 0.95, th);
      break;
    }
    case 'plus': {
      const th = Math.max(1, size * 0.16);
      ctx.fillRect(cx - half * 0.95, cy - th / 2, len * 0.95, th);
      ctx.fillRect(cx - th / 2, cy - half * 0.95, th, len * 0.95);
      break;
    }
    case 'cross': {
      ctx.lineWidth = Math.max(1, size * 0.16);
      const d = half * 0.72;
      ctx.beginPath();
      ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d);
      ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d);
      ctx.stroke();
      break;
    }
    case 'binary': {
      // A monospace 1 or 0 per cell, sized by intensity. Glyph is stable
      // per position (hashed on centre) so cells don't flicker between digits.
      const fs = len * 1.25;
      if (fs < 4) return;
      ctx.font = `${fs}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
      ctx.fillText(hash2(cx, cy) > 0.5 ? '1' : '0', cx, cy);
      break;
    }
    default: // dot
      ctx.beginPath();
      ctx.arc(cx, cy, half * 1.1, 0, Math.PI * 2);
      ctx.fill();
  }
}

// Full-viewport, audio-reactive dither field. Reads the shared AnalyserNode
// each frame; idles with slow breathing when there's no audio yet.
export function ZenVisualizer({
  getAnalyser,
  imageUrl,
  config,
}: {
  getAnalyser: () => AnalyserNode | null;
  imageUrl?: string | null;
  config: ZenConfig;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const cfgRef = useRef<ZenConfig>(config);
  cfgRef.current = config;

  // Album-art sampling state for 'image' mode.
  const imgRef = useRef<HTMLImageElement | null>(null);
  const lumRef = useRef<Float32Array | null>(null);
  const lumDimsRef = useRef<{ cols: number; rows: number }>({ cols: 0, rows: 0 });
  const offRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    lumRef.current = null;
    if (!imageUrl) { imgRef.current = null; return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imgRef.current = img; lumRef.current = null; };
    img.onerror = () => { imgRef.current = null; };
    img.src = imageUrl;
    return () => { imgRef.current = null; };
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let freq = new Uint8Array(0);
    let wave = new Uint8Array(0);
    let t0 = 0;

    const sampleImage = (cols: number, rows: number) => {
      const img = imgRef.current;
      if (!img) return null;
      const d = lumDimsRef.current;
      if (lumRef.current && d.cols === cols && d.rows === rows) return lumRef.current;
      try {
        if (!offRef.current) offRef.current = document.createElement('canvas');
        const off = offRef.current;
        off.width = cols; off.height = rows;
        const octx = off.getContext('2d', { willReadFrequently: true });
        if (!octx) return null;
        const ir = img.width / img.height;
        const gr = cols / rows;
        let sw = img.width, sh = img.height, sx = 0, sy = 0;
        if (ir > gr) { sw = img.height * gr; sx = (img.width - sw) / 2; }
        else { sh = img.width / gr; sy = (img.height - sh) / 2; }
        octx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
        const data = octx.getImageData(0, 0, cols, rows).data;
        const lum = new Float32Array(cols * rows);
        for (let i = 0; i < cols * rows; i++) {
          const p = i * 4;
          lum[i] = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
        }
        lumRef.current = lum;
        lumDimsRef.current = { cols, rows };
        return lum;
      } catch {
        return null; // tainted (no CORS) — fall back
      }
    };

    const draw = (ts: number) => {
      if (!t0) t0 = ts;
      const time = (ts - t0) / 1000;
      const cfg = cfgRef.current;
      const analyser = getAnalyser();

      let overall = 0, bass = 0;
      if (analyser) {
        analyser.smoothingTimeConstant = cfg.smoothing;
        if (freq.length !== analyser.frequencyBinCount) freq = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freq);
        const n = freq.length;
        let sum = 0;
        for (let i = 0; i < n; i++) sum += freq[i];
        overall = sum / (n * 255);
        const bcount = Math.max(1, Math.floor(n / 8));
        let bsum = 0;
        for (let i = 0; i < bcount; i++) bsum += freq[i];
        bass = bsum / (bcount * 255);
      }

      const cell = Math.max(3, Math.round(cfg.cellSize));
      const pitch = Math.max(2, cell * cfg.spacing);
      const cols = Math.ceil(w / pitch), rows = Math.ceil(h / pitch);
      const cxN = cols / 2, cyN = rows / 2;
      const maxD = Math.hypot(cxN, cyN) || 1;
      const gain = cfg.gain;
      const feather = cfg.feather;
      const sv = cfg.sizeVariation;
      const scale = cfg.scale;
      const idle = analyser ? 0 : 0.35 + 0.14 * Math.sin(time * 0.8);
      const pulse = analyser ? 0.22 + bass * gain * 0.9 : idle;
      const energy = analyser ? overall : idle;

      let mode = cfg.mode;
      let lum: Float32Array | null = null;
      if (mode === 'image') {
        lum = sampleImage(cols, rows);
        if (!lum) mode = 'field';
      }
      if (mode === 'waveform' && analyser) {
        if (wave.length !== analyser.fftSize) wave = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(wave);
      }

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = cfg.background;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = cfg.color;
      ctx.strokeStyle = cfg.color;
      ctx.lineCap = 'round';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let intensity: number;
          switch (mode) {
            case 'radial':
              intensity = pulse - Math.hypot(c - cxN, r - cyN) / maxD;
              break;
            case 'ripple': {
              const dd = Math.hypot(c - cxN, r - cyN);
              intensity = (0.5 + 0.5 * Math.sin(dd * (scale * 3) - time * 2.4 - bass * 7)) * (0.5 + energy * gain) - 0.35;
              break;
            }
            case 'plasma': {
              const v =
                Math.sin(c * scale * 2 + time) +
                Math.sin(r * scale * 2.3 - time * 0.8) +
                Math.sin((c + r) * scale * 1.6 + time * 0.5) +
                Math.sin(Math.hypot(c - cxN, r - cyN) * scale * 2 - time);
              intensity = (v / 4) * 0.5 * (0.6 + energy * gain) + 0.1 * energy * gain;
              break;
            }
            case 'spectrum': {
              const bin = freq.length ? Math.floor((c / cols) * freq.length) : 0;
              const bar = analyser ? (freq[bin] / 255) * gain : idle;
              intensity = bar - (1 - r / rows);
              break;
            }
            case 'waveform': {
              const bin = wave.length ? Math.floor((c / cols) * wave.length) : 0;
              const disp = analyser ? (wave[bin] - 128) / 128 : 0.4 * Math.sin(c * 0.15 + time * 2);
              const center = rows / 2 + disp * rows * 0.35 * (0.6 + gain * 0.3);
              const thickness = Math.max(1.5, rows * 0.035);
              intensity = 1 - Math.abs(r - center) / thickness;
              break;
            }
            case 'image':
              intensity = lum![r * cols + c] * (0.55 + energy * gain * 0.7);
              break;
            default: { // field
              const nz = fbm(c * scale + time * 0.3, r * scale - time * 0.2);
              intensity = nz * (0.4 + energy * gain) - 0.15;
            }
          }

          const thr = (BAYER_8[(r % 8) * 8 + (c % 8)] + 0.5) / 64;
          let a: number;
          if (feather <= 0) a = intensity > thr ? 1 : 0;
          else { a = (intensity - thr) / feather + 0.5; if (a > 1) a = 1; else if (a < 0) a = 0; }
          if (a <= 0.02) continue;

          const sf = 1 - sv * (1 - hash2(c + 0.5, r + 0.5));
          let shape = cfg.shape;
          if (shape === 'mix') shape = ['plus', 'cross', 'minus'][Math.floor(hash2(c, r) * 3) % 3];
          drawMark(ctx, shape, c * pitch + pitch / 2, r * pitch + pitch / 2, cell, a, sf);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getAnalyser]);

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0" />;
}
