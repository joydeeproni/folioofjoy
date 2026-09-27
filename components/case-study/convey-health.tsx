'use client';

import { Statement } from './shared/statement';
import { MarqueeWall } from './shared/marquee-wall';
import { HighlightBanner } from './shared/highlight-banner';
import { FaqAccordion } from './shared/faq-accordion';
import { SEP } from './shared/case-credits';
import { CaseShell, SectionIntro, sectionId } from './shared/case-shell';
import { ScaleHero } from './shared/scale-hero';
import { ScrollDeviceStory, type StoryStep } from './shared/scroll-device-story';
import { CloserLook, type CloserItem } from './shared/closer-look';
import { DeconstructBento, type DeconstructTile } from './shared/deconstruct-bento';
import { BeforeAfter } from './shared/before-after';
import { Reveal } from '@/components/reveal';
import { JOY } from './team';

// Convey Health — web case study on the Apple-style kit (Tactile Create's
// shape: statement → hero that settles into a lineup → story → closer look →
// the parts → before and after → every screen → FAQ). Facts come from the
// project files and usability report.

const IMG = '/work/convey-health';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;
const URL = 'Convey · Plan finder';

const TOC = ['Overview', 'The plan finder', 'How it flows', 'Up close', 'Taken apart', 'Before and after', 'Every screen', 'FAQ'];

const STATEMENT = [
  'Choosing a Medicare plan is a big decision, made once a year, usually by someone turning 65.',
  'Every plan leads with a different number. Premium, deductible, network.',
  'None of them answer the question people actually ask: what will this cost me this year, with my drugs and my doctor?',
];

const SCREENS = [
  { src: `${KIT}/screen-01-plan-results.webp`, live: `${LIVE}/01-plans.html`, alt: 'Plan results with the yearly cost summary' },
  { src: `${KIT}/screen-02-drug-cabinet.webp`, alt: 'Drug cabinet' },
  { src: `${KIT}/screen-03-find-doctors.webp`, alt: 'Find your doctors' },
  { src: `${KIT}/screen-04-compare-plans.webp`, alt: 'Compare three plans' },
  { src: `${KIT}/screen-05-enroll-payment.webp`, alt: 'Enrollment, payment step' },
  { src: `${KIT}/screen-06-confirmation.webp`, alt: 'Application submitted' },
];

// panRatio = full screenshot height ÷ width, so the long pages scroll inside the browser.
const STEPS: StoryStep[] = [
  {
    title: 'Start with your drugs',
    body: 'Add a drug, pick the dosage and the package. If a generic exists, a card says so and shows what it saves each month.',
    screen: SCREENS[1],
    panRatio: 1433 / 1600,
  },
  {
    title: 'Plans lead with the yearly cost',
    body: 'Each plan opens on the estimated cost for the year, then premium and deductibles. Chips say plainly whether your drugs and your doctor are covered.',
    screen: SCREENS[0],
    panRatio: 1527 / 1600,
  },
  {
    title: 'Keep the doctors you trust',
    body: 'Search by name, specialty or clinic, and see which plans have that doctor in network before you pick one.',
    screen: SCREENS[2],
    panRatio: 1240 / 1600,
  },
  {
    title: 'Compare up to three',
    body: 'Check plans from the list and a tray fills at the bottom. The comparison is priced for your drugs, at your pharmacy, with your doctor.',
    screen: SCREENS[3],
    panRatio: 1507 / 1600,
  },
  {
    title: 'Enroll without calling anyone',
    body: 'Six steps, saved as you go: applicant, election period, other coverage, payment, representative, authorize. A licensed agent is one call away on each.',
    screen: SCREENS[4],
    panRatio: 1289 / 1600,
  },
  {
    title: 'Then, what happens next',
    body: 'A confirmation number, the date coverage starts, and a tracker from Medicare review to the member ID card in the post.',
    screen: SCREENS[5],
    panRatio: 1180 / 1600,
  },
];

