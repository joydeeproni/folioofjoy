'use client';

import { useEffect, useRef, useState } from 'react';
import { ArticleToc } from '@/components/writings/article-toc';
import { slugify } from '@/lib/writings/slug';
import { FG, FAINT, MUTED } from './shared/tokens';
import { Statement } from './shared/statement';
import { Lightbox } from './shared/lightbox';
import { PhoneRow } from './shared/phone-row';
import { MarqueeWall } from './shared/marquee-wall';
import { BentoGrid, type BentoTile } from './shared/bento-grid';
import { HighlightBanner } from './shared/highlight-banner';
import { FaqAccordion } from './shared/faq-accordion';
import { CaseCredits, SEP } from './shared/case-credits';
import { JOY } from './team';

// Cassi — Apple-Books-style scroll case study. Keeps the standard chrome (back
// link and case nav come from the page; collapsed title + right rail are here).
// All copy is placeholder pending Joy's edit.

const BLOB = 'https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work';

const TOC = ['Overview', 'The app', 'In motion', 'Up close', 'FAQ'];
const id = (label: string) => slugify(label);

// PLACEHOLDER COPY — three lines, 12–18 words each, matching the reference rhythm.
const STATEMENT = [
  'Owning a home means a hundred small decisions a year, and nobody obvious to ask about any of them.',
  'Most home apps answer that with a dashboard. A dashboard is just the question, rearranged.',
  'Cassi answers by doing the thing — quietly, and usually before you thought to ask.',
];

// Five screens hand-picked by Joy, kept short so the lineup fits one centred row
// at desktop widths and each card can stay large. Native 900×2336 (0.3853) and
// shown at that ratio, so the app's bottom tab bar survives instead of being
// cropped off by a forced 9:19.5 card.
const PHONES = [
  { src: '/work/cassi/your-home-handled.webp', alt: 'Your home, handled' },
  { src: '/work/cassi/setup-home.webp', alt: 'Setting up a new home in Cassi' },
  { src: '/work/cassi/calendar.webp', alt: "Cassi's maintenance calendar" },
  { src: '/work/cassi/dishwasher.webp', alt: 'Diagnosing a dishwasher issue' },
  { src: '/work/cassi/where-is-circuit-breaker.webp', alt: 'Asking Cassi where the circuit breaker is' },
];

// Twenty-one local UI screenshots, native 1000×2168 (0.4613) — a near-exact
// match for aspect-[9/19.5] (0.4615), so they sit in MarqueeWall uncropped.
// Split across two rows, with near-duplicate families (welcome*,
// operations-overview*, financials-*) spread apart rather than adjacent, so
// neither row reads as repetitive. Captions are derived from filenames.
// PLACEHOLDER COPY — captions to be rewritten by Joy.
const SCREENS_BASE = '/work/cassi/screens';
const ROW_A = [
  { src: `${SCREENS_BASE}/splash.webp`, caption: 'The splash screen' },
  { src: `${SCREENS_BASE}/welcome.webp`, caption: 'The welcome screen' },
  { src: `${SCREENS_BASE}/home.webp`, caption: 'The home dashboard' },
  { src: `${SCREENS_BASE}/operations-overview.webp`, caption: 'The operations overview' },
  { src: `${SCREENS_BASE}/documents.webp`, caption: 'Every document, filed and searchable' },
  { src: `${SCREENS_BASE}/financials-intro.webp`, caption: 'An introduction to the financials view' },
  { src: `${SCREENS_BASE}/search-address.webp`, caption: 'Searching by address' },
  { src: `${SCREENS_BASE}/task-list.webp`, caption: 'The task list' },
  { src: `${SCREENS_BASE}/insurance-summary.webp`, caption: 'An insurance summary at a glance' },
  { src: `${SCREENS_BASE}/operations-overview-1.webp`, caption: 'Operations overview, a second pass' },
  { src: `${SCREENS_BASE}/thinking.webp`, caption: 'Cassi, thinking it over' },
];
const ROW_B = [
  { src: `${SCREENS_BASE}/welcome-1.webp`, caption: 'Welcome, screen two' },
  { src: `${SCREENS_BASE}/financials-overview.webp`, caption: 'The financials overview' },
  { src: `${SCREENS_BASE}/task-is-not-started-provider.webp`, caption: 'A task not yet started, provider view' },
  { src: `${SCREENS_BASE}/cassi-example-voice-system-03.webp`, caption: 'The voice assistant, mid-conversation' },
  { src: `${SCREENS_BASE}/welcome-2.webp`, caption: 'Welcome, screen three' },
  { src: `${SCREENS_BASE}/operations-overview-2.webp`, caption: 'Operations overview, a third pass' },
  { src: `${SCREENS_BASE}/task-list-summer-past.webp`, caption: "The task list, last summer's jobs" },
  { src: `${SCREENS_BASE}/financials-intro-1.webp`, caption: 'Financials, one step further in' },
  { src: `${SCREENS_BASE}/voice-step-02.webp`, caption: 'Voice input, step two' },
  { src: `${SCREENS_BASE}/financials-overview-1.webp`, caption: 'Financials overview, a second look' },
];

