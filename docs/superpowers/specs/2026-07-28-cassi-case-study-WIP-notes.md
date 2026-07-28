# Cassi case study redesign — in-progress brainstorm notes

**Status:** brainstorm paused at the first clarifying question. NOT a finished spec.
**Date:** 2026-07-28
**Branch:** `feat/wip-construction-sign` (the committed work here is unrelated — see "Already shipped")

Resume by reading this file, then answering the open questions in order.

---

## What the redesign is

Rebuild the Cassi case study (`components/case-study/cassi.tsx`) with a scroll flow
modelled on <https://www.apple.com/apple-books/>, reusing components and styling from
the Tactile Create Suite case study.

Joy's brief, verbatim in substance:

1. Opens with a **slab of text with the Cassi logo on top**.
2. Scrolling reveals a **row of mobiles** showing screenshots/videos of the Cassi app.
3. Another **blurb**.
4. A **moving carousel** — reuse the Tactile Create UI-screens carousel, but with mobile
   screens, so the aspect ratio changes accordingly.
5. **Bento / image snippets with a blurb** — build this as a reusable component for later use.
6. **Q&A** — reuse the Tactile Create FAQ accordion.
7. **End nav to other case studies.**

Two standing constraints:

- **Chrome does not change.** The scroll-collapsed title, the right-side section bar, and
  the bottom case-study nav all stay as they are.
- **Typography matches the articles.** Same ballpark as the current writings articles.
- **Copy is dummy for now** — same length and size as the Apple Books reference text.
  Joy will edit it as we go. Do not invent final copy.

---

## Findings from the codebase (already verified, don't re-derive)

### The chrome is free

`BackLink` and `CaseNav` (prev/next case studies) are rendered by the page, not the case
component — `app/work/[slug]/page.tsx:27-29`. They survive any rewrite of `cassi.tsx`
untouched. `CaseNav` reads prev/next from `getPrevNext()` in `components/case-study/cases.ts`.

### Two different case-study architectures exist

- **`CaseStudyLayout`** (`components/case-study/case-study-layout.tsx`) — the two-column
  scroll-driven frame: prose scrolls left, sticky `VisualStage` crossfades on the right.
  **Cassi currently uses this.** This is what the redesign replaces.
- **`TactileCreate`** (`components/case-study/tactile-create.tsx`) — does NOT use
  `CaseStudyLayout`. It owns its own chrome and is the model to follow:
  - collapsed sticky title — lines 392–398
  - `ArticleToc` right rail — line 406 (labels come from the `TOC` array, line 23)
  - content column — `max-w-5xl`, line 408
  - bottom-edge fade — lines 401–404

Section ids are `slugify(label)` so the rail and the DOM ids derive from one string.

### Reusable pieces in `tactile-create.tsx`

| Component | Line | What it does |
|---|---|---|
| `Statement` | 107 | Big text slab; each line brightens 5%→100% on scroll. Good candidate for the opening slab. |
| `SuiteShelf` | 135 | Horizontal shelf of logo + name + blurb cards, first card aligned to the heading. |
| `ScrollVideoCarousel` | 162 | Signature moment: hero video scales 2.0→1 then pans into a row. 300vh sticky. |
| `VideoCard` | 203 | Bare autoplaying video, `aspect-[16/10]`, rounded, no chrome. **Aspect must change for mobile.** |
| `SmallShot` / `Marquee` / `MarqueeWall` | 216 / 243 / 266 | Auto-scrolling image rows, opposite directions, hover slows to 0.3×, click opens lightbox. **This is the "moving carousel" to reuse.** |
| `Lightbox` | 278 | Click-to-open image overlay, Esc to close, locks body scroll. |
| `FeatureCarousel` | 309 | Snap carousel, image + caption below. |
| `FaqAccordion` | 340 | The Q&A to reuse. Single-open accordion, Plus/Minus icons. |

Layout constants worth reusing: `FULL_BLEED` (92), `SHELF` (96), `SHELF_PAD` (97).

Palette: `FG #EDEAE0`, `BG #0B0B0B`, `MUTED rgba(237,234,224,0.55)`,
`FAINT rgba(237,234,224,0.14)`, `ACCENT #2CA152`.

### Typography reference

- `components/case-study/prose.tsx` — `Eyebrow` / `H2` / `P` / `Pull` / `List` primitives.
- `components/content/markdown.tsx` — the article scale to match: `p` is
  `text-lg leading-relaxed`, `h2` is `text-3xl`, blockquote is a 2px `#2CA152` left border.

