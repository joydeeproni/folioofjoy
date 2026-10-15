export interface Country { code: string; name: string; bn: string; symbol: string; letter: string }
export type Season = 'spring' | 'summer' | 'fall' | 'autumn' | 'winter';
export interface StampOptions {
  /** width in px (default 96); height follows the stamp's shape */
  size?: number;
  frame?: 'perforated' | 'line' | 'none';
  /** default 'auto' = the season on `date` for that country (flipped in the southern hemisphere) */
  season?: Season | 'auto' | 'none';
  /** default 'auto' = the year of `date` */
  year?: number | string | 'auto' | 'none';
  /** show the country code in the bar (default true) */
  tag?: boolean;
  /** accessible name; '' makes the SVG decorative */
  title?: string;
  /** date used for 'auto' (default now) */
  date?: Date;
}
export const countries: Country[];
export function stampFor(code: string): Country | null;
/** ISO code from the browser language region (e.g. "da-DK" -> "DK"), or null */
export function detectCountry(): string | null;
export function seasonFor(code: string, date?: Date): Season;
export function stampSVG(code: string, options?: StampOptions): string;
export function stampBits(code: string, options?: Omit<StampOptions, 'size' | 'title'>): { w: number; h: number; bits: Uint8Array };
declare global {
  interface Window { BPStamps: { countries: Country[]; stampFor: typeof stampFor; detectCountry: typeof detectCountry; seasonFor: typeof seasonFor; stampSVG: typeof stampSVG; stampBits: typeof stampBits } }
  interface HTMLElementTagNameMap { 'bp-stamp': HTMLElement }
}
