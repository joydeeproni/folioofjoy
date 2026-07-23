// Canonical case-study list — the single source of truth for the Cases index
// and for prev/next navigation. Order here is the display order (newest first).
export type CaseMeta = { title: string; category: string; year: number; slug: string };

export const CASES: CaseMeta[] = [
  { title: 'Create Canvas', category: 'Web', year: 2025, slug: 'canvas' },
  { title: 'Cassi Home', category: 'Mobile', year: 2025, slug: 'cassi' },
  { title: 'Knobs, Sliders & Dials', category: 'Components', year: 2025, slug: 'knobs' },
  { title: 'Pitzsa', category: 'Web', year: 2024, slug: 'pitzsa' },
  { title: 'Tactile Core', category: 'Strategy', year: 2022, slug: 'tactile-core' },
  { title: 'Insider', category: 'Web', year: 2020, slug: 'insider' },
  { title: 'Verizon', category: 'Mobile', year: 2018, slug: 'verizon' },
  { title: 'Deterge', category: 'Mobile', year: 2015, slug: 'deterge' },
];

// Newest first; ties keep listed order (stable sort).
export const SORTED_CASES = [...CASES].sort((a, b) => b.year - a.year);

export function getPrevNext(slug: string): { prev?: CaseMeta; next?: CaseMeta } {
  const i = SORTED_CASES.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return { prev: SORTED_CASES[i - 1], next: SORTED_CASES[i + 1] };
}
