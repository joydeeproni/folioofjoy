'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { Moon, Sun, Sunset } from 'lucide-react';
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
import { DeviceFrame } from './shared/device-frame';
import { FG, MUTED } from './shared/tokens';
import { JOY } from './team';

// Teen Health Planner: mobile, in Cassi's shape. Statement → phone lineup →
// one day, pinned, from morning to "Still up?" → the sky on the viewer's own
// clock → every screen (after over before) → closer look → taken apart →
// before/after → banner → FAQ. Facts come from the project CASESTUDY.md.

const IMG = '/work/teen-health-planner';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;

const TOC = ['Overview', 'The app', 'One day', 'The sky', 'Every screen', 'Up close', 'Taken apart', 'Before and after', 'FAQ'];

const STATEMENT = [
  'Teen Health Planner is for teenagers living with diabetes, asthma or a heart condition.',
  'Meds, appointments, symptoms and mood all need keeping track of, every day.',
  'And the app doing it has to compete with everything else on their phone.',
];

const s = (file: string, alt: string, live?: string) => ({ src: `${KIT}/${file}.webp`, alt, live: live && `${LIVE}/${live}` });

const HOME_DAY = s('screen-home-day', 'Home in the morning: sun, stars, streak and the next appointment', '01-home.html?t=day');
const HOME_DUSK = s('screen-home-dusk', 'Home in the evening, under a dusk gradient');
const HOME_NIGHT = s('screen-home-night', 'Home at night: a crescent moon and “Still up?”');

const LINEUP = [
  HOME_DAY,
  s('screen-planner', 'Planner timeline with a missed dose'),
  s('screen-add', 'Add to your planner sheet'),
  s('screen-quiz', 'Quiz with a countdown'),
  s('screen-results', 'Quiz results and the 5 in a row challenge'),
  s('screen-learn', 'Learn, with a narrator to pick'),
];

const DAY: StoryStep[] = [
  {
    title: 'Good morning',
    body: 'Home opens on the next appointment with a live countdown, today’s entries, and your stars, streak and rank.',
    screen: HOME_DAY,
  },
  {
    title: 'Your week, as a timeline',
    body: 'Each day is a card with what you took, what you logged and what’s coming up. A missed dose is marked clearly, without a telling-off.',
    screen: s('screen-planner', 'Planner'),
  },
  {
    title: 'Log it in two taps',
    body: 'The plus button opens one sheet: a mood picker on top, then symptom, medication, event, document, measurement or a sticker.',
    screen: s('screen-add', 'Add to your planner'),
  },
  {
    title: 'A quiz, against the clock',
    body: 'A countdown, four answers, and the 5 in a row challenge at the bottom, so you always know what’s at stake.',
    screen: s('screen-quiz-right', 'A correct quiz answer'),
  },
  {
    title: 'Points for keeping track',
    body: 'Results add up the stars and the perfect-round bonus, and show how far you are through the challenge.',
    screen: s('screen-results', 'Quiz results'),
  },
  {
    title: 'Still up?',
    body: 'Late at night the header turns dark, a crescent moon comes out, and the greeting changes.',
    screen: HOME_NIGHT,
  },
];

// ── The sky, on the viewer's clock ───────────────────────────────────────────
// Local piece: the three home headers crossfade. It starts on the time of day
// where the reader is, then cycles while in view until they pick one.
const SKIES = [
  { label: 'Morning', greet: 'Good morning', Icon: Sun, screen: HOME_DAY },
  { label: 'Evening', greet: 'Good evening', Icon: Sunset, screen: HOME_DUSK },
  { label: 'Night', greet: 'Still up?', Icon: Moon, screen: HOME_NIGHT },
];
const skyFor = (h: number) => (h >= 5 && h < 17 ? 0 : h >= 17 && h < 21 ? 1 : 2);

