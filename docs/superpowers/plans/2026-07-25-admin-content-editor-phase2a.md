# Admin Content Editor — Phase 2A (Case-study JSON rendering) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make a case study render from an editable JSON overlay, identically to its coded version — the non-destructive foundation the Phase 2B inline editor builds on. Proven by migrating **Deterge** to `content/work/deterge.json`.

**Architecture:** Same overlay pattern as Phase 1. A client `CaseStudyRenderer` maps `EditableCaseStudy` JSON → the existing `CaseStudyLayout`: markdown body → prose primitives, `image`/`video`/`zoom` visuals pass through, `bento` → a `Bento` component, `coded` → a `CODED_BLOCKS` registry lookup. `app/work/[slug]/page.tsx` prefers the JSON overlay, else the existing registry component.

**Tech Stack:** Next 16 RSC, React 19, TS, `react-markdown` (present from Phase 1).

## Global Constraints

- **Non-destructive:** do not modify/delete `components/case-study/deterge.tsx`, the registry, or any coded study. Overlay only.
- **Parity:** the JSON-rendered Deterge must match the coded one — same headings, eyebrows, captions, body text, images, the metrics block, header, and footer.
- **Serialization boundary:** `CaseStudyRenderer` is a client component (`'use client'`); the server page passes it only plain JSON (`EditableCaseStudy`). Render closures for `bento`/`coded` are created inside the client renderer, never passed from the server.
- **Reuse existing prose styling:** case-study markdown maps to the look of `components/case-study/prose.tsx` (`FG #EDEAE0`, accent `#2CA152`).
- No test runner / no eslint: gate on `corepack pnpm exec tsc --noEmit` (ignore the pre-existing `lib/color.ts` error) + curl verification against the running dev server on `:3000`.
- Commit only each task's listed files; the tree has unrelated uncommitted work — never `git add -A`.

---

### Task 1: Case-study markdown, coded-block registry, overlay reader

**Files:**
- Modify: `components/content/markdown.tsx` (add `CaseStudyMarkdown`)
- Create: `components/case-study/coded-blocks.tsx`
- Modify: `lib/content/editable.ts` (add `readCaseStudyOverlay`)

**Interfaces:**
- Produces:
  - `CaseStudyMarkdown({ source }: { source: string }): JSX.Element`
  - `CODED_BLOCKS: Record<string, () => ReactNode>` and `renderCoded(ref: string): ReactNode`
  - `readCaseStudyOverlay(slug: string): Promise<EditableCaseStudy | null>`

- [ ] **Step 1: Add `CaseStudyMarkdown` to `components/content/markdown.tsx`**

Append to the existing file (keep `ArticleMarkdown` unchanged):

```tsx
const CS_FG = '#EDEAE0';

// Markdown mapped to the case-study prose look (components/case-study/prose.tsx).
// The first paragraph gets the pixel drop-cap, matching <P lead>.
export function CaseStudyMarkdown({ source }: { source: string }) {
  return (
    <div className="[&>p:first-of-type]:first-letter:font-pixel [&>p:first-of-type]:first-letter:text-5xl [&>p:first-of-type]:first-letter:mr-2 [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:leading-none" style={{ color: CS_FG }}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="font-sans text-[17px] md:text-lg leading-relaxed mb-5 text-pretty">{children}</p>,
          h2: ({ children }) => <h2 className="font-sans font-medium text-2xl md:text-3xl tracking-tight mb-4">{children}</h2>,
          ul: ({ children }) => <ul className="mb-6 space-y-2 pl-5 list-disc font-sans text-[17px] md:text-lg leading-relaxed">{children}</ul>,
          ol: ({ children }) => <ol className="mb-6 space-y-2 pl-6 list-decimal font-sans text-[17px] md:text-lg leading-relaxed">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => <a href={href} className="underline underline-offset-4 decoration-1 hover:opacity-70">{children}</a>,
          blockquote: ({ children }) => (
            <blockquote className="my-8 pl-5 font-sans text-xl md:text-2xl leading-snug tracking-tight" style={{ borderLeft: '2px solid #2CA152' }}>{children}</blockquote>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 2: Create the coded-block registry**

```tsx
// components/case-study/coded-blocks.tsx
'use client';

