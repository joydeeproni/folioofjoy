import type { WritingListItem } from '@/lib/sanity/queries'

// Bespoke, code-rendered writings (rich prose + inline SVG/ASCII diagrams) that
// don't fit the Sanity prose pipeline. Metadata here is merged into the Writings
// list/nav; the matching React body lives in components/writings and is resolved
// by app/writings/[slug]/page.tsx via the local-articles registry.
export const LOCAL_WRITINGS: WritingListItem[] = [
  {
    slug: 'designing-for-low-literacy',
    number: '02',
    title: 'Designing For Low Literacy',
    type: 'Case Study',
    postedOn: '',
  },
  {
    slug: 'better-social-proof',
    number: '03',
    title: 'Better Social Proof',
    type: 'Research',
    postedOn: 'March 9th, 2021',
  },
]

export const LOCAL_SLUGS: ReadonlySet<string> = new Set(LOCAL_WRITINGS.map((w) => w.slug))

// Merge local entries into a Sanity-fetched list and re-sort by number (asc).
export function mergeLocalWritings<T extends { number?: string; slug: string }>(
  sanity: T[],
  local: T[],
): T[] {
  const bySlug = new Map(sanity.map((w) => [w.slug, w]))
  for (const w of local) bySlug.set(w.slug, w)
  return [...bySlug.values()].sort((a, b) => (a.number ?? '').localeCompare(b.number ?? ''))
}
