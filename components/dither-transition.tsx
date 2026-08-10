'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAudio } from '@/lib/audio-context';
import {
  DEFAULT_DITHER,
  DITHER_COLOR,
  DITHER_LOADER_BG,
  playDither,
  playDitherLoader,
} from './dither-engine';

// Route / first-load transition — the corners-in drift reveal (shared engine).
export function DitherTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<{ stop: () => void } | null>(null);
  const seedRef = useRef(0);
  const initialReadyRef = useRef(false);

  const pathname = usePathname();
  const { gateOpen } = useAudio();

  const play = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    animRef.current?.stop();
    seedRef.current += 1;
    animRef.current = playDither(canvas, { ...DEFAULT_DITHER, color: DITHER_COLOR }, seedRef.current);
  }, []);

  // 1. First load — the canvas is already opaque in the server-rendered HTML,
  // then becomes a living dither field until both the window and fonts are
  // ready. Only after that does it reveal the page.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    seedRef.current += 1;
    const loader = playDitherLoader(
      canvas,
      { ...DEFAULT_DITHER, color: DITHER_COLOR },
      seedRef.current,
    );
    animRef.current = loader;

    const windowReady =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));
    const fontsReady = document.fonts?.ready?.catch(() => undefined) ?? Promise.resolve();
    // Avoid a single-frame flash on a warm cache while keeping the loader brief.
    const minimumRun = new Promise<void>((resolve) => window.setTimeout(resolve, 350));
    let active = true;

    void Promise.all([windowReady, fontsReady, minimumRun]).then(() => {
      if (!active) return;
      initialReadyRef.current = true;
      loader.finish();
    });

    return () => {
      active = false;
      loader.stop();
    };
  }, []);

  // 2. Gate dismissed (gate -> home) — reveal the home page.
  const prevGate = useRef(gateOpen);
  useEffect(() => {
    if (initialReadyRef.current && prevGate.current && !gateOpen) play();
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
    if (leavingPreview || !initialReadyRef.current) return;
    play();
  }, [pathname, play]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 z-[500] pointer-events-none"
      // Opaque before hydration: the page never gets a chance to paint in its
      // fallback font before the loader takes over.
      style={{ display: 'block', backgroundColor: DITHER_LOADER_BG }}
    />
  );
}