const CLOSER: CloserItem[] = [
  { label: 'A summary that keeps score', body: 'A receipt follows you through the flow. Add a drug or a doctor and the yearly estimate updates in place.', screen: { src: `${KIT}/detail-summary-receipt.webp` } },
  { label: 'Switch and save', body: 'When a generic exists, one tap switches it and the receipt ticks down in front of you. In the example, Lipitor to atorvastatin.', screen: { src: `${IMG}/reel-generic.mp4` } },
  { label: 'The plan card', body: 'Yearly cost first and biggest. Premium and deductibles next to it. Coverage for your drugs and doctor in plain words underneath.', screen: { src: `${KIT}/detail-plan-card.webp` } },
  { label: 'Compare, from anywhere', body: 'Check a second plan and the tray invites you to compare, using the product’s own copy: one selected, check another to start comparing.', screen: { src: `${IMG}/reel-compare.mp4` } },
  { label: 'On a phone', body: 'The same plan list on a phone, and a tracker for the application once it’s in.', screen: { src: `${IMG}/reel-mobile.mp4` } },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'anatomy',
    span: 'full',
    title: 'One plan card, five jobs',
    blurb: 'Every plan in the list is the same card. Each part answers one question a 65-year-old actually has.',
    src: `${KIT}/plan-card.webp`,
    ratio: 1400 / 462,
    pins: [
      { x: 31.4, y: 6, label: 'Why this plan is at the top' },
      { x: 16.2, y: 52.7, label: 'The yearly cost, first and biggest' },
      { x: 2.6, y: 81.2, label: 'Coverage for your drugs and doctor, in words' },
      { x: 69.6, y: 71, label: 'Add to compare without leaving the list' },
      { x: 91.8, y: 71, label: 'One primary action' },
    ],
  },
  {
    kind: 'exploded',
    span: 'half',
    title: 'The receipt, in layers',
    blurb: 'Four layers of the real component: the card, the estimate, what it’s made of, and one next step.',
    ratio: 816 / 1024,
    layers: [
      { src: `${KIT}/receipt-layer-0.webp`, label: 'Card surface' },
      { src: `${KIT}/receipt-layer-1.webp`, label: 'Yearly estimate' },
      { src: `${KIT}/receipt-layer-2.webp`, label: 'Drugs, pharmacy, doctors' },
      { src: `${KIT}/receipt-layer-3.webp`, label: 'Continue with this plan' },
    ],
  },
  {
    kind: 'palette',
    span: 'half',
    title: 'Petrol, sage, and big type',
    blurb: 'Convey’s own petrol and sage. Figtree at 16px body, because the people reading it are 64 and up.',
    font: { family: 'Figtree', href: 'https://fonts.googleapis.com/css2?family=Figtree:wght@700&display=swap', sample: '$600', note: '16px body' },
    swatches: [
      { hex: '#32647D', name: 'Petrol' },
      { hex: '#69ACB1', name: 'Sage' },
      { hex: '#1E2830', name: 'Ink' },
      { hex: '#F5F6F6', name: 'Surface' },
      { hex: '#173745', name: 'Petrol 900' },
      { hex: '#E6F2F2', name: 'Sage 100' },
      { hex: '#B8513D', name: 'Coral' },
      { hex: '#D39A2C', name: 'Amber' },
    ],
  },
];

const FAQ = [
  {
    q: 'What was your role in this?',
    // ASK JOY: team size, and who else was on it at GGK (research, BA, dev)?
    a: 'At GGK I designed the online plan finder and enrollment portal for Convey Health: the flows, prototypes and screens, from drug cabinet to enrollment.',
  },
  {
    q: 'How did you test it?',
    a: (
      <>
        <p>
          Three phases of prototypes. The first round went to seven participants in April 2018: six scenario tasks, task
          time, a post-task questionnaire, SUS, and a click heatmap on plan details.
        </p>
        <p>
          Comparing plans: 100% completion. Building a drug cabinet: 86%. Understanding the plan types: 29%. Eligibility:
          57%. People liked the floating summary and asked for plainer words, which is most of what changed next.
        </p>
      </>
    ),
  },
  // ASK JOY: design stack in 2018; hardest design challenge; what you learned / would do differently.
];

export function ConveyHealth() {
  return (
    <CaseShell
      title="Convey Health"
      lede="A Medicare plan finder and enrollment portal where your yearly cost is always on screen."
      people={[JOY]}
      meta={
        <>
          GGK{SEP}2018
        </>
      }
      toc={TOC}
    >
      {(open) => (
        <>
          <Statement
            lines={STATEMENT}
            trailing={
              <>
                Convey Health helps health plans sell and run Medicare Advantage and drug plans. At GGK I designed its
                online plan finder and enrollment portal: find your drugs, your pharmacy and your doctors, compare plans,
                and enroll without picking up the phone.
              </>
            }
          />

          <Reveal>
            <SectionIntro heading="Your yearly cost, never off screen.">
              Six screens, one person, three drugs and a doctor. Scroll to line them up.
            </SectionIntro>
          </Reveal>
          <ScaleHero id={sectionId('The plan finder')} kind="browser" url={URL} screens={SCREENS} />

          <ScrollDeviceStory
            id={sectionId('How it flows')}
            kind="browser"
            url={URL}
            steps={STEPS}
            intro={
              <SectionIntro heading="From a pill bottle to a plan.">
                The whole flow follows one person, with three drugs and one doctor, from the first search to the day
                coverage starts.
              </SectionIntro>
            }
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The two components that carry the whole product, pulled apart. The layers are captures of the real HTML component."
            tiles={PARTS}
            onOpen={open}
          />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="browser"
            url={URL}
            heading="The drug cabinet, before and after."
            blurb="The same step, side by side. Drag across to compare."
            before={{ src: `${KIT}/before-drug-cabinet.webp`, label: 'Before' }}
            after={{ src: `${KIT}/screen-02-drug-cabinet.webp`, label: 'After' }}
            facts={[
              { label: 'Where you are', before: 'A step list down the left', after: 'A progress bar across the top' },
              { label: 'Generic drugs', before: 'A keep-or-switch radio pair', after: 'A card with the monthly saving, one tap to switch' },
              { label: 'Cost while you shop', before: 'A summary box', after: 'A receipt that updates on every step' },
            ]}
          />

          <section id={sectionId('Every screen')} className="scroll-mt-24 pt-8">
            <SectionIntro heading="Every screen." className="mb-10">
              Plans, drugs, doctors, compare, enroll, done. Hover to slow it down, click to open one.
            </SectionIntro>
          </section>
          <MarqueeWall
            rows={[SCREENS.map((s) => ({ src: s.src, caption: s.alt }))]}
            aspect="aspect-[16/10]"
            cardClass="w-[78vw] max-w-[560px] sm:w-[42vw]"
            durationsMs={[52000]}
            onOpen={open}
          />

          <HighlightBanner
            src={`${KIT}/mobile-mockup.webp`}
            title="And on the phone in their pocket"
            blurb="The plan list and the application tracker, sized for a phone. Once you hit submit, the tracker texts you at each step."
            aspect="aspect-[4/3] md:aspect-[16/9]"
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
