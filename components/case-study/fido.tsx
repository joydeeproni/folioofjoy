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
import { FG, MUTED, FAINT } from './shared/tokens';
import { JOY } from './team';

// Fido — mobile case study on the Apple-style kit, in Cassi's shape:
// statement → phone lineup (live) → what owners told us → a week of quests,
// pinned (live) → every screen → closer look → up close → the website → FAQ.
// Screens follow the original v6 app; the live frames play the same motion as
// the HTML screens. Facts come from the project files and the research digest
// (5 owner interviews, meeting notes, v1 feedback).

const IMG = '/work/fido';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;

const TOC = ['Overview', 'The app', 'What owners told us', 'A week of quests', 'Up close', 'The details', 'The website', 'FAQ'];

const STATEMENT = [
  'New puppy parents get a thousand answers from Google and none from someone who knows their dog.',
  'Books get read to chapter two. Classes are an hour a week. The dog is there all day.',
  'Fido turns training into ten-minute quests, and puts a real trainer on the other side of every one.',
];

const s = (file: string, alt: string, live?: string) => ({ src: `${KIT}/${file}.webp`, alt, live: live && `${LIVE}/${live}` });

const LINEUP = [
  s('screen-01-quest-wall', 'Home: a wall of quests', '01-home.html'),
  s('screen-02-quest-goal', 'A quest’s goal and what to bring', '02-quest.html'),
  s('screen-03-quest-step', 'One timed step', '03-step.html'),
  s('screen-05-you-did-it', 'You did it', '04-done.html'),
  s('screen-07-library', 'The library', '05-library.html'),
  s('screen-08-talk-to-trainer', 'Talk to the trainer', '06-talk.html'),
  s('screen-09-profile', 'Profile, with the pups', '07-me.html'),
];

const WEEK: StoryStep[] = [
  {
    title: 'Plan by the dog’s age',
    body: 'Early on we decided the week should be the dog’s age, not a curriculum. Onboarding asks who the dog is, what’s on your mind and who else is training, then shows a plan you can change anytime.',
    screen: s('screen-13-plan', 'Milou’s first 12 weeks', '11-plan.html'),
  },
  {
    title: 'A wall of quests',
    body: 'Feedback on the first version called home bland, and past quests merged into the background. So home became a wall of big pastel cards, one colour per kind of quest, the current column in focus and the neighbours peeking in.',
    screen: s('screen-01-quest-wall', 'The quest wall', '01-home.html'),
  },
  {
    title: 'One step, one hand',
    body: 'The goal and what to bring come first. Then it’s one step per card, with a timer and a single button, because your other hand is holding a leash. The trainer’s pro tips sit one tap away.',
    screen: s('screen-03-quest-step', 'A timed quest step', '03-step.html'),
  },
  {
    title: 'Off days are normal',
    body: 'Owners told us they felt pressured when the dog didn’t perform. The check-in is three quick questions and an optional clip. Christophe adjusts the plan, he doesn’t grade it.',
    screen: s('screen-21-check-in', 'How did it go?', '17-checkin.html'),
  },
  {
    title: 'Scout answers, Christophe decides',
    body: 'In the second phase we added Scout, an assistant inside the trainer chat. It answers “is this normal?” straight away, links the matching quest, and hands off to Christophe in one tap.',
    screen: s('screen-20-ask-scout', 'Scout in the trainer chat', '16-assist.html'),
  },
  {
    title: 'Skills, not a report card',
    body: 'Progress grows from the dog: potty, crate and gentle mouth, each with levels and one clear next unlock. People wanted to see progress, not a score.',
    screen: s('screen-16-skills', 'Milou’s skills', '13-skills.html'),
  },
];

