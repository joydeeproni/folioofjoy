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

// Fortna WES — cart-mounted tablet and pack station on the Apple-style kit:
// statement → tablet lineup → one cart, pinned → the pack line in context →
// closer look → the cart taken apart → before/after of the pack station →
// every screen over the originals → FAQ. Facts come from the project files
// (_case-studies/toptal/fortna-wes.md and the original screens in reference/).

const IMG = '/work/fortna';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;

const TOC = ['Overview', 'On the cart', 'One cart, start to finish', 'On the line', 'Up close', 'Taken apart', 'Before and after', 'Every screen', 'FAQ'];

const STATEMENT = [
  'Fulfilment centres lean on temporary and seasonal staff.',
  'On a first shift, someone has to push a cart to the right rack and put the right item in the right tote.',
  'At the end of the line, someone else packs it, and every short or damaged item has to be dealt with without a supervisor.',
];

const s = (file: string, alt: string, live?: string) => ({ src: `${KIT}/${file}.webp`, alt, ...(live ? { live: `${LIVE}/${live}` } : {}) });

const SCREENS = {
  pick: s('screen-04-pick-to-light', 'Pick to light: put 5 into tote T-4633', '03-pick.html'),
  go: s('screen-01-go-to-location', 'Go to aisle 675, bay 082, location 24B'),
  make: s('screen-03-make-cart', 'Make cart: scan an empty tote'),
  made: s('screen-02-make-cart-complete', 'Cart complete, 12 totes'),
  put: s('screen-05-put-confirmed', 'Put confirmed'),
  pack: s('screen-06-pack-station', 'Pack station: 3 of 5 packed'),
  short: s('screen-07-items-short', 'Report items short'),
  dump: s('screen-08-dump-cart', 'Dump cart'),
};

const LINEUP = [SCREENS.pick, SCREENS.go, SCREENS.make, SCREENS.made, SCREENS.put, SCREENS.pack, SCREENS.dump];

const STEPS: StoryStep[] = [
  {
    title: 'Build the cart, tote by tote',
    body: 'Scan empty totes onto a 12-slot cart. The next open slot is outlined, and the cart on screen fills up the way the real one does.',
    screen: SCREENS.make,
  },
  {
    title: 'Twelve of twelve',
    body: 'Once every slot holds a tote, the cart is complete and one button starts picking.',
    screen: SCREENS.made,
  },
  {
    title: 'Go here',
    body: 'Aisle, bay and location in type big enough to read from the cart handle, with the cart’s capacity and a route to the rack.',
    screen: SCREENS.go,
  },
  {
    title: 'Put it in the lit tote',
    body: 'Scan the item and its photo comes up with how many to put. On the cart, the target tote lights lime, just like the put-to-light on the physical cart.',
    screen: SCREENS.pick,
  },
  {
    title: 'Confirmed, next stop',
    body: 'The tote gets its tick, the count drops to zero, and the next location is one tap away.',
    screen: SCREENS.put,
  },
  {
    title: 'Empty it at the end',
    body: 'Scan each tote as it comes off the cart onto the conveyor. A damaged tote is one button, not a conversation.',
    screen: SCREENS.dump,
  },
];

const CLOSER: CloserItem[] = [
  { label: 'Pick to light', body: 'Scan the location label, the target tote lights up, confirm the put.', screen: { src: `${IMG}/reel-pick.mp4` } },
  { label: 'Make cart', body: 'Each scan drops a tote into the next open slot until the cart is complete.', screen: { src: `${IMG}/reel-make-cart.mp4` } },
  { label: 'Next location', body: 'Aisle, bay and location in one row, big enough to read from the cart handle. Area, zone and level underneath.', screen: { src: `${KIT}/detail-next-location.webp` } },
  { label: 'The route', body: 'A map of the pick face with the path from where you are to the rack you need.', screen: { src: `${KIT}/detail-route-map.webp` } },
  { label: 'Packing five', body: 'Every scan fills one segment. At five of five the bar is full and the item is done.', screen: { src: `${IMG}/reel-pack.mp4` } },
  { label: 'Short, in seconds', body: 'Quantity steppers and the common reasons as chips: damaged, not in tote, wrong item. The order is flagged for a re-pick and the packer moves on.', screen: SCREENS.short, kind: 'tablet' },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'exploded',
    span: 'full',
    title: 'The cart is the interface',
    blurb: 'The screen draws the actual cart: three shelves, twelve totes. Four layers of the real component, pulled apart.',
    ratio: 1444 / 980,
    layers: [
      { src: `${KIT}/cart-layer-0.webp`, label: 'Shelves and posts' },
      { src: `${KIT}/cart-layer-1.webp`, label: 'Totes and slot numbers' },
      { src: `${KIT}/cart-layer-2.webp`, label: 'Done ticks' },
      { src: `${KIT}/cart-layer-3.webp`, label: 'The lit tote: put 5' },
    ],
  },
  {
    kind: 'anatomy',
    span: 'two-thirds',
    title: 'One item, five jobs',
    blurb: 'The pack station’s current item. Each part answers something a packer needs mid-reach.',
    src: `${KIT}/pack-anatomy.webp`,
    ratio: 1512 / 916,
    pins: [
      { x: 8, y: 18, label: 'A photo big enough to check what you’re holding' },
      { x: 80, y: 37, label: 'SKU, and whether it’s fragile' },
      { x: 70, y: 49, label: 'A count you can read from a step back' },
      { x: 88, y: 62, label: 'One segment per unit' },
      { x: 64.5, y: 76.4, label: 'Short and Confirm, as equals' },
    ],
  },
  {
    kind: 'palette',
    span: 'third',
    title: 'Fortna’s own colours',
    blurb: 'Steel for totes and actions, lime for put here and done, amber for exceptions.',
    font: { family: 'Archivo', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@800&display=swap', sample: '675', note: 'numbers at 800' },
    swatches: [
      { hex: '#5D87A1', name: 'Steel' },
      { hex: '#1F3A4B', name: 'Steel 900' },
      { hex: '#B2B83A', name: 'Lime' },
      { hex: '#FDB913', name: 'Amber' },
      { hex: '#8B2346', name: 'Burgundy' },
      { hex: '#232628', name: 'Ink' },
    ],
  },
];

