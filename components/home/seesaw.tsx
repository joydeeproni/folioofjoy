'use client';

// Decorative seesaw illustration for the homepage hero. The art is a flat,
// ungrouped SVG (828×676); we rotate the whole thing ±1° around a pivot near
// the red fulcrum so it reads as a balancing seesaw.
export function Seesaw({ className }: { className?: string }) {
  return (
    <img
      src="/home/seesaw.svg"
      alt=""
      aria-hidden
      className={`animate-seesaw select-none pointer-events-none ${className ?? ''}`}
      draggable={false}
    />
  );
}
