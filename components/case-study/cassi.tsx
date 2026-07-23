'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CaseStudyLayout } from './case-study-layout';
import { P, Pull, List } from './prose';
import { MetricsPanel } from './controls/metrics-panel';
import type { CaseStudySection } from './types';

// Media lives on the same Vercel Blob store the rest of the site uses.
const BLOB = 'https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work';

const SECTIONS: CaseStudySection[] = [
  {
    id: 'intro',
    body: (
      <>
        <P lead>
          Cassi is an AI assistant for homeowners. Not a chatbot bolted to a dashboard — an
          assistant that lives quietly across the whole product and actually does the thing,
          instead of telling you how to do the thing.
        </P>
        <P>
          Find a leak under the sink and Cassi figures out what it is, tells you how bad it is,
          and books a contractor it already knows you&rsquo;d pick. A pre-revenue founder needed a
          prototype real enough to raise on. I was the solo designer, working with one engineer.
        </P>
        <Pull>The prototype raised a $3M seed. The company went on to a $10M Series A.</Pull>
      </>
    ),
    visual: { kind: 'video', src: `${BLOB}/cassi-onboarding-splash.mp4`, alt: 'Cassi onboarding splash screens' },
    caption: 'Onboarding — first run',
  },
  {
    id: 'brief',
    act: 'Process',
    eyebrow: 'The brief',
    heading: 'It had to feel shipped, not sketched',
    body: (
      <>
        <P>
          The founder wasn&rsquo;t raising on a deck of pretty frames. Investors were going to hold
          the thing. So &ldquo;realistic&rdquo; wasn&rsquo;t a nice-to-have — it was the entire point. The
          prototype had to behave like a product that already existed.
        </P>
        <P>
          That set the bar for every decision: no lorem ipsum, no dead ends, no screen that
          only works if you tap it in exactly the right order. If a real homeowner would hit a
          state, we designed that state.
        </P>
      </>
    ),
    visual: { kind: 'image', src: `${BLOB}/onboarding-flow-01.png`, alt: "Cassi's onboarding flow mapped end to end" },
    caption: 'Onboarding flow, mapped',
  },
  {
    id: 'philosophy',
    act: 'Process',
    eyebrow: 'The idea',
    heading: 'Invisible intelligence',
    body: (
      <>
        <P>
          The whole product ran on one belief: the smartest thing an assistant can do is get out
          of the way. Omnipresent, but never in your face. It should feel less like software and
          more like a reliable person who happens to know your house better than you do.
        </P>
        <List
          items={[
            'Embedded everywhere, never in the way.',
            'A memory that actually matters — it remembers your house, not just your last message.',
            'Structured peace of mind: fewer decisions on your plate, not more notifications.',
          ]}
        />
      </>
    ),
    visual: { kind: 'video', src: `${BLOB}/cassi-home-dashboard-concept.mp4`, alt: 'Cassi home dashboard concept' },
    caption: 'Home dashboard concept',
  },
  {
    id: 'maintenance',
    act: 'Process',
    eyebrow: 'The part I owned',
    heading: 'The maintenance flow',
    body: (
      <>
        <P>
          My piece of the MVP was maintenance — the least glamorous, most anxiety-shaped corner
          of owning a home. The goal was low cognitive load and high actionability: hand people
          the next right step before they had to go looking for it.
        </P>
        <P>
          Most of the work was in the edges. What happens mid-season? When a job&rsquo;s half-booked?
          When the thing you flagged last spring comes due again? The microcopy carried a lot of
          that weight — a maintenance app should sound like a calm neighbour, not a warranty card.
        </P>
      </>
    ),
    visual: { kind: 'video', src: `${BLOB}/cassi-maintenance-flow.mp4`, alt: 'Cassi maintenance flow with a seasonal checklist' },
    caption: 'Maintenance flow',
  },
  {
    id: 'states',
    act: 'Process',
    eyebrow: 'The unglamorous bit',
    heading: 'The states nobody screenshots',
    body: (
      <>
        <P>
          Uploading documents is the kind of flow people skip in a portfolio. It&rsquo;s also exactly
          where a prototype feels fake if you rush it. So I drew the in-between: the parsing, the
          almost-done, the &ldquo;we got most of it, check this one field.&rdquo;
        </P>
        <Pull>The in-between states are the product. Everything else is a screenshot.</Pull>
      </>
    ),
    visual: { kind: 'image', src: `${BLOB}/upload-progress-01.png`, alt: 'The document-upload flow across its in-between states' },
    caption: 'Document upload — the in-between states',
  },
  {
    id: 'profile',
    act: 'Product',
    eyebrow: 'What we built',
    heading: 'Your whole home, from an address',
    body: (
      <P>
        Type in an address and Cassi hands back the full picture — value, flood-zone risk, the
        boring-but-load-bearing facts — before you&rsquo;ve figured out what to ask. The address is the
        only thing we make you do. Everything after it is Cassi&rsquo;s job.
      </P>
    ),
    visual: { kind: 'image', src: `${BLOB}/property-listing-02.png`, alt: "A home's full profile from just an address" },
    caption: 'Property profile',
  },
  {
    id: 'facts',
    act: 'Product',
    eyebrow: 'What we built',
    heading: 'Answers before the question',
    body: (
      <P>
        Did-you-know cards surface a fact about your home right when it&rsquo;s useful — not buried in a
        settings page you&rsquo;ll never open. It&rsquo;s the invisible-intelligence idea made tangible: the
        assistant volunteering the thing you were about to need.
      </P>
    ),
    visual: { kind: 'image', src: `${BLOB}/fact-card-01.png`, alt: 'Did-you-know cards surfacing a home fact' },
    caption: 'Did-you-know cards',
  },
  {
    id: 'voice',
    act: 'Product',
    eyebrow: 'What we built',
    heading: 'Talking to your house',
    body: (
      <P>
        Sometimes the fastest input is your voice. You can just talk to Cassi — describe the
        problem out loud, watch it listen, and get an answer back. It&rsquo;s the same assistant, minus
        the keyboard.
      </P>
    ),
    visual: { kind: 'video', src: `${BLOB}/cassi-assistant-speaking.mp4`, alt: 'Talking to Cassi out loud and hearing it answer' },
    caption: 'Talking to Cassi',
  },
  {
    id: 'outcome',
    act: 'Outcome',
    eyebrow: 'What happened',
    heading: 'A prototype that moved real money',
    body: (
      <>
        <P>
          The prototype did its job, and then it kept doing it. I&rsquo;ll take &ldquo;a design that directly
          moved real money&rdquo; over a dribbble shot any day.
        </P>
        <P>
          Six months, one designer, one engineer, and a bar that said: make it feel like it
          already exists. It did.
        </P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <MetricsPanel progression stats={[{ value: '$3M', label: 'seed' }, { value: '$10M', label: 'Series A' }]} />
      ),
    },
    caption: 'A prototype that moved real money',
  },
];

export function Cassi() {
  return (
    <CaseStudyLayout
      sections={SECTIONS}
      title="Cassi"
      header={
        <header className="pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: '#EDEAE0' }}>
            Cassi
          </h1>
          <p className="mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: '#EDEAE0' }}>
            An AI assistant for homeowners that&rsquo;s omnipresent, unobtrusive, and real enough to raise on.
          </p>
          <p className="mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>
            Freelance · iOS + Web · 6 months · Solo designer
          </p>
        </header>
      }
      footer={
        <footer className="py-16 md:py-24">
          <p className="font-sans text-2xl md:text-3xl tracking-tight text-balance" style={{ color: '#EDEAE0' }}>
            That&rsquo;s Cassi — a prototype that had to feel real, and did.
          </p>
          <Link
            href="/preview"
            className="mt-8 inline-flex items-center gap-2 font-sans text-sm text-white/70 transition-colors duration-200 hover:text-[#2CA152]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to all work
          </Link>
        </footer>
      }
    />
  );
}
