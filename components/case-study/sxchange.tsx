'use client';

import { useState } from 'react';
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
import { FG } from './shared/tokens';
import { JOY } from './team';

// SXchange — web case study on the Apple-style kit, in Tactile Create's shape:
// statement → a lineup that settles → the deal bar (try it) → buy and sell,
// pinned → up close → taken apart → before and after → emails → every screen.
// Facts come from the 2019 files and the client's change list (CASESTUDY.md).

const IMG = '/work/sxchange';
const KIT = `${IMG}/kit`;
const LIVE = `${IMG}/live`;
const URL = 'SXchange · AIF units for sale';

const TOC = ['Overview', 'The marketplace', 'The deal bar', 'Buy and sell', 'Up close', 'Taken apart', 'Before and after', 'Emails', 'Every screen', 'FAQ'];

const STATEMENT = [
  'Money in an Alternative Investment Fund is locked in for years.',
  'Some investors need out early. Others would happily buy in, at a discount to NAV.',
  'Between them sits a wall of numbers: NAV, commitment, amount paid, balance payable.',
];

const k = (file: string) => `${KIT}/${file}.webp`;

const LINEUP = [
  { src: k('screen-02-listings'), live: `${LIVE}/01-listings.html`, alt: 'AIF units for sale, sorted by biggest discount' },
  { src: k('screen-03-fund-details'), alt: 'Fund details' },
  { src: k('screen-13-sell-units-and-amounts'), alt: 'Sell, units and amounts, with the buyer preview' },
  { src: k('screen-16-seller-dashboard'), alt: 'Seller dashboard with prospects' },
  { src: k('screen-09-buying-dashboard'), alt: 'Buying dashboard' },
  { src: k('screen-06-compare'), alt: 'Compare three funds' },
];

// panRatio = full screenshot height ÷ width, so long pages scroll inside the browser.
const STEPS: StoryStep[] = [
  {
    title: 'Sorted by the gap',
    body: 'Listings filter by AIF category, discount, strategy and vintage, and sort by biggest discount. A strip up top says how many are live, how much is on offer and the average discount.',
    screen: { src: k('screen-02-listings'), alt: 'Listings' },
    panRatio: 2944 / 2880,
  },
  {
    title: 'Everything before you ask',
    body: 'Price, units, the seller’s commitment, amount paid, balance payable, and whether it’s a default case. One button requests the seller’s details.',
    screen: { src: k('screen-03-fund-details'), alt: 'Fund details' },
    panRatio: 3624 / 2880,
  },
  {
    title: 'Every request has a next step',
    body: 'The buying dashboard tracks each request in four steps: requested, seller shared details, terms agreed, transfer approved. Price alerts flag a lower ask on a fund you watch.',
    screen: { src: k('screen-09-buying-dashboard'), alt: 'Buying dashboard' },
    panRatio: 2446 / 2880,
  },
  {
    title: 'Price it and see it',
    body: 'Selling takes three steps. On units and amounts, a preview shows the listing exactly as buyers will see it, and the balance payable is worked out for you.',
    screen: { src: k('screen-13-sell-units-and-amounts'), alt: 'Sell, units and amounts' },
    panRatio: 2240 / 2880,
  },
  {
    title: 'Prospects, one click away',
    body: 'Prospects expand under each listing: who they are, what they asked for, and a Share my details button. Pending approvals are counted at the top.',
    screen: { src: k('screen-16-seller-dashboard'), alt: 'Seller dashboard' },
    panRatio: 2942 / 2880,
  },
  {
    title: 'Approve with the evidence in view',
    body: 'Every listing is checked before it goes live, against the statement of account and other sellers of the same fund. The original slide-to-approve stayed.',
    screen: { src: k('screen-17-admin-review'), alt: 'Admin review' },
    panRatio: 1920 / 2880,
  },
];

const CLOSER: CloserItem[] = [
  { label: 'Request the seller', body: 'From a listing to the fund page to the seller’s details. Both sides get each other’s contact by email.', screen: { src: `${IMG}/reel-seller-info.mp4` } },
  { label: 'The buyer preview', body: 'Type a discount and the preview updates: the deal bar, the ask and the asking value, as a buyer will see them.', screen: { src: `${IMG}/reel-sell.mp4` } },
  { label: 'Slide to approve', body: 'An admin checks the listing, then slides to approve. The seller is told it’s live.', screen: { src: `${IMG}/reel-admin.mp4` } },
  { label: 'Find your organisation', body: 'Registration searches organisations already on SXchange, with a way to add a new one for review.', screen: { src: k('detail-organisation-search') } },
  { label: 'A wishlist that watches', body: 'Saved funds keep their deal bar, and flag when a second seller lists the same fund.', screen: { src: k('detail-wishlist-card') } },
  { label: 'In your pocket', body: 'Fund details on a phone, with the request button pinned where a thumb can reach it.', screen: { src: k('screen-22-mobile-fund-details'), alt: 'Fund details on a phone' }, kind: 'phone' },
];

