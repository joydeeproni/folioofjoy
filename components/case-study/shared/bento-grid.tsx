'use client';

import { Reveal } from '@/components/reveal';
import { Media } from './media-card';
import { FG, MUTED } from './tokens';

export type BentoTile = {
  src: string;
  span: 'full' | 'half';
  title: string;
  blurb: string;
  /** Tailwind aspect class. Defaults by span; override for very wide media. */
  aspect?: string;
};

// A grid of media tiles, each captioned with a title and a blurb. `full` tiles
// span both columns. Reusable across case studies — no asset paths baked in.
export function BentoGrid({
  id,
  heading,
  blurb,
  tiles,
  onOpen,
  objectPosition = 'object-top',
}: {
  id?: string;
  heading: string;
  blurb?: string;
  tiles: BentoTile[];
  onOpen: (src: string) => void;
  /** Which edge survives the crop. Defaults to the top, matching current behaviour. */
  objectPosition?: string;
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
      <Reveal className="grid gap-4 md:grid-cols-2">
        {tiles.map((t) => (
          <div
            key={t.src}
            className={`overflow-hidden rounded-2xl ${t.span === 'full' ? 'md:col-span-2' : ''}`}
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            <button
              type="button"
              onClick={() => onOpen(t.src)}
              aria-label={`Open ${t.title}`}
              className="group block w-full cursor-zoom-in overflow-hidden"
            >
              <Media
                src={t.src}
                alt={t.title}
                className={`w-full ${t.aspect ?? (t.span === 'full' ? 'aspect-[16/9]' : 'aspect-[4/3]')} object-cover ${objectPosition} transition-transform duration-300 group-hover:scale-[1.02]`}
              />
            </button>
            <div className="px-5 pb-6 pt-5 md:px-6">
              <h3 className="font-sans font-medium text-lg" style={{ color: FG }}>
                {t.title}
              </h3>
              <p className="mt-2 font-sans text-[15px] leading-relaxed" style={{ color: MUTED }}>
                {t.blurb}
              </p>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