function SkyClock({ id }: { id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [clock, setClock] = useState<string | null>(null);
  const [auto, setAuto] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const now = new Date();
    setActive(skyFor(now.getHours()));
    setClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // Hold the reader's own sky for a beat, then cycle.
  useEffect(() => {
    if (!inView || !auto || reduce) return;
    const t = setTimeout(() => {
      setStarted(true);
      setActive((a) => (a + 1) % SKIES.length);
    }, started ? 2800 : 4200);
    return () => clearTimeout(t);
  }, [inView, auto, reduce, active, started]);

  return (
    <section id={id} ref={ref} className="scroll-mt-24 py-16 md:py-24">
      <Reveal className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:gap-16">
        <div className="min-w-0">
          <SectionIntro eyebrow="the signature" heading="A sky that knows what time it is.">
            <p>
              The brief asked for a dashboard sun that moves with the time of day. I let the whole header follow the clock:
              a morning sun, a dusk gradient, and a crescent moon when you’re still up.
            </p>
            <p className="mt-4">
              “Still up?” does more than a notification would. It notices, and it doesn’t nag.
            </p>
          </SectionIntro>
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Time of day">
            {SKIES.map(({ label, Icon }, i) => {
              const on = i === active;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setAuto(false);
                    setActive(i);
                  }}
                  className="flex items-center gap-2 rounded-full px-4 py-2 font-sans text-sm transition-colors duration-300"
                  style={{ backgroundColor: on ? FG : 'rgba(237,234,224,0.07)', color: on ? '#0B0B0B' : FG }}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTED }} aria-live="polite">
            {clock ? `It’s ${clock} where you are · ${SKIES[skyFor(new Date().getHours())].label.toLowerCase()}` : ' '}
          </p>
        </div>
        <DeviceFrame kind="phone" className="mx-auto w-[64vw] max-w-[300px] md:w-full md:max-w-none">
          {SKIES.map(({ label, screen }, i) => (
            <img
              key={label}
              src={screen.src}
              alt={i === active ? screen.alt : ''}
              aria-hidden={i !== active}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-[1100ms] ease-out"
              style={{ opacity: i === active ? 1 : 0 }}
            />
          ))}
        </DeviceFrame>
      </Reveal>
    </section>
  );
}

const AFTER_ROW = [
  ['screen-home-day', 'After · Home, morning'],
  ['screen-planner', 'After · Planner'],
  ['screen-record', 'After · Health record'],
  ['screen-add', 'After · Add'],
  ['screen-quiz', 'After · Quiz'],
  ['screen-results', 'After · Results'],
  ['screen-learn', 'After · Learn'],
  ['screen-home-night', 'After · Home, night'],
].map(([f, caption]) => ({ src: `${KIT}/${f}.webp`, caption }));

const BEFORE_ROW = [
  ['before-login', 'Before · Login'],
  ['before-home', 'Before · Home'],
  ['before-planner', 'Before · Planner'],
  ['before-record', 'Before · Health record'],
  ['before-results', 'Before · Results'],
].map(([f, caption]) => ({ src: `${KIT}/${f}.webp`, caption }));

const CLOSER: CloserItem[] = [
  { label: 'Morning to night', body: 'The home header moves from a morning sun to dusk to a crescent moon, next to the planner.', screen: { src: `${IMG}/reel-day-night.mp4` } },
  { label: 'Quiz to results', body: 'The countdown runs, a right answer lights up green, and the stars add up on the results screen.', screen: { src: `${IMG}/reel-quiz.mp4` } },
  { label: 'How are you feeling?', body: 'The add sheet opens on a mood picker, from awful to great, before anything else.', screen: { src: `${KIT}/detail-mood.webp` } },
  { label: 'Today, in one card', body: 'Today’s entries in the planner, each with a small category tint and a time.', screen: { src: `${KIT}/detail-today.webp` } },
  { label: 'The month at a glance', body: 'The health record calendar puts a dot under each day for meds, events, mood and docs.', screen: { src: `${KIT}/detail-calendar.webp` } },
  { label: 'Pick your narrator', body: 'Every course can be told by a voice you choose: calm Maya, Theo who talks like a friend, Coach Ade, or Robo.', screen: s('screen-learn', 'Learn'), kind: 'phone' },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'exploded',
    span: 'two-thirds',
    title: 'The night sky, in layers',
    blurb: 'Four layers of the real home header, captured from the HTML screen. Hover a layer to isolate it.',
    ratio: 390 / 336,
    layers: [
      { src: `${KIT}/sky-layer-0.webp`, label: 'Sky gradient' },
      { src: `${KIT}/sky-layer-1.webp`, label: 'Moon, hills and stars' },
      { src: `${KIT}/sky-layer-2.webp`, label: 'Greeting, level and stats' },
      { src: `${KIT}/sky-layer-3.webp`, label: 'Next appointment' },
    ],
  },
  {
    kind: 'states',
    span: 'third',
    title: 'Good morning, still up?',
    blurb: 'Same screen, same data. Only the sky and the greeting change.',
    ratio: 390 / 844,
    items: [
      { src: HOME_DAY.src, label: 'Morning' },
      { src: HOME_NIGHT.src, label: 'Night' },
    ],
  },
  {
    kind: 'anatomy',
    span: 'half',
    title: 'The 5 in a row challenge',
    blurb: 'Finish all five quizzes without a wrong answer to unlock the Quiz badge.',
    src: `${KIT}/challenge-card.webp`,
    ratio: 386 / 334,
    pins: [
      { x: 82, y: 11.5, label: 'Five quizzes, no wrong answers' },
      { x: 56, y: 36.3, label: 'Done: ticked off, points banked' },
      { x: 56, y: 68.6, label: 'The quiz you’re on' },
      { x: 56, y: 84.7, label: 'Harder ones stay locked' },
    ],
  },
  {
    kind: 'palette',
    span: 'half',
    title: 'The sunrise from the logo',
    blurb: 'Red to yellow, saved for the sky and the one thing to tap next. Everything else stays warm and neutral, with quiet tints marking meds, events, mood and docs.',
    font: { family: 'Outfit', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@800&display=swap', sample: '321', note: 'friendly, not childish' },
    swatches: [
      { hex: '#E62224', name: 'Red' },
      { hex: '#EA6612', name: 'Orange' },
      { hex: '#F2B600', name: 'Yellow' },
      { hex: '#1F1A1C', name: 'Ink' },
      { hex: '#8079B5', name: 'Meds' },
      { hex: '#5C949A', name: 'Docs' },
      { hex: '#1E2352', name: 'Night sky' },
      { hex: '#FBF7F4', name: 'Surface' },
    ],
  },
];