const AFTER_ROW = [SCREENS.go, SCREENS.make, SCREENS.made, SCREENS.pick, SCREENS.put, SCREENS.pack, SCREENS.short, SCREENS.dump].map((x) => ({
  src: x.src,
  caption: `After · ${x.alt}`,
}));
const BEFORE_ROW = [
  ['original-navigate', 'Go to next location'],
  ['original-make-cart', 'Make cart'],
  ['original-pick', 'Put items in tote'],
  ['original-dump', 'Dump totes'],
  ['before-pack', 'Pack station'],
  ['original-short', 'Items short'],
  ['original-pack-detail', 'Pack station, with data'],
].map(([f, caption]) => ({ src: `${KIT}/${f}.webp`, caption: `Before · ${caption}` }));

const FAQ = [
  {
    q: 'What was your role?',
    a: 'UX lead on the pack station, from concept to development, and I designed the cart-picking flows alongside it: make cart, go to location, pick to tote, dump cart. I worked with GGK’s design and BA teams and Fortna’s product and engineering.',
  },
  {
    q: 'What was the brief?',
    a: 'A pack station that lets packers finish every order fast and handle every exception without help, with a learning curve low enough for people who haven’t had significant training.',
  },
  {
    q: 'How did you get there?',
    a: (
      <>
        <p>
          A heuristic evaluation of the existing screens and contextual inquiry with packers early on. I reworked the
          information architecture from a competitive analysis, then drew the red routes: the few paths packers take
          hundreds of times a shift. Those got the most attention.
        </p>
        <p>
          With the BA team I produced the first wireframes, then prototypes we used for usability testing, and refined
          the journey from what we saw.
        </p>
      </>
    ),
  },
  // ASK JOY: what did usability testing turn up? what shipped, and anything you'd do differently?
];

export function Fortna() {
  return (
    <CaseShell
      title="Fortna WES"
      lede="Pick it, put it, pack it: a cart-mounted tablet and a pack station a new hire can use on day one."
      people={[JOY]}
      meta={
        <>
          UX lead{SEP}GGK{SEP}2018
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
                Fortna builds the software that runs distribution centres. Its warehouse execution system directs pickers
                around the floor with a tablet on a cart, and tells packers what goes in each carton. At GGK I was UX lead
                on a new pack station, and designed the cart-picking flows that feed it.
              </>
            }
          />

          <Reveal>
            <SectionIntro heading="One instruction per screen.">
              Every screen opens with a dark bar that says the next thing to do. If a temp on day one can read it from
              the cart handle, it works.
            </SectionIntro>
          </Reveal>
          <ScaleHero id={sectionId('On the cart')} kind="tablet" screens={LINEUP} />

          <ScrollDeviceStory
            id={sectionId('One cart, start to finish')}
            kind="tablet"
            steps={STEPS}
            intro={
              <SectionIntro heading="From empty totes to the conveyor.">
                The red route a picker walks hundreds of times a shift: build the cart, go, put, confirm, and empty it at
                the end.
              </SectionIntro>
            }
          />

          <HighlightBanner
            id={sectionId('On the line')}
            src={`${IMG}/reel-conveyor.mp4`}
            title="At the end of the line"
            blurb="The pack station runs on monitors along a conveyor pack line. The same one instruction at the top, the same colours, adapted to a widescreen."
            aspect="aspect-[4/3] md:aspect-[16/9]"
            onOpen={open}
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The cart and the pack item carry the whole floor. Layers and pins are captures of the real HTML screens."
            tiles={PARTS}
            onOpen={open}
          />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="tablet"
            heading="Same station, one clear next step."
            blurb="The pack station before, and after. Drag across to compare."
            before={{ src: `${KIT}/before-pack.webp`, label: 'Before' }}
            after={{ src: SCREENS.pack.src, label: 'After' }}
            facts={[
              { label: 'What to do now', before: 'A grey strip under the header', after: 'A dark instruction bar in large type' },
              { label: 'The count', before: 'Qty ordered in a dark box', after: '3 of 5 packed, with a bar that fills per unit' },
              { label: 'Reporting short', before: 'A small button under the quantity', after: 'Short beside Confirm, the same size' },
              { label: 'Tote and carton', before: 'End tote, Pack all, New LPN', after: 'The same three, in a fixed toolbar' },
            ]}
          />

          <section id={sectionId('Every screen')} className="scroll-mt-24 pt-8">
            <SectionIntro heading="Every screen, over the originals." className="mb-10">
              Cart picking and packing, with the original screens underneath. Hover to slow it down, click to open one.
            </SectionIntro>
          </section>
          <MarqueeWall
            rows={[AFTER_ROW, BEFORE_ROW]}
            aspect="aspect-[4/3]"
            cardClass="w-[74vw] max-w-[460px] sm:w-[36vw]"
            durationsMs={[56000, 62000]}
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
