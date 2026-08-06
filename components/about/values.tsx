import { ScrollFade } from '@/components/scroll-fade';
import type { AboutValue } from '@/lib/content/types';

const MUTED = 'rgba(237,234,224,0.5)';
const RULE = 'rgba(237,234,224,0.14)';

// The four values as a 2×2 grid, each keyed by one of the brand colours
// (lib/brand.ts). Stacks to a single column on mobile.
export function Values({ values }: { values: AboutValue[] }) {
  return (
    <section className="mt-16 md:mt-24">
      <ScrollFade>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] pb-5">Values</h2>
      </ScrollFade>

      <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2 md:gap-x-12">
        {values.map((value) => (
          <ScrollFade key={value.title}>
            <div className="flex gap-5 border-t py-6 md:py-8" style={{ borderColor: RULE }}>
              <span
                aria-hidden
                className="mt-1.5 size-4 shrink-0 md:size-5"
                style={{ backgroundColor: value.color }}
              />
              <div>
                <h3 className="font-sans text-lg md:text-xl">{value.title}</h3>
                <p
                  className="mt-2 font-sans text-base md:text-lg leading-relaxed text-pretty"
                  style={{ color: MUTED }}
                >
                  {value.body}
                </p>
              </div>
            </div>
          </ScrollFade>
        ))}
      </div>
    </section>
  );
}
