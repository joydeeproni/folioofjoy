'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { pickActiveSection } from './active-section';
import { VisualStage } from './visual-stage';
import { Eyebrow, H2 } from './prose';
import type { CaseStudySection } from './types';

// The reusable scroll-driven case study frame.
//
// Desktop: two columns. Prose scrolls in the left column; a sticky visual stage
// fills the right column and crossfades to the active section's visual.
// Mobile: the stage is a band pinned to the top of the viewport (opaque, above
// the prose) while the single prose column scrolls beneath it — same active
// section drives the swap.

const BG = '#0B0B0B';

export function CaseStudyLayout({
  sections,
  header,
}: {
  sections: CaseStudySection[];
  header?: ReactNode;
}) {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;
    const recompute = () => {
      frame = 0;
      const tops = sectionRefs.current
        .map((el, index) => (el ? { index, top: el.getBoundingClientRect().top } : null))
        .filter((v): v is { index: number; top: number } => v !== null);
      setActive(pickActiveSection(tops, window.innerHeight));
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

  return (
    <div className="mx-auto w-full max-w-6xl md:grid md:grid-cols-[1fr_1.05fr] md:gap-12 lg:gap-16">
      {/* Visual stage — first in the DOM so it pins to the top on mobile. */}
      <div
        className="sticky top-0 z-20 -mx-6 h-[42dvh] px-6 md:z-auto md:mx-0 md:h-dvh md:px-0 md:col-start-2 md:row-start-1"
        style={{ backgroundColor: BG }}
      >
        <div className="flex h-full w-full items-center py-4 md:py-16">
          <VisualStage visual={activeSection.visual} activeKey={activeSection.id} />
        </div>
      </div>

      {/* Prose column. */}
      <div className="md:col-start-1 md:row-start-1">
        {header}
        {sections.map((section, i) => (
          <section
            key={section.id}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            className="border-t border-white/10 py-12 first:border-t-0 md:min-h-[72vh] md:py-16"
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
  );
}
