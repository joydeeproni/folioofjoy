'use client';

import { Reveal } from '@/components/reveal';
import { Media } from './media-card';
import { FG, MUTED, FULL_BLEED } from './tokens';

// A full-bleed media banner for a case study's single headline deliverable —
// bigger and less framed than a bento tile, so it reads as the main thing.
// The media runs edge to edge; the text stays in the caller's normal content
// column so it lines up with the rest of the page's prose. No project-specific
// paths baked in — everything comes through props, reusable across case studies.
export function HighlightBanner({
  id,
  src,
  eyebrow,
  title,
  blurb,
  onOpen,
}: {
  id?: string;
  src: string;
  eyebrow?: string;
  title: string;
  blurb: string;
  /** If passed, clicking the media opens it in the shared lightbox. */
  onOpen?: (src: string) => void;
}) {
  // 16:9 keeps the banner feeling big without cropping a 4:3 source too hard —
  // ~25% of the source height is lost (split top/bottom), the same tolerance
  // already accepted elsewhere on this page for a 4:3 clip in a 16:9 frame.
  const mediaClass = 'aspect-[16/9] w-full object-cover';

  return (
    <section id={id} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <div className={FULL_BLEED}>
          {onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(src)}
              className="group block w-full cursor-zoom-in overflow-hidden"
            >
              <Media src={src} className={`${mediaClass} transition-transform duration-300 group-hover:scale-[1.01]`} />
            </button>
          ) : (
            <Media src={src} className={mediaClass} />
          )}
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-8 md:mt-10">
          {eyebrow && (
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
              {eyebrow}
            </p>
          )}
          <h2 className="mb-4 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>
            {title}
          </h2>
          <p className="max-w-[60ch] font-sans text-lg leading-relaxed" style={{ color: MUTED }}>
            {blurb}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
