'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/reveal';
import { Statement } from './shared/statement';
import { FaqAccordion } from './shared/faq-accordion';
import { SEP } from './shared/case-credits';
import { CaseShell, SectionIntro, sectionId } from './shared/case-shell';
import { ScaleHero } from './shared/scale-hero';
import { ScrollDeviceStory, type StoryStep } from './shared/scroll-device-story';
import { CloserLook, type CloserItem } from './shared/closer-look';
import { DeconstructBento, type DeconstructTile } from './shared/deconstruct-bento';
import { BeforeAfter } from './shared/before-after';
import { DeviceFrame } from './shared/device-frame';
import { FAINT, FG, MUTED } from './shared/tokens';
import { JOY } from './team';

// Nikai Egypt — web case study on the Apple-style kit, in Tactile Create's
// shape: statement → a lineup that settles → the store finder, live → the
// pages, pinned → up close → the phone, live → taken apart → before and after.
// Facts come from the 2021 files (CASESTUDY.md); no results were recorded.

const IMG = '/work/nikai';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;
const URL = 'nikaiegypt.com';

const TOC = ['Overview', 'The site', 'Where to buy', 'The pages', 'Up close', 'On a phone', 'Taken apart', 'Before and after', 'FAQ'];

const STATEMENT = [
  'In 2021 Nikai brought its TVs and home appliances to Egypt, through other people’s shops.',
  'People meet the brand at B.TECH, at Raya or on Souq. Then they look it up.',
  'Nobody searches for a brand. They search for the nearest shop that has it.',
];

const k = (file: string) => `${KIT}/${file}.webp`;

const LINEUP = [
  { src: k('screen-home-hero'), live: `${LIVE}/01-home.html`, alt: 'Homepage hero: the 65 inch TV, a size picker and the retailers' },
  { src: k('screen-home-categories'), alt: 'Product categories as a bento' },
  { src: k('screen-home-where-to-buy'), alt: 'Find Nikai in your city' },
  { src: k('screen-product'), alt: '65 inch UHD Smart TV, with where to buy' },
  { src: k('screen-product-specs'), alt: 'The full spec sheet' },
  { src: k('screen-support'), alt: 'Request support and find a service center' },
];

// panRatio = full screenshot height ÷ width, so long pages scroll inside the browser.
const STEPS: StoryStep[] = [
  {
    title: 'The TV comes first',
    body: 'The flagship TV on a black stage, with a size picker and a spec card. The retailers sit right under it: buy at B.TECH, Raya or Souq.',
    screen: { src: k('screen-home-hero'), alt: 'Homepage hero' },
  },
  {
    title: 'Rooms, not a catalogue',
    body: 'A bento instead of four equal tiles. TVs get the most room, kitchen goes wide, home care and comfort sit smaller, all with real product cut-outs from the brand’s library.',
    screen: { src: k('screen-home-categories'), alt: 'Product categories' },
  },
  {
    title: 'Every spec, and where to buy it',
    body: 'A size switcher, four key numbers, the retailers with a link to each, then the full spec sheet grouped into picture, sound and connections.',
    screen: { src: k('full-product'), alt: 'Product page, full length' },
    panRatio: 5836 / 2880,
  },
  {
    title: 'Aftercare is part of the promise',
    body: 'Request support sits in the nav. Three steps: what you need, which product, your details. Next to it, a finder for the nearest service center.',
    screen: { src: k('full-support'), alt: 'Support page, full length' },
    panRatio: 3958 / 2880,
  },
];

