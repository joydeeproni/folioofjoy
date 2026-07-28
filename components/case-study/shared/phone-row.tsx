'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { MediaCard, type MediaItem } from './media-card';
import { FULL_BLEED } from './tokens';

// Cards use whatever native ratio the caller's screenshots actually are —
// forcing a fixed phone ratio here would bake one project's crop into a
// component every case study shares.
const DEFAULT_ASPECT = 'aspect-[9/19.5]';
// Card width is the caller's call, because it depends entirely on how many
// screens they pass — five can be generous, a dozen has to be modest or the
// outermost cards get pushed past the viewport edge and, with overflow clipped,
// out of reach. Same knob MarqueeWall exposes.
const DEFAULT_CARD = 'w-[38vw] max-w-[190px] shrink-0 md:w-[15vw] md:max-w-[200px]';

// A lineup of phone screens that rises from below the fold as a single group —
// scaled up, settling to normal size and position as the section scrolls into
// view. Desktop is full-bleed and overflows both viewport edges, centred on its
// middle; below md it becomes a horizontal scroll strip, because many phone
// widths do not fit at 375px. Honours prefers-reduced-motion by rendering the
// settled state statically, matching Statement/Marquee elsewhere in this folder.
export function PhoneRow({
  id,
  items,
  aspect = DEFAULT_ASPECT,
  cardClass = DEFAULT_CARD,
}: {
  id?: string;
  items: MediaItem[];
  aspect?: string;
  cardClass?: string;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  // Progress 0 when the section's top reaches the bottom of the viewport (first
  // becomes reachable), progress 1 once its top has scrolled up to 40% of the
  // viewport height — i.e. the row is comfortably inside the fold, not still
  // teetering at the edge, by the time it's fully settled.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start 0.4'] });
  const y = useTransform(scrollYProgress, [0, 1], [220, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);

  const row = (
    <div className="flex w-max gap-3 px-6 md:mx-auto md:w-full md:justify-center md:gap-4">
      {items.map((item) => (
        <MediaCard
          key={item.src}
          src={item.src}
          alt={item.alt ?? ''}
          aspect={aspect}
          objectPosition="object-top"
          className={cardClass}
        />
      ))}
    </div>
  );

  return (
    <section id={id} ref={sectionRef} className="scroll-mt-24 py-12 md:py-20">
      {/* overflow-x here (not just on mobile) is load-bearing: a full-bleed row
          this wide, animated with `scale`, would otherwise push the document's
          own scrollable width past the viewport at every intermediate frame.
          `clip` rather than `hidden` on the md+ axis: per CSS Overflow, a
          non-`visible` overflow-x blockifies overflow-y (forces it to `auto`),
          so `hidden` would clip this row's own vertical entrance animation and
          open a nested vertical scroll region. `clip` is the one overflow value
          that does not blockify the other axis, so overflow-y stays `visible`. */}
      <div
        className={`${FULL_BLEED} overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-x-clip`}
      >
        {reduce ? (
          row
        ) : (
          <motion.div style={{ y, scale }} className="will-change-transform">
            {row}
          </motion.div>
        )}
      </div>
    </section>
  );
}