import type { ReactNode } from 'react';
import { MetricsPanel } from './controls/metrics-panel';

// Hand-coded visuals that can't be expressed as data, addressable by id from a
// case study's JSON overlay ({ kind: 'coded', ref: '<id>' }). Add entries here as
// coded studies are migrated.
export const CODED_BLOCKS: Record<string, () => ReactNode> = {
  'deterge:outcome-metrics': () => (
    <MetricsPanel stats={[{ value: '80+', label: 'weekly active' }, { value: '₹30k', label: 'invested' }, { value: '6', label: 'months' }]} />
  ),
};

export function renderCoded(ref: string): ReactNode {
  const block = CODED_BLOCKS[ref];
  if (block) return block();
  return <div className="font-mono text-sm text-white/40">coded block: {ref}</div>;
}
```

- [ ] **Step 3: Add the case-study overlay reader to `lib/content/editable.ts`**

Append (mirrors `readArticleOverlay`):

```ts
export async function readCaseStudyOverlay(slug: string): Promise<EditableCaseStudy | null> {
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, 'work', `${slug}.json`), 'utf8');
    return editableCaseStudySchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Typecheck + commit**

Run: `corepack pnpm exec tsc --noEmit` (ignore `lib/color.ts`).

```bash
git add components/content/markdown.tsx components/case-study/coded-blocks.tsx lib/content/editable.ts
git commit -m "feat(admin): case-study markdown, coded-block registry, overlay reader"
```

---

### Task 2: CaseStudyRenderer (data → CaseStudyLayout)

**Files:**
- Create: `components/case-study/renderer.tsx`

**Interfaces:**
- Consumes: `EditableCaseStudy` (Task 1 types), `CaseStudyMarkdown`, `renderCoded`, `Bento`, `CaseStudyLayout`, `CaseStudySection`/`Visual` types.
- Produces: `CaseStudyRenderer({ data }: { data: EditableCaseStudy }): JSX.Element`.

- [ ] **Step 1: Create the renderer**

```tsx
// components/case-study/renderer.tsx
'use client';

import { CaseStudyLayout } from './case-study-layout';
import { Bento } from './controls/bento';
import { renderCoded } from './coded-blocks';
import { CaseStudyMarkdown } from '@/components/content/markdown';
import type { CaseStudySection, Visual } from './types';
import type { EditableCaseStudy, EditableVisual } from '@/lib/content/editable';

function toVisual(v: EditableVisual): Visual {
  switch (v.kind) {
    case 'image': return { kind: 'image', src: v.src, alt: v.alt, fit: v.fit };
    case 'video': return { kind: 'video', src: v.src, poster: v.poster, alt: v.alt };
    case 'zoom': return { kind: 'zoom', src: v.src, alt: v.alt, focus: v.focus, annotations: v.annotations };
    case 'bento': return { kind: 'component', render: () => <Bento columns={v.columns} images={v.images} /> };
    case 'coded': return { kind: 'component', render: () => renderCoded(v.ref) };
  }
}

export function CaseStudyRenderer({ data }: { data: EditableCaseStudy }) {
  const sections: CaseStudySection[] = data.sections.map((s) => ({
    id: s.id,
    act: s.act,
    eyebrow: s.eyebrow,
    heading: s.heading,
    caption: s.caption,
    body: <CaseStudyMarkdown source={s.body} />,
    visual: toVisual(s.visual),
  }));

  return (
    <CaseStudyLayout
      sections={sections}
      title={data.title}
      header={
        <header className="pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: '#EDEAE0' }}>{data.header.title}</h1>
          <p className="mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: '#EDEAE0' }}>{data.header.lede}</p>
          <p className="mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>{data.header.meta}</p>
        </header>
      }
      footer={data.footer && (
        <footer className="py-16 md:py-24">
          <p className="font-sans text-2xl md:text-3xl tracking-tight text-balance" style={{ color: '#EDEAE0' }}>{data.footer.headline}</p>
          <p className="mt-4 max-w-[52ch] font-sans text-[15px] leading-relaxed" style={{ color: 'rgba(237,234,224,0.5)' }}>{data.footer.note}</p>
        </footer>
      )}
    />
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `corepack pnpm exec tsc --noEmit`

```bash
git add components/case-study/renderer.tsx
git commit -m "feat(admin): CaseStudyRenderer maps editable JSON to the real layout"
```

---

### Task 3: Overlay wiring in the case-study route

**Files:**
- Modify: `app/work/[slug]/page.tsx`

**Interfaces:**
- Consumes: `readCaseStudyOverlay` (Task 1), `CaseStudyRenderer` (Task 2).

- [ ] **Step 1: Prefer the JSON overlay, else the coded component**

In `app/work/[slug]/page.tsx`, add imports and an overlay branch inside the component, before the existing `getCaseStudy` lookup:

```tsx
import { readCaseStudyOverlay } from '@/lib/content/editable';
import { CaseStudyRenderer } from '@/components/case-study/renderer';
```

```tsx
  const overlay = await readCaseStudyOverlay(slug);
  if (overlay) {
    return (
      <main className={SHELL} style={{ backgroundColor: BG, color: FG }}>
        <BackLink href="/writings" />
        <CaseStudyRenderer data={overlay} />
        <CaseNav slug={slug} />
      </main>
    );
  }
