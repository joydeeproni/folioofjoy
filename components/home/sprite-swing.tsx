'use client';

import { forwardRef } from 'react';

// The swing rendered from the hand-drawn spritesheet (public/home/swing-spritesheet.svg,
// a 1536×539 sheet). Unlike the vector SwingSet, each frame is a flat pose, so
// it animates by FRAME-SWAPPING (not rotation): the parent sets this <svg>'s
// viewBox to window into a single pose. Top row = swing poses; ~333px pitch.
const SHEET = '/home/swing-spritesheet.svg';
const X0 = 20;
const Y = 45;
const FRAME_W = 330;
const FRAME_H = 220;
const PITCH = 333;

// viewBox that crops to swing pose `i` (0 = back/pushed, 1 = forward).
export const frameViewBox = (i: number) => `${X0 + i * PITCH} ${Y} ${FRAME_W} ${FRAME_H}`;

export const SpriteSwing = forwardRef<SVGSVGElement, { className?: string }>(
  function SpriteSwing({ className }, ref) {
    return (
      <svg
        ref={ref}
        viewBox={frameViewBox(0)}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        className={`select-none pointer-events-none ${className ?? ''}`}
      >
        <image href={SHEET} x={0} y={0} width={1536} height={539} />
      </svg>
    );
  },
);
