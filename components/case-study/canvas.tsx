'use client';

import { CaseStudyLayout } from './case-study-layout';
import { P, Pull, List } from './prose';
import { MiniCanvas } from './controls/mini-canvas';
import type { CaseStudySection } from './types';

const BLOB = 'https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work';
const ACCENT = '#2CA152';

const SECTIONS: CaseStudySection[] = [
  {
    id: 'intro',
    eyebrow: 'The short version',
    body: (
      <>
        <P lead>
          Canvas is the infinite whiteboard at the heart of Tactile Create — our internal,
          AI-native suite that takes a game from a one-line idea through to a playable prototype.
          Think Miro, but wired into the way we actually make games.
        </P>
        <P>
          I spent about three months rebuilding the invisible micro-interactions that make a
          whiteboard feel like a whiteboard — in production code, with Claude Code, not in Figma.
          Because here&rsquo;s the thing about an infinite canvas: you cannot judge it from a static
          frame. It only exists once you can grab it.
        </P>
        <Pull>You can&rsquo;t design a canvas in frames. The prototype was the design.</Pull>
      </>
    ),
    visual: { kind: 'video', src: `${BLOB}/canvas-stickynote.mp4`, alt: 'A draggable sticky-note canvas' },
    caption: 'Sticky-note canvas',
  },
  {
    id: 'method',
    act: 'Process',
    eyebrow: 'Why prototype',
    heading: 'Prototyping was the method',
    body: (
      <>
        <P>
          Miro spent a decade perfecting behaviours you never consciously notice. To get anywhere
          near that, I couldn&rsquo;t mock it — I had to build it, watch people use it, and rebuild.
          I studied the whiteboarding market, then reconstructed the behaviours in real code so
          they could actually be felt and torn apart in critique.
        </P>
        <P>
          Here&rsquo;s a stand-in you can grab. It&rsquo;s a fraction of the real thing, but it makes the
          point: drag a note, and it&rsquo;s obvious in half a second whether the motion feels right.
          No screenshot tells you that.
        </P>
      </>
    ),
    visual: { kind: 'component', render: () => <MiniCanvas /> },
    caption: 'Drag the notes',
  },
  {
    id: 'states',
    act: 'Craft',
    eyebrow: 'The invisible part',
    heading: 'Twenty states hiding in “select”',
    body: (
      <>
        <P>
          &ldquo;Select an object&rdquo; sounds like one thing. It&rsquo;s about twenty. I decomposed hover and
          selection into discrete states and built each deliberately:
        </P>
        <List
          items={[
            'Stacked objects — which one do you mean when three overlap?',
            'Shift vs. no-shift; add-to-selection vs. replace.',
            'Drag-select from empty space vs. dragging an object.',
            'Mouse vs. trackpad, which behave nothing alike.',
          ]}
        />
        <P>
          Out of the box, AI gets almost all of these wrong — it writes the happy path and stops.
          The same care went into arrow connectors that rescale as you type into them, and a pen
          tool tuned until it felt smooth instead of jittery.
        </P>
      </>
    ),
    visual: { kind: 'component', render: () => <MiniCanvas /> },
    caption: 'Idle → hover → selected → dragging',
  },
  {
    id: 'outcome',
    act: 'Outcome',
    eyebrow: 'What happened',
    heading: 'The engineers shipped my prototype',
    body: (
      <>
        <div className="mb-8 flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <span>
            <span className="font-mono font-thin text-5xl md:text-6xl tracking-tight tabular-nums" style={{ color: '#EDEAE0' }}>
              500–1k
            </span>
            <span className="ml-2 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.5)' }}>
              users
            </span>
          </span>
          <span>
            <span className="font-mono font-thin text-5xl md:text-6xl tracking-tight tabular-nums" style={{ color: '#EDEAE0' }}>
              &lt;6
            </span>
            <span className="ml-2 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.5)' }}>
              months · 2 people
            </span>
          </span>
        </div>
        <P>
          The prototype wasn&rsquo;t thrown away — the engineers reused much of the code, re-optimised
          the hot paths, and shipped the real Canvas on top of it. Adoption landed at 500–1,000
          users, roughly 60% in-house and 40% external partner studios.
        </P>
        <P>
          Canvas and Create Art came together in under six months, me and one developer — about a
          year of build compressed into two quarters, because the prototype and the product were
          never really separate things.
        </P>
      </>
    ),
    visual: { kind: 'video', src: `${BLOB}/canvas-stickynote.mp4`, alt: 'The sticky-note canvas in motion' },
    caption: 'Sticky-note canvas',
  },
];

export function Canvas() {
  return (
    <CaseStudyLayout
      sections={SECTIONS}
      title="Canvas"
      header={
        <header className="pt-24 pb-4 md:pt-16">
          <p className="mb-4 font-sans font-medium text-sm tracking-[-0.02em] lowercase" style={{ color: ACCENT }}>
            Case study
          </p>
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: '#EDEAE0' }}>
            Create Canvas
          </h1>
          <p className="mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: '#EDEAE0' }}>
            Rebuilding an infinite whiteboard in production code, because you can&rsquo;t judge one from a static frame.
          </p>
          <p className="mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>
            Tactile Games · Prototype → product · Interactive
          </p>
        </header>
      }
    />
  );
}
