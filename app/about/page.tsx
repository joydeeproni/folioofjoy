import { BackLink } from '@/components/back-link';
import { Reveal } from '@/components/reveal';

const INSTAGRAM = 'https://www.instagram.com/joyingntravelling/';

// Dark, to match the rest of the site (mirrors the Writings page palette).
const BG = '#0B0B0B';
const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.5)';
const RULE = 'rgba(237,234,224,0.14)';

interface Inspiration {
  name: string;
  note: string;
  url?: string;
}

interface InspirationGroup {
  category: string;
  items: Inspiration[];
}

// Inline for now — this migrates to the content system we're settling on.
const INSPIRATION: InspirationGroup[] = [
  {
    category: 'Creatives',
    items: [
      { name: 'Edvard R. Tufte', note: 'Nobody can design complex data viz than him' },
      { name: 'Harish S', note: 'He turns everything into gold, whether it’s CRED or Agam' },
      { name: 'Mick Champayne', note: 'Illustrator, mentor and a friend only lucky ones can have' },
      { name: 'Philip Linnemann', note: 'Someone whose portfolio is all over public places in Denmark' },
      { name: 'Matt D. Smith', note: 'His videos turned me into a designer' },
      { name: 'Gawx', note: 'You don’t need time, space & equipment to create' },
    ],
  },
  {
    category: 'Companies',
    items: [
      { name: 'March Tee', note: 'Small non-luxury boutique t-shirt company, who aren’t sellouts' },
      { name: 'Pigeon & Co', note: 'They know how to have fun in their work' },
      { name: 'Xiaomi', note: 'Very underrated tech company, often judged and overlooked' },
      { name: 'reMarkable', note: 'How to be successful with just one product' },
      { name: 'On Running', note: 'How to be successful with one ugly shoe' },
      { name: 'Teenage Engineering', note: 'Apple of musical instruments' },
      { name: 'LEGO', note: 'Every child should grow up with' },
    ],
  },
  {
    category: 'Artists',
    items: [
      { name: 'Arijit Singh', note: 'How to stay grounded while being a god' },
      { name: 'Jeremy Hindle', note: 'Production designer of Severance' },
      { name: 'Indian Ocean', note: 'The sound of India' },
      { name: 'Tanmay Bhat', note: 'Only successful person whose story I saw from start to finish' },
      { name: 'Edvard Munch', note: 'Favourite painter of all time' },
      { name: 'Marius Bauer', note: 'The style of painting I like' },
      { name: 'Satyajit Ray', note: 'Non-designer who was a great designer' },
    ],
  },
  {
    category: 'Style',
    items: [
      { name: 'Wes Anderson', note: 'The whole vibe' },
      { name: 'The War Kitchen', note: 'Instagram page all about retro vintage' },
      { name: 'Cyberpunk 2077', note: 'Game that reimagined what the future could be like' },
      { name: 'Flower Mountain', note: 'How to make colourful shoes look nice' },
      { name: 'RAINS', note: 'Rainproof apparel made cool again' },
    ],
  },
];

