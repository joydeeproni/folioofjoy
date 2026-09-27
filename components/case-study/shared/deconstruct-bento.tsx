'use client';

import { useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/reveal';
import { Media } from './media-card';
import { FG, MUTED, FAINT } from './tokens';

// A bento of the parts, not the pages. Each tile takes a component apart a
// different way: `exploded` lifts its real layers apart in 3D, `anatomy` pins
// numbered callouts onto it, `palette` shows the tokens, `states` lines up the
// same component in its different moments, `media` is a plain tile.
// Layer images are real captures of the HTML component with the other parts
// hidden (same clip rect, transparent background), so they stack exactly.

type Span = 'full' | 'two-thirds' | 'half' | 'third';
const SPAN: Record<Span, string> = {
  full: 'md:col-span-6',
  'two-thirds': 'md:col-span-4',
  half: 'md:col-span-3',
  third: 'md:col-span-2',
};

type Base = { title: string; blurb?: ReactNode; span?: Span };
export type DeconstructTile = Base &
  (
    | { kind: 'exploded'; layers: { src: string; label: string }[]; ratio: number }
    | { kind: 'anatomy'; src: string; ratio: number; pins: { x: number; y: number; label: string }[] }
    | { kind: 'palette'; swatches: { hex: string; name: string }[]; font?: { family: string; href?: string; sample?: string; note?: string } }
    | { kind: 'states'; items: { src: string; label: string }[]; ratio: number }
    | { kind: 'media'; src: string; aspect?: string; fit?: 'cover' | 'contain' }
  );

export function DeconstructBento({
  id,
  heading,
  blurb,
  tiles,
  onOpen,
}: {
  id?: string;
  heading: string;
  blurb?: ReactNode;
  tiles: DeconstructTile[];
  onOpen?: (src: string) => void;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <h2 className="mb-4 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>
          {heading}
        </h2>
        {blurb && (
          <p className="mb-8 max-w-[60ch] font-sans text-lg leading-relaxed" style={{ color: MUTED }}>
            {blurb}
          </p>
        )}
      </Reveal>
      <div className="grid gap-4 md:grid-cols-6">
        {tiles.map((t, i) => (
          <Reveal key={i} delay={(i % 3) * 0.06} className={`${SPAN[t.span ?? 'half']} flex flex-col overflow-hidden rounded-2xl`}>
            <div className="flex h-full flex-col" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <div className="relative">
                <TileBody tile={t} onOpen={onOpen} />
              </div>
              <div className="mt-auto px-5 pb-6 pt-5 md:px-6">
                <h3 className="font-sans font-medium text-lg" style={{ color: FG }}>
                  {t.title}
                </h3>
                {t.blurb && (
                  <p className="mt-2 font-sans text-[15px] leading-relaxed" style={{ color: MUTED }}>
                    {t.blurb}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TileBody({ tile, onOpen }: { tile: DeconstructTile; onOpen?: (src: string) => void }) {
  switch (tile.kind) {
    case 'exploded':
      return <Exploded layers={tile.layers} ratio={tile.ratio} />;
    case 'anatomy':
      return <Anatomy src={tile.src} ratio={tile.ratio} pins={tile.pins} />;
    case 'palette':
      return <Palette swatches={tile.swatches} font={tile.font} />;
    case 'states':
      return (
        <div className="flex gap-3 overflow-x-auto p-5 [scrollbar-width:none] md:p-6">
          {tile.items.map((s) => (
            <figure key={s.src} className="min-w-[38%] flex-1">
              <img src={s.src} alt={s.label} loading="lazy" className="w-full rounded-lg object-cover object-top" style={{ aspectRatio: tile.ratio }} />
              <figcaption className="mt-2 font-mono text-[11px] tracking-[0.12em]" style={{ color: MUTED }}>
                {s.label}
              </figcaption>
            </figure>
          ))}
        </div>
      );
    case 'media': {
      const cls = `w-full ${tile.aspect ?? 'aspect-[4/3]'} ${tile.fit === 'contain' ? 'object-contain p-6' : 'object-cover object-top'}`;
      return onOpen ? (
        <button type="button" onClick={() => onOpen(tile.src)} aria-label={`Open ${tile.title}`} className="block w-full cursor-zoom-in">
          <Media src={tile.src} alt={tile.title} className={cls} />
        </button>
      ) : (
        <Media src={tile.src} alt={tile.title} className={cls} />
      );
    }
  }
}

// ── Exploded layers ───────────────────────────────────────────────────────────
// Flat and assembled until it scrolls into view, then tilts and pulls apart.
// Hovering a legend row isolates that layer. Tap/click the stage to toggle.
function Exploded({ layers, ratio }: { layers: { src: string; label: string }[]; ratio: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { amount: 0.6, once: true });
  const reduce = useReducedMotion();
  const [assembled, setAssembled] = useState(false);
  const [focus, setFocus] = useState<number | null>(null);
  const open = (inView || !!reduce) && !assembled;
  const wide = ratio > 2;
  // Wide components (a pill, a bar) read better with a steeper tilt and more
  // separation; tall ones (a card, a sheet) need less.
  const tilt = wide ? { rotateX: 42, rotateZ: -6 } : { rotateX: 52, rotateZ: -24 };
  const gap = wide ? 13 : 11; // cqw (% of the stage width), per layer

  return (
    <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6">
      <button
        ref={ref}
        type="button"
        onClick={() => setAssembled((a) => !a)}
        aria-label={assembled ? 'Explode layers' : 'Assemble layers'}
        className="@container relative mx-auto flex w-full items-center justify-center"
        style={{ aspectRatio: wide ? 1.6 : 1, perspective: '1600px' }}
      >
        <motion.div
          className="relative"
          style={{ width: wide ? '82%' : '62%', aspectRatio: ratio, transformStyle: 'preserve-3d' }}
          initial={false}
          animate={open ? tilt : { rotateX: 0, rotateZ: 0 }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {layers.map((l, i) => {
            const z = open ? (i - (layers.length - 1) / 2) * gap : 0;
            return (
              <motion.img
                key={l.src}
                src={l.src}
                alt={l.label}
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain"
                style={{ filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.45))' }}
                initial={false}
                animate={{ z: `${z}cqw`, opacity: focus === null || focus === i ? 1 : 0.12 }}
                transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : i * 0.05 }}
              />
            );
          })}
        </motion.div>
      </button>
      <ol className="space-y-1.5 md:w-44">
        {[...layers].reverse().map((l, ri) => {
          const i = layers.length - 1 - ri;
          return (
            <li
              key={l.src}
              onMouseEnter={() => setFocus(i)}
              onMouseLeave={() => setFocus(null)}
              className="flex cursor-default items-center gap-2.5 font-sans text-[13.5px] transition-colors"
              style={{ color: focus === i ? FG : MUTED }}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px]" style={{ border: `1px solid ${FAINT}` }}>
                {i + 1}
              </span>
              {l.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Anatomy pins ──────────────────────────────────────────────────────────────
function Anatomy({ src, ratio, pins }: { src: string; ratio: number; pins: { x: number; y: number; label: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="p-5 md:p-6">
      <div ref={ref} className="relative mx-auto" style={{ aspectRatio: ratio }}>
        <img src={src} alt="" loading="lazy" draggable={false} className="h-full w-full rounded-xl object-contain" />
        {pins.map((p, i) => (
          <motion.span
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[11px] font-medium"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: hover === i ? '#0B0B0B' : FG,
              color: hover === i ? FG : '#0B0B0B',
              boxShadow: '0 0 0 4px rgba(11,11,11,0.35), 0 6px 16px rgba(0,0,0,0.35)',
            }}
            initial={false}
            animate={{ scale: inView || reduce ? 1 : 0, opacity: inView || reduce ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {i + 1}
          </motion.span>
        ))}
      </div>
      <ol className="mt-5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {pins.map((p, i) => (
          <li
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="flex items-start gap-2.5 font-sans text-[13.5px] leading-snug transition-colors"
            style={{ color: hover === i ? FG : MUTED }}
          >
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px]" style={{ border: `1px solid ${FAINT}` }}>
              {i + 1}
            </span>
            {p.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Palette + type ────────────────────────────────────────────────────────────
function Palette({
  swatches,
  font,
}: {
  swatches: { hex: string; name: string }[];
  font?: { family: string; href?: string; sample?: string; note?: string };
}) {
  return (
    <div className="p-5 md:p-6">
      {/* React 19 hoists stylesheet links into <head>. */}
      {font?.href && <link rel="stylesheet" href={font.href} precedence="default" />}
      {font && (
        <div className="mb-6 flex items-end justify-between gap-4 border-b pb-5" style={{ borderColor: FAINT }}>
          <span className="text-6xl leading-none tracking-tight md:text-7xl" style={{ fontFamily: `'${font.family}', sans-serif`, color: FG, fontWeight: 700 }}>
            {font.sample ?? 'Aa'}
          </span>
          <span className="text-right font-mono text-[11px] tracking-[0.12em]" style={{ color: MUTED }}>
            {font.family}
            {font.note && (
              <>
                <br />
                {font.note}
              </>
            )}
          </span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {swatches.map((s) => (
          <div key={s.hex + s.name}>
            <div className="aspect-[4/3] rounded-lg" style={{ backgroundColor: s.hex, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }} />
            <p className="mt-1.5 truncate font-sans text-[12.5px]" style={{ color: FG }}>
              {s.name}
            </p>
            <p className="font-mono text-[10.5px] uppercase" style={{ color: MUTED }}>
              {s.hex}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
