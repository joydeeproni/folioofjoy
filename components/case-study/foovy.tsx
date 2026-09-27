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
import { DeconstructBento, type DeconstructTile } from './shared/deconstruct-bento';
import { BeforeAfter } from './shared/before-after';
import { FG, MUTED, FAINT } from './shared/tokens';
import { JOY } from './team';

// Foovy — mobile case study on the Apple-style kit. Cassi-like but shorter:
// statement → phone lineup → what the feedback rounds decided → shop to pan,
// pinned → taken apart (with the two reels) → before / after → every screen →
// banner → FAQ. Facts come from CASESTUDY.md and the client feedback rounds.

const IMG = '/work/foovy';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;
const RATIO = 375 / 812;

const TOC = ['Overview', 'The app', 'Three rounds', 'Shop to pan', 'Taken apart', 'Before and after', 'FAQ'];

const STATEMENT = [
  'Most food waste happens for a dull reason: we forget what’s in the fridge.',
  'Foovy’s founders wanted a fridge you could see from anywhere, with a countdown on everything inside it.',
  'And recipes built from the three or four things that need eating first.',
];

const s = (file: string, alt: string, live?: string) => ({
  src: `${KIT}/${file}.webp`,
  alt,
  width: 375,
  live: live && `${LIVE}/${live}`,
});

const LINEUP = [
  s('screen-01-home', 'Home: the fridge door', '01-home.html'),
  s('screen-02-inside-fridge', 'Inside the fridge'),
  s('screen-04-item-details', 'An item’s details'),
  s('screen-05-scan-detected', 'Scan: the items it found'),
  s('screen-06-generated-recipes', 'Recipes from what you have'),
  s('screen-07-shopping-basket', 'The shared basket'),
];

const FLOW: StoryStep[] = [
  {
    title: 'Snap the shopping',
    body: 'Add items by barcode, voice or photo. From a photo, Foovy lists what it found; you tick the list and sort it into Fridge, Freezer or Cupboard.',
    screen: s('screen-05-scan-detected', 'We have detected the following items'),
  },
  {
    title: 'Open the fridge',
    body: 'Every item sits on its shelf in a ring that counts down its days, green to amber to red. You can read a whole shelf at a glance.',
    screen: s('screen-02-inside-fridge', 'Inside Fridge'),
  },
  {
    title: 'Tap one for the story',
    body: 'Eat today, where it lives, how much of its life is used up, and a reminder the day before.',
    screen: s('screen-04-item-details', 'Tomatoes, eat today'),
  },
  {
    title: 'Pick what needs eating',
    body: 'Select the tomatoes, cheese and bacon straight off the shelves, and tap Show Recipes.',
    screen: s('screen-03-select-to-cook', 'Three items selected'),
  },
  {
    title: 'Cook what you have',
    body: 'Dishes that use what you already have first, each marked all in, or with what you’d still need.',
    screen: s('screen-06-generated-recipes', 'Generated recipes'),
  },
  {
    title: 'One fridge, two shoppers',
    body: 'The basket shows who added what, marks what’s already at home, and keeps a notes thread, so nobody buys a third bag of spinach.',
    screen: s('screen-07-shopping-basket', 'Shopping basket'),
  },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'exploded',
    span: 'two-thirds',
    title: 'The fridge door, in layers',
    blurb: 'The client asked for the logo and veg magnets on the door. Four layers of the real component: the door, the magnets, a note from whoever you share with, and the way in.',
    ratio: 363 / 266,
    layers: [
      { src: `${KIT}/door-layer-0.webp`, label: 'The door' },
      { src: `${KIT}/door-layer-1.webp`, label: 'Magnets' },
      { src: `${KIT}/door-layer-2.webp`, label: 'A note from Ben' },
      { src: `${KIT}/door-layer-3.webp`, label: '14 items, 3 to eat first' },
    ],
  },
  {
    kind: 'states',
    span: 'third',
    title: 'One, then three',
    blurb: 'Pick items off the shelves and the button counts them.',
    ratio: RATIO,
    items: [
      { src: `${KIT}/state-fr-1.webp`, label: '1 selected' },
      { src: `${KIT}/state-fr-3.webp`, label: '3 selected' },
    ],
  },
  {
    kind: 'anatomy',
    span: 'third',
    title: 'An item, five jobs',
    blurb: 'Enough to decide whether it’s dinner tonight.',
    src: `${KIT}/item-sheet.webp`,
    ratio: 375 / 544.2,
    pins: [
      { x: 41, y: 36.5, label: 'Days left, in a ring' },
      { x: 72, y: 23.5, label: 'What to do, not just a date' },
      { x: 2.6, y: 53.8, label: 'Straight onto the list' },
      { x: 2.6, y: 72, label: 'Fridge, Freezer or Cupboard' },
      { x: 2.6, y: 88.3, label: 'Its whole life, and where today is' },
    ],
  },
  {
    kind: 'palette',
    span: 'two-thirds',
    title: 'Dark, green, and three places',
    blurb: 'The dark look and the green stay from the original. Fridge, Freezer and Cupboard each have a colour, and so does every stage of freshness.',
    font: { family: 'Plus Jakarta Sans', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=swap', sample: '3d', note: 'one family' },
    swatches: [
      { hex: '#0C0D0B', name: 'Night' },
      { hex: '#1B1D19', name: 'Card' },
      { hex: '#34C759', name: 'Fridge' },
      { hex: '#4FA8F5', name: 'Freezer' },
      { hex: '#F5C33B', name: 'Cupboard' },
      { hex: '#FF9F2E', name: 'Eat me' },
      { hex: '#FF5A4E', name: 'Not so fresh' },
      { hex: '#D6EEFB', name: 'Glass' },
    ],
  },
  {
    kind: 'media',
    span: 'half',
    title: 'Door, shelf, item',
    blurb: 'From the fridge door into the fridge, then into one item.',
    src: `${IMG}/reel-fridge.mp4`,
    aspect: 'aspect-[4/3]',
  },
  {
    kind: 'media',
    span: 'half',
    title: 'Select, then cook',
    blurb: 'Three items off the shelves, and recipes that use them.',
    src: `${IMG}/reel-cook.mp4`,
    aspect: 'aspect-[4/3]',
  },
];

