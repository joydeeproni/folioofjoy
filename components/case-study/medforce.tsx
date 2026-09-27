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

// MedForce — web case study on the Apple-style kit (Tactile Create's shape:
// statement → hero lineup → story → closer look → the parts → before and
// after → every screen → the speaker side → FAQ). Facts come from the project
// notes (Redesigns/_case-studies/toptal/medforce.md and index.html).

const IMG = '/work/medforce';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;
const URL = 'MedForce · Rep portal';
const RATIO = 1440 / 960;

const TOC = ['Overview', 'Two portals', 'A program’s life', 'Up close', 'Taken apart', 'Before and after', 'Every screen', 'FAQ'];

const STATEMENT = [
  'Pharma companies run thousands of speaker programs a year: a trained doctor presents to other doctors over lunch, dinner or a webinar.',
  'Every step of every program has compliance rules.',
  'The portals mirrored the back office, not the rep’s day. Status was a coloured dot, and reps had to hunt for what needed them.',
];

const SCREENS = [
  { src: `${KIT}/screen-01-rep-dashboard.webp`, live: `${LIVE}/01-dashboard.html`, alt: 'Rep dashboard' },
  { src: `${KIT}/screen-02-program-closed.webp`, alt: 'Dashboard, program closed' },
  { src: `${KIT}/screen-03-programs-calendar.webp`, alt: 'Programs calendar' },
  { src: `${KIT}/screen-04-request-program.webp`, alt: 'Request a program' },
  { src: `${KIT}/screen-05-speaker-directory.webp`, alt: 'Speaker directory' },
  { src: `${KIT}/screen-07-speaker-portal-home.webp`, alt: 'Speaker portal home' },
  { src: `${KIT}/screen-08-speaker-contract-w9.webp`, alt: 'Speaker contract, W-9 step' },
];

const STEPS: StoryStep[] = [
  {
    title: 'Start with the work',
    body: 'The dashboard opens on what needs you: close this program, confirm that speaker, chase that venue. One verb each. Next to it, the quarter’s budget by brand and spend against plan.',
    screen: SCREENS[0],
  },
  {
    title: 'A track, not a dot',
    body: 'Every program moves through five states: requested, approved, confirmed, occurred, closed. A small track shows where each one sits and what comes next, in every table and preview.',
    screen: SCREENS[1],
  },
  {
    title: 'A month at a glance',
    body: 'A calendar coloured by state. Pick a program and its preview opens: the lifecycle steps, the speaker and venue, and the cost breakdown.',
    screen: SCREENS[2],
  },
  {
    title: 'Eight steps, no budget surprises',
    body: 'The long request form became a wizard. The speaker step only shows doctors trained on the topic and free that day. A side panel keeps the summary, the budget left after this request, and the compliance checks.',
    screen: SCREENS[3],
  },
  {
    title: 'Speakers who can actually come',
    body: 'A directory filtered by brand, availability and distance, with each speaker’s completed, pending and cancelled programs on the card.',
    screen: SCREENS[4],
  },
  {
    title: 'Then, the other side',
    body: 'Speakers get their own portal, in the sky blue from the original palette: the next program with time, venue, host and itinerary, recent payments, and alerts.',
    screen: SCREENS[5],
  },
  {
    title: 'Contracting in plain words',
    body: 'Onboarding walks through profile, W-9, direct deposit and signature. The W-9 step explains each tax choice in a line and says why it’s needed.',
    screen: SCREENS[6],
  },
];

const CLOSER: CloserItem[] = [
  { label: 'Close a program', body: 'Close it from the queue. The item leaves the list and the program’s track moves to Closed.', screen: { src: `${IMG}/reel-close.mp4` } },
  { label: 'Choose a speaker', body: 'Pick a speaker and the summary updates, with the cost and what’s left of the quarter’s budget.', screen: { src: `${IMG}/reel-speaker.mp4` } },
  { label: 'Needs your action', body: 'One queue, one verb per item: close, review, call.', screen: { src: `${KIT}/detail-needs-action.webp` } },
  { label: 'Program preview', body: 'The lifecycle with its dates, the speaker, the venue and the coordinator, then every dollar attached to the program.', screen: { src: `${KIT}/detail-program-preview.webp` } },
  { label: 'The budget', body: 'What’s left this quarter, split by brand, next to the year’s spend against plan.', screen: { src: `${KIT}/detail-budget.webp` } },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'anatomy',
    span: 'full',
    title: 'Who’s presenting?',
    blurb: 'The speaker step of a request. It only lists doctors who are trained on the topic and free that day.',
    src: `${KIT}/speaker-card.webp`,
    ratio: 1148 / 288,
    pins: [
      { x: 27, y: 56.5, label: 'How far they are from the venue' },
      { x: 60, y: 77, label: 'Trained on this topic, and how often they’ve presented' },
      { x: 79.5, y: 42.7, label: 'Free that night' },
      { x: 86.5, y: 60.8, label: 'One pick, with an alternate if you want one' },
    ],
  },
  {
    kind: 'exploded',
    span: 'full',
    title: 'The dashboard, in layers',
    blurb: 'Navigation, then the budget, then the work queue, then the programs. Four layers of the real screen.',
    ratio: RATIO,
    layers: [
      { src: `${KIT}/dash-layer-0.webp`, label: 'Navigation' },
      { src: `${KIT}/dash-layer-1.webp`, label: 'Greeting and budget' },
      { src: `${KIT}/dash-layer-2.webp`, label: 'Needs your action' },
      { src: `${KIT}/dash-layer-3.webp`, label: 'Upcoming programs' },
    ],
  },
  {
    kind: 'states',
    span: 'half',
    title: 'Five states, one track',
    blurb: 'The same component in every table, preview and calendar. Amber flags a program that has happened but still needs closing.',
    ratio: 520 / 200,
    items: [
      { src: `${KIT}/life-0.webp`, label: 'Requested' },
      { src: `${KIT}/life-1.webp`, label: 'Approved' },
      { src: `${KIT}/life-2.webp`, label: 'Confirmed' },
      { src: `${KIT}/life-3.webp`, label: 'Occurred' },
      { src: `${KIT}/life-4.webp`, label: 'Closed' },
    ],
  },
  {
    kind: 'palette',
    span: 'half',
    title: 'Two portals, one palette',
    blurb: 'Navy for the rep portal and sky blue for the speaker portal, both from MedForce’s original colours. Green, amber and rose only ever mean a state.',
    font: { family: 'Plus Jakarta Sans', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&display=swap', sample: '$3,456', note: 'Tabular figures' },
    swatches: [
      { hex: '#1F5AA3', name: 'Navy' },
      { hex: '#0F2A4F', name: 'Navy 900' },
      { hex: '#E3ECF8', name: 'Navy 100' },
      { hex: '#3098D0', name: 'Sky' },
      { hex: '#DDF0FA', name: 'Sky 100' },
      { hex: '#3A7D18', name: 'Green' },
      { hex: '#B26A00', name: 'Amber' },
      { hex: '#C23F4F', name: 'Rose' },
    ],
  },
];