// The six non-portrait assets. All titles and blurbs are PLACEHOLDER COPY —
// ~4-word titles, ~25-word blurbs.
const BENTO: BentoTile[] = [
  {
    src: `${BLOB}/upload-progress-01.png`,
    span: 'full',
    aspect: 'aspect-[21/8]',
    title: 'The states nobody screenshots',
    blurb: 'Uploading a document in five frames: parsing, almost-there, and the one field we could not read. Skip these and the prototype feels fake.',
  },
  {
    src: `${BLOB}/cassi-maintenance-flow.mp4`,
    span: 'half',
    title: 'A season ahead',
    blurb: 'The maintenance flow hands over a seasonal checklist before the season turns, so the next right step is already waiting.',
  },
  {
    src: `${BLOB}/cassi-assistant-speaking.mp4`,
    span: 'half',
    title: 'Talking to your house',
    blurb: 'Sometimes the fastest input is your voice. Describe the problem out loud, watch it listen, get an answer back.',
  },
  // These two pair up side by side at md and stack below it. Both keep an
  // explicit 16/9 rather than the half-tile 4/3 default: the flow map is 1.84
  // natively, so 4/3 would crop its sides off, and matching the two aspects
  // keeps the row's two cards the same height.
  {
    src: `${BLOB}/onboarding-flow-01.png`,
    span: 'half',
    aspect: 'aspect-[16/9]',
    title: 'Onboarding, mapped',
    blurb: 'The whole first run drawn end to end, from the home-intelligence score through to the first insurance upload.',
  },
  {
    src: `${BLOB}/cassi-carousel.mp4`,
    span: 'half',
    aspect: 'aspect-[16/9]',
    title: 'Scored at a glance',
    blurb: 'Animated home-condition cards, each property scored so the comparison happens before anyone opens a spreadsheet.',
  },
];

// All five answers are Joy's.
const FAQ = [
  { q: 'What was your role in this?', a: 'I worked as a solo product designer (visual focus) and prototyper with the founder and 1 full stack engineer to test feasibility of the features.' },
  { q: 'What was your design stack?', a: 'Figma and Xcode (sometimes). Prototypes were made with Figma Make.' },
  {
    q: 'What were some design challenges?',
    a: (
      <>
        <p>
          Well, most of our potential users were in the US and preferred meeting in person and showing us what issues
          they had. We also were interviewing with home maintenance companies to see what people deal with. Being
          remote, it was hard for me to see those, I had to empathize and rely a lot on secondary knowledge.
        </p>
        <p>
          Also balancing the product which has the best visuals versus shipping the MVP was challenging, because the
          tech team wanted to cut down a lot of it, which led the company to rehire the engineering team a couple of
          times.
        </p>
      </>
    ),
  },
  {
    q: 'How did you measure success of this project?',
    a: 'We shipped an MVP and the founder could raise $3 million first and $10 million later with that MVP, which was the whole point of this exercise.',
  },
  {
    q: 'What were your learnings from this?',
    a: (
      <>
        <p>
          One of our biggest mistakes was that we were trying to solve too many things at once — it would have been
          smarter to just focus on 1 problem that this solves and ship it.
        </p>
        <p>
          Secondly, a lot of problems cannot be solved with tech and we have to accept it. There are regulations,
          people’s trust, ground level operational challenges that must be taken into account. Just an app cannot be a
          panacea.
        </p>
      </>
    ),
  },
];