const PARTS: DeconstructTile[] = [
  {
    kind: 'anatomy',
    span: 'full',
    title: 'One listing row, six jobs',
    blurb: 'Every listing is the same row, so a buyer can scan twenty-five of them for the biggest gap.',
    src: k('listing-row'),
    ratio: 1124 / 195.5,
    pins: [
      { x: 5.9, y: 12, label: 'Which fund, by its mark' },
      { x: 21.5, y: 88, label: 'Category and vintage' },
      { x: 56.1, y: 12, label: 'The striped gap is the discount' },
      { x: 49.3, y: 88, label: 'Ask against NAV, to four decimals' },
      { x: 63.2, y: 88, label: 'The discount, in green' },
      { x: 91.4, y: 12, label: 'One way in' },
    ],
  },
  {
    kind: 'exploded',
    span: 'half',
    title: 'The mobile card, in layers',
    blurb: 'Four layers of the real component: the card, the fund and its discount, the deal bar, and the size of the lot.',
    ratio: 800 / 454,
    layers: [
      { src: k('card-layer-0'), label: 'Card surface' },
      { src: k('card-layer-1'), label: 'Fund and discount' },
      { src: k('card-layer-2'), label: 'Deal bar' },
      { src: k('card-layer-3'), label: 'Units, value, wishlist' },
    ],
  },
  {
    kind: 'palette',
    span: 'half',
    title: 'Navy, blue and the logo’s yellow',
    blurb: 'The brand’s navy and blue carry the product. The yellow only ever means one thing: the discount.',
    font: { family: 'Plus Jakarta Sans', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&display=swap', sample: '₹8.7487', note: 'one family' },
    swatches: [
      { hex: '#363C60', name: 'Navy' },
      { hex: '#1284FC', name: 'Blue' },
      { hex: '#FCAE18', name: 'Yellow' },
      { hex: '#FFE3A8', name: 'Yellow 200' },
      { hex: '#0F7A47', name: 'Discount' },
      { hex: '#1B1E2E', name: 'Ink' },
      { hex: '#E6E8F2', name: 'Navy 100' },
      { hex: '#F6F7FA', name: 'Surface' },
    ],
  },
  {
    kind: 'states',
    span: 'half',
    title: 'In review, then live',
    blurb: 'The same review screen before and after the slide.',
    ratio: 1440 / 960,
    items: [
      { src: k('screen-17-admin-review'), label: 'In review' },
      { src: k('screen-18-admin-approved'), label: 'Approved' },
    ],
  },
  {
    kind: 'media',
    span: 'half',
    title: 'Checks, not a gut feel',
    blurb: 'Units against the statement of account, NAV against the manager’s statement, and whether the balance adds up.',
    src: k('detail-review-checks'),
    aspect: 'aspect-[1024/672]',
  },
];

const EVERY: [string, string][] = [
  ['screen-01-home', 'Home'],
  ['screen-02-listings', 'Listings'],
  ['screen-03-fund-details', 'Fund details'],
  ['screen-04-seller-info-sent', 'Seller details sent'],
  ['screen-05-login-to-contact', 'Log in to contact'],
  ['screen-06-compare', 'Compare'],
  ['screen-07-wishlist', 'Wishlist'],
  ['screen-08-wishlist-empty', 'Wishlist, empty'],
  ['screen-09-buying-dashboard', 'Buying dashboard'],
  ['screen-10-register-organisation', 'Register, your organisation'],
  ['screen-11-register-add-organisation', 'Register, add an organisation'],
  ['screen-12-sell-choose-fund', 'Sell, choose the fund'],
  ['screen-13-sell-units-and-amounts', 'Sell, units and amounts'],
  ['screen-14-sell-documents', 'Sell, documents'],
  ['screen-15-listing-submitted', 'Listing submitted'],
  ['screen-16-seller-dashboard', 'Seller dashboard'],
  ['screen-17-admin-review', 'Admin review'],
  ['screen-18-admin-approved', 'Approved'],
  ['screen-19-account-settings', 'Account settings'],
];
const ROWS = [EVERY.slice(0, 10), EVERY.slice(10)].map((row) => row.map(([f, caption]) => ({ src: k(f), caption })));

const FAQ = [
  {
    q: 'What was your role in this?',
    // ASK JOY: freelance or through an agency? Who were the founder and developers you worked with?
    a: 'I owned the product design end to end, working with the founder and the developers: flows for both sides, the switch between them, every screen and state, and the email templates.',
  },
  {
    q: 'Where did the rules for amounts come from?',
    a: (
      <>
        <p>
          The client’s own review, on 14 October 2019. Registration was hard. Errors showed codes instead of words. 475
          units showed up as 0475. “Balance amount” could mean two things.
        </p>
        <p>
          I turned each item into a rule. One format for money everywhere: Indian digit grouping, two decimals. Labels
          rewritten with the client: Discount (%), balance amount payable, is this a default case?
        </p>
      </>
    ),
  },
  // ASK JOY: design stack in 2019; what shipped and how it did; what you'd do differently.
];

// ── The deal bar, live ──────────────────────────────────────────────────────
// The real component's maths (NAV × (1 − discount)), in the product's own
// styling, with the discount on a slider. The fund is the one in the screens.
const NAV = 12.4981;
const inr = (n: number, d = 4) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

function DealBarPlay() {
  const [d, setD] = useState(30);
  const ask = NAV * (1 - d / 100);
  const pct = (ask / NAV) * 100;
  return (
    <div className="rounded-[20px] bg-white p-5 text-[#1B1E2E] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] md:p-8" style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700&display=swap" precedence="default" />
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-[#1E3A5F] text-[13px] font-bold text-white">MIO</span>
        <div className="min-w-0">
          <b className="block truncate text-[15px] md:text-[17px]">Meridian Income Opportunities Fund</b>
          <span className="text-[13px] text-[#72778F]">Meridian Capital · AIF Cat II</span>
        </div>
      </div>
      <p className="mt-6 text-[13px] text-[#72778F]">Asking price per unit</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
        <span className="text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums md:text-[44px]">{inr(ask)}</span>
        <span className="text-[15px] font-bold text-[#0F7A47] md:text-[17px]">{d}% off NAV</span>
      </p>
      <div className="relative mt-5 h-3 overflow-hidden rounded-[6px] bg-[#E6E8F2]">
        <span className="absolute inset-y-0 left-0 rounded-[6px] bg-[#363C60] transition-[width] duration-150" style={{ width: `${pct}%` }} />
        <span
          className="absolute inset-y-0 right-0 transition-[left] duration-150"
          style={{ left: `${pct}%`, background: 'repeating-linear-gradient(135deg,#FCAE18 0 4px,#FFE3A8 4px 8px)' }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[12.5px] text-[#72778F] tabular-nums">
        <span>
          Ask <b className="text-[#1B1E2E]">{inr(ask)}</b>
        </span>
        <span>NAV {inr(NAV)}</span>
      </div>
      <label className="mt-8 block border-t border-[rgba(27,30,46,0.08)] pt-5">
        <span className="flex justify-between text-[13px] font-medium text-[#4B5068]">
          <span>Discount (%)</span>
          <span className="tabular-nums">{d}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={d}
          onChange={(e) => setD(Number(e.target.value))}
          aria-label="Discount to NAV"
          className="mt-3 w-full accent-[#363C60]"
        />
      </label>
    </div>
  );
}

// Two emails side by side: the original and the one that does something.
function EmailPair({ onOpen }: { onOpen: (src: string) => void }) {
  const items = [
    { src: k('before-email'), label: 'Before', alt: 'The original new prospect email: an illustration and a button' },
    { src: k('screen-20-email-new-prospect'), label: 'After', alt: 'The new prospect email with the listing, its deal bar and the buyer' },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {items.map((it) => (
        <button key={it.label} type="button" onClick={() => onOpen(it.src)} className="group relative block overflow-hidden rounded-[18px] bg-white text-left">
          <img src={it.src} alt={it.alt} loading="lazy" className="aspect-square w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]" />
          <span className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] backdrop-blur" style={{ backgroundColor: 'rgba(11,11,11,0.62)', color: FG }}>
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function SXchange() {
  return (
    <CaseShell
      title="SXchange"
      lede="A second market for AIF units, where buyers see the discount before they read a number."
      people={[JOY]}
      meta={
        <>
          {/* ASK JOY: freelance, or through an agency? */}
          Product designer{SEP}2019
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
                Second String built SXchange so investors who need out can sell their units to buyers who want in. I
                designed the product end to end: listings, fund details, compare, a three-step sell flow, dashboards for
                buyers and sellers, admin review, and the emails that tie it together. Everyone on it can be a buyer, a
                seller, or both, so one switch in the nav flips between the two.
              </>
            }
          />

          <Reveal>
            <SectionIntro heading="See the deal before you read a number.">
              Listings, fund details, selling and both dashboards. Scroll to line them up.
            </SectionIntro>
          </Reveal>
          <ScaleHero id={sectionId('The marketplace')} kind="browser" url={URL} screens={LINEUP} />

          <section id={sectionId('The deal bar')} className="scroll-mt-24 py-16 md:py-24">
            <div className="grid items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-14">
              <Reveal>
                <SectionIntro eyebrow="the signature" heading="The striped gap is the discount.">
                  <p>
                    Every listing gets a deal bar. NAV is the full length, the asking price is the navy bar, and the gap
                    between them is striped in the yellow from the logo.
                  </p>
                  <p className="mt-4">You see how good the deal is before you read a number. Drag the discount to try it.</p>
                </SectionIntro>
              </Reveal>
              <Reveal>
                <DealBarPlay />
              </Reveal>
            </div>
          </section>

          <ScrollDeviceStory
            id={sectionId('Buy and sell')}
            kind="browser"
            url={URL}
            steps={STEPS}
            intro={
              <SectionIntro heading="One account, two jobs.">
                A buyer finds a gap and asks for the seller. A seller prices their units and meets the buyers. An admin
                checks every listing in between.
              </SectionIntro>
            }
          />

          <CloserLook id={sectionId('Up close')} items={CLOSER} />

          <DeconstructBento
            id={sectionId('Taken apart')}
            heading="Taken apart."
            blurb="The listing is the product, so it’s the part worth pulling apart. The layers are captures of the real HTML component."
            tiles={PARTS}
            onOpen={open}
          />

          <BeforeAfter
            id={sectionId('Before and after')}
            kind="browser"
            url="SXchange · Seller dashboard"
            heading="Amounts that read like money."
            blurb="The seller dashboard, before and after. Drag across to compare."
            before={{ src: k('before-seller-dashboard'), label: 'Before' }}
            after={{ src: k('screen-16-seller-dashboard'), label: 'After' }}
            facts={[
              { label: 'Buying or selling', before: 'A Switch to Buying button', after: 'A Buying / Selling switch in the nav' },
              { label: 'The price', before: 'NAV and discount as two numbers', after: 'A deal bar: the ask against NAV' },
              { label: 'Money', before: '8.4981, no currency', after: '₹ with Indian digit grouping' },
              { label: 'Prospects', before: 'A separate tab', after: 'Under each listing, with Share my details' },
            ]}
          />

          <section id={sectionId('Emails')} className="scroll-mt-24 py-16 md:py-24">
            <Reveal>
              <SectionIntro heading="Emails that do something." className="mb-10">
                The original new prospect email led with an illustration. The new one carries the listing, its deal bar
                and the buyer, with one action. You can decide what to do without opening the site.
              </SectionIntro>
            </Reveal>
            <Reveal>
              <EmailPair onOpen={open} />
            </Reveal>
          </section>

          <section id={sectionId('Every screen')} className="scroll-mt-24 pt-8">
            <SectionIntro heading="Every screen." className="mb-10">
              Home, registration, buying, selling, admin and settings. Hover to slow it down, click to open one.
            </SectionIntro>
          </section>
          <MarqueeWall rows={ROWS} aspect="aspect-[16/10]" cardClass="w-[78vw] max-w-[520px] sm:w-[40vw]" durationsMs={[64000, 58000]} onOpen={open} />

          <HighlightBanner
            src={k('mobile-mockup')}
            title="The deal bar fits in a thumb"
            blurb="Listings and fund details reflow for phones, with the request button pinned where a thumb can reach it."
            aspect="aspect-[4/3]"
            onOpen={open}
          />

          <FaqAccordion id={sectionId('FAQ')} heading="The questions I get asked." items={FAQ} />
        </>
      )}
    </CaseShell>
  );
}
