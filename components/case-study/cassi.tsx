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
import { FaqAccordion } from './shared/faq-accordion';

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

// Twelve local UI screenshots, native 900×2336 (0.3853) — kept at their own
// ratio in PhoneRow so the app's bottom tab bar survives instead of getting
// cropped off by a forced 9:19.5 card.
const PHONES = [
  { src: '/work/cassi/home.webp', alt: "Cassi's home dashboard" },
  { src: '/work/cassi/all-properties.webp', alt: 'Every property in one list' },
  { src: '/work/cassi/setup-home.webp', alt: 'Setting up a new home in Cassi' },
  { src: '/work/cassi/calendar.webp', alt: "Cassi's maintenance calendar" },
  { src: '/work/cassi/seasonal-plan.webp', alt: 'A seasonal home maintenance plan' },
  { src: '/work/cassi/hvac-service.webp', alt: 'Scheduling HVAC service' },
  { src: '/work/cassi/hvac-service-1.webp', alt: 'Confirming an HVAC service appointment' },
  { src: '/work/cassi/dishwasher.webp', alt: 'Diagnosing a dishwasher issue' },
  { src: '/work/cassi/where-is-circuit-breaker.webp', alt: 'Asking Cassi where the circuit breaker is' },
  { src: '/work/cassi/vendor-coordination.webp', alt: 'Coordinating with a vendor on a repair' },
  { src: '/work/cassi/handoff-overview.webp', alt: 'A handoff overview for a new homeowner' },
  { src: '/work/cassi/your-home-handled.webp', alt: 'Your home, handled' },
];

// All seven portrait-ish assets. Captions are the ones already written in
// lib/work/local.ts, trimmed of the leading "Cassi — ".
const CAROUSEL = [
  { src: `${BLOB}/cassi-onboarding-splash.mp4`, caption: 'Onboarding splash screens that feel like a deep breath, not a signup.' },
  { src: `${BLOB}/property-listing-02.png`, caption: "A home's full profile from just an address: value, flood-zone risk, the works." },
  { src: `${BLOB}/cassi-bathroom-maintenance-video.mp4`, caption: 'Booking bathroom maintenance by just walking it through on video.' },
  { src: `${BLOB}/fact-card-01.png`, caption: 'Did-you-know cards that surface a home fact before you thought to ask.' },
  { src: `${BLOB}/cassi-home-dashboard-concept.mp4`, caption: 'A home dashboard concept: everything about the house in one calm view.' },
  { src: `${BLOB}/mortgage-upload-01.png`, caption: 'A mortgage assistant that reads your terms and says, plainly, whether to refinance.' },
  { src: `${BLOB}/cassi-error-reporting.mp4`, caption: 'Reporting a problem and watching it get fixed, no ticket number required.' },
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
  {
    src: `${BLOB}/onboarding-flow-01.png`,
    span: 'full',
    aspect: 'aspect-[16/9]',
    title: 'Onboarding, mapped',
    blurb: 'The whole first run drawn end to end, from the home-intelligence score through to the first insurance upload.',
  },
  {
    src: `${BLOB}/cassi-carousel.mp4`,
    span: 'half',
    title: 'Scored at a glance',
    blurb: 'Animated home-condition cards, each property scored so the comparison happens before anyone opens a spreadsheet.',
  },
  {
    src: `${BLOB}/cassi-fundraising-deck.mp4`,
    span: 'half',
    title: 'The pitch itself',
    blurb: 'The fundraising deck that carried the prototype into the room and helped land the first round of funding.',
  },
];

// PLACEHOLDER COPY — questions mirror the Tactile Create set; answers are Joy's to write.
const FAQ = [
  { q: 'What was your role in this?', a: 'Solo designer for six months, working with one engineer. I owned the maintenance flow end to end and designed every state around it.' },
  { q: 'What was your design stack?', a: 'Figma for design, and a clickable prototype real enough that investors could hold it rather than watch a walkthrough.' },
  { q: 'What were some design challenges?', a: 'Placeholder — the honest answer is about drawing the in-between states nobody screenshots, and keeping the assistant out of the way.' },
  { q: 'How did you measure success of this project?', a: 'Placeholder — the prototype raised a $3M seed and the company went on to a $10M Series A.' },
  { q: 'What were your learnings from this?', a: 'Placeholder — a prototype earns trust in its edges, not its hero screens.' },
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
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
            Freelance&nbsp;&nbsp;//&nbsp;&nbsp;iOS + Web&nbsp;&nbsp;//&nbsp;&nbsp;6 months&nbsp;&nbsp;//&nbsp;&nbsp;Solo designer
          </p>
          <hr className="mt-8 border-0 border-t" style={{ borderColor: FAINT }} />
        </header>

        <Statement
          lines={STATEMENT}
          trailing={
            /* PLACEHOLDER COPY — ~45 words, matching the reference body paragraph. */
            <>
              A pre-revenue founder needed a prototype real enough to raise on, not a deck of pretty frames. I was
              the solo designer alongside one engineer for six months, and the bar never moved: every state a real
              homeowner would hit had to already exist.
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
          rows={[CAROUSEL]}
          aspect="aspect-[9/19.5]"
          cardClass="w-[42vw] max-w-[200px] sm:w-[15vw] sm:max-w-[180px]"
          durationsMs={[52000]}
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

        <FaqAccordion id={id('FAQ')} heading="The questions I get asked." items={FAQ} />
      </div>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
