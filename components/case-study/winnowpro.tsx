'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/reveal';
import { Statement } from './shared/statement';
import { HighlightBanner } from './shared/highlight-banner';
import { FaqAccordion } from './shared/faq-accordion';
import { SEP } from './shared/case-credits';
import { CaseShell, SectionIntro, sectionId } from './shared/case-shell';
import { ScaleHero } from './shared/scale-hero';
import { ScrollDeviceStory, type StoryStep } from './shared/scroll-device-story';
import { CloserLook, type CloserItem } from './shared/closer-look';
import { DeconstructBento, type DeconstructTile } from './shared/deconstruct-bento';
import { BeforeAfter } from './shared/before-after';
import { DeviceFrame, ScreenContent } from './shared/device-frame';
import { FG, MUTED } from './shared/tokens';
import { JOY } from './team';

// WinnowPro — web case study on the Apple-style kit, in Tactile Create's shape:
// statement → the onboarding lineup → the flow, pinned → closer look → the
// report (a long scroll against one screen) → taken apart → before / after →
// FAQ. Facts come from ~/Desktop/Redesigns/09-winnowpro/CASESTUDY.md.

const IMG = '/work/winnowpro';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;
const URL = 'WinnowPro · Onboarding';

const TOC = ['Overview', 'Onboarding', 'Step by step', 'Up close', 'The report', 'Taken apart', 'Before and after', 'FAQ'];

const STATEMENT = [
  'A car dealership signs with WinnowPro to run its ads, its social posts and a chatbot on its website.',
  'Nothing goes live until it hands over access to Google, Facebook and its CRM.',
  'That’s where onboarding stalled. Connections failed, nobody knew which ones mattered, or when the ads would start.',
];

const s = (file: string, alt: string, live?: string) => ({ src: `${KIT}/${file}.webp`, alt, live: live && `${LIVE}/${live}` });

const LINEUP = [
  s('screen-02-share-access', 'Share access, with the launch readiness rail', '02-share-access.html'),
  s('screen-01-select-plan', 'Pick your base plan'),
  s('screen-04-showroom-chat-setup', 'Showroom Chat setup with a live preview'),
  s('screen-06-competitive-intelligence', 'Competitive intelligence report'),
  s('screen-07-access-control', 'Access control across franchises'),
  s('screen-08-user-permissions', 'Permissions per franchise'),
];

const STEPS: StoryStep[] = [
  {
    title: 'Price first',
    body: 'Two plan cards, Ad Services and Showroom Chat, with the monthly fee up front and a running summary beside them. Add-ons stay optional.',
    screen: s('screen-01-select-plan', 'Pick your base plan'),
  },
  {
    title: 'Grouped by why it matters',
    body: 'Connections sit in three groups: Essentials for paid ads, Data 360 for attribution, and Targeting, which is optional. Each group says what it’s for.',
    screen: s('screen-02-share-access', 'Share access'),
  },
  {
    title: 'Every error says how to fix it',
    body: 'Instead of “ERROR. RETRY?”, a failed connection says why it failed and what to do. Retry it and the rail beside the step moves on.',
    screen: s('screen-03-access-connected', 'Share access, with every essential connected'),
  },
  {
    title: 'See what buyers will see',
    body: 'The chatbot is set up next to a preview of the dealer’s own website, so the greeting, colour and position change as you type.',
    screen: s('screen-04-showroom-chat-setup', 'Showroom Chat setup'),
  },
];

