'use client';

import { useEffect, useRef, useState } from 'react';
import { useDialKit } from 'dialkit';
import { useWork, useWritings } from '@/components/content-provider';
import { scrambleReveal } from '@/lib/scramble';
import { Seesaw } from './seesaw';
import { DitherReveal } from './dither-reveal';
import { WorkMarquee } from './work-marquee';

export type HoverTarget = null | 'about' | 'photography' | 'writings';

const QUOTE = 'i awoke and saw that life was service. i acted and behold, service was joy.';
const GREEN = '#2CA152';
const YELLOW = '#F2E30C';

export function CenterStage({
  hoverTarget,
  hoverOrigin,
}: {
  hoverTarget: HoverTarget;
  hoverOrigin?: { x: number; y: number } | null;
}) {
  const WORK_ITEMS = useWork();
  const WRITINGS = useWritings();

  // Live controls for the hero quote (dialkit panel, dev only).
  const q = useDialKit('Homepage Quote', {
    sizeVw: [13.4, 2, 16, 0.05],
    maxWidth: [16, 8, 40, 0.5], // characters per line (ch) — locks line breaks across widths
    lineHeight: [1.06, 0.6, 2, 0.01],
    letterSpacing: [-0.025, -0.08, 0.4, 0.005],
    wordSpacing: [-0.2, -0.2, 1.5, 0.01],
    color: GREEN,
  }) as unknown as {
    sizeVw: number;
    maxWidth: number;
    lineHeight: number;
    letterSpacing: number;
    wordSpacing: number;
    color: string;
  };

  const [previewing, setPreviewing] = useState(false);
  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const hasScrambled = useRef(false);

  // Scramble the quote once on first mount.
  useEffect(() => {
    if (hasScrambled.current || !quoteRef.current) return;
    hasScrambled.current = true;
    scrambleReveal(quoteRef.current, QUOTE, 1.6, 0.2);
  }, []);

  // A nav hover stops the preview (the hovered preview takes over the page).
  useEffect(() => { if (hoverTarget) setPreviewing(false); }, [hoverTarget]);

  const showMarquee = !hoverTarget && previewing;

  return (
    <div className="absolute inset-0">
      {/* HERO — green pixel quote behind the teetering seesaw. Stays visible
          while the selected previews drop and stack on top. */}
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6" hidden={hoverTarget !== null || previewing}>
        <p
          ref={quoteRef}
          suppressHydrationWarning
          className="font-pixel"
          style={{
            color: q.color,
            // Fluid size, bounded so phones and ultrawides don't hit extremes.
            fontSize: `clamp(2.2rem, ${q.sizeVw}vw, 9rem)`,
            // Width in ch tracks the font, so line breaks land identically at any width.
            maxWidth: `min(90vw, ${q.maxWidth}ch)`,
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

      {/* WORK MARQUEE — draggable filmstrip, drifts right→left, captions the centred item */}
      {showMarquee && <WorkMarquee />}

      {/* Preview Work — runs the project slide-stack on loop (homepage only) */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 text-sm font-sans"
        hidden={hoverTarget !== null}
      >
        <button
          onClick={() => setPreviewing((p) => !p)}
          className={`transition-colors ${previewing ? 'text-[#2CA152]' : 'text-white/90 hover:text-[#2CA152]'}`}
        >
          Preview Work
        </button>
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
