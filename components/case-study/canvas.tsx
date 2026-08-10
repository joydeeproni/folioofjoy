'use client';

import { CaseStudyLayout } from './case-study-layout';
import { P, Pull, List } from './prose';
import { ConnectorPlayground, SectionMembershipLab } from './controls/mini-canvas';
import { CaseCredits } from './shared/case-credits';
import { JOY } from './team';
import type { CaseStudySection } from './types';

const BLOB = 'https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work';

function ReflectionPanel() {
  return (
    <div className="w-full max-w-[560px] px-1 md:px-4">
      <svg
        viewBox="0 0 560 440"
        role="img"
        aria-labelledby="reflection-diagram-title reflection-diagram-desc"
        className="h-auto w-full overflow-visible"
      >
        <title id="reflection-diagram-title">The details that create a good experience</title>
        <desc id="reflection-diagram-desc">
          Where it lands, how it joins, how it routes, how it recovers, and what appears next all
          connect to a good experience.
        </desc>

        <defs>
          <marker id="reflection-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#2CA152" />
          </marker>
          <filter id="reflection-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="280" cy="220" r="74" fill="rgba(44,161,82,0.12)" stroke="#2CA152" strokeWidth="1.5" filter="url(#reflection-glow)" />
        <circle cx="280" cy="220" r="63" fill="#102016" stroke="rgba(44,161,82,0.5)" />

        <g fill="none" stroke="#2CA152" strokeWidth="1.5" strokeOpacity="0.65" markerEnd="url(#reflection-arrow)">
          <path d="M 173 82 C 205 88, 220 123, 235 162" />
          <path d="M 391 82 C 355 89, 340 123, 325 162" />
          <path d="M 438 220 C 400 220, 375 220, 354 220" />
          <path d="M 385 358 C 352 337, 338 306, 325 278" />
          <path d="M 174 358 C 208 337, 222 306, 235 278" />
        </g>

        <g fill="#2CA152">
          <circle cx="173" cy="82" r="3" />
          <circle cx="391" cy="82" r="3" />
          <circle cx="438" cy="220" r="3" />
          <circle cx="385" cy="358" r="3" />
          <circle cx="174" cy="358" r="3" />
        </g>

        <g fill="#141414" stroke="rgba(237,234,224,0.22)" strokeWidth="1.5">
          <rect x="55" y="54" width="142" height="56" rx="28" />
          <rect x="363" y="54" width="142" height="56" rx="28" />
          <rect x="407" y="192" width="130" height="56" rx="28" />
          <rect x="329" y="330" width="158" height="56" rx="28" />
          <rect x="62" y="330" width="181" height="56" rx="28" />
        </g>

        <g fill="rgba(237,234,224,0.68)" textAnchor="middle" className="font-mono text-[12px] uppercase tracking-[0.12em]">
          <text x="126" y="86">Where it lands</text>
          <text x="434" y="86">How it joins</text>
          <text x="472" y="224">How it routes</text>
          <text x="408" y="362">How it recovers</text>
          <text x="152" y="354">
            <tspan x="152">What appears</tspan>
            <tspan x="152" dy="16">next</tspan>
          </text>
        </g>

        <text x="280" y="213" textAnchor="middle" fill="#EDEAE0" className="font-sans text-[19px] font-medium tracking-tight">
          <tspan x="280">Good</tspan>
          <tspan x="280" dy="23">experience</tspan>
        </text>
      </svg>
    </div>
  );
}

const SECTIONS: CaseStudySection[] = [
  {
    id: 'intro',
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
          Section membership was one of those behaviours. Moving something into a section,
          selecting the section itself, and absorbing an object by stretching the section around
          it all needed different feedback. Use the three states here to compare them.
        </P>
      </>
    ),
    visual: { kind: 'component', render: () => <SectionMembershipLab />, bleed: true },
    caption: 'Move in → select → stretch & absorb',
  },
  {
    id: 'states',
    act: 'Craft',
    eyebrow: 'What broke',
    heading: 'The gap between generated and designed',
    body: (
      <>
        <P>
          The dummy whiteboard made the failure cases impossible to ignore. I could see exactly
          where the interactions stopped behaving like a real canvas:
        </P>
        <List
          items={[
            'Arrow connectors overlapped objects or missed their endpoints.',
            'Routes changed unpredictably as connected objects moved or resized.',
            'The visual treatment did not consistently show what was attached.',
            'The pen tool amplified every input point into visible jitter.',
          ]}
        />
        <P>
          AI can make something that looks finished in seconds. Then you move a shape and the
          arrow points past it, or select one and cannot tell which object is active. That gap is
          the work. A designer still has to use the product, find the failure states, and polish
          the behaviour until it feels right.
        </P>
        <P>
          Build a connection in the AI draft, move the shapes until it breaks, then switch to
          Designer polish. The board stays exactly the same; only the behavioural decisions
          change.
        </P>
      </>
    ),
    visual: { kind: 'component', render: () => <ConnectorPlayground />, bleed: true },
    caption: 'Same canvas · different behaviour',
  },
  {
    id: 'reflection',
    act: 'Reflection',
    eyebrow: 'What I learned',
    heading: 'The most useful design work was often behavioral rather than visual',
    body: (
      <>
        <P>
          A polished canvas depends on small decisions: where something lands, how it joins a
          section, how a connector routes, what happens when media fails, and which controls
          appear after selection.
        </P>
        <P>
          Those details are easy to overlook, but they are what made the product feel less fragile
          in daily use.
        </P>
      </>
    ),
    visual: { kind: 'component', render: () => <ReflectionPanel /> },
    caption: 'The small decisions made it durable',
  },
];

export function Canvas() {
  return (
    <CaseStudyLayout
      sections={SECTIONS}
      title="Canvas"
      header={
        <header className="pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: '#EDEAE0' }}>
            Create Canvas
          </h1>
          <p className="mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: '#EDEAE0' }}>
            Rebuilding an infinite whiteboard in production code, because you can&rsquo;t judge one from a static frame.
          </p>
          <CaseCredits
            people={[JOY]}
            meta="Tactile Games · Prototype → product · Interactive"
          />
        </header>
      }
    />
  );
}
