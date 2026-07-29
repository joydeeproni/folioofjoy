'use client';

import { useEffect, useRef, useState } from 'react';
import { useDialKit } from 'dialkit';
import { useWork, useWritings } from '@/components/content-provider';
import { scrambleReveal } from '@/lib/scramble';
import { SwingSet } from './swing-set';
import { SpriteSwing, frameViewBox } from './sprite-swing';
import { DitherReveal } from './dither-reveal';
import Link from 'next/link';

export type HoverTarget = null | 'about' | 'photography' | 'writings';

// The hero quote, split so the three theme words become nav links: life + joy
// open About, service opens Work. Joined, the segments equal the full quote —
// kept as one source of truth so the scramble reveal animates the exact text.
const QUOTE_SEGMENTS: { t: string; href?: string }[] = [
  { t: 'i awoke and saw that ' },
  { t: 'life', href: '/about' },
  { t: ' was ' },
  { t: 'service', href: '/preview' },
  { t: '. i acted and behold, ' },
  { t: 'service', href: '/preview' },
  { t: ' was ' },
  { t: 'joy', href: '/about' },
  { t: '.' },
];
const QUOTE = QUOTE_SEGMENTS.map((s) => s.t).join('');
const GREEN = '#2CA152';
const YELLOW = '#F2E30C';

