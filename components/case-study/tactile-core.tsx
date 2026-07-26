'use client';

import { CaseStudyLayout } from './case-study-layout';
import { P, Pull, List } from './prose';
import { ContactSheet } from './controls/contact-sheet';
import { Bento } from './controls/bento';
import { AsciiPanel } from './controls/ascii-panel';
import type { CaseStudySection } from './types';

// Tactile Core — internal tooling platform, designed SOLO 2021–25 on a from-
// scratch Core Design System (MUI base, Untitled-UI-inspired theming). Real
// screens in public/work/tactile-core/ (see _manifest.txt).
//
// Structure: PRODUCT-LED. Lead with the suite, then each tool gets hero → craft
// → states-bento, with the story sprinkled as short interludes. Zoom focus +
// annotation coords are first-pass estimates; annotations only on screens I've
// verified. Holes marked {/* ASK JOY */}.

const B = '/work/tactile-core';
const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.5)';

const SECTIONS: CaseStudySection[] = [
  // ─── OPEN: the breadth, immediately ───
  {
    id: 'suite',
    act: 'The system',
    eyebrow: 'what it is',
    heading: 'One panel that runs the whole studio',
    body: (
      <>
        <P lead>
          Tactile Core is the internal platform behind the games — A/B tests, live events, player
          segments, builds, analytics, support, game config. Dozens of tools, one system.
        </P>
        <P>Every screen here I designed and built myself, between 2021 and 2025.</P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <Bento
          columns={2}
          images={[
            { file: 'sf-timeline-view.png' },
            { file: 'ab-test-tracks-and-journeys.png' },
            { file: 'segments-default.png' },
            { file: 'create-new-game-overview.png' },
            { file: 'segments-segment-overlap.png' },
          ]}
        />
      ),
    },
    caption: 'A few of the tools',
  },
  {
    id: 'one-rail',
    act: 'The system',
    eyebrow: 'the real brief',
    heading: 'It started as a drawer of apps that didn’t know each other',
    body: (
      <>
        <P>
          It began as separate tools and spreadsheets on a default Bootstrap theme. It worked — it just
          didn&rsquo;t hang together. The problem was never the UI. It&rsquo;s utilitarian software.
        </P>
        <P>
          Making it cohesive was the job. First move: one rail across every tool, plus a switcher to jump
          between games.
        </P>
      </>
    ),
    visual: {
      kind: 'zoom',
      src: `${B}/create-new-game-sidebar-navigation-default.png`,
      alt: 'The unified sidebar — every product in one rail',
      focus: { x: 0.11, y: 0.45, scale: 1.9 },
      annotations: [
        { id: 'rail', x: 0.11, y: 0.2, side: 'right', label: 'One rail — ~20 tools' },
        { id: 'games', x: 0.016, y: 0.5, side: 'right', label: 'Switch between games' },
      ],
    },
    caption: 'Navigation, unified',
  },

  // ─── CHAPTER: A/B Testing ───
  {
    id: 'ab-hero',
    act: 'A/B testing',
    eyebrow: 'the flagship tool',
    heading: 'Spin up a test without leaving the page',
    body: (
      <>
        <P>
          Pick the resources to test, add groups, set weights — the whole experiment on one screen. The
          heavy machinery of an A/B platform, made to feel like filling in a form.
        </P>
      </>
    ),
    visual: { kind: 'zoom', src: `${B}/ab-test-tracks-and-journeys.png`, alt: 'Create A/B Test — test groups, journeys, tracks', focus: { x: 0.5, y: 0.45, scale: 1 } },
    caption: 'Create an A/B test',
  },
  {
    id: 'ab-card',
    act: 'A/B testing',
    eyebrow: 'where the craft is',
    heading: 'A whole test group, judged inside one card',
    body: (
      <>
        <P>
          Each group is a single card: its weight and split, its journeys and tracks, and its <em>live</em>
          numbers — DAU, ARPDAU, revenue diff — right there. You compare Control against Treatment without
          leaving the card. {/* ASK JOY: why in-card stats vs a separate analytics page? */}
        </P>
        <Pull>Dense signal in a small card, without it feeling heavy — the part I enjoy most.</Pull>
      </>
    ),
    visual: {
      kind: 'zoom',
      src: `${B}/ab-test-test-group-card-v2.png`,
      alt: 'A/B test group card — properties, journeys, and live stats',
      focus: { x: 0.5, y: 0.82, scale: 1.35 },
      annotations: [
        { id: 'weight', x: 0.85, y: 0.27, side: 'left', label: 'Weight + split %' },
        { id: 'stats', x: 0.12, y: 0.82, side: 'top', label: 'Live DAU / ARPDAU, in the card' },
      ],
    },
    caption: 'A/B test — one card',
  },
  {
    id: 'ab-states',
    act: 'A/B testing',
    eyebrow: 'the unglamorous bits',
    heading: 'The states nobody screenshots',
    body: (
      <>
        <P>
          A tool is mostly its edges — the empty first-run, the confirm modal, the randomization seed, the
          in-between card states. Getting these right is what makes it feel finished.
        </P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <Bento
          columns={2}
          images={[
            { file: 'ab-test-first-time-open-save-resource-empty-state.png' },
            { file: 'ab-test-modal.png' },
            { file: 'ab-test-randomization-seed-card.png' },
            { file: 'ab-test-test-group-card-v2-1.png' },
            { file: 'ab-test-test-group-card-v2-2.png' },
          ]}
        />
      ),
    },
    caption: 'A/B — states & details',
  },
  {
    id: 'ds-lesson',
    act: 'The system',
    eyebrow: 'the first thing I got wrong',
    heading: 'I built too much design system',
    body: (
      <>
        <P>
          I built our Core Design System from scratch — MUI underneath, themed after Untitled UI — and
          spent too long perfecting components before anyone needed them.
        </P>
        <P>You only need the basics up front: inputs, tables, buttons, type, colour.</P>
        <Pull>The real work is the patterns and rules — written down from day one. The rules are the product.</Pull>
      </>
    ),
    visual: { kind: 'component', render: BeforeAfter },
    caption: 'Rules > components',
  },

  // ─── CHAPTER: Scheduled Features ───
  {
    id: 'sf-hero',
    act: 'Scheduled features',
    eyebrow: 'the whole calendar',
    heading: 'Every live event on one timeline',
    body: (
      <>
        <P>
          Scheduled Features puts every event and offer, across every track, on a single timeline with a
          &ldquo;today&rdquo; line through it. Ops sees the whole calendar at once instead of reading a list.
        </P>
      </>
    ),
    visual: {
      kind: 'zoom',
      src: `${B}/sf-timeline-view.png`,
      alt: 'Scheduled Features — timeline of events across tracks',
      focus: { x: 0.5, y: 0.5, scale: 1 },
      annotations: [{ id: 'today', x: 0.49, y: 0.55, side: 'right', label: 'The “today” line' }],
    },
    caption: 'Scheduled features — timeline',
  },
  {
    id: 'sf-config',
    act: 'Scheduled features',
    eyebrow: 'from config to UI',
    heading: 'This much JSON, turned into a form',
    body: (
      <>
        <P>
          Underneath, an offer is a wall of nested JSON. The tool&rsquo;s job is to make that editable by a
          human — a form, a timeline, a set of states — instead of a text file someone edits at 2am.
        </P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <Bento
          columns={2}
          images={[
            { file: 'sf-overview-consecutiveoffertemplate-threeoffers-allavai.png' },
            { file: 'sf-creating-when-form-is-filled.png' },
            { file: 'sf-list-view-metadata-highlights.png' },
            { file: 'sf-metadata-highlights.png' },
          ]}
        />
      ),
    },
    caption: 'Offer config → editable UI',
  },

  // ─── CHAPTER: Segments ───
  {
    id: 'seg-overlap',
    act: 'User segments',
    eyebrow: 'comparison in a glance',
    heading: 'How much a segment overlaps others, at a glance',
    body: (
      <>
        <P>
          A small donut per overlap, real percentage beneath. A dense comparison you read in a second — the
          kind of tiny, information-rich component I could design all day.
        </P>
      </>
    ),
    visual: {
      kind: 'zoom',
      src: `${B}/segments-segment-overlap.png`,
      alt: 'Segment overlap — donut cluster',
      focus: { x: 0.5, y: 0.5, scale: 1 },
      annotations: [{ id: 'ov', x: 0.22, y: 0.35, side: 'bottom', label: 'Overlap %, per segment' }],
    },
    caption: 'Segment overlap',
  },
  {
    id: 'seg-states',
    act: 'User segments',
    eyebrow: 'every state, handled',
    heading: 'One segment, a dozen moments',
    body: (
      <>
        <P>
          Details, usage, last-run results, the many-segments case, the two-segments case, the kebab menus,
          the add-button state. A real tool is the sum of its small, correct moments.
        </P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <Bento
          columns={3}
          images={[
            { file: 'segments-details-view.jpg' },
            { file: 'segments-2-below-header-expanded.png' },
            { file: 'segments-dashboard-usage-section.png' },
            { file: 'segments-last-run-result-section.png' },
            { file: 'segments-when-there-are-many-segments.png' },
            { file: 'segments-when-there-is-only-2-segments.png' },
            { file: 'segments-create-segment-group.png' },
            { file: 'segments-add-button-state.png' },
            { file: 'segments-archive-option-in-kebab-menu.png' },
          ]}
        />
      ),
    },
    caption: 'Segments — the whole surface',
  },
  {
    id: 'consistency',
    act: 'The system',
    eyebrow: 'the second thing I got wrong',
    heading: 'Consistency isn’t the same as sameness',
    body: (
      <>
        <P>
          I chased uniformity — every tool identical. Wrong. A timeline and a support inbox are different
          tasks, different mental models, different users.
        </P>
        <P>Only the basics should match — saving, modals, destructive actions, empty states. The rest should be free to be itself.</P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <Bento columns={2} images={[{ file: 'sf-timeline-view.png' }, { file: 'segments-segment-overlap.png' }]} />
      ),
    },
    caption: 'Two tools, intentionally different',
  },

  // ─── CHAPTER: Create / Configure Game ───
  {
    id: 'game-hero',
    act: 'Create a game',
    eyebrow: 'self-serve onboarding',
    heading: 'Stand up a new game — or a new studio',
    body: (
      <>
        <P>
          Naming, shortcodes, package + certificate config, team permissions. Enough hand-holding that a
          brand-new game (or an outside studio) can get running without someone walking them through it.
        </P>
      </>
    ),
    visual: { kind: 'zoom', src: `${B}/create-new-game-overview.png`, alt: 'Configure Game — overview', focus: { x: 0.5, y: 0.4, scale: 1 } },
    caption: 'Configure a new game',
  },
  {
    id: 'game-parts',
    act: 'Create a game',
    eyebrow: 'the reusable pieces',
    heading: 'Built from parts, so it stays consistent',
    body: (
      <>
        <P>
          Permissions, template containers, the fingerprint section — assembled from the same Core parts, so
          a new flow inherits the system instead of reinventing it.
        </P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <Bento
          columns={2}
          images={[
            { file: 'create-new-game-permissions-adding-users-ii.png' },
            { file: 'create-new-game-after-commercial-name-is-filled-shortcod.png' },
            { file: 'create-new-game-template-parts-container.png' },
            { file: 'create-new-game-template-parts-fingerprint-section.png' },
          ]}
        />
      ),
    },
    caption: 'Reusable template parts',
  },

  // ─── THE WALL ───
  {
    id: 'the-wall',
    act: 'The whole thing',
    eyebrow: 'four years, one designer',
    heading: 'This whole system, by hand',
    body: (
      <>
        <P>
          Not a gallery to skim — the point is the surface. One person, one system, this much ground, from
          2021 to 2025.
        </P>
      </>
    ),
    visual: { kind: 'component', render: () => <ContactSheet /> },
    caption: 'The whole surface',
  },

  // ─── INTERLUDE: what I'd change ───
  {
    id: 'debt',
    act: 'What I’d change',
    eyebrow: 'honest bits',
    heading: 'The defaults I inherited became debt',
    body: (
      <>
        <P>
          Two I&rsquo;d take back. <strong>Uppercase buttons</strong>, straight from MUI, are now permanent —
          we tried sentence case and people had gotten used to the shouting. And the <strong>purple</strong>
          leans too hard in places because we followed MUI&rsquo;s theme instead of our own judgement.
        </P>
        <P>
          The bigger one: I designed the system but under-taught the <em>why</em>. I did it one-on-one when I
          should have built it into how the whole team thinks. That&rsquo;s the part I do properly now.
        </P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <AsciiPanel
          art={`  WHAT I'D CHANGE

  uppercase BUTTONS ......  MUI default → permanent
  purple everywhere .....   followed the theme, not the need
  taught the "why" 1:1 ..   should've been team-wide

  small defaults you don't decide on
  become decisions anyway.`}
        />
      ),
    },
    caption: 'The honest list',
  },

  // ─── CLOSE: reflection, no metrics ───
  {
    id: 'close',
    act: 'What it became',
    eyebrow: 'the surprise',
    heading: 'We set out to make tools usable. We built a product',
    body: (
      <>
        <P>
          No clean number to give — too much changed at once to pin adoption on the redesign, and I&rsquo;d
          rather be honest than tidy.
        </P>
        <P>
          The real outcome was a surprise. The craft — design <em>and</em> engineering — got good enough that
          a games company started seeing itself as a SaaS one. Good internals other studios could run on.
          That&rsquo;s where it&rsquo;s headed next.
        </P>
      </>
    ),
    visual: {
      kind: 'component',
      render: () => (
        <AsciiPanel
          art={`   internal tools
        │
        ▼
   [ good enough to sell ]
        │
        ▼
   a games co. → a SaaS co.

   what I'd keep:
   · rules before components
   · teach the system, not just ship it
   · dense can still be calm`}
        />
      ),
    },
    caption: 'Where it’s headed',
  },
];

