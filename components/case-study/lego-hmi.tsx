'use client';

import { Reveal } from '@/components/reveal';
import { Statement } from './shared/statement';
import { MarqueeWall } from './shared/marquee-wall';
import { HighlightBanner } from './shared/highlight-banner';
import { FaqAccordion } from './shared/faq-accordion';
import { PhoneRow } from './shared/phone-row';
import { SEP } from './shared/case-credits';
import { CaseShell, SectionIntro, sectionId } from './shared/case-shell';
import { ScaleHero } from './shared/scale-hero';
import { ScrollDeviceStory, type StoryStep } from './shared/scroll-device-story';
import { CloserLook, type CloserItem } from './shared/closer-look';
import { DeconstructBento, type DeconstructTile } from './shared/deconstruct-bento';
import { BeforeAfter } from './shared/before-after';
import { JOY } from './team';

// LEGO Moulding — tablet HMI on the Apple-style kit, in Tactile Create's shape
// (statement → hero lineup → pinned story → closer look → taken apart), with a
// phone companion and a before/after of the original Stopcode app. Facts come
// from the project files (_case-studies/toptal/lego-moulding-hmi.md and the
// original screens in reference/).

const IMG = '/work/lego-hmi';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;
const TAB = 16 / 10;

const TOC = ['Overview', 'On the machine', 'An alarm, start to finish', 'In the hall', 'Up close', 'Taken apart', 'In your pocket', 'Before and after', 'Every screen', 'FAQ'];

const STATEMENT = [
  'Every LEGO brick starts in an injection-moulding machine, and operators keep those machines running.',
  'When one stops, someone has to say why, with a stop code, or the production data is wrong.',
  'The client’s success criterion was blunt: set a stop code in two clicks or less.',
];

const t = (file: string, alt: string, live?: string) => ({ src: `${KIT}/${file}.webp`, alt, ...(live ? { live: `${LIVE}/${live}`, width: 1280 } : {}) });

const TABLET = [
  t('screen-01-machine-overview', 'Machine overview: order, process values and the mould-card check', '01-overview.html'),
  t('screen-02-alarm-stop-code', 'Alarm E-2041 with the suggested stop code'),
  t('screen-03-stop-code-set', 'Stop code set to Breakdown'),
  t('screen-04-add-elog-entry', 'Add eLog entry'),
  t('screen-05-elog', 'The machine’s eLog'),
  t('screen-06-run-in', 'Run-in: settings wired to results'),
  t('screen-07-run-in-in-tolerance', 'Run-in, every result in tolerance'),
];

const STEPS: StoryStep[] = [
  {
    title: 'The machine, at a glance',
    body: 'The current order and its progress, live cycle time, cushion, mass temperature and cooling time, and a mould-card check that flags drift before it becomes scrap.',
    screen: TABLET[0],
  },
  {
    title: 'It stops. The screen says why',
    body: 'Hot runner zone 3 is over temperature. The alarm shows the trend behind it and three things to check, with the stop codes right beside it.',
    screen: TABLET[1],
  },
  {
    title: 'Two taps',
    body: 'The likely code comes preselected from the alarm. Pick it, confirm it. That is the brief, met.',
    screen: TABLET[2],
  },
  {
    title: 'Log it while it’s fresh',
    body: 'One sheet: type, reason, action, elements OK or not, a photo and a comment. The types are LEGO’s own: Quality, Mould, Equipment, Information.',
    screen: TABLET[3],
  },
  {
    title: 'The next shift reads it',
    body: 'New entries land on top of the machine’s log, so the shift after yours sees what happened instead of guessing.',
    screen: TABLET[4],
  },
  {
    title: 'Then tune the next run',
    body: 'Settings on the left, results on the right, wired together. Nudge injection speed and the results it affects light up with where they’ll land.',
    screen: TABLET[5],
  },
];