const CLOSER: CloserItem[] = [
  { label: 'The launch rail', body: 'Beside every onboarding step: the connections and calls still to do, a go-live date, and the account manager’s name.', screen: { src: `${KIT}/detail-launch-readiness.webp` } },
  { label: 'Retry, and it moves', body: 'Facebook Ads fails, the row says why, and one retry later the rail ticks forward.', screen: { src: `${IMG}/reel-connect.mp4` } },
  { label: 'A plan card', body: 'The monthly fee up front, then exactly what it pays for: paid ads, reporting and social content.', screen: { src: `${KIT}/detail-plan-card.webp` } },
  { label: 'The chat preview', body: 'The greeting a buyer sees on the dealer’s site, in the dealer’s colour, as you set it up.', screen: { src: `${KIT}/detail-showroom-chat.webp` } },
  { label: 'Your rating, in context', body: 'Not just 3.8 out of 5, but what it means next to the dealers around you.', screen: { src: `${KIT}/detail-cit-score.webp` } },
  { label: 'Re-send an invite', body: 'The user list shows status, role and franchises at a glance. A row menu handles the rest.', screen: { src: `${IMG}/reel-invite.mp4` } },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'anatomy',
    span: 'full',
    title: 'One connection group, four jobs',
    blurb: 'Essentials, Data 360 and Targeting are all the same card. This is Essentials, the one paid ads need.',
    src: `${KIT}/essentials.webp`,
    ratio: 958 / 455,
    pins: [
      { x: 44.2, y: 10.5, label: 'How many are connected, and what the group is for' },
      { x: 77.4, y: 10.5, label: 'Progress you can read without opening it' },
      { x: 45.2, y: 75.4, label: 'Why it failed, and what to do about it' },
      { x: 83.8, y: 72.8, label: 'Retry, right where the problem is' },
    ],
  },
  {
    kind: 'exploded',
    span: 'half',
    title: 'The launch rail, in layers',
    blurb: 'Four layers of the real component: the card, the go-live date, what’s left, and a person to ask.',
    ratio: 438 / 618,
    layers: [
      { src: `${KIT}/rail-layer-0.webp`, label: 'Card surface' },
      { src: `${KIT}/rail-layer-1.webp`, label: 'Go-live date and progress' },
      { src: `${KIT}/rail-layer-2.webp`, label: 'What’s left, in order' },
      { src: `${KIT}/rail-layer-3.webp`, label: 'Your account manager' },
    ],
  },
  {
    kind: 'palette',
    span: 'half',
    title: 'Red, navy and yellow',
    blurb: 'WinnowPro’s own brand sheet, stretched into ramps. Manrope throughout.',
    font: { family: 'Manrope', href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@800&display=swap', sample: 'Apr 12', note: 'Go-live date' },
    swatches: [
      { hex: '#EC462F', name: 'Red' },
      { hex: '#093B7D', name: 'Navy' },
      { hex: '#FFE768', name: 'Yellow' },
      { hex: '#1F1F1F', name: 'Ink' },
      { hex: '#FCFBF8', name: 'Paper' },
      { hex: '#FEF3F0', name: 'Red 50' },
      { hex: '#E1E9F5', name: 'Navy 100' },
      { hex: '#1F8A55', name: 'Connected' },
    ],
  },
];

const FAQ = [
  {
    q: 'What was your role in this?',
    // ASK JOY: who else was on it (developers? account managers in reviews?) and how you worked with the founder day to day.
    a: 'I was freelance, March to October 2021, working directly with WinnowPro’s founder. I designed new-client onboarding end to end, the Competitive Intelligence Tool (landing, setup and report, on desktop and mobile), and access control for dealer groups.',
  },
  {
    q: 'How does access work across franchises?',
    a: 'Dealer groups run several franchises. Each user starts from a role, and the role’s permissions can then be adjusted per franchise, so they’re set once and reused.',
  },
  // ASK JOY: what shipped and when; any numbers on onboarding completion or time to live; how it was tested; the hardest call you made; design tools.
];