const cap = (f: string) =>
  f
    .replace(/^(screen|state)-[\da-z]+-/, '')
    .replace(/-/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
const ROW = [
  'screen-01-home',
  'screen-02-inside-fridge',
  'screen-03-select-to-cook',
  'screen-04-item-details',
  'screen-05-scan-detected',
  'state-05a-generating',
  'screen-06-generated-recipes',
  'screen-07-shopping-basket',
  'screen-08-login',
].map((f) => ({ src: `${KIT}/${f}.webp`, caption: cap(f) }));

// A freshness ring like the app's, drawn small: how much of the item's life is left.
function Ring({ color, left, label }: { color: string; left: number; label: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(237,234,224,0.1)" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${c * left} ${c}`}
          transform="rotate(-90 28 28)"
        />
      </svg>
      <span className="font-sans text-sm" style={{ color: FG }}>
        {label}
      </span>
    </div>
  );
}

// What three rounds of founder feedback decided, in their words.
function Rounds() {
  const rows = [
    { k: 'Kept', v: 'The fridge from idea 1.' },
    { k: 'Kept', v: 'The food statuses from idea 3: fresh, eat me, not so fresh.' },
    { k: 'Changed', v: 'Show expiry in days, not hours or weeks.' },
    { k: 'Changed', v: 'Lose the snowflake icon. People read it as freezer.' },
    { k: 'Named', v: 'Fridge: cold items. Freezer: frozen items. Cupboard: outside of fridge or freezer.' },
  ];
  return (
    <section id={sectionId('Three rounds')} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <SectionIntro eyebrow="Five ideas, three rounds" heading="The founders picked the fridge.">
          I started with five directions for home. Over three rounds of feedback, the founders took the parts they
          liked from each and sharpened the words.
        </SectionIntro>
      </Reveal>
      <div className="mt-10 grid gap-3 md:grid-cols-5">
        <Reveal className="md:col-span-3">
          <ol className="rounded-3xl p-2" style={{ background: 'rgba(237,234,224,0.04)', border: `1px solid ${FAINT}` }}>
            {rows.map((r, i) => (
              <li
                key={r.v}
                className="flex gap-4 px-4 py-4 md:px-5"
                style={{ borderTop: i ? `1px solid ${FAINT}` : undefined }}
              >
                <span className="w-16 shrink-0 pt-1 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: r.k === 'Kept' ? '#34C759' : MUTED }}>
                  {r.k}
                </span>
                <span className="font-sans text-lg leading-snug" style={{ color: FG }}>
                  {r.v}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal className="md:col-span-2">
          <div
            className="flex h-full flex-col justify-between gap-8 rounded-3xl p-6"
            style={{ background: 'rgba(237,234,224,0.04)', border: `1px solid ${FAINT}` }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
              From idea 3
            </p>
            <div className="flex justify-around">
              <Ring color="#34C759" left={0.8} label="Fresh" />
              <Ring color="#FF9F2E" left={0.4} label="Eat me" />
              <Ring color="#FF5A4E" left={0.12} label="Not so fresh" />
            </div>
            <p className="font-sans text-base leading-relaxed" style={{ color: MUTED }}>
              Three stages became the ring on every item: it empties as the food ages and changes colour as it goes.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: 'What was your role in this?',
    // ASK JOY: confirm "sole designer, about four months", and who the developers were.
    a: 'I was the only designer, working with Foovy’s two founders and their developers for about four months in 2020. I took it from five early concepts through three rounds of feedback to launch-ready flows, screens, prototypes and animations.',
  },
  {
    q: 'What did the brief ask for?',
    a: 'A lot: add items by barcode, voice or photo, a countdown on every item, Fridge, Freezer and Cupboard views, recipes from three or four ingredients, a shared shopping list, allergies and reminders. And it still had to feel simple enough to open every day.',
  },
  // ASK JOY: design stack; did the app launch, and what happened after; what you'd do differently.
];

export function Foovy() {
  return (
    <CaseShell
      title="Foovy"
      lede="A food-waste app that shows what’s in your fridge, and what to cook before it goes off."
      people={[JOY]}
      meta={
        <>
          Sole designer{SEP}2020
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
                Foovy is a UK start-up. In 2020 I designed their iOS app with the two founders: a live list of
                everything in the fridge, freezer and cupboard, added by barcode, voice or photo, and recipes from
                what needs using up.
              </>
            }
          />

          <ScaleHero id={sectionId('The app')} kind="phone" ratio={RATIO} screens={LINEUP} />

          <Rounds />

          <ScrollDeviceStory
            id={sectionId('Shop to pan')}
            kind="phone"
            ratio={RATIO}
            deviceSide="left"
            steps={FLOW}
            intro={
              <SectionIntro heading="From the shopping bag to the pan.">
                Scan it in, watch it count down, cook it before it goes, and shop together for the next lot.
              </SectionIntro>
            }
          />

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The fridge door and an item’s details, pulled apart. The layers are captures of the real HTML screens."
            tiles={PARTS}
            onOpen={open}
          />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="phone"
            ratio={RATIO}
            heading="Same fridge, calmer."
            blurb="Inside the fridge, before and after, in the same frame. Drag across to compare."
            before={{ src: `${KIT}/before-inside-fridge.webp`, label: 'Before' }}
            after={{ src: `${KIT}/screen-02-inside-fridge.webp`, label: 'After' }}
            facts={[
              { label: 'Fridge, Freezer, Cupboard', before: 'A Switch Section link under the shelves', after: 'Three tabs at the top, with counts' },
              { label: 'Days left', before: 'A small badge with a thin arc', after: 'A ring around the whole item' },
              { label: 'Shelves', before: 'Three shelves', after: 'Three shelves and a crisper drawer' },
            ]}
          />

          <section className="pt-8">
            <Reveal>
              <SectionIntro heading="Every screen." className="mb-10">
                Home, fridge, item, scan, recipes, basket and sign-in. Hover to slow it down, click to open one.
              </SectionIntro>
            </Reveal>
          </section>
          <MarqueeWall
            rows={[ROW]}
            aspect="aspect-[375/812]"
            cardClass="w-[44vw] max-w-[220px] sm:w-[20vw] sm:max-w-[240px]"
            durationsMs={[48000]}
            onOpen={open}
          />

          <HighlightBanner
            src={`${KIT}/dribbble-02-freshness.webp`}
            title="A shelf you can read at a glance"
            blurb="Every item in its freshness ring, green to amber to red."
            aspect="aspect-[4/3]"
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