const FAQ = [
  {
    q: 'What was your role in this?',
    a: 'At GGK I was the UX/UI designer on both portals: the Allergan rep portal (dashboard, programs, request flow, speakers, reports, resources, hub events) and the Genentech speaker portal (dashboard, programs, presentations, training, contracts, direct deposit, payments). I worked with the GGK design team and MedForce’s product and client-services leads, and helped plan and run the research.',
  },
  {
    q: 'How did you research it?',
    a: 'A survey and a questionnaire for reps, and usability reviews of the existing client portal, run session by session. We mapped the original flows, including venue selection and programs with several topics and speakers, before changing anything.',
  },
  // ASK JOY: what shipped and how it landed with reps/speakers; hardest design challenge; what you'd do differently; design stack at the time.
];

export function MedForce() {
  return (
    <CaseShell
      title="MedForce"
      lede="Two portals for pharma speaker programs: one for the reps who run them, one for the doctors who present."
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
                MedForce runs speaker programs for pharma brands like Allergan and Genentech. Reps request and manage
                them. Speakers sign contracts, prepare decks and get paid. At GGK I designed both sides: a portal for the
                reps and one for the speakers, organised around a single program lifecycle.
              </>
            }
          />

          <Reveal>
            <SectionIntro heading="Every program, from request to closed.">
              Two portals on one model. Navy for reps, sky blue for speakers. Scroll to line them up.
            </SectionIntro>
          </Reveal>
          <ScaleHero id={sectionId('Two portals')} kind="browser" url={URL} ratio={RATIO} screens={SCREENS} />

          <ScrollDeviceStory
            id={sectionId('A program’s life')}
            kind="browser"
            url={URL}
            ratio={RATIO}
            steps={STEPS}
            intro={
              <SectionIntro heading="Where is my program?">
                Reps couldn’t tell where a program stood without opening it. Follow one through a quarter, then switch sides to the speaker.
              </SectionIntro>
            }
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The speaker card, the dashboard and the one component every screen shares. All captured from the real HTML screens."
            tiles={PARTS}
            onOpen={open}
          />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="browser"
            url={URL}
            ratio={RATIO}
            heading="The rep dashboard, before and after."
            blurb="Same rep, same programs. Drag across to compare."
            before={{ src: `${KIT}/before-dashboard.webp`, label: 'Before' }}
            after={{ src: `${KIT}/screen-01-rep-dashboard.webp`, label: 'After' }}
            facts={[
              { label: 'Where a program stands', before: 'A coloured dot and a word', after: 'A five-step track, requested to closed' },
              { label: 'What needs you', before: 'Program cards with a small button', after: 'A queue with one clear verb per item' },
              { label: 'Budget', before: 'A pie chart', after: 'A meter by brand, and spend against plan' },
            ]}
          />

          <section id={sectionId('Every screen')} className="scroll-mt-24 pt-8">
            <SectionIntro heading="Every screen." className="mb-10">
              Dashboard, calendar, request, speakers, then the speaker portal and its contract. Hover to slow it down,
              click to open one.
            </SectionIntro>
          </section>
          <MarqueeWall
            rows={[SCREENS.map((s) => ({ src: s.src, caption: s.alt }))]}
            aspect="aspect-[3/2]"
            cardClass="w-[78vw] max-w-[560px] sm:w-[42vw]"
            durationsMs={[52000]}
            onOpen={open}
          />

          <HighlightBanner
            src={`${KIT}/speaker-portal-board.webp`}
            title="And the doctor on stage"
            blurb="The speaker portal home: the next program with its venue and people, fees so far this year, alerts, and the decks to present."
            aspect="aspect-[4/3] md:aspect-[16/9]"
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