---

## Asset audit (measured with ffprobe — this was the expensive part)

All Cassi media is on Vercel Blob. There is **no** `public/work/cassi/` directory.

```
BLOB = https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work
```

Full inventory of Cassi files, with real dimensions:

| File | Dimensions | Ratio (w/h) | Duration |
|---|---|---|---|
| `cassi-error-reporting.mp4` | 664×1440 | **0.461 — exact 9:19.5** | 28.9s |
| `fact-card-01.png` | 393×852 | **0.461 — exact 9:19.5** | — |
| `cassi-onboarding-splash.mp4` | 736×1440 | 0.511 | 16.5s |
| `cassi-bathroom-maintenance-video.mp4` | 774×1440 | 0.538 | 27.7s |
| `property-listing-02.png` | 1028×1908 | 0.539 | — |
| `mortgage-upload-01.png` | 1112×1964 | 0.566 | — |
| `cassi-home-dashboard-concept.mp4` | 846×1440 | 0.588 | 68.4s |
| `cassi-maintenance-flow.mp4` | 1080×1080 | 1.000 (square) | 62.4s |
| `cassi-assistant-speaking.mp4` | 800×706 | 1.133 | 10.4s |
| `cassi-carousel.mp4` | 1440×1080 | 1.333 (4:3) | 10.0s |
| `cassi-fundraising-deck.mp4` | 1440×1080 | 1.333 (4:3) | 30.0s |
| `onboarding-flow-01.png` | 1776×968 | 1.835 (flow map) | — |
| `upload-progress-01.png` | 2068×782 | 2.644 (5 frames in a row) | — |

**Consequence:** ~7 assets are portrait enough for the mobile row and carousel, but only
two are exactly 9:19.5 — the rest need `object-cover` cropping to sit in a uniform row.
The 6 square/landscape items belong in the bento and landscape slots instead.

Captions for every one of these already exist in `lib/work/local.ts:16-39` — reuse them
rather than writing new ones.

**Missing:** no Cassi logo exists anywhere in the repo or on Blob. This blocks item 1.

---

## Open questions, in order

1. **Cassi logo** (blocking, asked and dismissed — re-ask first). Options put to Joy:
   (a) he exports a file to `Downloads/Design Exports` and I wire it in;
   (b) set the wordmark in Galeria, no image;
   (c) pull it off cassihome.com and vendor it into `public/work/cassi/`.
2. **Mobile row framing** — device bezel/mockup chrome, or bare rounded cards? And is
   `object-cover` cropping acceptable given only 2 of 13 assets are exactly 9:19.5?
3. **Section count and the right-rail TOC labels** — Tactile Create uses 5
   (`Overview, Creative Suite, In motion, Up close, FAQ`). What are Cassi's?
4. **Bento component API** — it has to be reusable afterwards. Images + blurb: how many
   tiles, fixed or masonry, does the blurb sit beside or above the grid?
   Note `components/case-study/controls/bento.tsx` already exists but hardcodes
   `BASE = '/work/tactile-core'` and is built for the sticky stage, so it needs
   generalising (accept a base or full srcs) before Cassi can use it.

---

## Already shipped this session (unrelated to Cassi)

Commit `96f77c5` on `feat/wip-construction-sign` — under-construction roadworks sign on
unfinished listings in `/writings`:

- `wip?: boolean` added to `CaseMeta`; set on all cases except Tactile Create.
- On WIP case rows the sign replaces the category label; rows with a date (Folio of Joy)
  keep the date and show the sign beside it.
- Also flagged on Control Panel OS. The no-href `Row` variant gained `group` so hover works.
- Tooltip is the cassette's `Tooltip`/`TooltipContent` but on `side="top"` (`left` covered
  the adjacent date).
- Tactile Create's category retagged "AI · Platform" → "Web".
- Artwork is `public/construction-sign.svg` (Joy's export), referenced via `<img>` from
  `components/icons/construction-sign.tsx` — ~31KB of paths on ten rows, so it's fetched
  once rather than inlined.

### Loose ends

- `.claude/` is still untracked. `launch.json` (dev-server config) is worth tracking;
  `settings.local.json` is machine-specific and should be gitignored.
- `pnpm lint` fails — `eslint` is not installed.
- `tsc --noEmit` reports one **pre-existing** error at `lib/color.ts:207` (`ThemeColors`
  missing `link`/`foreground`/`foregroundRgb`/`onAccent`). Not caused by this work.
- Dev server: `.claude/launch.json` defines the `folioofjoy` entry on port 3000.
