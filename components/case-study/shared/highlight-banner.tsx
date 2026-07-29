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
  aspect = 'aspect-[16/9]',
  objectPosition = 'object-center',
}: {
  id?: string;
  src: string;
  eyebrow?: string;
  title: string;
  blurb: string;
  /** If passed, clicking the media opens it in the shared lightbox. */
  onOpen?: (src: string) => void;
  /** Tailwind aspect-ratio class for the media frame. Defaults to 16:9 — the
   *  source video here is native 4:3, so ~25% of its height is lost (split
   *  top/bottom), the same tolerance already accepted elsewhere on this page
   *  for a 4:3 clip in a 16:9 frame. */
  aspect?: string;
  /** Which point of the media survives the crop. Defaults to centre, matching
   *  current behaviour. */
  objectPosition?: string;
}) {
  const mediaClass = `${aspect} w-full object-cover ${objectPosition}`;

  return (
    <section id={id} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <div className={FULL_BLEED}>
          {onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(src)}
              aria-label={`Open ${title}`}
              className="group block w-full cursor-zoom-in overflow-hidden"
            >
              <Media
                src={src}
                alt={title}
                className={`${mediaClass} transition-transform duration-300 group-hover:scale-[1.01]`}
              />
            </button>
          ) : (
            <Media src={src} alt={title} className={mediaClass} />
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
