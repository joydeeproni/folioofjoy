'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useDialKit } from 'dialkit';
import { useAudio } from '@/lib/audio-context';

// Classic recursive 8x8 ordered (Bayer) dither matrix, values 0..63 — the same
// matrix the site's pixel loader uses.
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

// Stable hash -> [0,1) for the 'random' pattern.
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

interface DitheredVideoSettings {
  enabled: boolean;
  cellSize: number;
  gap: number;
  levels: number;
  pattern: string;
  shape: string;
  brightness: number;
  contrast: number;
  saturation: number;
  opacity: number;
  fps: number;
  playback: string;
}

interface DitheredVideoProps {
  /** Path to a same-origin video in /public, or a CORS-enabled absolute URL. */
  src?: string;
}

/**
 * A full-bleed background that plays a muted, looping video and renders it
 * through a colored Bayer ordered-dither pass. The dither imposes no color of
 * its own — each cell keeps the video's sampled color, ordered-quantized per
 * channel so it reads as a dither rather than plain pixelation. All look
 * parameters are exposed through DialKit (dev only).
 */
export function DitheredVideo({ src = '/bg-music-video.mp4' }: DitheredVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastDrawRef = useRef(0);

  const { isPlaying } = useAudio();

  const dial = useDialKit('Dithered Video', {
    enabled: true,
    cellSize: [6, 2, 32, 1],
    gap: [0, 0, 12, 1],
    levels: [4, 2, 16, 1],
    pattern: { type: 'select', options: ['bayer', 'random', 'none'], default: 'bayer' },
    shape: { type: 'select', options: ['square', 'dot'], default: 'square' },
    brightness: [0, -0.5, 0.5, 0.01],
    contrast: [1, 0.5, 2, 0.01],
    saturation: [1, 0, 2, 0.01],
    opacity: [1, 0, 1, 0.01],
    fps: [30, 8, 60, 1],
    playback: { type: 'select', options: ['always', 'with-music'], default: 'always' },
  }) as unknown as DitheredVideoSettings;

  // Keep the latest settings available to the imperative draw loop.
  const cfgRef = useRef(dial);
  cfgRef.current = dial;

  // Apply brightness/contrast/saturation to a single channel triplet, then
  // ordered-dither quantize each channel to `levels` steps using the cell's
  // Bayer (or random) threshold.
  const quantize = useCallback(
    (rgb: [number, number, number], c: number, r: number, cfg: DitheredVideoSettings): [number, number, number] => {
      let [rr, gg, bb] = rgb;

      // Contrast around mid-grey, then brightness.
      const ct = cfg.contrast;
      const br = cfg.brightness * 255;
      rr = (rr - 128) * ct + 128 + br;
      gg = (gg - 128) * ct + 128 + br;
      bb = (bb - 128) * ct + 128 + br;

      // Saturation around luminance.
      if (cfg.saturation !== 1) {
        const lum = 0.299 * rr + 0.587 * gg + 0.114 * bb;
        rr = lum + (rr - lum) * cfg.saturation;
        gg = lum + (gg - lum) * cfg.saturation;
        bb = lum + (bb - lum) * cfg.saturation;
      }

      const levels = Math.max(2, Math.round(cfg.levels));
      const step = 255 / (levels - 1);
      let threshold = 0; // 'none' — plain posterize, no dither
      if (cfg.pattern === 'bayer') threshold = (BAYER_8[(r % 8) * 8 + (c % 8)] + 0.5) / 64 - 0.5;
      else if (cfg.pattern === 'random') threshold = hash2(c, r) - 0.5;

      const q = (v: number) => {
        let out = Math.round((v + threshold * step) / step) * step;
        if (out < 0) out = 0;
        else if (out > 255) out = 255;
        return out;
      };
      return [q(rr), q(gg), q(bb)];
    },
    [],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const cfg = cfgRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Resize visible canvas to the viewport if needed.
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.style.opacity = String(cfg.opacity);

    if (!cfg.enabled || video.readyState < 2) {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    const cell = Math.max(2, Math.round(cfg.cellSize));
    const cols = Math.max(1, Math.ceil(w / cell));
    const rows = Math.max(1, Math.ceil(h / cell));

    // Downscale the video frame into a tiny offscreen buffer (one cell = one px).
    let off = offRef.current;
    if (!off) { off = document.createElement('canvas'); offRef.current = off; }
    if (off.width !== cols || off.height !== rows) { off.width = cols; off.height = rows; }
    const offCtx = off.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;
    offCtx.drawImage(video, 0, 0, cols, rows);

    let img: ImageData;
    try {
      img = offCtx.getImageData(0, 0, cols, rows);
    } catch {
      // Tainted canvas (cross-origin without CORS) — give up quietly.
      ctx.clearRect(0, 0, w, h);
      return;
    }
    const data = img.data;

    ctx.clearRect(0, 0, w, h);
    const gap = Math.min(cfg.gap, cell - 1);
    const drawn = Math.max(1, cell - gap);
    const inset = gap / 2;
    const isDot = cfg.shape === 'dot';
    const fastPath = !isDot && gap <= 0;

    if (fastPath) {
      // Quantize in place, then scale the tiny buffer up with smoothing off so
      // each source pixel becomes a crisp cell block.
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          const [qr, qg, qb] = quantize([data[i], data[i + 1], data[i + 2]], c, r, cfg);
          data[i] = qr; data[i + 1] = qg; data[i + 2] = qb;
        }
      }
      offCtx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, cols, rows, 0, 0, cols * cell, rows * cell);
      return;
    }

    // Per-cell path (dots, or squares with a gap).
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 4;
        const [qr, qg, qb] = quantize([data[i], data[i + 1], data[i + 2]], c, r, cfg);
        ctx.fillStyle = `rgb(${qr},${qg},${qb})`;
        const x = c * cell;
        const y = r * cell;
        if (isDot) {
          const lum = (0.299 * qr + 0.587 * qg + 0.114 * qb) / 255;
          const rad = lum * (drawn / 2) * 1.15;
          if (rad < 0.4) continue;
          ctx.beginPath();
          ctx.arc(x + cell / 2, y + cell / 2, rad, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(x + inset, y + inset, drawn, drawn);
        }
      }
    }
  }, [quantize]);

  // Animation loop with an fps cap; pauses when the tab is hidden.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = (t: number) => {
      const cfg = cfgRef.current;
      const minDelta = 1000 / Math.max(1, cfg.fps);
      if (t - lastDrawRef.current >= minDelta) {
        lastDrawRef.current = t;
        draw();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    if (reduce) {
      // Render a single static frame once the video has data.
      const v = videoRef.current;
      if (v && v.readyState >= 2) draw();
      else v?.addEventListener('loadeddata', () => draw(), { once: true });
      return;
    }

    const start = () => { if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick); };
    const stop = () => { if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };

    const onVisibility = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [draw]);

  // Kick off playback (muted autoplay) and honor the playback mode.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (dial.playback === 'with-music' && !isPlaying) {
      v.pause();
    } else {
      v.play().catch(() => { /* autoplay may be blocked until interaction */ });
    }
  }, [dial.playback, isPlaying]);

  const isRemote = /^https?:\/\//i.test(src);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        {...(isRemote ? { crossOrigin: 'anonymous' as const } : {})}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
