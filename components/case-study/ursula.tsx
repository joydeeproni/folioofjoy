'use client';

import { Reveal } from '@/components/reveal';
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
import { JOY } from './team';

// Ursula — mobile case study on the Apple-style kit, in Cassi's shape:
// statement → phone lineup → the spec, page by page → a day, pinned → closer
// look → taken apart → the spec's wireframe against the screen → FAQ.
// It's a new design from the client's written spec, not a redesign; facts
// come from ~/Desktop/Redesigns/08-ursula/CASESTUDY.md and the spec itself.

const IMG = '/work/ursula';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;

const TOC = ['Overview', 'The app', 'The spec', 'A day', 'Up close', 'Taken apart', 'Before and after', 'FAQ'];

const STATEMENT = [
  'Ursula runs HR for companies across Mauritius.',
  'Most of their employees never touch it. No desk, no laptop.',
  'They still have leave to approve, a day to clock out of, and sign-ins to confirm.',
];

const s = (file: string, alt: string, live?: string) => ({ src: `${KIT}/${file}.webp`, alt, live: live && `${LIVE}/${live}` });

const LINEUP = [
  s('screen-03-notifications', 'Notifications: three things need you', '03-notifications.html'),
  s('screen-05-swipes', 'Swipes: today, hours worked and the week'),
  s('screen-04-leave-request', 'A leave request with the facts a manager checks'),
  s('screen-09-approve-sign-in', 'Approve a sign-in to Ursula Cloud'),
  s('screen-08-me', 'Me: profile, emergency contact, language'),
  s('screen-07-offline', 'Offline: the day stays readable'),
];

const SPEC = [
  ['spec-01', 'Page 1 · Contents'],
  ['spec-02', 'Page 2 · About the application'],
  ['spec-03', 'Page 3 · Main flow'],
  ['spec-05', 'Page 5 · Home'],
  ['spec-06', 'Page 6 · Restrictions'],
  ['spec-08', 'Page 8 · Notifications'],
  ['spec-09', 'Page 9 · Swipes'],
  ['spec-11', 'Page 11 · Two-way authentication'],
].map(([f, caption]) => ({ src: `${KIT}/${f}.webp`, caption }));

const DAY: StoryStep[] = [
  {
    title: 'Activate once',
    body: 'Platform name, username and passphrase from your HR team, once. One sentence says what the phone becomes: your key to Ursula.',
    screen: s('screen-01-activate', 'Activate this phone'),
  },
  {
    title: 'Fail safe, not fail open',
    body: 'A splash fetches your settings. If activation or settings fail, the app shows the error for two seconds and closes without saving anything. If a different employee turns up on the phone, it wipes its local data.',
    screen: s('screen-02-splash', 'Getting your day ready'),
  },
  {
    title: 'Things that need you',
    body: 'Notifications lead with a verb: approve, acknowledge. A leave request shows what a manager checks before saying yes: the dates, the balance after, and who else is off that week.',
    screen: s('screen-04-leave-request', 'Kevin wants 3 days off'),
  },
  {
    title: 'Swipe out, like pushing a door',
    body: 'The spec asked for Swipe In and Swipe Out buttons for home working. I made it a swipe, a deliberate push, so nobody clocks out from their pocket.',
    screen: s('screen-05-swipes', 'Swipes'),
  },
  {
    title: 'Offline, the day stays',
    body: 'You still see today. Your swipe is saved on the phone and sent later. Approvals wait, because an offline yes is a promise the app can’t keep.',
    screen: s('screen-07-offline', 'You’re offline'),
  },
  {
    title: 'Is this you?',
    body: 'Signing in to Ursula Cloud, the phone shows the browser, place and time, then asks you to tap the number on your computer. You can’t approve by accident.',
    screen: s('screen-09-approve-sign-in', 'Is this you signing in to Ursula Cloud?'),
  },
];

