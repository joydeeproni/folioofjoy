'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { animate } from 'motion';
import { useAudio } from '@/lib/audio-context';

// Classic recursive 8x8 ordered (Bayer) dither matrix, values 0..63 — the same
// matrix the site's pixel loader uses. Cells clear in this order so the swap
// reads as a coherent dither rather than random noise.
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

// Matches the site's pixel loader: 6px cells.
const CELL = 6;
// How quickly each cell fills/empties once its threshold is crossed — small
// feather keeps the dots reading as particles rather than hard squares.
const FEATHER = 0.14;

export interface DitherSwipeHandle {
  /** Run the dither transition, calling `onMid` at peak coverage to swap content. */
  play: (onMid: () => void) => void;
}

interface DitherSwipeProps {
  /** Total transition duration in ms (cover + uncover). */
  duration?: number;
  /** z-index for the overlay canvas. */
  zIndex?: number;
}

/**
 * A full-viewport dither-into-particles transition. On `play`, cells fill in
 * Bayer order until the screen is covered, the content swaps at the peak, then
 * the cells dissolve back out as shrinking dots.
 */
export const DitherSwipe = forwardRef<DitherSwipeHandle, DitherSwipeProps>(
  function DitherSwipe({ duration = 620, zIndex = 120 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<{ stop: () => void } | null>(null);
    const { theme } = useAudio();
    const colorRef = useRef(theme.accent);
    colorRef.current = theme.accent;

    // coverage 0..1 — fraction of cells (by Bayer threshold) currently filled.
    const draw = useCallback((coverage: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = colorRef.current;

      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      const rMax = (CELL / 2) * 1.15;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = (BAYER_8[(r % 8) * 8 + (c % 8)] + 0.5) / 64;
          let a = (coverage - t) / FEATHER;
          if (a <= 0.003) continue;
          if (a > 1) a = 1;
          // Dot radius encodes coverage — cells grow into and dissolve out of
          // particles.
          ctx.beginPath();
          ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, a * rMax, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }, []);

    const play = useCallback(
      (onMid: () => void) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          onMid();
          return;
        }
        // Respect reduced-motion: swap instantly, no dither.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          onMid();
          return;
        }

        animRef.current?.stop();

        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
        canvas.style.display = 'block';

        let swapped = false;
        animRef.current = animate(0, 1, {
          duration: Math.max(0.05, duration / 1000),
          ease: 'easeInOut',
          onUpdate: (v: number) => {
            if (v < 0.5) {
              // Cover: coverage ramps 0 -> 1 (plus feather headroom).
              draw(v * 2 * (1 + FEATHER));
            } else {
              if (!swapped) {
                swapped = true;
                onMid();
              }
              // Uncover: coverage ramps 1 -> 0.
              draw((1 - v) * 2 * (1 + FEATHER));
            }
          },
          onComplete: () => {
            if (!swapped) onMid();
            if (canvasRef.current) canvasRef.current.style.display = 'none';
          },
        });
      },
      [draw, duration],
    );

    useImperativeHandle(ref, () => ({ play }), [play]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{ display: 'none', zIndex }}
      />
    );
  },
);
