'use client';

import { forwardRef } from 'react';

// Decorative seesaw illustration for the homepage hero. The art is a flat,
// ungrouped SVG (828×676); we rotate the whole thing around a pivot near the
// red fulcrum (matching the CSS transform-origin) so it reads as a balancing
// seesaw. `tilt` (degrees) overrides the idle teeter — the hero drives it from
// which side of the seesaw the cursor is on; null resumes the idle animation.
export const Seesaw = forwardRef<HTMLImageElement, { className?: string; tilt?: number | null }>(
  function Seesaw({ className, tilt = null }, ref) {
    const idle = tilt == null;
    return (
      <img
        ref={ref}
        src="/home/seesaw.svg"
        alt=""
        aria-hidden
        draggable={false}
        className={`select-none pointer-events-none ${idle ? 'animate-seesaw' : ''} ${className ?? ''}`}
        style={
          idle
            ? undefined
            : {
                transform: `rotate(${tilt}deg)`,
                transformOrigin: '50% 62%',
                transition: 'transform 300ms ease-out',
                willChange: 'transform',
              }
        }
      />
    );
  },
);
