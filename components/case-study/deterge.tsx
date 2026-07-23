'use client';

import { CaseStudyLayout } from './case-study-layout';
import { P, Pull } from './prose';
import { MetricsPanel } from './controls/metrics-panel';
import type { CaseStudySection } from './types';

// Screens (drop the pasted files into public/work/deterge/ with these names).
const IMG = '/work/deterge';

const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.5)';

const SECTIONS: CaseStudySection[] = [
  {
    id: 'intro',
    body: (
      <>
        <P lead>
          Deterge was an online laundry service for college students — the kind of thing you build
          because your own laundry situation is genuinely broken. Ours was irregular and overpriced,
          so five of us in our third year built the app we wished existed.
        </P>
        <P>
          We didn&rsquo;t want to buy machines or lease space — we were full-time students. So we became
          the technology layer instead: aggregate the launderers, own the experience, keep it simple.
        </P>
        <Pull>We weren&rsquo;t a laundry business. We were the app that made laundry disappear.</Pull>
      </>
    ),
    visual: { kind: 'image', src: `${IMG}/home.png`, alt: 'Deterge home — “Hello, Joydeep” with a single Pick My Laundry button' },
    caption: 'Home — pick my laundry',
  },
  {
    id: 'origin',
    act: 'Origin',
    eyebrow: 'September 2015',
    heading: 'It started as a complaint',
    body: (
      <P>
        It started as a dorm conversation — me and four classmates griping about the campus laundry.
        We did the obvious thing and asked around: would you actually use an app for this? Enough
        people said yes that we stopped talking and started building.
      </P>
    ),
    visual: { kind: 'image', src: `${IMG}/get-started.png`, alt: 'Deterge get-started screen — “Let us do the things you hate”' },
    caption: 'The pitch',
  },
  {
    id: 'research',
    act: 'Process',
    eyebrow: 'Knowing the user',
    heading: 'Thirty conversations',
    body: (
      <>
        <P>
          I built personas from real people, not archetypes, then talked to thirty-odd students
          across the colleges nearby. The clearest signal came back fast: nobody wanted a signup
          wall. They wanted their clothes washed, not another account to remember.
        </P>
        <P>
          A competitive teardown of the laundry apps around us confirmed it — most buried the one
          thing you came to do under onboarding.
        </P>
      </>
    ),
    visual: { kind: 'image', src: `${IMG}/rates.png`, alt: 'Deterge rates — transparent per-item pricing by category' },
    caption: 'Transparent rates',
  },
  {
    id: 'decision',
    act: 'Process',
    eyebrow: 'The one decision',
    heading: 'Skip the login',
    body: (
      <>
        <P>
          So we made the call that shaped everything: the first screen isn&rsquo;t a login or a welcome
          splash — it&rsquo;s the booking screen. Open the app, request a pickup. Everything else can wait.
        </P>
        <P>
          Pencil sketches became XD wireframes, and we cut every step that wasn&rsquo;t pulling its weight.
          Material Design as the base, with just enough of our own to feel like us on Android and iOS.
        </P>
        <Pull>The first screen shouldn&rsquo;t ask who you are. It should do the thing you came for.</Pull>
      </>
    ),
    visual: { kind: 'image', src: `${IMG}/location-time.png`, alt: 'Deterge booking — pick pickup location on a map and a date/time slot' },
    caption: 'Booking-first',
  },
  {
    id: 'build',
    act: 'Ship',
    eyebrow: 'Making it real',
    heading: 'Built it, branded it',
    body: (
      <>
        <P>
          We shipped an Android app — Android Studio, Java and XML, Firebase for the backend. I
          worked the front end with the team. (We&rsquo;d started with an ASP.NET / C# website, then
          replaced it with a landing page whose only job was to send you to the app.)
        </P>
        <P>
          The brand was deliberately minimal — a plain wordmark in the spirit of Uber and Google,
          blue as the one colour, icons drawn in Illustrator. Your clothes came back in a reusable
          tote with your own tag on it. Small thing; people remembered it.
        </P>
      </>
    ),
    visual: { kind: 'image', src: `${IMG}/status.png`, alt: 'Deterge order status — a pickup-to-delivery timeline' },
    caption: 'Order status',
  },
  {
    id: 'outcome',
    act: 'Outcome',
    eyebrow: 'What happened',
    heading: 'It actually worked',
    body: (
      <>
        <P>
          We aggregated the local dhobiwaale, then landed a deal with a major provider contracted to
          Indian Railways — suddenly a student app had real infrastructure and manpower behind it.
        </P>
        <P>
          Eighty-plus weekly active users in the first month, on &#8377;30k. But the part I&rsquo;m proudest
          of is what it set off: classmates started building their own campus apps, and the institute
          spun up an incubator cell — and took Deterge&rsquo;s tech to keep it running after we&rsquo;d moved on.
        </P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <MetricsPanel
          stats={[{ value: '80+', label: 'weekly active' }, { value: '₹30k', label: 'invested' }, { value: '6', label: 'months' }]}
        />
      ),
    },
    caption: 'It actually worked',
  },
];

export function Deterge() {
  return (
    <CaseStudyLayout
      sections={SECTIONS}
      title="Deterge"
      footer={
        <footer className="py-16 md:py-24">
          <p className="font-sans text-2xl md:text-3xl tracking-tight text-balance" style={{ color: FG }}>
            The first real thing I ever shipped.
          </p>
          <p className="mt-4 max-w-[52ch] font-sans text-[15px] leading-relaxed" style={{ color: MUTED }}>
            Originally written in 2017; I redesigned the screens as an exploration in 2019. My
            process has moved on a lot since — but this one still means the most.
          </p>
        </footer>
      }
      header={
        <header className="pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: FG }}>
            Deterge
          </h1>
          <p className="mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: FG }}>
            An online laundry service five of us built in college — fast, cheap, no hassle — that grew faster than we expected.
          </p>
          <p className="mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>
            Co-founder &amp; design · Mobile · 2015–17 · University venture
          </p>
        </header>
      }
    />
  );
}