```

- [ ] **Step 2: Typecheck + commit**

Run: `corepack pnpm exec tsc --noEmit`

```bash
git add "app/work/[slug]/page.tsx"
git commit -m "feat(admin): case-study route prefers JSON overlay"
```

---

### Task 4: Migrate Deterge to JSON and verify parity

**Files:**
- Create: `content/work/deterge.json`

- [ ] **Step 1: Write the overlay (a faithful transcription of `deterge.tsx`)**

Create `content/work/deterge.json`:

```json
{
  "slug": "deterge",
  "title": "Deterge",
  "header": {
    "title": "Deterge",
    "lede": "An online laundry service five of us built in college — fast, cheap, no hassle — that grew faster than we expected.",
    "meta": "Co-founder & design · Mobile · 2015–17 · University venture"
  },
  "sections": [
    {
      "id": "intro",
      "body": "Deterge was an online laundry service for college students — the kind of thing you build because your own laundry situation is genuinely broken. Ours was irregular and overpriced, so five of us in our third year built the app we wished existed.\n\nWe didn't want to buy machines or lease space — we were full-time students. So we became the technology layer instead: aggregate the launderers, own the experience, keep it simple.\n\n> We weren't a laundry business. We were the app that made laundry disappear.",
      "visual": { "kind": "image", "src": "/work/deterge/home.png", "alt": "Deterge home — “Hello, Joydeep” with a single Pick My Laundry button" },
      "caption": "Home — pick my laundry"
    },
    {
      "id": "origin",
      "act": "Origin",
      "eyebrow": "September 2015",
      "heading": "It started as a complaint",
      "body": "It started as a dorm conversation — me and four classmates griping about the campus laundry. We did the obvious thing and asked around: would you actually use an app for this? Enough people said yes that we stopped talking and started building.",
      "visual": { "kind": "image", "src": "/work/deterge/get-started.png", "alt": "Deterge get-started screen — “Let us do the things you hate”" },
      "caption": "The pitch"
    },
    {
      "id": "research",
      "act": "Process",
      "eyebrow": "Knowing the user",
      "heading": "Thirty conversations",
      "body": "I built personas from real people, not archetypes, then talked to thirty-odd students across the colleges nearby. The clearest signal came back fast: nobody wanted a signup wall. They wanted their clothes washed, not another account to remember.\n\nA competitive teardown of the laundry apps around us confirmed it — most buried the one thing you came to do under onboarding.",
      "visual": { "kind": "image", "src": "/work/deterge/rates.png", "alt": "Deterge rates — transparent per-item pricing by category" },
      "caption": "Transparent rates"
    },
    {
      "id": "decision",
      "act": "Process",
      "eyebrow": "The one decision",
      "heading": "Skip the login",
      "body": "So we made the call that shaped everything: the first screen isn't a login or a welcome splash — it's the booking screen. Open the app, request a pickup. Everything else can wait.\n\nPencil sketches became XD wireframes, and we cut every step that wasn't pulling its weight. Material Design as the base, with just enough of our own to feel like us on Android and iOS.\n\n> The first screen shouldn't ask who you are. It should do the thing you came for.",
      "visual": { "kind": "image", "src": "/work/deterge/location-time.png", "alt": "Deterge booking — pick pickup location on a map and a date/time slot" },
      "caption": "Booking-first"
    },
    {
      "id": "build",
      "act": "Ship",
      "eyebrow": "Making it real",
      "heading": "Built it, branded it",
      "body": "We shipped an Android app — Android Studio, Java and XML, Firebase for the backend. I worked the front end with the team. (We'd started with an ASP.NET / C# website, then replaced it with a landing page whose only job was to send you to the app.)\n\nThe brand was deliberately minimal — a plain wordmark in the spirit of Uber and Google, blue as the one colour, icons drawn in Illustrator. Your clothes came back in a reusable tote with your own tag on it. Small thing; people remembered it.",
      "visual": { "kind": "image", "src": "/work/deterge/status.png", "alt": "Deterge order status — a pickup-to-delivery timeline" },
      "caption": "Order status"
    },
    {
      "id": "outcome",
      "act": "Outcome",
      "eyebrow": "What happened",
      "heading": "It actually worked",
      "body": "We aggregated the local dhobiwaale, then landed a deal with a major provider contracted to Indian Railways — suddenly a student app had real infrastructure and manpower behind it.\n\nEighty-plus weekly active users in the first month, on ₹30k. But the part I'm proudest of is what it set off: classmates started building their own campus apps, and the institute spun up an incubator cell — and took Deterge's tech to keep it running after we'd moved on.",
      "visual": { "kind": "coded", "ref": "deterge:outcome-metrics" },
      "caption": "It actually worked"
    }
  ],
  "footer": {
    "headline": "The first real thing I ever shipped.",
    "note": "Originally written in 2017; I redesigned the screens as an exploration in 2019. My process has moved on a lot since — but this one still means the most."
  }
}
```

- [ ] **Step 2: Verify the overlay renders Deterge with parity**

With the dev server on `:3000`, run:
```bash
curl -s http://localhost:3000/work/deterge -o /tmp/det.html -w "http %{http_code}\n"
grep -o "It started as a complaint\|Thirty conversations\|Skip the login\|Built it, branded it\|It actually worked\|made laundry disappear\|weekly active\|/work/deterge/home.png\|The first real thing I ever shipped" /tmp/det.html | sort | uniq -c
```
Expected: every heading, the pull-quote text, the metrics label ("weekly active"), the first image path, and the footer all present — i.e. the JSON overlay renders the full case study.

- [ ] **Step 3: Confirm the coded version is bypassed (overlay wins)**

The overlay path renders `CaseStudyRenderer`, not the coded `Deterge`. Since both produce the same text, confirm no error and that `CaseNav` (prev/next) is present:
```bash
grep -o "Cases\|Prev\|Next\|case-nav\|←" /tmp/det.html | head
```
Expected: navigation chrome present; page is a normal 200 with the content above.

- [ ] **Step 4: Commit**

```bash
git add content/work/deterge.json
git commit -m "feat(admin): migrate Deterge to an editable JSON overlay (parity)"
```

---

## Self-Review

**Spec coverage (Phase 2A scope):**
- Case-study data → real layout renderer → Task 2 ✓
- Markdown body → case-study prose → Task 1 ✓
- `coded` block registry → Task 1 ✓; `bento`/`zoom`/`image`/`video` mapping → Task 2 ✓
- Non-destructive overlay in the route → Task 3 ✓
- Proven on a real study (Deterge) with parity → Task 4 ✓

**Placeholder scan:** none — every step has concrete code/commands; the migration JSON is complete.

**Type consistency:** `EditableCaseStudy`/`EditableVisual` (Phase 1 Task 1) are consumed by `readCaseStudyOverlay` (Task 1), `CaseStudyRenderer` (Task 2), and the route (Task 3). `renderCoded(ref)` (Task 1) is called by Task 2. `deterge:outcome-metrics` is defined in Task 1's registry and referenced in Task 4's JSON.

**Deferred to Phase 2B (not gaps):** the inline case-study editor (edit-on-page for eyebrow/heading/caption/body), visual editing forms (image/video swap+upload, zoom focus/annotations, bento lists), and section add/remove/reorder. Migrating the interactive studies (Tactile Core) also lands in 2B, where the zoom/bento/coded editing UI exists.
