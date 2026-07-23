'use client';

import { CaseStudyLayout } from './case-study-layout';
import { P } from './prose';
import { AsciiPanel } from './controls/ascii-panel';
import type { CaseStudySection } from './types';

// Lightweight scaffolds for case studies that don't have screens yet. Each is a
// real, navigable page: header + planned sections, with an ASCII flow in the
// preview panel describing the work. Swap the ASCII for real visuals as content
// lands, or replace the whole entry with a bespoke component.

const MUTED = 'rgba(237,234,224,0.4)';

type StubSection = { heading: string; note: string; ascii: string };
type StubConfig = { title: string; tag: string; premise: string; sections: StubSection[] };

function makeStub(cfg: StubConfig) {
  const sections: CaseStudySection[] = cfg.sections.map((s, i) => ({
    id: `s${i}`,
    heading: s.heading,
    body: <P>{s.note}</P>,
    visual: { kind: 'component', render: () => <AsciiPanel art={s.ascii} /> },
    caption: 'Flow sketch',
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
    {
      heading: 'Personalization at scale',
      note: 'How Insider combined past activity, real-time triggers, and predictive insight to tailor web experiences for global brands. — content coming.',
      ascii: `  past activity  --+
  real-time      --+-->  [ PERSONALIZE ]  -->  convert
  predictive     --+`,
    },
    {
      heading: 'The Social Proof module',
      note: 'Six research-backed persuasion patterns, from real-time stats to trust badges, grounded in Yelp / Nielsen / VWO data. — content coming.',
      ascii: `  THE SOCIAL PROOF MODULE
  +----------------------------+
  |  real-time stats           |
  |  reviews                   |
  |  social metrics            |
  |  influencer halo           |
  |  trust badges              |
  |  milestones                |
  +----------------------------+
     Yelp  .  Nielsen  .  VWO`,
    },
    {
      heading: 'What it moved',
      note: 'Conversion impact and where it shipped. — metrics to add.',
      ascii: `  before  -->  [ + lift % ]  -->  after
            ( metrics to add )`,
    },
  ],
});

export const TactileCore = makeStub({
  title: 'Tactile Core',
  tag: 'Tactile Games · Strategy · LiveOps & monetization',
  premise: 'LiveOps and game events for Tactile’s match/puzzle games — engaging players without feeling pay-to-win. The events my team and I designed generated over $10M.',
  sections: [
    {
      heading: 'Monetize without breaking trust',
      note: 'The core tension: events that engage players without feeling play-to-win or intrusive. — content coming.',
      ascii: `            PLAYER
              |
          [  FUN  ]
              |
       engaged? --yes-->  [ MONETIZE ]
              |                 |
              +----- trust <----+
          ( never pay-to-win )`,
    },
    {
      heading: 'Fail-state offers',
      note: 'Upsells at the moment of purchase intent — “Out of Time (+60s)”, “Out of Space” — with tiered pricing. Paywall and friction-reduction design. — content coming.',
      ascii: `  OUT OF TIME        OUT OF SPACE
  +----------+        +----------+
  |  +60s    |        |  clear   |
  |  900     |        |  900     |
  +----+-----+        +-----+----+
       |  purchase intent  |
       +--------+----------+
                v
    [ pack ]  [ $6.99 ]  [ $19.99 ]`,
    },
    {
      heading: 'The booster economy',
      note: 'Reward loops like the Shopping Gift progression that keep players moving without pushing. — content coming.',
      ascii: `   Level 22 — Shopping Gift

      O  O  O   -->   *  *  *
      0 / 3           3 / 3
                        |
                        v
                  booster unlock`,
    },
    {
      heading: 'Benchmark → gap → offer',
      note: 'Systematic teardowns against Royal Match, Match Factory, Triple Match and more, turned into proposed offers. — content coming.',
      ascii: `  CURRENT   |   COMPETITOR    |  PROPOSED
  ----------+-----------------+----------
   offer    |  Royal Match    |   new
            |  Match Factory  |   offer
            |
       \\_______ gap _________/
                  v
             fill the gap`,
    },
    {
      heading: '$10M+ generated',
      note: 'Over $10M of monetization business from events my team and I designed; led two designers. — metrics to add.',
      ascii: `     events we designed
              |
              v
        +-----------+
        |   $10M +  |
        +-----------+
       led 2 designers`,
    },
  ],
});

export const FolioOfJoy = makeStub({
  title: 'Folio of Joy',
  tag: 'Personal · Web · This site',
  premise: 'Designing the portfolio you’re reading — the system, the type, and the small joys.',
  sections: [
    {
      heading: 'A folio, not a template',
      note: 'What I wanted this site to feel like. — content coming.',
      ascii: `      x  template
      +---------------+
      |    a folio    |
      +---------------+`,
    },
    {
      heading: 'Type, colour, motion',
      note: 'The editorial dark system, the pixel / mono / sans trio, the dither reveal. — content coming.',
      ascii: `  Galeria  .  Praktikal  .  Geist Pixel
  ------ one green accent ------
  dither reveal   :::::.....`,
    },
    {
      heading: 'The small joys',
      note: 'The Zen player, the reel, the hand-built controls. — content coming.',
      ascii: `  Zen player  |  the reel  |  controls`,
    },
  ],
});

export const Pitzsa = makeStub({
  title: 'Pitzsa',
  tag: 'Web · Brief to come',
  premise: 'Case study premise to come — brief, role, and outcome to be added.',
  sections: [
    {
      heading: 'Overview',
      note: 'Add the premise, your role, and the outcome. — placeholder.',
      ascii: `        PITZSA
       +--------+
       |   ?    |
       +--------+
     brief to come`,
    },
    {
      heading: 'The work',
      note: 'Add the key screens and the decisions behind them. — placeholder.',
      ascii: `   [ screens ]   [ decisions ]
         to be added`,
    },
  ],
});