const CLOSER: CloserItem[] = [
  { label: 'Alarm to eLog', body: 'The whole loop in one take: the alarm, the stop code, then the eLog entry that explains it.', screen: { src: `${IMG}/reel-alarm-to-elog.mp4` } },
  { label: 'Cause and effect', body: 'Injection speed from 45 to 52. The predictions move into their green bands, and the test shot confirms them.', screen: { src: `${IMG}/reel-run-in.mp4` } },
  { label: 'Drift, caught early', body: 'Each process value sits next to what the mould card says it should be. Cooling time at 6.8 s against 6.0 is flagged before it turns into scrap.', screen: { src: `${KIT}/detail-process-kpi.webp` } },
  { label: 'Sized for gloves', body: 'Carbon’s number input at full touch size, with the change since the last shot next to it.', screen: { src: `${KIT}/detail-number-input.webp` } },
  { label: 'From the phone', body: 'The same alarm arrives as a push. Set stop code opens the sheet with the suggested code already picked.', screen: { src: `${IMG}/reel-mobile-stop-code.mp4` } },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'anatomy',
    span: 'full',
    title: 'Run-in, wired',
    blurb: 'The idea from the original run-in screen, done properly: every setting is connected to the results it moves.',
    src: `${KIT}/run-in-anatomy.webp`,
    ratio: 2128 / 1000,
    pins: [
      { x: 37.8, y: 38, label: 'The setting you changed, and by how much' },
      { x: 47.5, y: 25, label: 'A wire to each result it affects' },
      { x: 70.5, y: 15.7, label: 'The tolerance band and the target' },
      { x: 88, y: 15.7, label: 'Where the next shot should land' },
    ],
  },
  {
    kind: 'exploded',
    span: 'half',
    title: 'The stop code panel, in layers',
    blurb: 'Five layers of the real component: surface, instruction, the suggested code, the rest, and one confirm.',
    ratio: 896 / 1148,
    layers: [
      { src: `${KIT}/codes-layer-0.webp`, label: 'Panel' },
      { src: `${KIT}/codes-layer-1.webp`, label: 'Two taps: pick a reason, confirm' },
      { src: `${KIT}/codes-layer-2.webp`, label: 'Suggested from the alarm' },
      { src: `${KIT}/codes-layer-3.webp`, label: 'Other VITS codes' },
      { src: `${KIT}/codes-layer-4.webp`, label: 'Acknowledge or set' },
    ],
  },
  {
    kind: 'palette',
    span: 'half',
    title: 'IBM Carbon, as it comes',
    blurb: 'Official Carbon components and one blue for action, so it sits with the rest of the factory’s IT. Red and green only mean alarm and in tolerance.',
    font: { family: 'IBM Plex Sans', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@600&display=swap', sample: '268', note: 'Plex Sans + Mono' },
    swatches: [
      { hex: '#0F62FE', name: 'Blue 60' },
      { hex: '#161616', name: 'Gray 100' },
      { hex: '#393939', name: 'Gray 80' },
      { hex: '#C6C6C6', name: 'Gray 30' },
      { hex: '#F4F4F4', name: 'Gray 10' },
      { hex: '#DA1E28', name: 'Red 60' },
      { hex: '#24A148', name: 'Green 50' },
      { hex: '#FFFFFF', name: 'White' },
    ],
  },
  {
    kind: 'states',
    span: 'full',
    title: 'Before the shot, and after',
    blurb: 'The same run-in screen with two results out of tolerance, then with every result in its band.',
    ratio: TAB,
    items: [
      { src: `${KIT}/screen-06-run-in.webp`, label: 'Predicting' },
      { src: `${KIT}/screen-07-run-in-in-tolerance.webp`, label: 'In tolerance' },
    ],
  },
];

const PHONES = [
  ['screen-08-mobile-alarm-push', 'Alarm push'],
  ['screen-09-mobile-machine-hall', 'Machine hall'],
  ['screen-10-mobile-machine-detail', 'Machine detail'],
  ['screen-11-mobile-set-stop-code', 'Set stop code'],
  ['screen-13-mobile-elog-feed', 'eLog feed'],
  ['screen-14-mobile-add-elog-entry', 'New eLog entry'],
  ['screen-15-mobile-changeover-checklist', 'Changeover checklist'],
  ['screen-16-mobile-shift-handover', 'Shift handover'],
].map(([f, alt]) => ({ src: `${KIT}/${f}.webp`, alt }));

const AFTER_ROW = TABLET.map((s) => ({ src: s.src, caption: `After · ${s.alt}` }));
const BEFORE_ROW = [
  ['original-v1-01', 'Select a module'],
  ['original-v1-03', 'Pending changeovers'],
  ['original-v1-06', 'Mount mould'],
  ['original-v1-08', 'Jobs as a grid'],
  ['original-v1-09', 'Job details'],
  ['original-runin-1', 'Run-in'],
  ['original-runin-5', 'Run-in, injection speed wired'],
].map(([f, caption]) => ({ src: `${KIT}/${f}.webp`, caption: `Before · ${caption}` }));