const CLOSER: CloserItem[] = [
  { label: 'The homepage', body: 'From the TV to the rooms, the numbers, the store finder and support, in one scroll.', screen: { src: `${IMG}/reel-homepage.mp4` } },
  { label: 'Where to buy, per product', body: 'Every retailer that stocks it, with a link to each. Prices are set by the retailer, and the panel says so.', screen: { src: k('retailers') } },
  { label: 'A bento of rooms', body: 'TVs large, kitchen wide, home care and comfort smaller. Each tile goes straight to its range.', screen: { src: k('detail-category-bento') } },
  { label: 'Request support', body: 'Three quick steps, and a call back within one working day.', screen: { src: k('detail-support-request') } },
  { label: 'On the phone', body: 'The homepage on a phone, with a bottom bar that keeps support in reach.', screen: { src: `${IMG}/reel-mobile.mp4` } },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'anatomy',
    span: 'full',
    title: 'The store finder, five jobs',
    blurb: 'One panel answers the only question that matters after the store: where can I get this near me?',
    src: k('wtb-anatomy'),
    ratio: 1240 / 719.7,
    pins: [
      { x: 27.4, y: 40, label: 'Twelve cities, with a count for each' },
      { x: 27.4, y: 78, label: 'A close-up of the Delta and Cairo, where most stores are' },
      { x: 40, y: 62, label: 'The whole country on one map' },
      { x: 70.6, y: 21, label: 'The stores in your city' },
      { x: 70.6, y: 86, label: 'Or buy online' },
    ],
  },
  {
    kind: 'states',
    span: 'full',
    title: 'One map, any city',
    blurb: 'The same map as you pick Cairo, Alexandria, Asyut or Sohag.',
    ratio: 510 / 679.7,
    items: [
      { src: k('map-cairo'), label: 'Cairo' },
      { src: k('map-alexandria'), label: 'Alexandria' },
      { src: k('map-asyut'), label: 'Asyut' },
      { src: k('map-sohag'), label: 'Sohag' },
    ],
  },
  {
    kind: 'palette',
    span: 'half',
    title: 'Nikai red, on a black stage',
    blurb: 'Red for action, black for the TVs, and one type family with an Arabic partner for the bilingual nav.',
    font: { family: 'Onest', href: 'https://fonts.googleapis.com/css2?family=Onest:wght@800&display=swap', sample: '65″', note: 'with Tajawal' },
    swatches: [
      { hex: '#E3141E', name: 'Nikai red' },
      { hex: '#A80C14', name: 'Red 700' },
      { hex: '#FDE6E7', name: 'Red 100' },
      { hex: '#0A0A0C', name: 'Stage' },
      { hex: '#1E1E22', name: 'Stage 3' },
      { hex: '#0E0E10', name: 'Ink' },
      { hex: '#6B6B73', name: 'Ink 3' },
      { hex: '#F5F5F3', name: 'Surface' },
    ],
  },
  {
    kind: 'anatomy',
    span: 'half',
    title: 'Where to buy, on every product',
    blurb: 'The product page answers the same question, for one TV.',
    src: k('retailers'),
    ratio: 540.5 / 314.25,
    pins: [
      { x: 66, y: 15, label: 'Who sets the price' },
      { x: 17.4, y: 43.6, label: 'The retailer, by its own logo' },
      { x: 60, y: 37, label: 'How many stores' },
      { x: 76.3, y: 43.6, label: 'In stock, or not' },
      { x: 87.8, y: 43.6, label: 'Straight to the retailer' },
    ],
  },
];

const FAQ = [
  {
    q: 'What was your role in this?',
    // ASK JOY: freelance or agency? Who built it, and who else was on the team?
    a: 'I designed the site end to end: the structure, the pages for home, product, support, about, awards, CSR and contact, and the handoff for the build. I worked from the brand’s product photography and marketing assets.',
  },
  {
    q: 'Why a map instead of a store list?',
    a: 'The original site asked you to pick your city from a dropdown. But nobody searches for a brand. They search for the nearest shop that has it, so the shops became content, not a footer. Most stores sit in the Delta and Cairo, so the map has a close-up for them.',
  },
  // ASK JOY: design stack in 2021; how the launch went; what you'd do differently.
];

// ── Where to buy, live ──────────────────────────────────────────────────────
// The real store-finder HTML in a browser frame. City chips below the frame
// drive it by postMessage (so it works at phone width too), and taps inside
// the frame report back, so both stay in sync.
const CITIES: [string, number][] = [
  ['Cairo', 6], ['Giza', 3], ['Alexandria', 4], ['Mansoura', 2], ['Tanta', 2], ['Al Sharqia', 2],
  ['Ismailia', 1], ['Banha', 1], ['Damanhour', 1], ['Fayoum', 1], ['Asyut', 1], ['Sohag', 1],
];