// Lightweight before/after mock — stands in for the shadcn-style mock UIs to come.
function BeforeAfter() {
  return (
    <div className="grid w-full max-w-[520px] grid-cols-2 gap-4 px-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>Before</p>
        <div className="space-y-1.5">
          <div className="h-2 w-3/4 rounded bg-white/20" />
          <div className="h-2 w-full rounded bg-white/15" />
          <div className="h-6 w-full rounded bg-blue-500/50" />
          <div className="h-6 w-full rounded bg-red-500/40" />
          <div className="h-2 w-1/2 rounded bg-white/15" />
          <div className="h-6 w-2/3 rounded bg-yellow-500/40" />
        </div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: '#2CA152' }}>After</p>
        <div className="space-y-2">
          <div className="h-2 w-2/3 rounded" style={{ backgroundColor: 'rgba(237,234,224,0.5)' }} />
          <div className="h-2 w-1/2 rounded" style={{ backgroundColor: 'rgba(237,234,224,0.25)' }} />
          <div className="mt-3 h-7 w-28 rounded" style={{ backgroundColor: '#2CA152' }} />
        </div>
      </div>
    </div>
  );
}

export function TactileCore() {
  return (
    <CaseStudyLayout
      sections={SECTIONS}
      title="Tactile Core"
      footer={
        <footer className="py-16 md:py-24">
          <p className="font-sans text-2xl md:text-3xl tracking-tight text-balance" style={{ color: FG }}>
            One panel to run a studio — good enough to hand to another one.
          </p>
          <p className="mt-4 max-w-[52ch] font-sans text-[15px] leading-relaxed" style={{ color: MUTED }}>
            Tactile Core — the studio&rsquo;s internal tooling platform. Designed solo, 2021–25, on a
            from-scratch Core Design System (MUI base, Untitled-UI-inspired theming).
          </p>
        </footer>
      }
      header={
        <header className="pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: FG }}>
            Tactile Core
          </h1>
          <p className="mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: FG }}>
            The internal panel that runs the studio&rsquo;s live games — made calm and cohesive enough for
            outside studios to run on too.
          </p>
          <p className="mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>
            Sole product designer · Internal platform · 2021–25 · Tactile Games
          </p>
        </header>
      }
    />
  );
}
