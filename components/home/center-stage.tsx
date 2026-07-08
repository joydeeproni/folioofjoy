'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useDialKit } from 'dialkit';
import { WORK_ITEMS, type WorkCategory } from '@/components/work-preview';
import { WRITINGS } from '@/lib/writings';
import { scrambleReveal } from '@/lib/scramble';
import { Seesaw } from './seesaw';
import { DitherReveal } from './dither-reveal';

export type HoverTarget = null | 'about' | 'photography' | 'writings';

// Category filters shown under the hero. Clicking one stacks that category's
// project previews on top of the hero; RND = everything.
type Cat = WorkCategory | 'RND';
const CATEGORIES: { key: Cat; full: string }[] = [
  { key: 'SVC', full: 'Service — products built to help others (dashboards, apps)' },
  { key: 'JOY', full: 'Joy — pure fun, experiments, random stuff' },
  { key: 'BIZ', full: 'Business — ecommerce, landing pages, money work' },
  { key: 'DTY', full: 'Duty — design systems, busywork, organization' },
  { key: 'RND', full: 'Random — everything' },
];

const QUOTE = 'i awoke and saw that life was service. i acted and behold, service was joy.';
const GREEN = '#2CA152';
const YELLOW = '#F2E30C';
const STACK_MS = 650; // gap between each preview dropping onto the pile

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

export function CenterStage({
  hoverTarget,
  hoverOrigin,
}: {
  hoverTarget: HoverTarget;
  hoverOrigin?: { x: number; y: number } | null;
}) {
  const isMobile = useIsMobile();

  // Live controls for the hero quote (dialkit panel, dev only).
  const q = useDialKit('Homepage Quote', {
    sizeVw: [6.5, 2, 16, 0.05],
    maxWidth: [800, 300, 1800, 10],
    lineHeight: [0.9, 0.6, 2, 0.01],
    letterSpacing: [-0.025, -0.08, 0.4, 0.005],
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

  const [activeCat, setActiveCat] = useState<Cat | null>(null);
  const [count, setCount] = useState(0); // number of piled previews (0 = none)
  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const hasScrambled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scramble the quote once on first mount.
  useEffect(() => {
    if (hasScrambled.current || !quoteRef.current) return;
    hasScrambled.current = true;
    scrambleReveal(quoteRef.current, QUOTE, 1.6, 0.2);
  }, []);

  const items = useMemo(() => {
    if (!activeCat) return [];
    if (activeCat === 'RND') return WORK_ITEMS;
    return WORK_ITEMS.filter((w) => w.category === activeCat);
  }, [activeCat]);

  // On category select, drop its previews onto the pile one at a time.
  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (!activeCat || items.length === 0) { setCount(0); return; }
    setCount(1);
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c >= items.length) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          return c;
        }
        return c + 1;
      });
    }, STACK_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeCat, items.length]);

  // A nav hover clears any active category (the preview takes over the page).
  useEffect(() => { if (hoverTarget) setActiveCat(null); }, [hoverTarget]);

  const toggle = (c: Cat) => setActiveCat((prev) => (prev === c ? null : c));

  const showStack = !hoverTarget && count > 0 && items.length > 0;
  const activeItem = showStack ? items[Math.min(count, items.length) - 1] : null;

  return (
    <div className="absolute inset-0">
      {/* HERO — green pixel quote behind the teetering seesaw. Stays visible
          while the selected previews drop and stack on top. */}
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6" hidden={hoverTarget !== null}>
        <p
          ref={quoteRef}
          suppressHydrationWarning
          className="font-pixel"
          style={{
            color: q.color,
            fontSize: isMobile ? '10.5vw' : `${q.sizeVw}vw`,
            maxWidth: isMobile ? '90vw' : `${q.maxWidth}px`,
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

      {/* WORK STACK — category previews drop and stack on top of the hero */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pb-28 pointer-events-none" hidden={!showStack}>
        <div className="relative">
          {items.map((item, i) => {
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
                  style={{
                    maxWidth: isMobile ? '90vw' : '78vw',
                    maxHeight: isMobile ? '72vh' : '68vh',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature caption — the top preview's description */}
      {activeItem && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center w-full px-6 pointer-events-none">
          <p
            key={`${activeCat}-${count}`}
            className="text-base md:text-lg font-sans text-center leading-relaxed max-w-xl text-white animate-caption-fade"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            {activeItem.caption}
          </p>
        </div>
      )}

      {/* Category abbreviations — click to stack that category (homepage only) */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-5 font-mono text-xs uppercase tracking-[0.2em]"
        hidden={hoverTarget !== null}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => toggle(c.key)}
            title={c.full}
            className="transition-colors hover:!opacity-100"
            style={{ color: activeCat === c.key ? GREEN : 'rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => { if (activeCat !== c.key) e.currentTarget.style.color = GREEN; }}
            onMouseLeave={(e) => { if (activeCat !== c.key) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            {c.key}
          </button>
        ))}
      </div>

      {/* ABOUT preview — yellow pixel "about" + 6502 + seesaw */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none" hidden={hoverTarget !== 'about'}>
        <span className="font-pixel font-light leading-none select-none text-[15vw] md:text-[11vw]" style={{ color: YELLOW }}>
          about
        </span>
        <span className="absolute top-[20%] left-1/2 -translate-x-1/2 font-pixel font-light text-white text-[8vw] md:text-[4.5vw]">
          6502
        </span>
        <Seesaw className="absolute w-[46vw] max-w-[560px] h-auto" />
      </div>

      {/* PHOTOGRAPHY preview — yellow "snap!" behind a photo pile */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none" hidden={hoverTarget !== 'photography'}>
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
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 px-6 pointer-events-none" hidden={hoverTarget !== 'writings'}>
        <span className="font-pixel font-light text-white text-[15vw] md:text-[9vw] leading-none select-none">
          writings
        </span>
        <div className="flex flex-col items-center gap-1 font-sans text-white/60 text-lg md:text-xl">
          {WRITINGS.map((w) => (
            <span key={w.slug}>{w.title}</span>
          ))}
        </div>
      </div>

      {/* Full-page dither transition for nav-hover previews (drifts from link) */}
      <DitherReveal trigger={hoverTarget ?? 'none'} origin={hoverOrigin} />
    </div>
  );
}
