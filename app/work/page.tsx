'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAudio } from '@/lib/audio-context';

const WORK_IMAGES = [
  '/work/project-01.png',
  '/work/project-02.png',
  '/work/project-03.png',
  '/work/project-04.png',
  '/work/carbondash-01.png',
  '/work/netflix-01.png',
  '/work/verizon-red.png',
  '/work/urbyn-banner.png',
  '/work/dribbble-08.jpg',
  '/work/widgets.png',
  '/work/dribbble-04.jpg',
  '/work/dribbble-10.jpg',
  '/work/dribbble-01.jpg',
  '/work/dribbble-06.jpg',
  '/work/tactile-create-01.png',
  '/work/tactile-create-02.png',
  '/work/verizon-red-02.png',
  '/work/urbyn-banner-02.png',
  '/work/urbyn-value-drivers.png',
  '/work/urbyn-historical.png',
  '/work/email-illustration.png',
  '/work/module-selector.png',
  '/work/property-widgets.png',
  '/work/hotel-cards.jpg',
  '/work/carbon-dashboard.jpg',
  '/work/carbondash-brand.png',
  '/work/carbondash-logos.png',
  '/work/carbondash-marketing.png',
];

const INTERVAL_MS = 1000; // ~every 2 beats at 120bpm
const INITIAL_DELAY_MS = 3000;
const PAUSE_AFTER_ALL_MS = 3000;

export default function Work() {
  const { theme } = useAudio();
  const [visibleCount, setVisibleCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSequence = useCallback(() => {
    let count = 0;
    const tick = () => {
      count++;
      setVisibleCount(count);
      if (count < WORK_IMAGES.length) {
        timerRef.current = setTimeout(tick, INTERVAL_MS);
      } else {
        // All shown — pause, then reset and restart
        timerRef.current = setTimeout(() => {
          setVisibleCount(0);
          timerRef.current = setTimeout(runSequence, 500);
        }, PAUSE_AFTER_ALL_MS);
      }
    };
    timerRef.current = setTimeout(tick, INTERVAL_MS);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(runSequence, INITIAL_DELAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [runSequence]);

  return (
    <main
      className="relative min-h-screen overflow-hidden transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: theme.background }}
    >
      {/* Navigation */}
      <nav className="fixed top-7 left-8 z-50 hidden md:flex items-center gap-5" style={{ color: theme.link }}>
        <Link
          href="/"
          className="text-sm font-sans opacity-70 hover:opacity-100 transition-opacity"
        >
          Back Home
        </Link>
        <span className="text-sm font-sans opacity-70 transition-opacity cursor-default">
          Projects
        </span>
      </nav>

      {/* Mobile navigation */}
      <nav className="md:hidden fixed top-5 left-5 z-50 flex items-center gap-4" style={{ color: theme.link }}>
        <Link
          href="/"
          className="text-sm font-sans opacity-70 hover:opacity-100 transition-opacity"
        >
          Back Home
        </Link>
      </nav>

      {/* Accent circle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: theme.accent, opacity: 0.85 }}
      />

      {/* Quote text */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 md:px-16 lg:px-24">
        <p className="font-heading font-light text-3xl md:text-7xl lg:text-8xl tracking-wide lowercase text-justify max-w-[900px]" style={{ lineHeight: '1.15', color: theme.foreground }}>
          i awoke and saw that life was service. i acted and behold, service was joy.
        </p>
      </div>

      {/* Overlapping project images — stacked on top of the text */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        {WORK_IMAGES.map((src, i) => {
          const visible = i < visibleCount;
          // Small deterministic offsets so images overlap but don't perfectly align
          const xOff = ((i * 37) % 40) - 20;
          const yOff = ((i * 53) % 30) - 15;
          return (
            <img
              key={src}
              src={src}
              alt=""
              className="absolute shadow-2xl"
              style={{
                display: visible ? 'block' : 'none',
                transform: `translate(${xOff}px, ${yOff}px)`,
                maxWidth: '80vw',
                maxHeight: '80vh',
              }}
            />
          );
        })}
      </div>
    </main>
  );
}
