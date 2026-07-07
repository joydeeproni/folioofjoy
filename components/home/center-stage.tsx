'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDialKit } from 'dialkit';
import { WORK_ITEMS } from '@/components/work-preview';
import { WRITINGS } from '@/lib/writings';
import { scrambleReveal } from '@/lib/scramble';
import { Seesaw } from './seesaw';
import { DitherReveal } from './dither-reveal';

export type HoverTarget = null | 'about' | 'photography' | 'writings';

const QUOTE = 'i awoke and saw that life was service. i acted and behold, service was joy.';
const GREEN = '#2CA152';
const YELLOW = '#F2E30C';
const START_DELAY = 450; // sustained movement before the work pile begins
const IDLE_MS = 800; // stop-moving delay before the hero returns
const ADVANCE_MS = 320; // min gap between pile advances while moving
const AUTO_MS = 3000; // mobile auto-cycle cadence

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

export function CenterStage({ hoverTarget }: { hoverTarget: HoverTarget }) {
  const isMobile = useIsMobile();

  // Live controls for the hero quote (dialkit panel, dev only). Defaults are
  // the current baked-in values; tune here, then bake the final numbers.
  const q = useDialKit('Homepage Quote', {
    sizeVw: [6.5, 2, 16, 0.05],
    maxWidth: [1400, 300, 1800, 10],
    lineHeight: [1.2, 0.8, 2, 0.01],
    letterSpacing: [0.01, -0.08, 0.4, 0.005],
    wordSpacing: [0.03, -0.2, 1.5, 0.01],
    color: GREEN,
  }) as unknown as {
    sizeVw: number;
    maxWidth: number;
    lineHeight: number;
    letterSpacing: number;
    wordSpacing: number;
    color: string;
  };
  const [count, setCount] = useState(0); // 0 = hero; >0 = piled work screens
  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const hasScrambled = useRef(false);
  const activeRef = useRef(false);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMove = useRef(0);
  const lastAdvance = useRef(0);

  // Scramble the quote once on first mount.
  useEffect(() => {
    if (hasScrambled.current || !quoteRef.current) return;
    hasScrambled.current = true;
    scrambleReveal(quoteRef.current, QUOTE, 1.6, 0.2);
  }, []);

  const clearTimers = useCallback(() => {
    if (startTimer.current) { clearTimeout(startTimer.current); startTimer.current = null; }
    if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null; }
  }, []);

  // A nav hover suppresses the work pile (the preview takes over the page).
  useEffect(() => {
    if (hoverTarget) {
      activeRef.current = false;
      clearTimers();
      setCount(0);
    }
  }, [hoverTarget, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Desktop: sustained movement starts the pile after a delay; idle hides it.
  const handleMove = useCallback(() => {
    if (isMobile || hoverTarget) return;
    const now = performance.now();
    lastMove.current = now;

    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      activeRef.current = false;
      if (startTimer.current) { clearTimeout(startTimer.current); startTimer.current = null; }
      setCount(0);
    }, IDLE_MS);

    if (!activeRef.current) {
      if (!startTimer.current) {
        startTimer.current = setTimeout(() => {
          startTimer.current = null;
          // Only begin if the mouse is still moving when the delay elapses.
          if (performance.now() - lastMove.current <= 200) {
            activeRef.current = true;
            lastAdvance.current = performance.now();
            setCount(1);
          }
        }, START_DELAY);
      }
    } else if (now - lastAdvance.current >= ADVANCE_MS) {
      lastAdvance.current = now;
      setCount((c) => Math.min(c + 1, WORK_ITEMS.length));
    }
  }, [isMobile, hoverTarget]);

  // Mobile: no hover — auto-cycle the pile on a timer (like /work).
  useEffect(() => {
    if (!isMobile || hoverTarget) return;
    setCount(1);
    const id = setInterval(() => {
      setCount((c) => (c >= WORK_ITEMS.length ? 0 : c + 1));
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [isMobile, hoverTarget]);

  const workActive = count > 0;
  const scene: 'hero' | 'work' | 'about' | 'photography' | 'writings' =
    hoverTarget ?? (workActive ? 'work' : 'hero');

  const activeIndex = workActive ? (count - 1) % WORK_ITEMS.length : -1;
  const activeItem = activeIndex >= 0 ? WORK_ITEMS[activeIndex] : null;

  return (
    <div className="absolute inset-0" onMouseMove={handleMove}>
      {/* HERO — green pixel quote behind the teetering seesaw. Stays visible
          while work images drop and stack on top (only nav previews replace it). */}
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6" hidden={hoverTarget !== null}>
        <p
          ref={quoteRef}
          suppressHydrationWarning
          className="font-pixel"
          style={{
            color: q.color,
            fontSize: `${q.sizeVw}vw`,
            maxWidth: `${q.maxWidth}px`,
            lineHeight: q.lineHeight,
            letterSpacing: `${q.letterSpacing}em`,
            wordSpacing: `${q.wordSpacing}em`,
            textAlign: 'justify',
            textTransform: 'lowercase',
            fontWeight: 400,
            fontFeatureSettings: "'salt' on",
          }}
        >
          {QUOTE}
        </p>
        <Seesaw className="absolute w-[62vw] max-w-[720px] h-auto" />
      </div>

      {/* WORK — screens drop and stack on top of the hero as the mouse moves */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pb-28 pointer-events-none" hidden={hoverTarget !== null || count === 0}>
        <div className="relative">
          {WORK_ITEMS.map((item, i) => {
            const visible = i < count;
            const xOff = ((i * 37) % 40) - 20;
            const yOff = ((i * 53) % 30) - 15;
            return (
              <div
                key={item.src}
                className="absolute"
                style={{
                  display: visible ? 'block' : 'none',
                  left: `calc(50% + ${xOff}px)`,
                  top: `calc(50% + ${yOff}px)`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: i,
                }}
              >
                <img
                  src={item.src}
                  alt={item.caption}
                  className="animate-work-drop shadow-2xl"
                  style={{ maxWidth: '78vw', maxHeight: '68vh' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* WORK caption — feature description, bottom centre */}
      {scene === 'work' && activeItem && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center w-full px-6 pointer-events-none">
          <p
            key={activeIndex}
            className="text-base md:text-lg font-sans text-center leading-relaxed max-w-xl text-white animate-caption-fade"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            {activeItem.caption}
          </p>
        </div>
      )}

      {/* ABOUT preview — yellow pixel "about" + 6502 + seesaw */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none" hidden={scene !== 'about'}>
        <span className="font-pixel font-light leading-none select-none text-[15vw] md:text-[11vw]" style={{ color: YELLOW }}>
          about
        </span>
        <span className="absolute top-[20%] left-1/2 -translate-x-1/2 font-pixel font-light text-white text-[8vw] md:text-[4.5vw]">
          6502
        </span>
        <Seesaw className="absolute w-[46vw] max-w-[560px] h-auto" />
      </div>

      {/* PHOTOGRAPHY preview — yellow "snap!" behind a photo pile */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none" hidden={scene !== 'photography'}>
        <span className="font-pixel font-light text-[16vw] leading-none select-none" style={{ color: YELLOW }}>
          snap!
        </span>
        <div className="absolute inset-0 flex items-center justify-center px-6 pb-16">
          <div className="relative">
            {WORK_ITEMS.slice(0, 6).map((item, i) => {
              const xOff = ((i * 41) % 60) - 30;
              const yOff = ((i * 29) % 40) - 20;
              const rot = ((i * 7) % 10) - 5;
              return (
                <img
                  key={item.src}
                  src={item.src}
                  alt=""
                  className="absolute shadow-2xl"
                  style={{
                    left: `calc(50% + ${xOff}px)`,
                    top: `calc(50% + ${yOff}px)`,
                    transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                    zIndex: i,
                    maxWidth: '46vw',
                    maxHeight: '62vh',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* WRITINGS preview — big pixel word + post titles */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 px-6 pointer-events-none" hidden={scene !== 'writings'}>
        <span className="font-pixel font-light text-white text-[15vw] md:text-[9vw] leading-none select-none">
          writings
        </span>
        <div className="flex flex-col items-center gap-1 font-sans text-white/60 text-lg md:text-xl">
          {WRITINGS.map((w) => (
            <span key={w.slug}>{w.title}</span>
          ))}
        </div>
      </div>

      {/* Full-page dither transition only for nav-hover previews (which replace
          the page). The work reveal instead drops images on top of the hero. */}
      <DitherReveal trigger={hoverTarget ?? 'none'} color={GREEN} duration={1200} />
    </div>
  );
}