const FAQ = [
  {
    q: 'What was your role in this?',
    // ASK JOY: anyone else on the team (a developer? an illustrator?), and did it launch?
    a: 'I worked freelance with the founder from April to November 2020. I designed the screens and the interaction and motion for each of them: login, the dashboard, the planner, the health record, quizzes and results, Learn, points and the profile.',
  },
  {
    q: 'How did the motion work come together?',
    // ASK JOY: which tools you animated in.
    a: 'The founder’s brief listed animations screen by screen: the dashboard sun, points flying into the counter, quiz answers lighting up. I turned each screen into an animated prototype and delivered them in four rounds, with the founder’s review and revisions between each.',
  },
  // ASK JOY: the hardest part of the brief; anything you'd do differently.
];

export function TeenHealthPlanner() {
  return (
    <CaseShell
      title="Teen Health Planner"
      lede="A health planner for teens with long-term conditions: meds, appointments, symptoms and mood, with quizzes and points for keeping track."
      people={[JOY]}
      meta={
        <>
          Freelance{SEP}2020
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
                The founder wanted health tracking that felt rewarding, not like a hospital form. Points, quizzes and a
                leaderboard were in the brief. My job was to make that playful without talking down to the people using it.
                I designed the screens and the motion for each of them, delivered in four rounds.
              </>
            }
          />

          <section id={sectionId('The app')} className="scroll-mt-24 pt-8">
            <Reveal>
              <SectionIntro heading="Take control, unlock prizes." className="mb-4">
                A planner, a health record, quizzes, courses and a leaderboard, behind five tabs.
              </SectionIntro>
            </Reveal>
          </section>
          <ScaleHero kind="phone" screens={LINEUP} />

          <ScrollDeviceStory
            id={sectionId('One day')}
            kind="phone"
            steps={DAY}
            deviceSide="left"
            intro={
              <SectionIntro heading="One day, from good morning to still up.">
                Check what’s next, log it, earn something for it.
              </SectionIntro>
            }
          />

          <SkyClock id={sectionId('The sky')} />

          <section id={sectionId('Every screen')} className="scroll-mt-24 pt-16 md:pt-24">
            <Reveal>
              <SectionIntro heading="Every screen." className="mb-10">
                The top row is After, the bottom row is Before. Hover to slow down, click to open.
              </SectionIntro>
            </Reveal>
          </section>
          <MarqueeWall
            rows={[AFTER_ROW, BEFORE_ROW]}
            aspect="aspect-[9/19.5]"
            cardClass="w-[44vw] max-w-[220px] sm:w-[20vw] sm:max-w-[240px]"
            durationsMs={[48000, 40000]}
            onOpen={open}
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The header that changes with the clock, and the challenge that keeps the quizzes going."
            tiles={PARTS}
            onOpen={open}
          />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="phone"
            heading="The same home, before and after."
            blurb="Every feature carries over. Drag across to compare."
            before={{ src: `${KIT}/before-home.webp`, label: 'Before' }}
            after={{ src: HOME_DAY.src, label: 'After' }}
            facts={[
              { label: 'The header', before: 'A sun in the corner', after: 'A sky that follows the time of day' },
              { label: 'Next appointment', before: 'A countdown in the header', after: 'Clinic, doctor and countdown in one card' },
              { label: 'Progress', before: 'A 6/9 bar and 321 stars', after: '321 stars, a 6-day streak and rank #2' },
              { label: 'The planner', before: 'A dashed box of filter buttons', after: 'Today’s three entries, one tap to the planner' },
            ]}
          />

          <HighlightBanner
            src={`${KIT}/hero-flow.webp`}
            title="Soft cards on a warm surface"
            blurb="Home, add, quiz and learn, side by side. The sunrise gradient only shows up in the sky and on the thing to tap next."
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
