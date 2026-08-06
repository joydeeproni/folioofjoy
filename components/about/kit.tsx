import { ScrollFade } from '@/components/scroll-fade';
import type { KitItem } from '@/lib/content/types';

const MUTED = 'rgba(237,234,224,0.5)';

// The desk. A card per object: square art slot on top, name + aside under it.
// The transparent sprites float directly on the page; the aspect-ratio wrapper
// only keeps their labels aligned across the grid.
export function Kit({ lede, items }: { lede?: string; items: KitItem[] }) {
  return (
    <section className="mt-16 md:mt-24">
      {/* Heading aligns with the grid's left edge, not the narrower essay column. */}
      <ScrollFade>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em]">Kit</h2>
        {lede && (
          <p className="mt-4 max-w-2xl font-sans text-lg md:text-xl leading-relaxed">{lede}</p>
        )}
      </ScrollFade>

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-4 md:gap-x-6 md:gap-y-12">
        {items.map((item, i) => (
          <ScrollFade key={item.name}>
            <figure className="group">
              <div className="relative aspect-square">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="kit-pixel-object h-full w-full object-contain [image-rendering:pixelated]"
                    style={{ animationDelay: `${i * -0.37}s` }}
                  />
                )}
              </div>
              <figcaption className="mt-3">
                <span className="block font-sans text-base md:text-lg leading-snug">
                  {item.name}
                </span>
                <span
                  className="mt-1 block font-sans text-sm md:text-base leading-snug text-pretty"
                  style={{ color: MUTED }}
                >
                  {item.note}
                </span>
              </figcaption>
            </figure>
          </ScrollFade>
        ))}
      </div>
    </section>
  );
}