export function CenterStage({
  hoverTarget,
  hoverOrigin,
  onSwingingChange,
}: {
  hoverTarget: HoverTarget;
  hoverOrigin?: { x: number; y: number } | null;
  onSwingingChange?: (swinging: boolean) => void;
}) {
  const WORK_ITEMS = useWork();
  const WRITINGS = useWritings();

  // Hero quote typography — tuned live via the old dialkit panel, now baked in.
  const q = {
    sizeVw: 13.4,
    maxWidth: 16, // characters per line (ch) — locks line breaks across widths
    lineHeight: 1.06,
    letterSpacing: 0,
    wordSpacing: -0.05,
    color: GREEN,
  };

  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const hasScrambled = useRef(false);
  const [revealed, setRevealed] = useState(false);

  // ── Swing Fling (prototype) ────────────────────────────────────────────────
  // Moving the mouse left/right "pumps" the swing. Real pendulum sim: mouse
  // velocity injects torque, so rhythmic in-phase motion builds amplitude
  // (resonance) like pumping your legs on a real swing. `playing` hands the
  // pendulum's transform to the rAF loop (SwingSet `live`); leaving the hero
  // returns it to the idle CSS animation. Launch/score/tilt come next.
  const spriteRef = useRef<SVGSVGElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  // theta/omega = the true pendulum; rTheta/rOmega = the springy render angle
  // that chases it (overshoots/wobbles → "springiness"). vx = live mouse speed.
  const phys = useRef({ theta: 0, omega: 0, rTheta: 0, rOmega: 0, vx: 0, lastX: 0, lastT: 0 });

  // Live-tunable feel (dev-only dialkit panel). springiness: 0 = rigid rope,
  // 1 = very bouncy. camera* drive the "screen shake" that grows with the swing.
  const dial = useDialKit('Swing', {
    gravity: [16, 4, 40, 0.5],
    damping: [0.9, 0.1, 3, 0.05],
    pump: [0.01, 0, 0.05, 0.001],
    maxAngle: [74, 20, 90, 1],
    springiness: [0.4, 0, 1, 0.05],
    cameraPan: [26, 0, 140, 2],
    cameraShake: [6, 0, 30, 0.5],
  }) as unknown as {
    gravity: number; damping: number; pump: number; maxAngle: number; springiness: number;
    cameraPan: number; cameraShake: number;
  };
  const dialRef = useRef(dial);
  dialRef.current = dial;

  // Let the page chrome (nav, copyright strip) fade out while the swing is live.
  useEffect(() => {
    onSwingingChange?.(playing);
  }, [playing, onSwingingChange]);

  const prefersReduced = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onHeroMove = (e: React.MouseEvent) => {
    if (prefersReduced()) return;
    const now = performance.now();
    const p = phys.current;
    if (!playing) {
      setPlaying(true);
      p.lastX = e.clientX;
      p.lastT = now;
      p.vx = 0;
      return;
    }
    const dt = Math.max(0.001, (now - p.lastT) / 1000);
    p.vx = (e.clientX - p.lastX) / dt; // px/s, signed (right = +)
    p.lastX = e.clientX;
    p.lastT = now;
  };

  const onHeroLeave = () => {
    setPlaying(false);
    spriteRef.current?.setAttribute('viewBox', frameViewBox(0));
    if (cameraRef.current) cameraRef.current.style.transform = '';
    const p = phys.current;
    p.theta = p.omega = p.rTheta = p.rOmega = p.vx = 0;
  };

  // Pendulum integrator — runs only while playing; writes the rotation straight
  // to the SVG group (no per-frame React re-render). Feel comes from the dial.
  useEffect(() => {
    if (!playing) return;
    const sprite = spriteRef.current;
    const p = phys.current;
    let last = performance.now();
    let raf = 0;
    let frame = -1;
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const d = dialRef.current;
      const MAX = (d.maxAngle * Math.PI) / 180;
      // true pendulum: gravity restoring + damping + mouse-velocity pump
      const acc = -d.gravity * Math.sin(p.theta) - d.damping * p.omega + d.pump * p.vx;
      p.omega += acc * dt;
      p.theta += p.omega * dt;
      if (p.theta > MAX) { p.theta = MAX; if (p.omega > 0) p.omega = 0; }
      if (p.theta < -MAX) { p.theta = -MAX; if (p.omega < 0) p.omega = 0; }
      p.vx *= 0.82; // mouse influence fades between moves
      // springy render angle chases the true angle — low damping = more wobble.
      // (Drives the camera; the sprite art itself frame-swaps below.)
      const STIFF = 160;
      const springDamp = 26 - 23 * d.springiness; // 0 → tight/rigid, 1 → bouncy
      p.rOmega += (STIFF * (p.theta - p.rTheta) - springDamp * p.rOmega) * dt;
      p.rTheta += p.rOmega * dt;
      // Frame-swap the hand-drawn swing: forward pose past center, back pose before.
      const next = p.theta > 0 ? 1 : 0;
      if (sprite && next !== frame) { frame = next; sprite.setAttribute('viewBox', frameViewBox(frame)); }

      // Camera: the whole hero scene leans/rolls with the swing and rumbles as
      // it gets more intense — so the screen sells the momentum. intensity is
      // how high (0..1); shake also scales with raw angular speed.
      const cam = cameraRef.current;
      if (cam) {
        const intensity = Math.min(1, Math.abs(p.rTheta) / MAX);
        const speed = Math.min(1, Math.abs(p.omega) / 4);
        const punch = Math.max(intensity, speed);
        const tx = d.cameraPan * Math.sin(p.rTheta); // slide left/right with the swing
        const sx = (Math.random() - 0.5) * d.cameraShake * punch; // horizontal rumble only
        cam.style.transform = `translateX(${tx + sx}px)`; // x-axis only — no scale, no vertical
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Scramble the quote once on first mount, then swap the flat text for the
  // version whose theme words (life / service / joy) are white, clickable links.
  useEffect(() => {
    if (hasScrambled.current || !quoteRef.current) return;
    hasScrambled.current = true;
    scrambleReveal(quoteRef.current, QUOTE, 1.6, 0.2);
    const t = setTimeout(() => setRevealed(true), 1900); // after the scramble settles (1.6s + 0.2s)
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0">
      {/* HERO — green pixel quote behind the swinging swing set. Stays visible
          while the selected previews drop and stack on top. */}
      <div
        ref={cameraRef}
        className="absolute inset-0 z-0 flex items-center justify-center px-6 will-change-transform"
        hidden={hoverTarget !== null}
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}
      >
        <p
          ref={quoteRef}
          suppressHydrationWarning
          className="font-geist"
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
            fontWeight: 300,
          }}
        >
          {revealed
            ? QUOTE_SEGMENTS.map((s, i) =>
                s.href ? (
                  <Link
                    key={i}
                    href={s.href}
                    className="italic text-white transition-colors hover:text-[#2CA152]"
                  >
                    {s.t}
                  </Link>
                ) : (
                  <span key={i}>{s.t}</span>
                ),
              )
            : QUOTE}
        </p>
        {/* pointer-events-none so the quote's word-links underneath stay clickable;
            the tilt is driven by onHeroMove reading the cursor's side of this art */}
        <SpriteSwing ref={spriteRef} className="absolute w-[86vw] md:w-[62vw] max-w-[720px] h-auto" />
      </div>

      {/* Preview Work — opens the full-screen work-preview reel. Fades out while
          the swing is being played so the toy is the focus. */}
      <div
        className={`fixed bottom-[calc(2rem+var(--sab))] left-1/2 -translate-x-1/2 z-30 text-sm font-sans transition-opacity duration-500 ${playing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        hidden={hoverTarget !== null}
      >
        <Link href="/preview" className="text-white/90 hover:text-[#2CA152] transition-colors">
          Preview Work
        </Link>
      </div>

      {/* ABOUT preview — yellow pixel "about" + 6502 + swing set */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none" hidden={hoverTarget !== 'about'}>
        <span className="font-pixel italic font-light leading-none select-none text-[15vw] md:text-[11vw]" style={{ color: YELLOW }}>
          about
        </span>
        <span className="absolute top-[20%] left-1/2 -translate-x-1/2 font-pixel italic font-light text-white text-[8vw] md:text-[4.5vw]">
          6502
        </span>
        <SwingSet className="absolute w-[46vw] max-w-[560px] h-auto" />
      </div>

      {/* PHOTOGRAPHY preview — yellow "snap!" behind a photo pile */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none" hidden={hoverTarget !== 'photography'}>
        <span className="font-pixel italic font-light text-[16vw] leading-none select-none" style={{ color: YELLOW }}>
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
        <span className="font-pixel italic font-light text-white text-[15vw] md:text-[9vw] leading-none select-none">
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
