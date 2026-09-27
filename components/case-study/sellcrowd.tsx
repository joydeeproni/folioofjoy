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
import { JOY } from './team';

// SellCrowd: a lean mobile case study in Cassi's shape. Statement → a live
// phone lineup → one shift, pinned → every screen → the call reel → FAQ.
// The lineup phones run the real HTML screens, which animate on load.

const IMG = '/work/sellcrowd';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;

const TOC = ['Overview', 'The app', 'A shift', 'Every screen', 'FAQ'];

const STATEMENT = [
  'A SellCrowd rep might sell accounting services this month and coffee subscriptions the next.',
  'Before they call anyone, they have to learn a client they met last week.',
  'Once they’re calling, they need two answers, fast: who’s next, and am I on target?',
];

const s = (file: string, alt: string, live?: string) => ({ src: `${KIT}/${file}.webp`, alt, live: live && `${LIVE}/${live}` });

const LINEUP = [
  s('screen-01-dashboard', 'Dashboard: the shift in numbers and the target bar', '01-dashboard.html'),
  s('screen-03-leads', 'Leads, filtered by how warm they are', '02-leads.html'),
  s('screen-04-lead-details', 'Lead details, with the call button', '03-lead.html'),
  s('screen-10-visitor-chat', 'Chat with a website visitor', '07-chat-visitor.html'),
  s('screen-12-leaderboards', 'Leaderboards', '09-leaders.html'),
  s('screen-13-training', 'Training for the current client', '10-training.html'),
];

const SHIFT: StoryStep[] = [
  {
    title: 'Learn the client',
    body: 'Trainings hold everything about who you’re selling for: the company, products and services, the sales script and objection handling. Then you get qualified.',
    screen: s('screen-13-training', 'Training'),
  },
  {
    title: 'See who’s next',
    body: 'Leads are sorted by how warm they are: new, cold, warm and hot. Each row has the company, the person, when you last spoke and a call button.',
    screen: s('screen-03-leads', 'Leads'),
  },
  {
    title: 'Call from the lead',
    body: 'Lead details keep the call button next to the name, with their local time, the last contact and your notes right below it.',
    screen: s('screen-05-calling', 'On a call'),
  },
  {
    title: 'Log it while it’s fresh',
    body: 'The outcome lands on the lead as its most recent contact, so the next call starts where this one ended.',
    screen: s('screen-06-meeting-booked', 'Meeting booked'),
  },
  {
    title: 'Hit the target',
    body: 'The dashboard keeps the shift in numbers: talk time, calls, meetings, sales and earnings, with a bar that fills toward the day’s target.',
    screen: s('screen-02-target-hit', 'Target hit'),
  },
];

const SCREENS = [
  ['screen-01-dashboard', 'Dashboard'],
  ['screen-03-leads', 'Leads'],
  ['screen-04-lead-details', 'Lead details'],
  ['screen-05-calling', 'On a call'],
  ['screen-07-contact-history', 'Contact history'],
  ['screen-08-reminders', 'Reminders'],
  ['screen-09-chats', 'Chats'],
  ['screen-10-visitor-chat', 'Visitor chat'],
  ['screen-11-team-chat', 'Team chat'],
  ['screen-12-leaderboards', 'Leaderboards'],
  ['screen-13-training', 'Training'],
  ['screen-14-company', 'Company'],
  ['screen-15-product-and-services', 'Product and services'],
  ['screen-16-sales-script', 'Sales script'],
  ['screen-17-objection-handling', 'Objection handling'],
  ['screen-18-login', 'Login'],
  ['screen-19-register', 'Register'],
].map(([f, caption]) => ({ src: `${KIT}/${f}.webp`, caption }));

const FAQ = [
  {
    q: 'What was your role in this?',
    // ASK JOY: who you worked with (founders? a dev team?) and how the ten versions were reviewed.
    a: 'I designed the SellCrowd app’s UX and UI from June to October 2020, across ten exported versions: the dashboard, leads, reminders, chats, leaderboards and trainings.',
  },
  // ASK JOY: design stack in 2020; the hardest challenge; how success was measured; what you'd do differently.
];

export function SellCrowd() {
  return (
    <CaseShell
      title="SellCrowd"
      lede="A mobile app for on-demand sales reps: every lead, call and meeting in one place, with a shift target that keeps score."
      people={[JOY]}
      meta={
        <>
          Mobile{SEP}Freelance{SEP}2020
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
                SellCrowd rents companies a sales team on demand, and the reps work from their phones. In 2020 I designed
                the app they spend the shift in, over ten versions: trainings to learn the client, leads, calls,
                reminders, website and team chats, and leaderboards.
              </>
            }
          />

          <ScaleHero id={sectionId('The app')} kind="phone" screens={LINEUP} />

          <ScrollDeviceStory
            id={sectionId('A shift')}
            kind="phone"
            steps={SHIFT}
            deviceSide="left"
            intro={
              <SectionIntro heading="One shift, start to finish.">
                Learn the client, work the list, log every call, and always know where you stand.
              </SectionIntro>
            }
          />

          <section id={sectionId('Every screen')} className="scroll-mt-24 pt-16 md:pt-24">
            <Reveal>
              <SectionIntro heading="Every screen in the shift." className="mb-10">
                Home, leads, reminders, chats and leaderboards, the trainings behind them, and the way in. Hover to slow
                it down, click to open.
              </SectionIntro>
            </Reveal>
          </section>
          <MarqueeWall
            rows={[SCREENS.slice(0, 9), SCREENS.slice(9)]}
            aspect="aspect-[390/844]"
            cardClass="w-[44vw] max-w-[220px] sm:w-[20vw] sm:max-w-[240px]"
            durationsMs={[46000, 58000]}
            onOpen={open}
          />

          <HighlightBanner
            src={`${IMG}/reel-call.mp4`}
            title="From a lead to a booked meeting"
            blurb="Open the lead, call, and log the outcome. Back on the dashboard, the target bar fills to five of five."
            aspect="aspect-[4/3]"
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
