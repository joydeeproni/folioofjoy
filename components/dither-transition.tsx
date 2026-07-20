'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAudio } from '@/lib/audio-context';
import { DEFAULT_DITHER, DITHER_COLOR, playDither } from './dither-engine';

// Route / first-load transition — the corners-in drift reveal (shared engine).
export function DitherTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<{ stop: () => void } | null>(null);
  const seedRef = useRef(0);

  const pathname = usePathname();
  const { gateOpen } = useAudio();

  const play = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    animRef.current?.stop();
    seedRef.current += 1;
    animRef.current = playDither(canvas, { ...DEFAULT_DITHER, color: DITHER_COLOR }, seedRef.current);
  }, []);

  // 1. First load — reveal whatever mounts first.
  useEffect(() => {
    play();
    return () => animRef.current?.stop();
  }, [play]);

  // 2. Gate dismissed (gate -> home) — reveal the home page.
  const prevGate = useRef(gateOpen);
  useEffect(() => {
    if (prevGate.current && !gateOpen) play();
    prevGate.current = gateOpen;
  }, [gateOpen, play]);

  // 3. Route change — reveal the new page, except when closing the work preview
  //    (leaving /preview), where the dither reveal is unwanted.
  const firstPath = useRef(true);
  const prevPath = useRef<string | null>(null);
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      prevPath.current = pathname;
      return;
    }
    const leavingPreview = prevPath.current === '/preview';
    prevPath.current = pathname;
    if (leavingPreview) return;
    play();
  }, [pathname, play]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 z-[500] pointer-events-none"
      style={{ display: 'none' }}
    />
  );
}