// The old free report was one very long scroll. Here it pans past in one
// browser while the new report sits still in the other. Local to this page.
function LongReport() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  // Screenshot is 1440×10821; the frame shows 1440×900, so pan ~91.7% of it.
  const pan = `-${(100 * (1 - 900 / 10821)).toFixed(1)}%`;

  return (
    <section id={sectionId('The report')} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <SectionIntro heading="The report on one screen.">
          The free competitive report was a very long scroll of charts. Now one screen tells the story: your rating,
          where you rank locally, who’s around you, search visibility against competitors, and the keywords they win that
          you don’t. The rest unlocks with CIT Pro.
        </SectionIntro>
      </Reveal>
      <Reveal>
        <div
          ref={ref}
          className="relative left-1/2 mt-10 grid w-full -translate-x-1/2 gap-6 md:w-[min(1320px,calc(100vw-8rem))] md:grid-cols-2 md:gap-6"
        >
          <figure>
            <DeviceFrame kind="browser" url="Competitive Intelligence Report" className="w-full">
              <div className="absolute inset-0 overflow-hidden">
                <motion.img
                  src={`${KIT}/before-cit-report.webp`}
                  alt="The competitive intelligence report before: one long page of charts"
                  draggable={false}
                  className="w-full"
                  initial={false}
                  animate={inView && !reduce ? { y: ['0%', pan] } : { y: '0%' }}
                  transition={inView && !reduce ? { duration: 36, ease: 'linear', repeat: Infinity, repeatType: 'reverse', repeatDelay: 1.5 } : { duration: 0 }}
                />
              </div>
            </DeviceFrame>
            <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
              Before
            </figcaption>
          </figure>
          <figure>
            <DeviceFrame kind="browser" url="WinnowPro · Competitive intel" className="w-full">
              <ScreenContent
                kind="browser"
                screen={s('screen-06-competitive-intelligence', 'The competitive intelligence report on one screen', '05-cit.html')}
              />
            </DeviceFrame>
            <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: FG }}>
              After
            </figcaption>
          </figure>
        </div>
      </Reveal>
    </section>
  );
}

export function WinnowPro() {
  return (
    <CaseShell
      title="WinnowPro"
      lede="A marketing platform that gets a car dealership from signed to live campaigns in one sitting."
      people={[JOY]}
      meta={
        <>
          Freelance{SEP}2021
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
                WinnowPro runs digital marketing for car dealerships: paid ads, social posts, a showroom chatbot, and
                reporting on which ads actually sell cars. In 2021, as a freelancer working with the founder, I designed
                three parts of it: new-client onboarding, a competitive intelligence report, and access control for
                dealer groups with several franchises.
              </>
            }
          />

          <Reveal>
            <SectionIntro heading="A dealer doesn’t care about OAuth.">
              They care about when the ads start. So a launch readiness rail sits beside every onboarding step: what’s
              left, a go-live date, and the name of the person who can help.
            </SectionIntro>
          </Reveal>
          <ScaleHero id={sectionId('Onboarding')} kind="browser" url={URL} screens={LINEUP} />

          <ScrollDeviceStory
            id={sectionId('Step by step')}
            kind="browser"
            url={URL}
            steps={STEPS}
            intro={
              <SectionIntro heading="From signed to sharing access.">
                Plan, payment, share access, team, Showroom Chat, launch. Six steps between signing and live
                campaigns.
              </SectionIntro>
            }
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <LongReport />

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The two components onboarding leans on, pulled apart. The layers are captures of the real HTML component."
            tiles={PARTS}
            onOpen={open}
          />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="browser"
            url={URL}
            heading="Sharing access, before and after."
            blurb="The step where onboarding used to stall. Drag across to compare."
            before={{ src: `${KIT}/before-share-access.webp`, label: 'Before' }}
            after={{ src: `${KIT}/screen-02-share-access.webp`, label: 'After' }}
            facts={[
              { label: 'A failed connection', before: '“ERROR. RETRY?”', after: 'Why it failed, and what to do' },
              { label: 'When ads go live', before: 'Not shown', after: 'A target date and what’s left, on every step' },
              { label: 'Where you are', before: 'A bar along the bottom', after: 'Six named steps across the top' },
              { label: 'Who can help', before: 'A how-to box', after: 'Your account manager, by name' },
            ]}
          />

          <HighlightBanner
            src={`${KIT}/hero-mockup.webp`}
            title="Signed to live, in one sitting"
            blurb="Share access with the launch rail beside it, and the Showroom Chat widget a buyer meets on the dealer’s site."
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
