'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArticleToc } from '@/components/writings/article-toc';
import { slugify } from '@/lib/writings/slug';
import { FG, FAINT } from './tokens';
import { Lightbox } from './lightbox';
import { CaseCredits, type CreditPerson } from './case-credits';

// The chrome every Apple-style case study shares (Cassi, Tactile Create and the
// kit pages): collapsed title bar once the header scrolls away, bottom-edge
// fade, right-rail index, the h1 + deck + credits header, and one lightbox.
// Children get `open(src)` for the lightbox as a render prop.

export const sectionId = (label: string) => slugify(label);

export function CaseShell({
  title,
  barTitle,
  lede,
  people,
  meta,
  toc,
  children,
}: {
  title: string;
  /** Text in the collapsed top bar. Defaults to `title`. */
  barTitle?: string;
  lede?: ReactNode;
  people: CreditPerson[];
  meta: ReactNode;
  /** Right-rail labels. The first one is the header; the rest must match the
   *  `id`s passed to sections via `sectionId(label)`. */
  toc: string[];
  children: (open: (src: string) => void) => ReactNode;
}) {
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
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(recompute);
    };
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
        className={`fixed inset-x-0 top-0 z-40 hidden justify-center px-16 pt-[calc(1.5rem+var(--sat))] pb-8 transition-opacity duration-300 ease-out md:flex ${
          collapsed ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ background: 'linear-gradient(to bottom, rgba(11,11,11,0.92), rgba(11,11,11,0))' }}
      >
        <span className="font-sans font-medium text-sm" style={{ color: FG }}>
          {barTitle ?? title}
        </span>
      </div>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[16vh] md:h-[22vh]"
        style={{ background: 'linear-gradient(to top, rgba(11,11,11,0.95), rgba(11,11,11,0))' }}
      />

      <ArticleToc sections={toc.map((label) => ({ label, level: 1 as const }))} />

      <div className="mx-auto w-full max-w-5xl" style={{ color: FG }}>
        <header ref={headerRef} id={sectionId(toc[0])} className="scroll-mt-24 pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: FG }}>
            {title}
          </h1>
          {lede && (
            <p className="mt-6 max-w-[58ch] font-sans text-lg md:text-xl leading-relaxed" style={{ color: 'rgba(237,234,224,0.72)' }}>
              {lede}
            </p>
          )}
          <CaseCredits people={people} meta={meta} />
          <hr className="mt-8 border-0 border-t" style={{ borderColor: FAINT }} />
        </header>

        {children(setLightbox)}
      </div>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

// Section heading + intro, in the same type as Cassi's "In motion" beat.
export function SectionIntro({
  eyebrow,
  heading,
  children,
  className = '',
}: {
  eyebrow?: string;
  heading: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: 'rgba(237,234,224,0.55)' }}>
          {eyebrow}
        </p>
      )}
      <h2 className="mb-4 font-sans font-medium text-2xl md:text-3xl tracking-tight text-balance" style={{ color: FG }}>
        {heading}
      </h2>
      {children && (
        <div className="max-w-[60ch] font-sans text-lg leading-relaxed" style={{ color: 'rgba(237,234,224,0.55)' }}>
          {children}
        </div>
      )}
    </div>
  );
}