const cap = (f: string) =>
  f
    .replace(/^screen-\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
const ROW_A = [
  'screen-01-quest-wall',
  'screen-02-quest-goal',
  'screen-03-quest-step',
  'screen-04-pro-tip',
  'screen-05-you-did-it',
  'screen-06-check-in-locked',
  'screen-07-library',
  'screen-08-talk-to-trainer',
  'screen-09-profile',
  'screen-10-welcome',
].map((f) => ({ src: `${KIT}/${f}.webp`, caption: cap(f) }));
const ROW_B = [
  'screen-11-dog-profile',
  'screen-12-goals',
  'screen-13-plan',
  'screen-14-sign-in',
  'screen-15-forgot-password',
  'screen-16-skills',
  'screen-17-lesson-listen',
  'screen-18-notifications',
  'screen-19-notifications-empty',
  'screen-20-ask-scout',
  'screen-21-check-in',
].map((f) => ({ src: `${KIT}/${f}.webp`, caption: cap(f) }));

const CLOSER: CloserItem[] = [
  { label: 'Three questions, then a plan', body: 'Who you’re training, what’s on your mind, who else is in. The plan that comes back is built around the dog’s age.', screen: { src: `${IMG}/reel-onboarding.mp4` } },
  { label: 'Home to “you did it”', body: 'Pick today’s quest off the wall, read the goal, work through the timed steps, and land on a check-in with the trainer.', screen: { src: `${IMG}/reel-quest.mp4` } },
  { label: 'The trainer, one tap away', body: 'The quest menu keeps pro tips and Talk to Trainer close, and the check-in unlocks once the adventure is done.', screen: { src: `${IMG}/reel-trainer.mp4` } },
  { label: 'Read, listen or watch', body: 'Some owners wanted to listen, others wanted a document. Every lesson comes in three formats, a quest to try tonight, and “did this work for Milou?” for the trainer.', screen: s('screen-17-lesson-listen', 'A lesson, in listen mode', '14-lesson.html'), kind: 'phone' },
  { label: 'What you need, before you go', body: 'Every quest lists what to bring, so a walk to the shops doesn’t end in a pocket without treats.', screen: { src: `${KIT}/detail-things-you-need.webp` } },
  { label: 'Every way back in', body: 'We covered every login flow, down to forgot password.', screen: s('screen-15-forgot-password', 'Forgot password'), kind: 'phone' },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'media',
    span: 'two-thirds',
    title: 'One colour per kind of quest',
    blurb: 'Adventure is peach, learning pink, training lilac, evaluation sky. You can tell what a quest is before you read it.',
    src: `${KIT}/detail-quest-cards.webp`,
    aspect: 'aspect-square',
  },
  {
    kind: 'states',
    span: 'third',
    title: 'Busy, then quiet',
    blurb: 'Notifications with news, and with none.',
    ratio: 390 / 844,
    items: [
      { src: `${KIT}/screen-18-notifications.webp`, label: 'Today' },
      { src: `${KIT}/screen-19-notifications-empty.webp`, label: 'All caught up' },
    ],
  },
  {
    kind: 'media',
    span: 'half',
    title: 'Locked until it’s earned',
    blurb: 'The check-in waits until the adventure is done. The lock wiggles, the pup wags, and the trainer is still one tap away.',
    src: `${KIT}/detail-check-in-locked.webp`,
    aspect: 'aspect-square',
  },
  {
    kind: 'palette',
    span: 'half',
    title: 'Pastels on black',
    blurb: 'Four quest pastels on a black stage with charcoal sheets. Yellow marks what’s selected, teal what’s done.',
    font: { family: 'Plus Jakarta Sans', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300&display=swap', sample: 'Milou', note: 'light display' },
    swatches: [
      { hex: '#FFD6A5', name: 'Adventure' },
      { hex: '#FFACAE', name: 'Learn' },
      { hex: '#BCB2FD', name: 'Train' },
      { hex: '#BCD1D6', name: 'Evaluate' },
      { hex: '#F8C954', name: 'Selected' },
      { hex: '#8DD0CC', name: 'Done' },
      { hex: '#323641', name: 'Charcoal' },
      { hex: '#000000', name: 'Stage' },
    ],
  },
  {
    kind: 'media',
    span: 'full',
    title: 'The pups at play',
    blurb: 'The brand illustrations, redrawn so they can move: on the profile the ball bounces between the two pups.',
    src: `${KIT}/detail-pups-at-play.webp`,
    aspect: 'aspect-[21/9]',
  },
];

const SITE: StoryStep[] = [
  {
    title: 'A members’ club, not a sales page',
    body: 'The brief was sign-ups, with limited copy and a sense of exclusivity. The page tells the story in order: from worried to wagging, the method, the families, our story, and the FAQ.',
    screen: { src: `${KIT}/screen-22-landing-page.webp`, alt: 'The landing page' },
    panRatio: 7607 / 1600,
  },
  {
    title: 'Membership, by invite',
    body: 'Two ways to play, on your own or with Christophe’s team, each ending on the same ask: request an invite.',
    screen: { src: `${KIT}/screen-23-membership-page.webp`, alt: 'The membership page' },
    panRatio: 2059 / 1600,
  },
];

// What the five households told us, from the research conclusion.
function Research() {
  const cols = [
    { k: 'What matters', v: ['Trust', 'Reassurance', 'Personalisation'] },
    { k: 'Pain points', v: ['Motivation', 'Digestible content'] },
    { k: 'Design approach', v: ['Soft', 'A communication app', 'Content is king', 'The IKEA effect'] },
  ];
  return (
    <section id={sectionId('What owners told us')} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <SectionIntro eyebrow="Five households" heading="Trust, reassurance, personal.">
          Before any screens, we interviewed five households with new dogs: couples in their 20s and 30s, some
          first-time owners, some who grew up with dogs. They wanted reassurance from a real person, progress rather
          than points, and steps like a recipe.
        </SectionIntro>
      </Reveal>
      <Reveal>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {cols.map((c) => (
            <div key={c.k} className="rounded-3xl p-6" style={{ background: 'rgba(237,234,224,0.04)', border: `1px solid ${FAINT}` }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
                {c.k}
              </p>
              <ul className="mt-4 space-y-1.5">
                {c.v.map((v) => (
                  <li key={v} className="font-sans text-xl tracking-tight" style={{ color: FG }}>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {[
            { q: 'Having progress is more important than scoring.', who: 'Kari, dog parent to a Pomeranian' },
            { q: 'When you can do this, go to step 2.', who: 'Kate and Nelson, on the most helpful thing they’d been told' },
          ].map((x) => (
            <figure key={x.q} className="rounded-3xl p-6 md:p-8" style={{ background: '#FAD2A0', color: '#14141E' }}>
              <blockquote className="font-sans text-2xl md:text-3xl leading-tight tracking-tight">“{x.q}”</blockquote>
              <figcaption className="mt-4 font-sans text-sm" style={{ color: 'rgba(20,20,30,0.65)' }}>
                {x.who}
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

const FAQ = [
  {
    q: 'What was your role in this?',
    // ASK JOY: confirm the role wording, and who else was on the team (developers? another designer?).
    a: 'Product designer. With Christophe, the founder, I ran the research, then designed the app across six versions, the landing page, and a second phase on progress, chat and notifications.',
  },
  {
    q: 'How long did it run?',
    a: 'It started with a three-page sample in November 2021. Phase one ran from January to October 2022: research, six versions of the app and the landing page. Phase two ran from December 2022 to March 2023: the skill tree, chat with an assistant, and notifications.',
  },
  {
    q: 'What did the research change?',
    a: 'We moved from curriculum weeks to the dog’s age, from scores to progress, and from long forms to quick check-ins that tell you off days are normal.',
  },
  {
    q: 'What was the hardest open question?',
    a: 'What a quest actually is. In phase two the journey became raise an issue, evaluate, learn, do, submit, trainer review, and we had to decide whether a quest is an issue or a module inside one.',
  },
  // ASK JOY: design stack; how success was measured / what happened after phase two; what you'd do differently.
];

export function Fido() {
  return (
    <CaseShell
      title="Fido"
      lede="A dog-training app where every lesson is a short quest, and a real trainer reads every check-in."
      people={[JOY]}
      meta={
        <>
          Product designer{SEP}2021–23
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
                Christophe, a certified trainer, was coaching families over email, WhatsApp and Zoom. They loved the
                personal touch but kept losing the plan in long threads. Over two years I designed Fido with him: the
                research, six versions of the app, the landing page, and a second phase on progress and chat.
              </>
            }
          />

          <Reveal>
            <SectionIntro heading="Ten minutes a day, with someone who notices.">
              Quests at home and on walks, and a trainer on the other side. These phones are the real screens, playing live.
            </SectionIntro>
          </Reveal>
          <ScaleHero id={sectionId('The app')} kind="phone" screens={LINEUP} />

          <Research />

          <ScrollDeviceStory
            id={sectionId('A week of quests')}
            kind="phone"
            steps={WEEK}
            intro={
              <SectionIntro heading="From “who’s your dog?” to the next unlock.">
                One puppy, Milou, 14 weeks old, from onboarding to her skills.
              </SectionIntro>
            }
          />

          <section className="pt-8">
            <Reveal>
              <SectionIntro heading="Every screen." className="mb-10">
                Quests, library, talk and profile, plus onboarding, sign-in and the empty states. Hover to slow it down, click
                to open one.
              </SectionIntro>
            </Reveal>
          </section>
          <MarqueeWall
            rows={[ROW_A, ROW_B]}
            aspect="aspect-[390/844]"
            cardClass="w-[44vw] max-w-[220px] sm:w-[20vw] sm:max-w-[240px]"
            durationsMs={[52000, 60000]}
            onOpen={open}
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <DeconstructBento
            id={sectionId('The details')}
            heading="The details."
            blurb="Colour that says what a quest is, the quiet states, and the pups that make it feel like Fido."
            tiles={PARTS}
            onOpen={open}
          />

          <ScrollDeviceStory
            id={sectionId('The website')}
            kind="browser"
            url="Fido · Join the club"
            steps={SITE}
            intro={
              <SectionIntro heading="Explaining it on the first visit.">
                The landing page and the membership page, built for one thing: sign-ups.
              </SectionIntro>
            }
          />

          <HighlightBanner
            src={`${KIT}/dribbble-02-wall.webp`}
            title="The quest wall"
            blurb="Every kind of quest in its own pastel, with today’s adventure in focus."
            aspect="aspect-[4/3]"
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
