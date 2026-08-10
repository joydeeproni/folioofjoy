// Canonical case-study list — the single source of truth for the Cases index
// and for prev/next navigation. Order here is the display order (newest first).
// `wip` marks a case whose write-up isn't finished: the Cases index renders
// those rows barricaded and unclickable, and prev/next skips them, so nothing
// on the site links into a draft. The pages themselves still render at
// /work/<slug> for previewing. Drop the flag once a case is done.
export type CaseMeta = { title: string; category: string; year: number; slug: string; wip?: boolean };

export const CASES: CaseMeta[] = [
  { title: 'Tactile Create', category: 'Web', year: 2026, slug: 'tactile-create' },
  { title: 'Create Canvas', category: 'Web', year: 2025, slug: 'canvas' },
  { title: 'Cassi', category: 'Mobile', year: 2025, slug: 'cassi' },
  { title: 'Knobs, Sliders & Dials', category: 'Components', year: 2025, slug: 'knobs' },
  { title: 'Pitzsa', category: 'Web', year: 2024, slug: 'pitzsa', wip: true },
  { title: 'Tactile Core', category: 'Strategy', year: 2022, slug: 'tactile-core', wip: true },
  { title: 'Insider', category: 'Web', year: 2020, slug: 'insider', wip: true },
  { title: 'Verizon', category: 'Mobile', year: 2018, slug: 'verizon', wip: true },
  { title: 'Deterge', category: 'Mobile', year: 2015, slug: 'deterge', wip: true },
];

// Finished cases lead the list; drafts fall below. Newest first within each
// group, ties keeping listed order (stable sort). Dropping a `wip` flag floats
// that case up on its own.
export const SORTED_CASES = [...CASES].sort(
  (a, b) => Number(!!a.wip) - Number(!!b.wip) || b.year - a.year,
);

// The finished cases, in display order. Prev/next walks this list only — a live
// case should never hand you off to a draft.
export const LIVE_CASES = SORTED_CASES.filter((c) => !c.wip);

export function getPrevNext(slug: string): { prev?: CaseMeta; next?: CaseMeta } {
  const i = LIVE_CASES.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return { prev: LIVE_CASES[i - 1], next: LIVE_CASES[i + 1] };
}
