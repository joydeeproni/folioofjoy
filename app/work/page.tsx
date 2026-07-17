'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAudio } from '@/lib/audio-context';
import { useWork } from '@/components/content-provider';

// Images pile up one every SLIDE_MS, each held long enough to read its
// description. The dots count the seconds the top image has been up.
const SLIDE_MS = 3000;
const INITIAL_DELAY_MS = 1500;
const PAUSE_AFTER_ALL_MS = 3000;
const MAX_DOTS = Math.max(1, Math.round(SLIDE_MS / 1000));

export default function Work() {
  const { theme } = useAudio();
  const WORK_ITEMS = useWork();
  const [visibleCount, setVisibleCount] = useState(0);
  const [dots, setDots] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSequence = useCallback(() => {
    let count = 1;
    setVisibleCount(1);
    const tick = () => {
      if (count < WORK_ITEMS.length) {
        count++;
        setVisibleCount(count);
        timerRef.current = setTimeout(tick, SLIDE_MS);
      } else {
        // All shown — pause on the full collage, then reset and restart.
        timerRef.current = setTimeout(() => {
          setVisibleCount(0);
          timerRef.current = setTimeout(runSequence, 500);
        }, PAUSE_AFTER_ALL_MS);
      }
    };
    timerRef.current = setTimeout(tick, SLIDE_MS);
  }, [WORK_ITEMS.length]);

  // Brief pause on the opening quote, then start the pile-up.
  useEffect(() => {
    timerRef.current = setTimeout(runSequence, INITIAL_DELAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [runSequence]);

  // Dot count = seconds the current top image has been visible (1 → MAX_DOTS).
  useEffect(() => {
    if (visibleCount === 0) return;
    setDots(1);
    const id = setInterval(() => setDots((d) => Math.min(d + 1, MAX_DOTS)), 1000);
    return () => clearInterval(id);
  }, [visibleCount]);

  const activeIndex = visibleCount - 1;
  const activeItem = activeIndex >= 0 ? WORK_ITEMS[activeIndex] : null;

  return (
    <main
      className="relative min-h-dvh overflow-hidden transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: theme.background }}
    >
      {/* Navigation */}
      <nav className="fixed top-[calc(1.75rem+var(--sat))] left-[calc(2rem+var(--sal))] z-50 hidden md:flex items-center gap-5" style={{ color: theme.link }}>
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
      <nav className="md:hidden fixed top-[calc(1.25rem+var(--sat))] left-[calc(1.25rem+var(--sal))] z-50 flex items-center gap-4" style={{ color: theme.link }}>
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
      <div className="relative z-10 min-h-dvh flex items-center justify-center px-8 md:px-16 lg:px-24">
        <p className="font-heading font-light text-3xl md:text-7xl lg:text-8xl tracking-wide lowercase text-justify max-w-[900px]" style={{ lineHeight: '1.15', color: theme.foreground }}>
          i awoke and saw that life was service. i acted and behold, service was joy.
        </p>
      </div>

      {/* Overlapping project images — pile up, lifted to leave room below */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pb-28 pointer-events-none">
        <div className="relative">
          {WORK_ITEMS.map((item, i) => {
            const visible = i < visibleCount;
            // Small deterministic offsets so images overlap but don't align.
            const xOff = ((i * 37) % 40) - 20;
            const yOff = ((i * 53) % 30) - 15;
            return (
              <img
                key={item.src}
                src={item.src}
                alt={item.caption}
                className="absolute -translate-x-1/2 -translate-y-1/2 shadow-2xl"
                style={{
                  display: visible ? 'block' : 'none',
                  left: `calc(50% + ${xOff}px)`,
                  top: `calc(50% + ${yOff}px)`,
                  zIndex: i,
                  maxWidth: '78vw',
                  maxHeight: '70vh',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Active description — only the top image's caption, bottom centre */}
      {activeItem && (
        <div className="fixed bottom-[calc(2.5rem+var(--sab))] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-full px-6 pointer-events-none">
          <div className="flex items-center gap-1.5" style={{ height: 5 }}>
            {Array.from({ length: MAX_DOTS }).map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-opacity duration-200"
                style={{
                  width: 5,
                  height: 5,
                  backgroundColor: theme.foreground,
                  opacity: i < dots ? 0.9 : 0.18,
                }}
              />
            ))}
          </div>
          <p
            key={`cap-${activeIndex}`}
            className="text-base md:text-lg font-sans text-center leading-relaxed max-w-xl animate-caption-fade"
            style={{ color: theme.foreground, textWrap: 'balance' } as React.CSSProperties}
          >
            {activeItem.caption}
          </p>
        </div>
      )}
    </main>
  );
}