const CLOSER: CloserItem[] = [
  { label: 'Approve leave', body: 'Open the request, check the facts, approve. The list updates behind you.', screen: { src: `${IMG}/reel-approve.mp4` } },
  { label: 'Swipe out', body: 'A deliberate push to clock out. The timeline adds the swipe.', screen: { src: `${IMG}/reel-swipe.mp4` } },
  { label: 'Me', body: 'Profile, a one-tap emergency call, English or French, and dark mode.', screen: s('screen-08-me', 'Me'), kind: 'phone' },
  { label: 'In the dark', body: 'Dark mode was in the spec’s first release, so every screen has it.', screen: s('screen-10-dark', 'Notifications in dark mode'), kind: 'phone' },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'media',
    span: 'full',
    title: 'The main flow, as the spec describes it',
    blurb: 'Connection info stored? Straight to the splash. If not, activate first. Every failure ends the same way: an error for two seconds, then the app closes without saving.',
    src: `${KIT}/app-flow.webp`,
    aspect: 'aspect-[16/9]',
  },
  {
    kind: 'exploded',
    span: 'half',
    title: 'A sign-in, in layers',
    blurb: 'Your day stays underneath, dimmed. The question sits on top of it.',
    ratio: 780 / 1248,
    layers: [
      { src: `${KIT}/signin-layer-0.webp`, label: 'Notifications, underneath' },
      { src: `${KIT}/signin-layer-1.webp`, label: 'Scrim' },
      { src: `${KIT}/signin-layer-2.webp`, label: 'Is this you?' },
    ],
  },
  {
    kind: 'anatomy',
    span: 'half',
    title: 'One question, no accidents',
    blurb: 'Everything you need to decide, and a check that you’re looking at the right computer.',
    src: `${KIT}/sheet.webp`,
    ratio: 414 / 450,
    pins: [
      { x: 2.4, y: 37.4, label: 'Which browser, where, and when' },
      { x: 2.4, y: 67.3, label: 'Tap the number shown on your computer' },
      { x: 2.4, y: 84.7, label: 'A clear way to say it isn’t you' },
      { x: 97.6, y: 84.7, label: 'Approve' },
    ],
  },
  {
    kind: 'states',
    span: 'half',
    title: 'Swipes, in three moments',
    blurb: 'In for the afternoon, offline with a swipe waiting to send, and out for the day.',
    ratio: 390 / 844,
    items: [
      { src: `${KIT}/screen-05-swipes.webp`, label: 'In since 13:14' },
      { src: `${KIT}/screen-07-offline.webp`, label: 'Offline, queued' },
      { src: `${KIT}/screen-06-swiped-out.webp`, label: 'Out at 14:02' },
    ],
  },
  {
    kind: 'palette',
    span: 'half',
    title: 'Violet and cyan, from the mark',
    blurb: 'The two brand colours come from the Ursula logo in the spec. The rest is a proposed system around them.',
    font: { family: 'Onest', href: 'https://fonts.googleapis.com/css2?family=Onest:wght@700&display=swap', sample: '13:14', note: 'EN and FR' },
    swatches: [
      { hex: '#8A00FC', name: 'Violet' },
      { hex: '#00D8EC', name: 'Cyan' },
      { hex: '#0A0A3C', name: 'Navy' },
      { hex: '#F5F5FA', name: 'Surface' },
      { hex: '#0B0B1E', name: 'Dark' },
      { hex: '#11875A', name: 'Approve' },
      { hex: '#B26A00', name: 'Queued' },
      { hex: '#D1344B', name: 'Reject' },
    ],
  },
];

const FAQ = [
  {
    q: 'What was your role in this?',
    a: 'I designed it on my own, from the client’s specification: the flows, every screen and state, the visual system and the motion.',
  },
  {
    q: 'Did it ship?',
    a: 'It’s a design proposal. Every section of the spec has a designed answer, including the six that were only headings. There are no launch numbers.',
  },
  {
    q: 'Is the data real?',
    a: 'No. Sun Coast Resorts and every person and number in the screens are made up. The violet and cyan come from the Ursula mark; the wider palette is proposed.',
  },
  // ASK JOY: was this freelance or through an agency, and did the client see the designs? Anything you'd push back on in the spec?
];

export function Ursula() {
  return (
    <CaseShell
      title="Ursula"
      lede="An HR app for the people who never open the HR system."
      people={[JOY]}
      meta={
        <>
          Client spec{SEP}2022
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
                In 2022 Ursula sent a specification for a small Android app for those people: notifications they can act
                on, swiping in and out when working from home, and approving sign-ins to Ursula Cloud. No screens were made
                from it at the time. I designed the app from that spec: every flow, screen and state.
              </>
            }
          />

          <ScaleHero id={sectionId('The app')} kind="phone" screens={LINEUP} />

          <section id={sectionId('The spec')} className="scroll-mt-24 pt-16 md:pt-24">
            <Reveal>
              <SectionIntro heading="Eleven pages and a warning." className="mb-10">
                Three wireframes, and a clear note: the drawings are not the design. The flow was precise, with English and
                French and dark mode from day one. But six of the eleven pages were just a heading: restrictions, offline
                data, notifications, swipes, Me and two-way authentication. I treated those as the real brief.
              </SectionIntro>
            </Reveal>
          </section>
          <MarqueeWall
            rows={[SPEC]}
            aspect="aspect-[579/819]"
            cardClass="w-[52vw] max-w-[260px] sm:w-[24vw] sm:max-w-[280px]"
            durationsMs={[52000]}
            onOpen={open}
          />

          <ScrollDeviceStory
            id={sectionId('A day')}
            kind="phone"
            steps={DAY}
            deviceSide="left"
            intro={
              <SectionIntro heading="Three tabs, answered one by one.">
                The spec fixed the home at three sections: Notifications, Swipes and Me. Everything else had to fit inside
                them, including the pages that were only headings.
              </SectionIntro>
            }
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The flow the whole app hangs on, and the two controls that can’t be tapped by accident. The layers are captures of the real HTML screens."
            tiles={PARTS}
            onOpen={open}
          />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="phone"
            heading="The spec’s wireframe, before and after."
            blurb="The configuration page as the spec drew it, and the activation screen designed from it. Drag across to compare."
            before={{ src: `${KIT}/before-activate.webp`, label: 'Before' }}
            after={{ src: `${KIT}/screen-01-activate.webp`, label: 'After' }}
            facts={[
              { label: 'Fields', before: 'Platform name, username, activation passphrase', after: 'The same three, with .ursula.mu after the platform name' },
              { label: 'What it tells you', before: 'Nothing', after: 'This phone becomes your key to Ursula' },
              { label: 'Language', before: 'Not shown', after: 'EN and FR, top right' },
            ]}
          />

          <HighlightBanner
            src={`${KIT}/light-dark.webp`}
            title="English and French, light and dark"
            blurb="English, French and dark mode were all required in the first release, so every screen has all three."
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
