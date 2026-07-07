'use client';

import { useEffect, useRef } from 'react';

// Ordered 8x8 Bayer matrix (0..63) — same dither family as the page-transition.
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

// A full-viewport dither overlay that plays a brief cover→clear reveal every
// time `trigger` changes value (skipping the first mount). Whatever content is
// beneath emerges from a dithered black cover instead of a plain fade.
export function DitherReveal({
  trigger,
  color = '#000000',
  cell = 12,
  duration = 480,
  className,
}: {
  trigger: unknown;
  color?: string;
  cell?: number;
  duration?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const feather = 0.25;

    const drawFrame = (p: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      const eff = p * (1 + feather);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = (BAYER_8[(r % 8) * 8 + (c % 8)] + 0.5) / 64;
          let a = 1 - (eff - t) / feather;
          if (a > 1) a = 1;
          else if (a < 0) a = 0;
          if (a <= 0.003) continue;
          ctx.globalAlpha = a;
          ctx.fillRect(c * cell, r * cell, cell + 1, cell + 1);
        }
      }
      ctx.globalAlpha = 1;
    };

    canvas.style.display = 'block';
    drawFrame(0);
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - (1 - p) * (1 - p); // easeOut — matches the route transition
      drawFrame(eased);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else if (canvasRef.current) {
        canvasRef.current.style.display = 'none';
      }
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [trigger, color, cell, duration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`fixed inset-0 pointer-events-none ${className ?? ''}`}
      style={{ display: 'none' }}
    />
  );
}
