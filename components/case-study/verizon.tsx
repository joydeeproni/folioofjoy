'use client';

import { CaseStudyLayout } from './case-study-layout';
import { P, Pull, List } from './prose';
import type { CaseStudySection } from './types';

// Process images (drop the pasted files into public/work/verizon/ with these names).
const IMG = '/work/verizon';

const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.5)';
const ACCENT = '#2CA152';

const SECTIONS: CaseStudySection[] = [
  {
    id: 'intro',
    eyebrow: 'The short version',
    body: (
      <>
        <P lead>
          Verizon runs huge warehouses of phones and wireless gear. The job here: give stock
          managers a way to track inventory and stock levels without spending their day hunting for
          boxes.
        </P>
        <P>
          The answer was a scanning app — point a phone camera at a rack and let the software do the
          counting, instead of checking off one box at a time.
        </P>
      </>
    ),
    visual: { kind: 'image', src: `${IMG}/scanner-home.gif`, alt: 'The Scanner app home screen — store/rack banner with Scan, Upload and History' },
    caption: 'Scanner — home',
  },
  {
    id: 'understanding',
    act: 'Understanding',
    eyebrow: 'The floor',
    heading: 'Racks, boxes, barcodes',
    body: (
      <>
        <P>
          An inventory is stores; stores are rooms of racks; racks hold boxes — sealed phones and
          comms devices. The stock manager keeps levels right by scanning every commodity on the
          rack. One box at a time.
        </P>
        <P>
          The insight that reframed the whole thing: don&rsquo;t scan boxes one by one — scan a group and
          make the app robust enough to do the rest.
        </P>
      </>
    ),
    visual: { kind: 'image', src: `${IMG}/warehouse-ops.png`, alt: 'Warehouse operations — stock taking, search & find, receiving, shipping' },
    caption: 'The warehouse floor',
  },
  {
    id: 'stories',
    act: 'Understanding',
    eyebrow: 'Requirements',
    heading: 'What it had to do',
    body: (
      <List
        items={[
          'Scan a barcode to pull IMEI and UPC info.',
          'Match images — find visually similar boxes from a reference.',
          'Count what’s scanned, segregate by model or type, and keep a record to update the inventory.',
          'Review past scans, then update stock straight from them.',
        ]}
      />
    ),
    visual: { kind: 'image', src: `${IMG}/retail-warehouse-flow.png`, alt: 'Where scanning happens across the shop floor and the warehouse' },
    caption: 'Where scanning happens',
  },
  {
    id: 'research',
    act: 'Process',
    eyebrow: 'How others do it',
    heading: 'Robust by default',
    body: (
      <>
        <P>
          A secondary sweep — Scandit, Samsung&rsquo;s enterprise Galaxy + AR scanning, Google Vision,
          Zbar — taught me what good scanning feels like. The through-line: the user should never
          have to configure the scan.
        </P>
        <Pull>Don&rsquo;t make someone tell the scanner what kind of code it&rsquo;s looking at. Detect it.</Pull>
        <P>
          So the flow became: scan &rarr; fetch info &rarr; save &rarr; it lands in History &rarr; review &rarr; update
          stock. Simple, forgiving, fast.
        </P>
      </>
    ),
    visual: { kind: 'image', src: `${IMG}/scan-flow.png`, alt: 'Flow: choose store and rack, scan by code or image, review in history, update stock' },
    caption: 'Scan → history → update',
  },
  {
    id: 'design',
    act: 'Design',
    eyebrow: 'Five screens',
    heading: 'Scan, store, review',
    body: (
      <>
        <P>
          The home screen leads with the one job — Scan — with Upload and History alongside. Before
          scanning, you pick the store and rack; a wide red banner up top makes sure you&rsquo;ve got the
          right one before a single box is counted.
        </P>
        <P>
          Scanning auto-detects the code and drops results into a swipe-up list. Scan-by-image lets
          you match against saved templates — point at a rack and it finds every box like the
          reference. Everything lands in History, where you review the captured video and counts and
          push the update to stock.
        </P>
      </>
    ),
    visual: { kind: 'image', src: `${IMG}/scan-by-image.png`, alt: 'Scan-by-image flow: add a new reference or select an existing template, then scan' },
    caption: 'Scan by image',
  },
  {
    id: 'result',
    act: 'Outcome',
    eyebrow: 'The payoff',
    heading: '500 hours back',
    body: (
      <>
        <div className="mb-8 flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <span>
            <span className="font-mono font-thin text-5xl md:text-6xl tracking-tight tabular-nums" style={{ color: FG }}>500+</span>
            <span className="ml-2 font-mono uppercase tracking-widest text-[11px]" style={{ color: MUTED }}>hours of scanning saved</span>
          </span>
        </div>
        <P>
          The result: automated stock scanning from a phone camera — auto-detect the barcode, fetch
          the data, update the system — replacing the manual asset-tracking grind. Group-scanning a
          rack instead of every box cut an estimated 500-plus hours of scanning.
        </P>
      </>
    ),
    visual: { kind: 'image', src: `${IMG}/history-update.png`, alt: 'History: stored scan video with product counts, reviewed then pushed to stock' },
    caption: 'Review & update stock',
  },
];

export function Verizon() {
  return (
    <CaseStudyLayout
      sections={SECTIONS}
      title="Verizon"
      header={
        <header className="pt-24 pb-4 md:pt-16">
          <p className="mb-4 font-sans font-medium text-sm tracking-[-0.02em] lowercase" style={{ color: ACCENT }}>
            Case study
          </p>
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: FG }}>
            Verizon
          </h1>
          <p className="mt-6 max-w-[36ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: FG }}>
            A stock-management app that lets warehouse managers scan inventory with a phone camera — and stop counting boxes one at a time.
          </p>
          <p className="mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>
            Product design · Mobile · Retail ops
          </p>
        </header>
      }
    />
  );
}
