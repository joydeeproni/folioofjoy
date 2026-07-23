'use client';

import { CaseStudyLayout } from './case-study-layout';
import { P } from './prose';
import type { CaseStudySection } from './types';

// Lightweight scaffolds for case studies that aren't written yet. Each renders a
// real, navigable page on the framework — header + an outline of planned
// sections with placeholder notes and a "preview coming" stage — so the route
// exists and the structure is visible. Fill the prose and swap the visuals as
// content lands, or replace the whole entry with a bespoke component.

const ACCENT = '#2CA152';
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
            <p className="mb-4 font-sans font-medium text-sm tracking-[-0.02em]" style={{ color: ACCENT }}>
              Case study · in progress
            </p>
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

export const MeraBills = makeStub({
  title: 'MeraBills',
  tag: 'MeraBills · Mobile · Behavioural design',
  premise: 'A bookkeeping app for low-literacy, low-trust micro-businesses in India — where the calculator metaphor failed and UPI won.',
  sections: [
    { act: 'Problem', heading: 'Businesses without proof', note: 'Millions of real businesses whose records live in notebooks, memory, and WhatsApp. — adapt from the low-literacy essay.' },
    { act: 'Process', heading: 'The metaphor that failed', note: 'A calculator that suddenly developed career ambitions, and why it didn’t land. — content coming.' },
    { act: 'Process', heading: 'What worked: UPI', note: 'Meeting people where their tech literacy already was. — content coming.' },
    { act: 'Outcome', heading: 'Reach', note: '2,000+ users, ~1,000–1,500 active; evolving into a small-business OS. — content coming.' },
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

export const Deterge = makeStub({
  title: 'Deterge',
  tag: 'Mobile · University venture',
  premise: 'A laundry app — and the business we tried to run during university.',
  sections: [
    { act: 'The idea', heading: 'Laundry, on demand', note: 'What we set out to build and run. — content coming.' },
    { act: 'The app', heading: 'Booking a wash', note: 'The core flow. — content coming.' },
    { act: 'What we learned', heading: 'Running it for real', note: 'Lessons from trying to run the business. — content coming.' },
  ],
});

export const Verizon = makeStub({
  title: 'Verizon',
  tag: 'Mobile · Retail ops · Porting from Medium',
  premise: 'A retail / warehouse stock-management scanner app. Full write-up porting from Medium.',
  sections: [
    { act: 'The task', heading: 'Scan, pick, log', note: 'Stock management on the warehouse floor. — content coming.' },
    { act: 'The flow', heading: 'Rack picking', note: 'The scanning flow, step by step. — content coming.' },
  ],
});
