import { BRAND, BRAND_ORDER, type BrandColor } from '@/lib/brand';
import type { StampFont } from './greetings';

// The three stamp designs. 'postal' is the original ring stamp; 'passport' and
// 'globe' come from the Tactile Create V3 Figma (node 451:6770) and are built on
// Google Sans Flex's wdth axis plus the shared continents mask.
export type StampStyle = 'postal' | 'passport' | 'globe';
export const STAMP_STYLES: StampStyle[] = ['postal', 'passport', 'globe'];

// A single stamp pressed into the guestbook.
export interface Stamp {
  id: string;
  page: number;
  /** Position as a fraction of the page box, 0–1, so it survives any resize. */
  x: number;
  y: number;
  /** Degrees, roughly ±18 — nobody presses a stamp perfectly straight. */
  rot: number;
  color: BrandColor;
  /** ISO-3166 alpha-2, or '' when we genuinely couldn't tell. */
  country: string;
  /** The greeting in its original script, e.g. 'नमस्ते' — the stamp's top ring. */
  hello: string;
  /** Latin country name — the bottom ring. */
  place: string;
  /** Full phrase in the local language; the stamp's label and hover title. */
  line: string;
  /** Which font tier can set `hello`; see lib/guestbook/greetings.ts. */
  font: StampFont;
  /** Which of the three designs to press. */
  style: StampStyle;
  /** ISO date of the press; rendered as the date in the stamp's middle. */
  at: string;
}

// What a client is allowed to choose. Everything else (country, greeting,
// colour, date, id) is decided server-side so a crafted request can't put
// arbitrary text on the page.
export interface StampRequest {
  page: number;
  x: number;
  y: number;
}

// At the 19% stamp footprint, 24 marks preserve the intended overlap without
// turning the spread into one solid block of ink. Once it reaches this point a
// fresh spread becomes the landing page and the filled pages stay browsable.
export const PAGE_CAPACITY = 24;
export const MAX_PAGES = 24;

// Derived from a server-owned seed, so a spread gets a mix of all three designs
// without letting the client choose arbitrary visual properties. The GET preview
// and POST use the same visitor/page seed, so what is hovered is what gets pressed.
export function stampStyleFor(seed: string): StampStyle {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 37 + seed.charCodeAt(i)) >>> 0;
  return STAMP_STYLES[h % STAMP_STYLES.length];
}

export function stampColor(seed: string): BrandColor {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return BRAND_ORDER[h % BRAND_ORDER.length];
}

export function stampRotation(seed: string, max = 16): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 41 + seed.charCodeAt(i)) >>> 0;
  const unit = h / 0xffffffff;
  return Math.round((unit * 2 - 1) * max);
}

export function hexFor(color: BrandColor): string {
  return BRAND[color];
}
