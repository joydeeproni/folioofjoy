'use client';

import { Reveal } from '@/components/reveal';
import { MediaCard, type MediaItem } from './media-card';
import { FULL_BLEED } from './tokens';

// Every screen is forced to the same 9:19.5 card so the row reads as a lineup of
// phones. Only two of Cassi's assets are natively that ratio; object-cover takes
// the difference off the top and bottom of the rest.
const PHONE = 'aspect-[9/19.5]';

// A lineup of uniform phone screens. Static — the videos inside already move.
// Desktop centres the whole row; below md it becomes a scroll strip, because five
// phone widths do not fit at 375px.
export function PhoneRow({ id, items }: { id?: string; items: MediaItem[] }) {
  return (
    <section id={id} className="scroll-mt-24 py-12 md:py-20">
      <Reveal>
        <div
          className={`${FULL_BLEED} overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-x-visible`}
        >
          <div className="flex w-max gap-3 px-6 md:mx-auto md:w-full md:justify-center md:gap-4 md:px-16">
            {items.map((item) => (
              <MediaCard
                key={item.src}
                src={item.src}
                alt={item.alt ?? ''}
                aspect={PHONE}
                objectPosition="object-top"
                className="w-[38vw] max-w-[190px] shrink-0 md:w-[15vw] md:max-w-[170px]"
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