const FAQ = [
  {
    q: 'What was your role?',
    a: (
      <>
        <p>
          UX/UI designer at GGK, working with LEGO’s operations and IT stakeholders over two phases. In phase one I worked on
          the Operator Control app, known as Stopcode: scan a machine, pick a stop code, confirm.
        </p>
        <p>
          In phase two I designed the moulding flows: pending changeovers, mounting a mould, and the run-in screen where
          operators tune settings until parts are in tolerance.
        </p>
      </>
    ),
  },
  {
    q: 'Who was it for?',
    a: 'The client’s persona was a machine-repair technician in his mid-fifties with 20 years on the floor. To him a stop code isn’t software, it’s a physical box on the machine. So the screen had to work with gloves on, at arm’s length, next to a noisy machine.',
  },
  {
    q: 'What did you design from?',
    a: 'LEGO’s decks, user stories, their Q&A sheet and a recorded eLog walkthrough. The paper changeover sheet and the mould card showed what operators actually check, and the four stages of the flow come straight from the real job: pending changeovers, things to remember, mount mould, run-in.',
  },
  {
    q: 'Why IBM Carbon?',
    a: 'Consistency with factory IT, and accessibility built in. Carbon’s components are used as they come, at touch size, with LEGO’s own vocabulary on top: Q, M, E and I entry types, VITS stop codes, mould numbers and granulates.',
  },
  // ASK JOY: was it tested with operators on the floor? what shipped from phase two? anything you'd do differently?
];

export function LegoHmi() {
  return (
    <CaseShell
      title="LEGO Moulding"
      lede="A tablet on every moulding machine, and a phone in the operator’s pocket: stop codes in two taps, a digital eLog, and a run-in you can reason about."
      people={[JOY]}
      meta={
        <>
          GGK{SEP}2018–19
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
                LEGO moulds its bricks on rows of injection-moulding machines. Operators change moulds, dial in new runs,
                log problems and set stop codes, and much of that lived on paper sheets, physical boxes and a basic phone
                app. At GGK I designed the operator tools: stop codes, a digital eLog, and the changeover and run-in flow.
              </>
            }
          />

          <Reveal>
            <SectionIntro heading="Run the machine. Log what happened.">
              A rugged tablet mounted on each machine, built on IBM Carbon. Seven screens, one machine, one alarm on hot
              runner zone 3.
            </SectionIntro>
          </Reveal>
          <ScaleHero id={sectionId('On the machine')} kind="tablet" ratio={TAB} screens={TABLET} />

          <ScrollDeviceStory
            id={sectionId('An alarm, start to finish')}
            kind="tablet"
            ratio={TAB}
            steps={STEPS}
            intro={
              <SectionIntro heading="See it, stop it, log it, tune it.">
                The full operator loop on one screen: see the problem, stop the machine with the right code, log what
                happened, and set up the next run.
              </SectionIntro>
            }
          />

          <HighlightBanner
            id={sectionId('In the hall')}
            src={`${IMG}/reel-in-context.mp4`}
            title="Where it lives"
            blurb="On the moulding machine’s control unit, between the machine’s own status strip and its soft keys. Big targets and numbers you can read from a step back."
            aspect="aspect-[4/3] md:aspect-[16/9]"
            onOpen={open}
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The run-in and the stop code panel carry most of the product. The layers and pins are captures of the real HTML screens."
            tiles={PARTS}
            onOpen={open}
          />

          <section id={sectionId('In your pocket')} className="scroll-mt-24 pt-16 md:pt-24">
            <Reveal>
              <SectionIntro heading="And in your pocket.">
                A phone companion for walking the hall: the alarm as a push, every machine at a glance, the same
                stop code sheet, the eLog, changeover checklists and a shift handover.
              </SectionIntro>
            </Reveal>
          </section>
          <PhoneRow items={PHONES} cardClass="w-[38vw] max-w-[170px] shrink-0 md:w-[11vw] md:max-w-[180px]" aspect="aspect-[390/844]" />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="phone"
            ratio={3192 / 5672}
            heading="Same job, fewer steps."
            blurb="The original Stopcode app, and the stop code sheet on the phone. Drag across to compare."
            before={{ src: `${KIT}/before-stopcode.webp`, label: 'Before' }}
            after={{ src: `${KIT}/screen-11-mobile-set-stop-code.webp`, label: 'After' }}
            facts={[
              { label: 'Finding the machine', before: 'Search or scan its barcode', after: 'The alarm push opens it' },
              { label: 'Choosing a code', before: 'A list of valid stop codes', after: 'The likely code suggested from the alarm' },
              { label: 'Remember machine', before: 'A toggle', after: 'A toggle, kept' },
            ]}
          />

          <section id={sectionId('Every screen')} className="scroll-mt-24 pt-8">
            <SectionIntro heading="Every screen, and where it came from." className="mb-10">
              The tablet screens over the original phase-two flows. Hover to slow it down, click to open one.
            </SectionIntro>
          </section>
          <MarqueeWall
            rows={[AFTER_ROW, BEFORE_ROW]}
            aspect="aspect-[16/10]"
            cardClass="w-[78vw] max-w-[520px] sm:w-[40vw]"
            durationsMs={[56000, 64000]}
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
