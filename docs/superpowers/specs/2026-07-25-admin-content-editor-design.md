# Admin Content Editor — Design

**Date:** 2026-07-25
**Status:** Approved in brainstorm; pending spec review.

## Goal

A local, dev-only editor at `/admin` where Joy can edit **case studies** and **articles** — section text (markdown), titles, and per-section media (image / video / zoom / bento) — while seeing the page in its **exact production design and fonts**. Edits save as JSON into the repo; the live site renders from that JSON after commit + deploy.

The point is to stop hand-editing `.tsx` for copy and media changes. Joy edits; I keep owning the hand-coded interactive blocks.

## Source of truth & persistence (decided)

- **Local-only, writes to the repo.** The editor runs only under `next dev`. Save writes `content/<type>/<slug>.json`; uploads write to `public/work/<slug>/`. Joy commits + deploys to publish.
- **No backend, no database, no auth.** All write endpoints are hard-guarded to `process.env.NODE_ENV === 'development'` and return 403 otherwise, so they cannot run on the deployed site.

## Architecture — overlay JSON + block registry

Content stays code **by default**. The editor introduces an optional JSON **overlay** per item.

- **Production render path:** for a given slug, if `content/<type>/<slug>.json` exists → render via a data-driven renderer; else → render the existing coded component (today's behavior). Non-destructive; migration is per-item and opt-in.
- Rejected alternatives: full migration of all content to data now (too big/risky for Tactile Core's interactivity); editing `.tsx` via AST patching (fragile).

### Coded-block registry

Hand-coded visuals (ASCII panels, the before/after mock, the contact-sheet wall) can't be expressed as data. They are registered by id in a `CODED_BLOCKS` map and referenced from JSON as `{ kind: 'coded', ref: '<id>' }`. Production looks them up; the editor shows them read-only ("edit in code").

## Content model

New editable types (in `lib/content/editable.ts`; reuse `Annotation`/`Focus` from `components/case-study/types.ts`).

```ts
type EditableVisual =
  | { kind: 'image'; src: string; alt: string; fit?: 'contain' | 'cover' }
  | { kind: 'video'; src: string; poster?: string; alt?: string }
  | { kind: 'zoom'; src: string; alt: string; focus?: Focus; annotations?: Annotation[] }
  | { kind: 'bento'; columns?: 2 | 3; images: { file: string; alt?: string }[] }
  | { kind: 'coded'; ref: string };

interface EditableSection {
  id: string;
  act?: string;
  eyebrow?: string;
  heading?: string;
  caption?: string;
  body: string;            // markdown
  visual: EditableVisual;
}

interface EditableCaseStudy {
  slug: string;
  title: string;
  header: { title: string; lede: string; meta: string };
  sections: EditableSection[];
  footer?: { headline: string; note: string };
}

interface EditableArticle {
  slug: string;
  title: string;
  titled?: string;
  subhead?: string;
  postedOn?: string;
  body: string;            // markdown (was Writing.body[] paragraphs)
  references?: { label: string; href: string }[];
}
```

### What is editable per visual type

| Visual | Editor controls |
|---|---|
| image / video | replace · remove · **drag-drop upload** → `public/work/<slug>/` |
| zoom | image picker · focus `{x,y,scale}` (sliders) · add/move/remove annotation dots |
| bento | add / remove / reorder screens · 2–3 column toggle |
| coded | read-only, labelled "edit in code" |

Most of Tactile Core (zoom + bento beats) becomes editable via forms; only the 3–4 hand-coded blocks stay code.

### Markdown scope

Basic only: **bold**, *italic*, links, bullet + numbered lists, headings, and `>` blockquote → the existing `Pull` pull-quote. Rendered through the **real prose primitives** (`H2`, `P`, `Pull`, `List`) so it matches production exactly. A small markdown renderer maps to those components (library vs. minimal custom parser decided at plan time).

## Production render

- `CaseStudyRenderer({ data })` maps `EditableSection[]` → `CaseStudySection[]`: markdown body → ReactNode via the markdown renderer; `image`/`video`/`zoom` pass through to `Visual`; `bento` → `{ kind: 'component', render: () => <Bento … /> }`; `coded` → `{ kind: 'component', render: CODED_BLOCKS[ref] }`. Feeds the existing `CaseStudyLayout`.
- `app/work/[slug]/page.tsx` and the writings template page gain an overlay check: JSON present → renderer; else existing component.

## Editor UX

- `app/admin/page.tsx` (currently a placeholder): in production, keep the existing "visit joydeeproni.com" screen; in dev, show an **index** of all case studies (`CASES`) and writings (`LOCAL_WRITINGS`), each linking to its editor.
- `app/admin/edit/[type]/[slug]/page.tsx`: loads the overlay JSON (or a blank scaffold), renders the **real two-column layout / article template** with editing affordances:
  - Section text edited as **markdown source with live preview** in the real design (full inline WYSIWYG is a later enhancement — Joy asked for editable markdown, which this satisfies).
  - Per-section control rail: media controls (per table above), plus add / delete / reorder section.
  - **Save** assembles and `PUT`s the JSON.

## API (dev-only)

- `app/api/admin/content/[type]/[slug]/route.ts` — `GET` (read overlay JSON, or 404), `PUT` (write `content/<type>/<slug>.json`).
- `app/api/admin/upload/route.ts` — `POST` multipart → writes to `public/work/<slug>/`, returns the public path.
- All guarded: non-development → 403.

## Phasing

1. **Shell + persistence + Articles.** Editor index, dev API, JSON overlay for the template writings (already data-shaped) end-to-end. Proves the architecture on the easy content.
2. **Case studies.** `EditableCaseStudy` model, `CaseStudyRenderer`, `CODED_BLOCKS` registry, editing of text/media/reorder, zoom + bento forms.
3. **Polish.** Drag-to-reorder, upload UX, validation, empty/error states.

## Non-goals

- No auth, no live/production editing, no hosted DB, no multi-user.
- No full WYSIWYG contentEditable in phase 1 (markdown-source editing with live preview instead).
- No editing of hand-coded block internals through the UI.
- No versioning beyond git.

## Open items (resolve during planning)

- Markdown renderer: small dependency (e.g. `react-markdown`) vs. a minimal custom parser mapping to prose primitives.
- One-time bootstrap of overlay JSON for **existing** coded case studies (e.g. Tactile Core) — the ReactNode bodies can't be auto-extracted to markdown, so first adoption is an assisted/manual export.
- Reorder interaction (buttons vs. drag) — buttons acceptable for phase 2, drag in phase 3.
