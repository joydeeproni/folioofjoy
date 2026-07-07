'use client';

import { useEffect, useRef } from 'react';
import { DEFAULT_DITHER, DITHER_COLOR, playDither } from '../dither-engine';

// In-page transition for the nav-hover previews. Uses the exact same dither
// engine/config as the route transition, so every dither looks identical.
export function DitherReveal({
  trigger,
  origin,
  className,
}: {
  trigger: unknown;
  origin?: { x: number; y: number } | null;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<{ stop: () => void } | null>(null);
  const seedRef = useRef(0);
  const first = useRef(true);
  // Read the latest origin without re-running the effect on its own.
  const originRef = useRef(origin);
  originRef.current = origin;

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    animRef.current?.stop();
    seedRef.current += 1;
    animRef.current = playDither(
      canvas,
      { ...DEFAULT_DITHER, color: DITHER_COLOR },
      seedRef.current,
      originRef.current ?? undefined,
    );
    return () => animRef.current?.stop();
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`fixed inset-0 z-40 pointer-events-none ${className ?? ''}`}
      style={{ display: 'none' }}
    />
  );
}
