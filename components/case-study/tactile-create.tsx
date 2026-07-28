'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, useAnimationFrame, type MotionValue } from 'motion/react';
import { Plus, Minus, Expand } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { ArticleToc } from '@/components/writings/article-toc';
import { slugify } from '@/lib/writings/slug';
import { FG, BG, MUTED, FAINT, FULL_BLEED, SHELF, SHELF_PAD } from './shared/tokens';
import { MediaCard, ZoomableShot } from './shared/media-card';
import { Statement } from './shared/statement';
import { Lightbox } from './shared/lightbox';

// Tactile Create ("Create Suite") — bespoke, Apple-TV-style scroll case study.
// KEEPS the standard case-study chrome (header, right-rail index, sticky title);
// only the IA / animation / components are new. Type is the site system (Galeria
// `font-sans` + mono labels). Media + icons are PLACEHOLDER. Copy from Joy's
// design; {/* ASK JOY */} marks lines to confirm/replace.

const IMG = '/work/tactile-create';

const TOC = ['Overview', 'Creative Suite', 'In motion', 'Up close', 'FAQ'];
const id = (label: string) => slugify(label);

// The big fade-in statement before the green video. Copy from Joy (verbatim).
const STATEMENT = [
  'Mobile games is a competitive industry — every 10 seconds someone uninstalls a game from their phone, making it harder to compete than ever.',
  'The only way to stand out and survive is to experiment and build concept games as much as possible.',
  'AI has made that possible, and embracing it is good business.',
];

// Short hover captions. {/* ASK JOY: labels are my best guess from filenames — confirm/replace */}
const SHOTS: { file: string; caption: string }[] = [
  { file: 'pipeline.png', caption: 'The concept pipeline' },
  { file: 'concept-details.png', caption: 'A concept, up close' },
  { file: 'details.png', caption: 'Game details' },
  { file: 'references.png', caption: 'Reference gathering' },
  { file: 'list.png', caption: 'The games list' },
  { file: 'list-1.png', caption: 'Browsing the library' },
  { file: 'empty.png', caption: 'Starting from empty' },
  { file: 'present.png', caption: 'Present mode' },
  { file: 'present-mode-open.png', caption: 'Presenting a concept' },
  { file: 'details-copy.png', caption: 'Details view' },
  { file: 'list-copy.png', caption: 'List view' },
  { file: 'list-copy-2.png', caption: 'List view' },
];

// Real preview videos for the green carousel — autoplay, no chrome.
const VIDEOS = [
  'tactilehub-preview-1.mp4', 'tactilehub-preview-2.mp4', 'tactileart-preview-1.mp4',
  'createart-preview-2.mp4', 'createart-preview-3.mp4', 'createcode-preview-1.mp4',
];

// The Creative Suite — three "Create" products. Copy + logos from Joy.
const SUITE = [
  {
    name: 'Create Hub',
    logo: 'createhub-logo.png',
    blurb: 'The central workspace for competitive intelligence and internal project tracking — competitor games, deconstructions, asset libraries, storyboards, and the org-wide project overview board.',
  },
  {
    name: 'Create Art',
    logo: 'createart-logo.png',
    blurb: 'An AI creative platform to generate, upscale, and transform images, video, and 3D for games — on models trained on Tactile’s own art styles.',
  },
  {
    name: 'Create Code',
    logo: 'createcode-logo.png',
    blurb: 'AI-native game generation wired to the Unity editor — 2D and 3D, in the studio’s own dev patterns.', // {/* ASK JOY: confirm Create Code copy (cut off in the mock) */}
  },
];

// Isolated moments — real images with captions.
const FEATURE = [
  { file: 'feature-c.png', caption: 'One overview to manage every game and its components.' },
  { file: 'feature-d.png', caption: 'Game project cards — the publishing team’s status at a glance.' },
  { file: 'feature-a.png', caption: 'A details modal for competitor analytics on the games we track.' },
  { file: 'feature-b.png', caption: 'Create Art — a Photoshop plugin, so the ecosystem follows you into Photoshop.' },
];

// Real questions from Joy; answers still to come. {/* ASK JOY: fill the answers */}
const FAQ = [
  { q: 'What was your role in this?', a: 'I worked as the product designer — I designed it in Figma, prototyped it in Make and Claude Code, then helped the developers through UAT and shipped it.' },
  { q: 'What was your design stack?', a: 'Figma, Make, and the Claude Code CLI. It’s built on React, with a custom design system I designed in Figma, based on MUI.' },
  { q: 'What were some design challenges?', a: '{Answer coming from Joy.}' },
  { q: 'How did you measure success of this project?', a: '{Answer coming from Joy.}' },
  { q: 'What were your learnings from this?', a: '{Answer coming from Joy.}' },
];

