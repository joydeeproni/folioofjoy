'use client';

import { CaseStudyLayout } from './case-study-layout';
import { P } from './prose';
import type { CaseStudySection } from './types';

// Lightweight scaffolds for case studies that aren't written yet. Each renders a
// real, navigable page on the framework — header + an outline of planned
// sections with placeholder notes and a "preview coming" stage — so the route
// exists and the structure is visible. Fill the prose and swap the visuals as
// content lands, or replace the whole entry with a bespoke component.

const MUTED = 'rgba(237,234,224,0.4)';

function StubVisual() {
  return (
    <div className="flex h-[55%] w-[78%] items-center justify-center rounded-xl border border-dashed border-white/15">
      <span className="font-mono uppercase tracking-widest text-[11px]" style={{ color: MUTED }}>
        Preview coming
      </span>
    </div>
  );
}

type StubSection = { act?: string; eyebrow?: string; heading: string; note: string };
type StubConfig = { title: string; tag: string; premise: string; sections: StubSection[] };

function makeStub(cfg: StubConfig) {
  const sections: CaseStudySection[] = cfg.sections.map((s, i) => ({
    id: `s${i}`,
    act: s.act,
    eyebrow: s.eyebrow,
    heading: s.heading,
    body: <P>{s.note}</P>,
    visual: { kind: 'component', render: () => <StubVisual /> },
    caption: 'In progress',
  }));

  function Stub() {
    return (
      <CaseStudyLayout
        sections={sections}
        title={cfg.title}
        header={
          <header className="pt-24 pb-4 md:pt-16">
            <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: '#EDEAE0' }}>
              {cfg.title}
            </h1>
            <p className="mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: '#EDEAE0' }}>
              {cfg.premise}
            </p>
            <p className="mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: MUTED }}>
              {cfg.tag}
            </p>
          </header>
        }
      />
    );
  }
  return Stub;
}

export const Insider = makeStub({
  title: 'Insider',
  tag: 'Insider · Web · Growth marketing',
  premise: 'Web personalizations that convert — and the research-backed Social Proof module behind them.',
  sections: [
    { act: 'Context', heading: 'Personalization at scale', note: 'How Insider combined past activity, real-time triggers, and predictive insight to tailor web experiences for global brands. — content coming.' },
    { act: 'Research', heading: 'The Social Proof module', note: 'Six research-backed persuasion patterns, from real-time stats to trust badges, grounded in Yelp / Nielsen / VWO data. — content coming.' },
    { act: 'Outcome', heading: 'What it moved', note: 'Conversion impact and where it shipped. — metrics to add.' },
  ],
});

export const TactileCore = makeStub({
  title: 'Tactile Core',
  tag: 'Tactile Games · Strategy · LiveOps & monetization',
  premise: 'LiveOps and game events for Tactile’s match/puzzle games — engaging players without feeling pay-to-win. The events my team and I designed generated over $10M.',
  sections: [
    { act: 'Context', heading: 'Monetize without breaking trust', note: 'The core tension: events that engage players without feeling play-to-win or intrusive. — content coming.' },
    { act: 'Process', heading: 'Fail-state offers', note: 'Upsells at the moment of purchase intent — “Out of Time (+60s)”, “Out of Space” — with tiered pricing. Paywall and friction-reduction design. — content coming.' },
    { act: 'Process', heading: 'The booster economy', note: 'Reward loops like the Shopping Gift progression that keep players moving without pushing. — content coming.' },
    { act: 'Process', heading: 'Benchmark → gap → offer', note: 'Systematic teardowns against Royal Match, Match Factory, Triple Match and more, turned into proposed offers. — content coming.' },
    { act: 'Outcome', heading: '$10M+ generated', note: 'Over $10M of monetization business from events my team and I designed; led two designers. — metrics to add.' },
  ],
});

export const FolioOfJoy = makeStub({
  title: 'Folio of Joy',
  tag: 'Personal · Web · This site',
  premise: 'Designing the portfolio you’re reading — the system, the type, and the small joys.',
  sections: [
    { act: 'The brief', heading: 'A folio, not a template', note: 'What I wanted this site to feel like. — content coming.' },
    { act: 'The system', heading: 'Type, colour, motion', note: 'The editorial dark system, the pixel / mono / sans trio, the dither reveal. — content coming.' },
    { act: 'Details', heading: 'The small joys', note: 'The Zen player, the reel, the hand-built controls. — content coming.' },
  ],
});

export const Pitzsa = makeStub({
  title: 'Pitzsa',
  tag: 'Web · Brief to come',
  premise: 'Case study premise to come — brief, role, and outcome to be added.',
  sections: [
    { heading: 'Overview', note: 'Add the premise, your role, and the outcome. — placeholder.' },
    { heading: 'The work', note: 'Add the key screens and the decisions behind them. — placeholder.' },
  ],
});