export function Cassi() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const recompute = () => {
      frame = 0;
      const el = headerRef.current;
      if (el) setCollapsed(el.getBoundingClientRect().bottom <= 56);
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
  }, []);

  return (
    <>
      <div
        aria-hidden={!collapsed}
        className={`fixed inset-x-0 top-0 z-40 hidden justify-center px-16 pt-[calc(1.5rem+var(--sat))] pb-8 transition-opacity duration-300 ease-out md:flex ${
          collapsed ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ background: 'linear-gradient(to bottom, rgba(11,11,11,0.92), rgba(11,11,11,0))' }}
      >
        <span className="font-sans font-medium text-sm" style={{ color: FG }}>
          Cassi
        </span>
      </div>

      {/* Progressive fade at the bottom edge — mirrors the top. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[16vh] md:h-[22vh]"
        style={{ background: 'linear-gradient(to top, rgba(11,11,11,0.95), rgba(11,11,11,0))' }}
      />

      <ArticleToc sections={TOC.map((label) => ({ label, level: 1 as const }))} />

      <div className="mx-auto w-full max-w-5xl" style={{ color: FG }}>
        <header ref={headerRef} id={id('Overview')} className="scroll-mt-24 pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: FG }}>
            Cassi
          </h1>
          <CaseCredits
            people={[JOY]}
            meta={
              <>
                Team of 1{SEP}
                <a
                  href="https://cassihome.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-1 underline-offset-4 transition-colors hover:text-[#EDEAE0]"
                >
                  Cassi Home
                </a>
                {SEP}2025
              </>
            }
          />
          <hr className="mt-8 border-0 border-t" style={{ borderColor: FAINT }} />
        </header>

        <Statement
          lines={STATEMENT}
          trailing={
            <>
              A pre-revenue founder needed some concepts and prototype of his idea built out. In order for it to be
              even prototyped, the product needed to be figured out first and the idea polished. 1 year and 2
              engineering teams later, I was able to design some concepts and prototype of what the product could be
              and how it can solve the homeowner&rsquo;s problem we set out to solve.
            </>
          }
        />

        <PhoneRow id={id('The app')} items={PHONES} aspect="aspect-[900/2336]" />

        {/* PLACEHOLDER COPY — heading ~6 words, paragraph ~30 words. */}
        <section id={id('In motion')} className="scroll-mt-24 pt-16 md:pt-24">
          <h2 className="mb-4 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>
            Every screen, not just the good ones.
          </h2>
          <p className="max-w-[60ch] font-sans text-lg leading-relaxed" style={{ color: MUTED }}>
            Onboarding, uploads, the half-booked job, the fact you needed back in March. The in-between states are the
            product — everything else is a screenshot you cannot tap.
          </p>
        </section>

        <MarqueeWall
          rows={[ROW_A, ROW_B]}
          aspect="aspect-[9/19.5]"
          cardClass="w-[48vw] max-w-[220px] sm:w-[20vw] sm:max-w-[260px]"
          durationsMs={[44000, 63000]}
          onOpen={setLightbox}
          className="mt-10"
        />

        <BentoGrid
          id={id('Up close')}
          heading="A few moments, up close."
          /* PLACEHOLDER COPY */
          blurb="The parts that do not fit on a phone screen: the flows, the pitch, and the states in between."
          tiles={BENTO}
          onOpen={setLightbox}
        />

        <HighlightBanner
          src={`${BLOB}/cassi-fundraising-deck.mp4`}
          /* PLACEHOLDER COPY — title only; the blurb below is Joy's. */
          title="The deck that carried the room"
          blurb="I also designed the final pitch deck of course. There were several versions of it, with quite a lot of varied pages that were used as per VC’s needs. This was designed in Figma and then later recreated in Google Slides (yes, it was a nightmare)"
          onOpen={setLightbox}
        />

        <FaqAccordion id={id('FAQ')} heading="The questions I get asked." items={FAQ} />
      </div>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
