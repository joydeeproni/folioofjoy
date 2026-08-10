'use client';

import { useEffect, useState } from 'react';
import { BRAND_ORDER, BRAND } from '@/lib/brand';

// A small square dot matrix that keeps re-forming into different marks while
// media loads. Same shape vocabulary as the zen visualiser (dot, plus, square,
// cross, minus) so it speaks the site's language rather than being a generic
// spinner, and it steps rather than eases — the pixel-art register the kit
// sprites and the hero scramble already use.

const SHAPES = ['dot', 'plus', 'square', 'cross', 'minus'] as const;
type Shape = (typeof SHAPES)[number];

// 3x3, matching the reference: sparse enough that individual marks read at 20px.
const GRID = 3;
const CELLS = GRID * GRID;

// ONE ticker for every loader on the page. A case study can hold twenty pieces of
// media; twenty independent intervals would all wake the main thread on their own
// schedule and drift out of phase with each other. Subscribers share this frame
// count, so the loaders also pulse in unison, which looks deliberate.
const TICK_MS = 130;
let frame = 0;
const listeners = new Set<(f: number) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(fn: (f: number) => void) {
  listeners.add(fn);
  if (!timer) {
    timer = setInterval(() => {
      frame++;
      for (const l of listeners) l(frame);
    }, TICK_MS);
  }
  return () => {
    listeners.delete(fn);
    // Stop the timer when the last loader unmounts, so a fully-loaded page isn't
    // paying for a heartbeat nothing watches.
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function useSharedFrame(active: boolean) {
  const [f, setF] = useState(0);
  useEffect(() => {
    if (!active) return;
    return subscribe(setF);
  }, [active]);
  return f;
}

// Which cells are lit on a given frame. A travelling pattern rather than random:
// randomness at 8fps reads as noise, while a marching subset reads as progress.
function isLit(cell: number, f: number): boolean {
  const phase = (cell + f) % CELLS;
  return phase < 4;
}

function Mark({ shape, cx, cy, r, color }: { shape: Shape; cx: number; cy: number; r: number; color: string }) {
  const t = Math.max(1, r * 0.62); // stroke weight for the linear marks
  switch (shape) {
    case 'square':
      return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={color} />;
    case 'minus':
      return <rect x={cx - r} y={cy - t / 2} width={r * 2} height={t} fill={color} />;
    case 'plus':
      return (
        <>
          <rect x={cx - r} y={cy - t / 2} width={r * 2} height={t} fill={color} />
          <rect x={cx - t / 2} y={cy - r} width={t} height={r * 2} fill={color} />
        </>
      );
    case 'cross':
      return (
        <g stroke={color} strokeWidth={t} strokeLinecap="butt">
          <line x1={cx - r * 0.8} y1={cy - r * 0.8} x2={cx + r * 0.8} y2={cy + r * 0.8} />
          <line x1={cx + r * 0.8} y1={cy - r * 0.8} x2={cx - r * 0.8} y2={cy + r * 0.8} />
        </g>
      );
    default:
      return <circle cx={cx} cy={cy} r={r} fill={color} />;
  }
}

export function DotLoader({
  size = 22,
  className = '',
  /** Set false to hold a static frame — used under prefers-reduced-motion. */
  animate = true,
  label = 'Loading',
}: {
  size?: number;
  className?: string;
  animate?: boolean;
  label?: string;
}) {
  const f = useSharedFrame(animate);
  const shape = SHAPES[f % SHAPES.length];
  // Colour advances a step slower than the shape, so the two cycles don't land
  // together and the loop is harder to spot.
  const color = BRAND[BRAND_ORDER[Math.floor(f / SHAPES.length) % BRAND_ORDER.length]];

  const pitch = size / GRID;
  const r = pitch * 0.26;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={label}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      {Array.from({ length: CELLS }, (_, i) => {
        if (!isLit(i, f)) return null;
        const cx = (i % GRID) * pitch + pitch / 2;
        const cy = Math.floor(i / GRID) * pitch + pitch / 2;
        return <Mark key={i} shape={shape} cx={cx} cy={cy} r={r} color={color} />;
      })}
    </svg>
  );
}
