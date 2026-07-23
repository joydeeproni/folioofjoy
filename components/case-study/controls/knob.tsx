'use client';

import { useRef, useState } from 'react';

// Rotary knob, lifted out of the Zen dock (components/zen/zen-dock.tsx) so it can
// be shown standalone in the controls case study. Drag vertically to set — 140px
// of travel is a full 0→1 sweep. Relative-delta drag (snapshots on pointer-down),
// not absolute click-to-position, so it feels like a real potentiometer. Value
// snaps to `step`; the accent arc thickens while dragging; on hover/drag a ring
// draws around the dial (the `animate-knob-fill` keyframe lives in globals.css).

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const decimalsOf = (step: number) => Math.max(0, (String(step).split('.')[1] || '').length);

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

export interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  accent: string;
  onChange: (v: number) => void;
}

export function Knob({ label, value, min, max, step, accent, onChange }: KnobProps) {
  const pct = clamp((value - min) / (max - min), 0, 1);
  const dec = decimalsOf(step);
  const angle = 225 + pct * 270; // 0 = top, clockwise; sweep 270°
  const drag = useRef<{ y: number; pct: number } | null>(null);
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const active = hover || dragging;

  const apply = (p: number) => {
    const raw = min + clamp(p, 0, 1) * (max - min);
    onChange(parseFloat((Math.round(raw / step) * step).toFixed(dec)));
  };
  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, pct };
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    apply(drag.current.pct + (drag.current.y - e.clientY) / 140);
  };
  const onUp = (e: React.PointerEvent) => {
    drag.current = null;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const [ix, iy] = polar(24, 24, 17, angle);
  const circ = 2 * Math.PI * 22;
  return (
    <div
      className="flex select-none flex-col items-center gap-[7px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="text-center font-mono text-[12px] leading-none text-white">{label}</span>
      <svg
        viewBox="0 0 48 54"
        width={48}
        height={54}
        className="cursor-ns-resize touch-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        <path d={arc(24, 24, 22, 225, 495)} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <path
          d={arc(24, 24, 22, 225, angle)}
          fill="none"
          stroke={accent}
          strokeWidth={dragging ? 3 : 2}
          strokeLinecap="round"
          style={{ transition: 'stroke-width 120ms' }}
        />
        {active && (
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-knob-fill"
            style={{ ['--circ' as string]: `${circ}px`, strokeDasharray: circ, transform: 'rotate(-90deg)', transformOrigin: '24px 24px' }}
          />
        )}
        <circle cx="24" cy="24" r="19" fill="#c9c9c9" />
        <line x1="24" y1="24" x2={ix} y2={iy} stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span
        className="text-center font-mono text-[37px] leading-none"
        style={{ color: '#ffffff', opacity: dragging ? 1 : active ? 0.85 : 0.5, transition: 'opacity 200ms', fontWeight: 300 }}
      >
        {value.toFixed(dec)}
      </span>
    </div>
  );
}