// ── Creative Suite — horizontal shelf, aligned to the heading ────────────────
function SuiteShelf() {
  return (
    <section id={id('Creative Suite')} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <h2 className="mb-8 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>Creative Suite</h2>
      </Reveal>
      <Reveal className={SHELF}>
        <div className={`flex gap-8 pb-4 md:gap-12 ${SHELF_PAD}`}>
          {SUITE.map((s, i) => (
            <div
              key={s.name}
              className={`flex w-[76vw] max-w-[400px] shrink-0 flex-col ${i > 0 ? 'pl-8 md:pl-12' : ''}`}
              style={i > 0 ? { borderLeft: `1px solid ${FAINT}` } : undefined}
            >
              <img src={`${IMG}/${s.logo}`} alt="" width={64} height={64} className="mb-16 h-16 w-16 rounded-2xl object-cover" />

              <h3 className="font-sans font-medium text-lg md:text-xl" style={{ color: FG }}>{s.name}</h3>
              <p className="mt-2 font-sans text-[15px] leading-relaxed" style={{ color: MUTED }}>{s.blurb}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ── Signature — green "video" scales down into a row of videos ────────────────
function ScrollVideoCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [2.0, 1]);
  // The other cards stay fully hidden (0%) and nothing pans until the hero video
  // has finished coming down (scale completes at 0.5) — so it never overlaps.
  const x = useTransform(scrollYProgress, [0.55, 0.9], ['0vw', '-150vw']);
  const fade = useTransform(scrollYProgress, [0.55, 0.72], [0, 1]);
  // Whole carousel fades out only over the last 10% — so people can watch the videos first.
  const outOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0]);

  if (reduce) {
    return (
      <section id={id('In motion')} className="scroll-mt-24 py-16">
        <div className={`${SHELF} flex gap-4 ${SHELF_PAD}`}>
          {VIDEOS.map((v, n) => <MediaCard key={n} src={`${IMG}/${v}`} aspect="aspect-[16/10]" className="w-[64vw] max-w-[720px] shrink-0" />)}
        </div>
      </section>
    );
  }

  return (
    <section id={id('In motion')} ref={ref} className={`relative h-[300vh] scroll-mt-24 ${FULL_BLEED}`}>
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <motion.div style={{ x, opacity: outOpacity }} className="flex items-center gap-4 pl-[calc(50vw-22vw)] pr-[40vw] will-change-transform">
          <motion.div style={{ scale }} className="relative z-10 origin-center shrink-0">
            <MediaCard src={`${IMG}/${VIDEOS[0]}`} aspect="aspect-[16/10]" className="w-[44vw] max-w-[720px]" />
          </motion.div>
          {VIDEOS.slice(1).map((v, n) => (
            <motion.div key={n} style={{ opacity: fade }} className="shrink-0">
              <MediaCard src={`${IMG}/${v}`} aspect="aspect-[16/10]" className="w-[44vw] max-w-[720px]" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Two bigger image rows auto-scrolling in opposite directions ──────────────
// Full-bleed edge-to-edge, sits right under the green carousel. Click opens the
// image; hovering a row slows its scroll way down.

// Per-frame speed so hover can slow it smoothly (no jump). `reverse` flips direction.
function Marquee({ shots, reverse = false, durationMs, onOpen }: { shots: { file: string; caption: string }[]; reverse?: boolean; durationMs: number; onOpen: (src: string) => void }) {
  const reduce = useReducedMotion();
  const pct = useMotionValue(reverse ? -50 : 0);
  const x = useTransform(pct, (v) => `${v}%`);
  const speed = useRef(1);
  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const step = (delta / durationMs) * 50 * speed.current;
    let v = pct.get() + (reverse ? step : -step);
    if (v <= -50) v += 50;
    if (v >= 0) v -= 50;
    pct.set(v);
  });
  const loop = [...shots, ...shots];
  return (
    <div className="overflow-hidden pb-7" onMouseEnter={() => (speed.current = 0.3)} onMouseLeave={() => (speed.current = 1)}>
      <motion.div className="flex w-max gap-4" style={reduce ? undefined : { x }}>
        {loop.map((s, i) => (
          <ZoomableShot
            key={i}
            item={{ src: `${IMG}/${s.file}`, caption: s.caption }}
            aspect="aspect-[16/10]"
            className="w-[70vw] max-w-[520px] sm:w-[40vw]"
            onOpen={onOpen}
          />
        ))}
      </motion.div>
    </div>
  );
}

function MarqueeWall({ onOpen }: { onOpen: (src: string) => void }) {
  return (
    <Reveal>
      <div className={`${FULL_BLEED} -mt-[12vh] space-y-3 pb-16 md:-mt-[18vh]`}>
        <Marquee shots={SHOTS.slice(0, 6)} durationMs={46000} onOpen={onOpen} />
        <Marquee shots={SHOTS.slice(6)} reverse durationMs={54000} onOpen={onOpen} />
      </div>
    </Reveal>
  );
}

// ── Isolated feature videos — carousel with captions ─────────────────────────
function FeatureCarousel({ onOpen }: { onOpen: (src: string) => void }) {
  return (
    <section id={id('Up close')} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <h2 className="mb-8 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>A few moments, up close.</h2>
      </Reveal>
      <Reveal className={SHELF}>
        <div className={`flex snap-x snap-mandatory gap-4 pb-4 ${SHELF_PAD}`}>
          {FEATURE.map((f) => {
            const src = `${IMG}/${f.file}`;
            return (
              <div key={f.file} className="w-[78vw] max-w-[560px] shrink-0 snap-start">
                <button type="button" onClick={() => onOpen(src)} className="group relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-lg border border-white/10 shadow-2xl">
                  <img src={src} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover object-top" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ backgroundColor: 'rgba(11,11,11,0.28)' }}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm" style={{ backgroundColor: 'rgba(11,11,11,0.55)', border: `1px solid rgba(237,234,224,0.35)` }}>
                      <Expand className="h-5 w-5" style={{ color: FG }} aria-hidden />
                    </span>
                  </span>
                </button>
                <p className="mt-3 font-sans text-[15px] leading-relaxed" style={{ color: MUTED }}>{f.caption}</p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

// ── FAQ accordion ────────────────────────────────────────────────────────────
function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id={id('FAQ')} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <h2 className="mb-8 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>The questions I get asked.</h2>
      </Reveal>
      <Reveal className="max-w-[70ch]">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ borderTop: `1px solid ${FAINT}` }}>
              <button onClick={() => setOpen(isOpen ? null : i)} className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left" aria-expanded={isOpen}>
                <span className="font-sans text-[17px] md:text-lg leading-relaxed transition-opacity group-hover:opacity-70" style={{ color: FG }}>{item.q}</span>
                <span className="shrink-0 text-[rgba(237,234,224,0.55)] transition-colors group-hover:text-[#EDEAE0]">{isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</span>
              </button>
              <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                <p className="max-w-[68ch] pb-6 font-sans text-[17px] md:text-lg leading-relaxed" style={{ color: MUTED }}>{item.a}</p>
              </motion.div>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}

export function TactileCreate() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const recompute = () => {
      frame = 0;
      const el = headerRef.current;
      if (el) setCollapsed(el.getBoundingClientRect().bottom <= 56);
    };
    const onScroll = () => { if (frame) return; frame = requestAnimationFrame(recompute); };
    recompute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden={!collapsed}
        className={`fixed inset-x-0 top-0 z-40 hidden justify-center px-16 pt-[calc(1.5rem+var(--sat))] pb-8 transition-opacity duration-300 ease-out md:flex ${collapsed ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        style={{ background: `linear-gradient(to bottom, rgba(11,11,11,0.92), rgba(11,11,11,0))` }}
      >
        <span className="font-sans font-medium text-sm" style={{ color: FG }}>Create Suite</span>
      </div>

      {/* Progressive fade at the bottom edge of the viewport — mirrors the top. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[16vh] md:h-[22vh]"
        style={{ background: 'linear-gradient(to top, rgba(11,11,11,0.95), rgba(11,11,11,0))' }}
      />

      <ArticleToc sections={TOC.map((label) => ({ label, level: 1 as const }))} />

      <div className="mx-auto w-full max-w-5xl" style={{ color: FG }}>
        <header ref={headerRef} id={id('Overview')} className="scroll-mt-24 pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: FG }}>Create Suite</h1>
          <p className="mt-6 max-w-[58ch] font-sans text-lg md:text-xl leading-relaxed" style={{ color: 'rgba(237,234,224,0.72)' }}>
            All-in-one game conception workspace designed for cinematic video and image creation. It combines
            professional virtual camera controls, character consistency tools, and multi-model workspaces into a
            single dashboard.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2" aria-hidden>
              {[0, 1, 2].map((i) => <span key={i} className="h-6 w-6 rounded-full" style={{ backgroundColor: 'rgba(237,234,224,0.45)', border: `2px solid ${BG}` }} />)}
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>Team of 3&nbsp;&nbsp;//&nbsp;&nbsp;Tactile Games&nbsp;&nbsp;//&nbsp;&nbsp;2025</p>
          </div>
          <hr className="mt-8 border-0 border-t" style={{ borderColor: FAINT }} />
        </header>

        <Statement
          lines={STATEMENT}
          trailing={
            <>
              Tactile has invested for years in building tech and tools to bridge this gap — to enable studios around
              the globe, including their own, to iterate and ship quality games. Create Suite lets game studios scout,
              plan, design, spec, prototype, launch and test games, all in one place. The suite has several tools; I led
              the product design, prototyping, and usability improvements on the main three: Create Hub, Art &amp; Code.
            </>
          }
        />
        <SuiteShelf />
        <ScrollVideoCarousel />
        <MarqueeWall onOpen={setLightbox} />
        <FeatureCarousel onOpen={setLightbox} />
        <FaqAccordion />
      </div>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