function Name({ name, url }: Inspiration) {
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

export default function About() {
  return (
    <main
      className="relative min-h-screen w-full px-6 md:px-16 py-10"
      style={{ backgroundColor: BG, color: FG }}
    >
      <BackLink />

      <div className="mx-auto max-w-5xl pt-24 md:pt-32">
        {/* Lede */}
        <Reveal>
          <header className="mx-auto max-w-2xl">
            <h1 className="font-pixel text-4xl md:text-6xl leading-[1.05] text-balance">
              Hello, I&rsquo;m Joy.
            </h1>
            <p className="mt-4 font-sans text-xl md:text-2xl text-balance" style={{ color: MUTED }}>
              First of all, thanks for stopping by.
            </p>
          </header>
        </Reveal>

        {/* Essay */}
        <div className="mt-14 mx-auto max-w-2xl space-y-6 font-sans text-lg md:text-xl leading-relaxed text-pretty">
          <Reveal>
            <p>
              This website changes every other month, so I&rsquo;m not sure which version you&rsquo;re
              seeing &mdash; or if you&rsquo;re one of the unlucky ones to catch an avant-garde version
              of it.
            </p>
          </Reveal>
          <Reveal>
            <p>
              I am a designer. Just a designer. Product, UI, UX, digital interface, interaction, visual;
              senior, junior, staff, principal &mdash; I&rsquo;m not sure which one fully applies, because
              design is beyond a rank or a job.
            </p>
          </Reveal>
          <Reveal>
            <p>
              It&rsquo;s a state of mind. It&rsquo;s a process of communicating solutions and showing
              people how things can be done to achieve their goals. I was a designer as a kid, trying to
              organize my dad&rsquo;s old computer desktop so it&rsquo;d be easy for him to find things,
              or my mom&rsquo;s spice rack so it&rsquo;d be accessible to her. I just didn&rsquo;t know
              what it was called, but the idea was the same. I watched them use it, fixed it, and then
              iterated.
            </p>
          </Reveal>
          <Reveal>
            <p>
              Today I do the same, except now with more elaborate Figma files and Claude Code prototypes
              to explain how something can be made easy and simple to use. And I&rsquo;d still be a
              designer even if the job &ldquo;UX designer&rdquo; didn&rsquo;t exist tomorrow.
            </p>
          </Reveal>
        </div>

        {/* Tagore quote */}
        <Reveal>
          <figure className="my-16 mx-auto max-w-2xl">
            <blockquote className="font-sans text-2xl md:text-3xl leading-snug tracking-tight text-balance">
              &ldquo;I slept and dreamt that life was joy. I awoke and saw that life was service. I acted
              and behold, service was joy.&rdquo;
            </blockquote>
            <figcaption
              className="mt-4 font-mono text-xs uppercase tracking-[0.25em]"
              style={{ color: MUTED }}
            >
              Rabindranath Tagore
            </figcaption>
          </figure>
        </Reveal>

        <div className="mx-auto max-w-2xl space-y-6 font-sans text-lg md:text-xl leading-relaxed text-pretty">
          <Reveal>
            <p>That&rsquo;s how I think of design &mdash; a service, and that service brings me joy.</p>
          </Reveal>
          <Reveal>
            <p>
              I can be annoying sometimes at dinner parties, when I&rsquo;m trying to tell people why
              their app feels off, why their landing page doesn&rsquo;t convert, and why their AI app
              looks like a GPT wrapper.
            </p>
          </Reveal>
          <Reveal>
            <p>
              But this isn&rsquo;t all I&rsquo;m about. I produce amateur Bollywood mixes with my
              keyboards and spend a lot of time tinkering with my PO-33.
            </p>
          </Reveal>
          <Reveal>
            <p>
              I also take photos that make me feel calm and mellow &mdash; 35mm street photography with
              my XT1 (iykyk). You can see them{' '}
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
              >
                here
              </a>
              .
            </p>
          </Reveal>
          <Reveal>
            <p>
              I&rsquo;m also a HUGE typography nerd, and I want to learn how to make my own fonts &mdash;
              something I&rsquo;m slowly learning to do.
            </p>
          </Reveal>
          <Reveal>
            <p>
              The world is full of optimizations, and people trying to optimize everything: money,
              careers, goals, dreams, numbers out of it all. I think we&rsquo;ve forgotten to have fun
              with what we do or what we create. That&rsquo;s what I aspire to do &mdash; create
              something fun that provides joy, not because I need to objectively hit some number.
            </p>
          </Reveal>
          <Reveal>
            <p>
              I&rsquo;ve been a designer for almost a decade. It&rsquo;s usually hard for me to focus on
              one thing &mdash; not because I have a short attention span, but because I have too many
              interests. I don&rsquo;t go to restaurants with badly designed menus, I&rsquo;m obsessed
              with metro maps and public signage, I love typography, and I&rsquo;m probably one of the
              few designers who doesn&rsquo;t use an iPhone.
            </p>
          </Reveal>
          <Reveal>
            <p>These are the things and people who inspire me to create, every day.</p>
          </Reveal>
        </div>

        {/* Inspiration table */}
        <section className="mt-16 md:mt-24">
          {INSPIRATION.map((group) => (
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
