'use client';

import { useRef, useState } from 'react';

// Reusable proportional slider: one bar split into two gradient segments with a
// gap and a white divider that marks the split. Drag anywhere to rebalance; the
// two sides always sum to 100. On release the divider plays a springy scaleX
// settle. Self-contained — drop it in and pass colours/labels/callbacks.
//
//   <ProportionalSlider leftLabel="Coffee" rightLabel="Milk"
//     leftColor="linear-gradient(135deg,#7c4a24,#3a2414)"
//     rightColor="linear-gradient(135deg,#555,#2b2b2b)"
//     value={60} onChange={setV} />
export interface ProportionalSliderProps {
  /** Controlled left-side percentage (0–100). Omit to run uncontrolled. */
  value?: number;
  /** Initial left-side percentage when uncontrolled. */
  defaultValue?: number;
  onChange?: (leftPercent: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  /** Any CSS background — solid or gradient. */
  leftColor?: string;
  rightColor?: string;
  /** Gap between the two segments, in px. */
  gap?: number;
  /** Bar height, in px. */
  height?: number;
  /** Corner radius on the segments, in px. */
  radius?: number;
  /** Settle-animation duration, in seconds. */
  animationSpeed?: number;
  /** 0–1: how hard the divider compresses before springing back. */
  springIntensity?: number;
  className?: string;
}

const SPRING = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function ProportionalSlider({
  value,
  defaultValue = 50,
  onChange,
  leftLabel = 'Left',
  rightLabel = 'Right',
  leftColor = 'linear-gradient(135deg, #3b82f6, #2563eb)',
  rightColor = 'linear-gradient(135deg, #fb923c, #f97316)',
  gap = 16,
  height = 56,
  radius = 12,
  animationSpeed = 0.5,
  springIntensity = 0.4,
  className = '',
}: ProportionalSliderProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  const [settleKey, setSettleKey] = useState(0); // bump on release to replay the spring

  const controlled = value !== undefined;
  const current = clamp(controlled ? (value as number) : internal, 0, 100);
  const leftPct = Math.round(current);
  const rightPct = 100 - leftPct;
  const compress = clamp(1 - springIntensity, 0.1, 1);

  const commit = (v: number) => {
    const clamped = clamp(v, 0, 100);
    if (!controlled) setInternal(clamped);
    onChange?.(clamped);
  };

  const setFromClientX = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    commit(((clientX - rect.left) / rect.width) * 100);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    setSettleKey((k) => k + 1); // trigger the springy settle
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); commit(current - 1); setSettleKey((k) => k + 1); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); commit(current + 1); setSettleKey((k) => k + 1); }
  };

  return (
    <div className={className}>
      <style>{`
        @keyframes ps-divider-settle {
          0%   { transform: translateX(-50%) scaleX(1); }
          35%  { transform: translateX(-50%) scaleX(var(--ps-compress, 0.6)); }
          100% { transform: translateX(-50%) scaleX(1); }
        }
      `}</style>

      <div
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label={`${leftLabel} vs ${rightLabel}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={leftPct}
        aria-valuetext={`${leftLabel} ${leftPct}%, ${rightLabel} ${rightPct}%`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className="group relative w-full cursor-ew-resize select-none outline-none touch-none"
        style={{ height }}
      >
        {/* Left segment */}
        <div
          className="absolute inset-y-0 left-0 transition-[filter] duration-300 group-hover:brightness-110"
          style={{
            width: `calc(${current}% - ${gap / 2}px)`,
            background: leftColor,
            borderRadius: radius,
            transition: dragging ? 'none' : `width ${animationSpeed}s ${SPRING}, filter 0.3s ease`,
          }}
        />
        {/* Right segment */}
        <div
          className="absolute inset-y-0 right-0 transition-[filter] duration-300 group-hover:brightness-110"
          style={{
            width: `calc(${100 - current}% - ${gap / 2}px)`,
            background: rightColor,
            borderRadius: radius,
            transition: dragging ? 'none' : `width ${animationSpeed}s ${SPRING}, filter 0.3s ease`,
          }}
        />
        {/* Divider line — springy settle on release; thickens + glows while dragging */}
        <div
          key={settleKey}
          className="pointer-events-none absolute top-0 h-full rounded-full bg-white"
          style={{
            left: `${current}%`,
            width: dragging ? 4 : 3,
            transform: 'translateX(-50%)',
            boxShadow: dragging
              ? '0 0 16px rgba(255,255,255,0.85)'
              : '0 0 8px rgba(255,255,255,0.45)',
            transition: 'width 0.2s ease, box-shadow 0.25s ease',
            ['--ps-compress' as string]: compress,
            animation: settleKey > 0 && !dragging ? `ps-divider-settle ${animationSpeed}s ${SPRING}` : 'none',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Percentages — always sum to 100 */}
      <div className="mt-3 flex justify-between font-mono text-xs uppercase tracking-wider text-white/70">
        <span>{leftLabel} {leftPct}%</span>
        <span>{rightPct}% {rightLabel}</span>
      </div>
    </div>
  );
}
