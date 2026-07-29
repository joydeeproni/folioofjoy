// Canonical case-study list — the single source of truth for the Cases index
// and for prev/next navigation. Order here is the display order (newest first).
// `wip` marks a case whose write-up isn't finished — the Cases index shows a
// barricade on those rows. Drop the flag once a case is done.
export type CaseMeta = { title: string; category: string; year: number; slug: string; wip?: boolean };

export const CASES: CaseMeta[] = [
  { title: 'Tactile Create', category: 'Web', year: 2026, slug: 'tactile-create' },
  { title: 'Create Canvas', category: 'Web', year: 2025, slug: 'canvas', wip: true },
  { title: 'Cassi', category: 'Mobile', year: 2025, slug: 'cassi' },
  { title: 'Knobs, Sliders & Dials', category: 'Components', year: 2025, slug: 'knobs', wip: true },
  { title: 'Pitzsa', category: 'Web', year: 2024, slug: 'pitzsa', wip: true },
  { title: 'Tactile Core', category: 'Strategy', year: 2022, slug: 'tactile-core', wip: true },
  { title: 'Insider', category: 'Web', year: 2020, slug: 'insider', wip: true },
  { title: 'Verizon', category: 'Mobile', year: 2018, slug: 'verizon', wip: true },
  { title: 'Deterge', category: 'Mobile', year: 2015, slug: 'deterge', wip: true },
];

// Newest first; ties keep listed order (stable sort).
export const SORTED_CASES = [...CASES].sort((a, b) => b.year - a.year);

export function getPrevNext(slug: string): { prev?: CaseMeta; next?: CaseMeta } {
  const i = SORTED_CASES.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return { prev: SORTED_CASES[i - 1], next: SORTED_CASES[i + 1] };
}
