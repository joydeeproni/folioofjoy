'use client';

import { useState } from 'react';
import { CaseStudyLayout } from './case-study-layout';
import { P, Pull, List } from './prose';
import { Knob } from './controls/knob';
import { ProportionalSlider } from '@/components/ui/proportional-slider';
import type { CaseStudySection } from './types';

const ACCENT = '#2CA152';

// ── Live demos (own their own state; the stage renders them as interactive) ──

function KnobDemo({ label = 'GAIN', initial = 0.5 }: { label?: string; initial?: number }) {
  const [v, setV] = useState(initial);
  return <Knob label={label} value={v} min={0} max={1} step={0.01} accent={ACCENT} onChange={setV} />;
}

function KnobRowDemo() {
  const [bass, setBass] = useState(0.6);
  const [treb, setTreb] = useState(0.35);
  const [mix, setMix] = useState(0.5);
  return (
    <div className="flex items-start justify-center gap-10">
      <Knob label="BASS" value={bass} min={0} max={1} step={0.05} accent={ACCENT} onChange={setBass} />
      <Knob label="TREB" value={treb} min={0} max={1} step={0.05} accent={ACCENT} onChange={setTreb} />
      <Knob label="MIX" value={mix} min={0} max={1} step={0.01} accent={ACCENT} onChange={setMix} />
    </div>
  );
}

function SliderDemo() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6">
      <ProportionalSlider
        leftLabel="Coffee"
        rightLabel="Milk"
        leftColor="linear-gradient(135deg,#7c4a24,#3a2414)"
        rightColor="linear-gradient(135deg,#e9e2d4,#b8ad97)"
        defaultValue={62}
        height={56}
      />
      <ProportionalSlider
        leftLabel="Work"
        rightLabel="Life"
        leftColor="linear-gradient(135deg,#2CA152,#186034)"
        rightColor="linear-gradient(135deg,#3a3a3a,#1c1c1c)"
        defaultValue={45}
        height={56}
      />
    </div>
  );
}

const SECTIONS: CaseStudySection[] = [
  {
    id: 'obsession',
    eyebrow: 'The short version',
    body: (
      <>
        <P lead>
          I have a thing for physical controls. Knobs with a bit of weight. Faders with a detent
          you can feel through your thumb. The reassuring click of a switch that means the thing
          actually happened.
        </P>
        <P>
          Software throws almost all of that away and replaces it with a flat rectangle that
          changes color. So whenever I build a tool, I try to put a little of the tactility back —
          not skeuomorphism for its own sake, but the small feedback loops that make a control feel
          alive under your hand. Go ahead and grab the knob.
        </P>
      </>
    ),
    visual: { kind: 'component', render: () => <KnobDemo label="GAIN" /> },
    caption: 'Drag the knob ↕',
  },
  {
    id: 'knob',
    act: 'Controls',
    eyebrow: 'Anatomy of a knob',
    heading: 'The rotary knob',
    body: (
      <>
        <P>
          This is the one I keep coming back to. A few decisions make or break how it feels:
        </P>
        <List
          items={[
            'Drag vertically, relative to where you grabbed — not click-to-jump. 140px of travel is a full sweep, so it behaves like a real potentiometer, not a scrubber.',
            'It snaps to the step, so you land on clean values instead of 0.4713.',
            'The arc thickens the moment you grab it, and a ring draws itself around the dial on hover — tiny acknowledgements that you’re in control.',
          ]}
        />
        <Pull>Feedback is the whole game. A control that doesn&rsquo;t react to your touch feels broken, even when it works.</Pull>
      </>
    ),
    visual: { kind: 'component', render: () => <KnobRowDemo /> },
    caption: 'Drag any knob ↕',
  },
  {
    id: 'slider',
    act: 'Controls',
    eyebrow: 'Anatomy of a slider',
    heading: 'The proportional slider',
    body: (
      <>
        <P>
          Some values aren&rsquo;t a number on a line — they&rsquo;re a balance between two things that
          always sum to a whole. Coffee and milk. Work and life. So the slider is one bar split by
          a divider you drag; the two sides trade against each other.
        </P>
        <P>
          On release the divider doesn&rsquo;t just stop — it springs back with a hair of overshoot, the
          way a real weighted control settles. And because not everyone drags, arrow keys nudge it
          too, with the ARIA roles a screen reader needs.
        </P>
      </>
    ),
    visual: { kind: 'component', render: () => <SliderDemo /> },
    caption: 'Drag to rebalance',
  },
  {
    id: 'identity',
    act: 'Why it matters',
    eyebrow: 'The takeaway',
    heading: 'Controls are where craft is felt',
    body: (
      <>
        <P>
          Nobody screenshots a knob. But they feel the difference the moment they touch one that
          was built with care versus one that wasn&rsquo;t. That&rsquo;s exactly why I sweat them — the parts
          people never talk about are the parts they trust.
        </P>
        <P>
          These live across the tools I make; this set came out of the Zen music player on this
          very site. Same obsession, different surface.
        </P>
      </>
    ),
    visual: { kind: 'component', render: () => <KnobDemo label="TRUST" initial={0.85} /> },
    caption: 'One more, for the road ↕',
  },
];

export function Knobs() {
  return (
    <CaseStudyLayout
      sections={SECTIONS}
      title="Controls"
      header={
        <header className="pt-24 pb-4 md:pt-16">
          <p className="mb-4 font-mono uppercase tracking-widest text-[11px]" style={{ color: ACCENT }}>
            Case Study
          </p>
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: '#EDEAE0' }}>
            Toggles, switches, knobs
          </h1>
          <p className="mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: '#EDEAE0' }}>
            A small obsession with physical controls, and how I put the tactility back into the ones I build.
          </p>
          <p className="mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>
            Craft note · Interactive · Play with everything
          </p>
        </header>
      }
    />
  );
}
