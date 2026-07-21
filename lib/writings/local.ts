import type { WritingListItem, Writing } from '@/lib/content/types'

// All writings now live in code. Two kinds:
//  - Bespoke, code-rendered articles (rich prose + inline SVG/ASCII diagrams)
//    whose React bodies live in components/writings and are resolved by
//    app/writings/[slug]/page.tsx via the local-articles registry.
//  - Template-rendered docs (LOCAL_WRITING_DOCS below) that use the editorial
//    template in app/writings/[slug]/page.tsx — these were migrated off Sanity.
export const LOCAL_WRITINGS: WritingListItem[] = [
  {
    slug: 'the-invisible-interface',
    number: '01',
    title: 'The Invisible Interface',
    postedOn: 'July 13th, 2026',
  },
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

// Full content for template-rendered writings (the editorial layout with a
// title/hero/meta/body/references grid). Bespoke React articles are NOT here —
// they live in components/writings via LOCAL_ARTICLES.
export const LOCAL_WRITING_DOCS: Record<string, Writing> = {
  'the-invisible-interface': {
    slug: 'the-invisible-interface',
    number: "01",
    title: "The Invisible Interface",
    postedOn: "July 13th, 2026",
    titled: "On CLIs, agents, and the vanishing UI",
    subhead: "The best interface disappears",
    references: [{ label: "Agents as the new users", href: "#" }, { label: "When the UI gets out of the way", href: "#" }],
    body: [
      "Use of CLI amongst non-developers and non-designers intrigues me. The other day one of our users asked us if we had MCP for a SaaS tool we spent months designing and optimizing the \"UX\" for. And the intended user wants an AI agent to go and use that tool for them!",
      "I think about this a lot lately, this sudden shift of mindset and change of user behavior and way we interact with our computers.",
      "Isn't that the point of human computer interaction design though, the interface should be almost invisible, so that people just go, do their job and get out of there ASAP, unless the business of the product relies on constant engagement or it's a game.",
      "What will be the meaning of UI design 10 years from now, if everyone decides to use CLI or a chat interface or even voice to accomplish their job?",
      "And maybe that's what UI design would be all about.",
    ],
  },
}

export const LOCAL_SLUGS: ReadonlySet<string> = new Set(LOCAL_WRITINGS.map((w) => w.slug))

// Sort writings by their number (asc) — the display order for the list and nav.
export function sortByNumber<T extends { number?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.number ?? '').localeCompare(b.number ?? ''))
}
