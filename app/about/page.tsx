import { BackLink } from '@/components/back-link';
import { Reveal } from '@/components/reveal';
import { Prose } from '@/components/prose';
import { getAbout, getInspiration, type InspirationItem } from '@/lib/sanity/queries';

// Rebuild at most once a minute; a Sanity webhook can revalidate instantly later.
export const revalidate = 60;

// Dark, to match the rest of the site (mirrors the Writings page palette).
const BG = '#0B0B0B';
const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.5)';
const RULE = 'rgba(237,234,224,0.14)';

// Fixed display order for the inspiration rail.
const CATEGORY_ORDER = ['Creatives', 'Companies', 'Artists', 'Style'];

function Name({ name, url }: InspirationItem) {
  if (!url) return <span>{name}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
    >
      {name}
    </a>
  );
}

export default async function About() {
  const [about, items] = await Promise.all([getAbout(), getInspiration()]);
  const inspiration = items ?? [];
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: inspiration.filter((i) => i.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <main
      className="relative min-h-dvh w-full px-6 md:px-16 pt-10 pb-[calc(2.5rem+var(--sab))]"
      style={{ backgroundColor: BG, color: FG }}
    >
      <BackLink />

      <div className="mx-auto max-w-5xl pt-24 md:pt-32">
        {/* Lede */}
        <Reveal>
          <header className="mx-auto max-w-2xl">
            <h1 className="font-pixel text-4xl md:text-6xl leading-[1.05] text-balance">
              {about?.lede}
            </h1>
            {about?.subLede && (
              <p className="mt-4 font-sans text-xl md:text-2xl text-balance" style={{ color: MUTED }}>
                {about.subLede}
              </p>
            )}
          </header>
        </Reveal>

        {/* Essay — before the quote */}
        <div className="mt-14 mx-auto max-w-2xl space-y-6 font-sans text-lg md:text-xl leading-relaxed text-pretty">
          <Prose value={about?.intro} />
        </div>

        {/* Tagore quote */}
        {about?.quote && (
          <Reveal>
            <figure className="my-16 mx-auto max-w-2xl">
              <blockquote className="font-sans text-2xl md:text-3xl leading-snug tracking-tight text-balance">
                &ldquo;{about.quote}&rdquo;
              </blockquote>
              {about.quoteAttribution && (
                <figcaption
                  className="mt-4 font-mono text-xs uppercase tracking-[0.25em]"
                  style={{ color: MUTED }}
                >
                  {about.quoteAttribution}
                </figcaption>
              )}
            </figure>
          </Reveal>
        )}

        {/* Essay — after the quote */}
        <div className="mx-auto max-w-2xl space-y-6 font-sans text-lg md:text-xl leading-relaxed text-pretty">
          <Prose value={about?.outro} />
        </div>

        {/* Inspiration table */}
        <section className="mt-16 md:mt-24">
          {groups.map((group) => (
            <Reveal key={group.category}>
              <div
                className="flex flex-col md:flex-row md:items-baseline md:gap-10 border-t"
                style={{ borderColor: RULE }}
              >
                <h2
                  className="pt-5 md:pt-4 md:w-28 md:shrink-0 font-mono text-[11px] uppercase tracking-[0.25em]"
                  style={{ color: MUTED }}
                >
                  {group.category}
                </h2>
                <div className="flex-1">
                  {group.items.map((item, i) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-1 md:grid-cols-[minmax(0,15rem)_1fr] gap-x-10 gap-y-1 py-3 md:py-4"
                      style={i > 0 ? { borderTop: `1px solid ${RULE}` } : undefined}
                    >
                      <div className="font-sans text-lg md:text-xl">
                        <Name {...item} />
                      </div>
                      <p
                        className="font-sans text-base md:text-lg text-balance"
                        style={{ color: MUTED }}
                      >
                        {item.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        <div className="h-24" />
      </div>
    </main>
  );
}