function WhereToBuy() {
  const ref = useRef<HTMLDivElement>(null);
  const [city, setCity] = useState('Cairo');
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.nikaiCity) setCity(e.data.nikaiCity);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const pick = (c: string) => {
    setCity(c);
    ref.current?.querySelector('iframe')?.contentWindow?.postMessage({ nikaiCity: c }, window.location.origin);
  };
  return (
    <>
      <div ref={ref}>
        <DeviceFrame
          kind="browser"
          url={URL}
          ratio={1440 / 901}
          interactive
          screen={{ src: k('where-to-buy'), live: `${LIVE}/where-to-buy.html`, alt: 'Find Nikai in your city: city chips, a map of Egypt and the stores' }}
          className="w-full"
        />
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Pick a city">
        {CITIES.map(([c, n]) => {
          const on = c === city;
          return (
            <button
              key={c}
              type="button"
              onClick={() => pick(c)}
              aria-pressed={on}
              className="h-9 rounded-full px-3.5 font-sans text-[14px] transition-colors"
              style={on ? { backgroundColor: FG, color: '#0B0B0B' } : { boxShadow: `inset 0 0 0 1px ${FAINT}`, color: FG }}
            >
              {c}
              <span className="ml-1.5" style={{ color: on ? 'rgba(11,11,11,0.5)' : MUTED }}>
                {n}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function Nikai() {
  return (
    <CaseShell
      title="Nikai Egypt"
      lede="A launch website for smart TVs and home appliances, built around one question: where can I buy this in my city?"
      people={[JOY]}
      meta={
        <>
          {/* ASK JOY: freelance, or through an agency? */}
          Product designer{SEP}2021
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
                Nikai is a Dubai-based brand with more than 400 products in over 60 countries. It doesn’t sell direct in
                Egypt, so the site had three jobs: explain the range, show the brand is real, and send people back to a
                shop. I designed it end to end, and every page leads to one of two places: a store that has the product,
                or someone who can help with it.
              </>
            }
          />

          <Reveal>
            <SectionIntro heading="Get the big picture.">
              Home, product and support, from the TV on the stage to the spec sheet. Scroll to line them up.
            </SectionIntro>
          </Reveal>
          <ScaleHero id={sectionId('The site')} kind="browser" url={URL} screens={LINEUP} />

          <section id={sectionId('Where to buy')} className="scroll-mt-24 py-16 md:py-24">
            <Reveal>
              <SectionIntro eyebrow="the signature" heading="Where to buy, on a map of Egypt." className="mb-10">
                The original site asked you to pick your city from a dropdown. Here it’s a map with every showroom city,
                a close-up of the Delta and Cairo, and the stores for the city you pick. Try it: pick a city.
              </SectionIntro>
            </Reveal>
            <Reveal>
              <WhereToBuy />
            </Reveal>
          </section>

          <ScrollDeviceStory
            id={sectionId('The pages')}
            kind="browser"
            url={URL}
            steps={STEPS}
            intro={
              <SectionIntro heading="A brand people meet in the store.">
                The site had to explain the range, show the brand is real, and send people back to a shop. Seven pages,
                and each one ends at where to buy, or at how to get help.
              </SectionIntro>
            }
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <section id={sectionId('On a phone')} className="scroll-mt-24 py-16 md:py-24">
            <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Reveal>
                <SectionIntro heading="Support, always in reach.">
                  <p>
                    On a phone the TV still comes first, with the sizes under it. A bottom bar keeps home, products, stores
                    and support one tap away, and the nav switches to Arabic.
                  </p>
                  <p className="mt-4">This is the real page. Scroll inside the phone.</p>
                </SectionIntro>
              </Reveal>
              <Reveal>
                <DeviceFrame
                  kind="phone"
                  interactive
                  screen={{ src: k('screen-mobile-hero'), live: `${LIVE}/m-home.html`, alt: 'The mobile homepage with the support bar' }}
                  className="mx-auto w-[72vw] max-w-[340px]"
                />
              </Reveal>
            </div>
          </section>

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The two panels that send people to a shop, pulled apart. Both are captures of the real HTML."
            tiles={PARTS}
            onOpen={open}
          />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="browser"
            url={URL}
            heading="The same TV, with somewhere to go."
            blurb="The homepage TV banner, before and after. Drag across to compare."
            before={{ src: k('before-hero'), label: 'Before' }}
            after={{ src: k('screen-home-hero'), label: 'After' }}
            facts={[
              { label: 'The hero', before: 'A banner: the TV on a marble stage', after: 'The TV with a size picker and a spec card' },
              { label: 'Where to buy', before: 'A city dropdown', after: 'Retailers under the TV, and a map of Egypt' },
            ]}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
