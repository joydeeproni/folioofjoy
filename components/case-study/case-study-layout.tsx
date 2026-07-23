'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { pickActiveSection } from './active-section';
import { VisualStage } from './visual-stage';
import { Eyebrow, H2 } from './prose';
import { ArticleToc, type TocSection } from '@/components/writings/article-toc';
import { slugify } from '@/lib/writings/slug';
import type { CaseStudySection } from './types';

// The right-rail index (shared with the writings articles) finds sections by
// slugify(label), so the label a section shows in the rail and its DOM id are
// derived from the same string.
const navLabel = (s: CaseStudySection) => s.heading ?? s.eyebrow ?? s.act ?? s.id;

// The reusable scroll-driven case study frame.
//
// Desktop: two columns. Prose scrolls in the left column; a sticky visual stage
// fills the right column and crossfades to the active section's visual.
// Mobile: the stage is a band pinned to the top of the viewport (opaque, above
// the prose) while the single prose column scrolls beneath it — same active
// section drives the swap.

const BG = '#0B0B0B';
const FG = '#EDEAE0';

export function CaseStudyLayout({
  sections,
  header,
  footer,
  title,
}: {
  sections: CaseStudySection[];
  header?: ReactNode;
  footer?: ReactNode;
  title?: string;
}) {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let frame = 0;
    const recompute = () => {
      frame = 0;
      const tops = sectionRefs.current
        .map((el, index) => (el ? { index, top: el.getBoundingClientRect().top } : null))
        .filter((v): v is { index: number; top: number } => v !== null);
      setActive(pickActiveSection(tops, window.innerHeight));
      // Collapse the header into the top bar once it has scrolled up near it.
      const headerEl = headerRef.current;
      if (headerEl) setCollapsed(headerEl.getBoundingClientRect().bottom <= 56);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(recompute);
    };
    recompute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sections.length]);

  const activeSection = sections[active] ?? sections[0];
  const tocSections: TocSection[] = sections.map((s) => ({ label: navLabel(s), level: 1 }));

  return (
    <>
    {/* Collapsed header → the title floats at the top, baseline-aligned with the
        BackLink (z-50), no divider — a soft gradient keeps it legible over content. */}
    {title && (
      <div
        aria-hidden={!collapsed}
        className={`fixed inset-x-0 top-0 z-40 hidden justify-center px-16 pt-[calc(1.5rem+var(--sat))] pb-8 transition-opacity duration-300 ease-out md:flex ${
          collapsed ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ background: 'linear-gradient(to bottom, rgba(11,11,11,0.92), rgba(11,11,11,0))' }}
      >
        <span className="font-sans font-medium text-sm" style={{ color: FG }}>
          {title}
        </span>
      </div>
    )}

    {/* Right-rail section index — the same component the writings articles use. */}
    <ArticleToc sections={tocSections} />
    <div className="mx-auto w-full max-w-6xl md:grid md:grid-cols-[1fr_1.05fr] md:gap-12 lg:gap-16">
      {/* Visual stage — first in the DOM so it pins to the top on mobile. On wide
          screens it breaks out of the centered grid to the right edge (small
          margin) for more preview real estate, while the article column stays put. */}
      <div
        className="sticky top-0 z-20 -mx-6 h-[42dvh] px-6 md:z-auto md:mx-0 md:h-dvh md:px-0 md:col-start-2 md:row-start-1 xl:w-[calc(50vw-60px)] xl:max-w-none xl:justify-self-start"
        style={{ backgroundColor: BG }}
      >
        <div className="flex h-full w-full flex-col justify-center py-4 md:py-16">
          <div className="min-h-0 flex-1">
            <VisualStage visual={activeSection.visual} activeKey={activeSection.id} />
          </div>
          {activeSection.caption && (
            <p
              key={activeSection.id}
              className="mt-3 hidden shrink-0 text-center font-mono uppercase tracking-widest text-[11px] md:block"
              style={{ color: 'rgba(237,234,224,0.4)' }}
            >
              {activeSection.caption}
            </p>
          )}
        </div>
      </div>

      {/* Prose column. */}
      <div className="md:col-start-1 md:row-start-1">
        <div ref={headerRef}>{header}</div>
        {sections.map((section, i) => (
          <section
            key={section.id}
            id={slugify(navLabel(section))}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            className={`flex scroll-mt-24 flex-col py-12 md:min-h-[86vh] md:py-16 ${
              i === 0 ? 'md:justify-start' : 'md:justify-center'
            }`}
          >
            {section.act && (
              <p className="mb-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>
                {section.act}
              </p>
            )}
            {section.eyebrow && <Eyebrow>{section.eyebrow}</Eyebrow>}
            {section.heading && <H2>{section.heading}</H2>}
            <div>{section.body}</div>
          </section>
        ))}
      </div>
    </div>
    {footer && <div className="mx-auto w-full max-w-6xl">{footer}</div>}
    </>
  );
}
