// Canonical case-study list — the single source of truth for the Cases index
// and for prev/next navigation. Order here is the display order (newest first).
// `wip` marks a case whose write-up isn't finished: the Cases index renders
// those rows barricaded and unclickable, and prev/next skips them, so nothing
// on the site links into a draft. The pages themselves still render at
// /work/<slug> for previewing. Drop the flag once a case is done.
// `archive` files a case under the Archive tab instead of Cases: older client
// work kept on record rather than featured.
export type CaseMeta = { title: string; category: string; year: number; slug: string; wip?: boolean; archive?: boolean };

export const CASES: CaseMeta[] = [
  { title: 'Tactile Create', category: 'Web', year: 2026, slug: 'tactile-create' },
  { title: 'Create Canvas', category: 'Web', year: 2025, slug: 'canvas' },
  { title: 'Cassi', category: 'Mobile', year: 2025, slug: 'cassi' },
  { title: 'Knobs, Sliders & Dials', category: 'Components', year: 2025, slug: 'knobs' },
  { title: 'Pitzsa', category: 'Web', year: 2024, slug: 'pitzsa', wip: true },
  { title: 'Fido', category: 'Mobile', year: 2023, slug: 'fido', archive: true },
  { title: 'Ursula', category: 'Mobile', year: 2022, slug: 'ursula', archive: true },
  { title: 'WinnowPro', category: 'Web', year: 2021, slug: 'winnowpro', archive: true },
  { title: 'Nikai Egypt', category: 'Web', year: 2021, slug: 'nikai', archive: true },
  { title: 'SellCrowd', category: 'Mobile', year: 2020, slug: 'sellcrowd', archive: true },
  { title: 'Foovy', category: 'Mobile', year: 2020, slug: 'foovy', archive: true },
  { title: 'Teen Health Planner', category: 'Mobile', year: 2020, slug: 'teen-health-planner', archive: true },
  { title: 'LEGO Moulding', category: 'Tablet', year: 2019, slug: 'lego-moulding', archive: true },
  { title: 'SXchange', category: 'Web', year: 2019, slug: 'sxchange', archive: true },
  { title: 'Convey Health', category: 'Web', year: 2018, slug: 'convey-health', archive: true },
  { title: 'MedForce', category: 'Web', year: 2018, slug: 'medforce', archive: true },
  { title: 'Fortna WES', category: 'Tablet', year: 2018, slug: 'fortna', archive: true },
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
  // Featured and archived cases each walk their own list, so a featured case
  // never hands you off into the archive (or back).
  const current = LIVE_CASES.find((c) => c.slug === slug);
  if (!current) return {};
  const list = LIVE_CASES.filter((c) => !!c.archive === !!current.archive);
  const i = list.indexOf(current);
  return { prev: list[i - 1], next: list[i + 1] };
}
