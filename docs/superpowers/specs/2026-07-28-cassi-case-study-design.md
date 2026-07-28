# Cassi case study — redesign spec

**Date:** 2026-07-28
**Status:** approved design, ready for an implementation plan
**Supersedes:** `2026-07-28-cassi-case-study-WIP-notes.md` (that file's asset audit is still the reference; its open questions are now answered)

Rebuild the Cassi case study with a scroll flow modelled on
<https://www.apple.com/apple-books/>, and extract the components it shares with the
Tactile Create Suite case study into a reusable layer.

---

## Decisions taken

| Question | Answer |
|---|---|
| Cassi logo | **Type only.** "Cassi" set in Galeria (`font-sans`). No image asset — none exists on Blob and the one on cassihome.com is near-black (`rgb(30,30,30)`) on transparent, so it would be invisible on `#0B0B0B`. |
| Mobile row framing | **Uniform cards with cropping.** Bare rounded `9/19.5` cards using `object-cover`, matching Tactile Create's chrome-less media idiom. No drawn device bezels. |
| Architecture | **Approach A** — extract shared components to `components/case-study/shared/` and refactor Tactile Create to consume them, so there is one copy of each. |
| Bento | A **new** component. The existing `controls/bento.tsx` is a stage-filling masonry with `BASE` hardcoded to `/work/tactile-core`; it is not touched. |
| Copy | Dummy placeholder prose at the Apple Books reference lengths. Joy edits it afterwards. |

## Constraints that must hold

- **Chrome does not change.** The scroll-collapsed title, the right-rail section index, and
  the bottom case-study nav all behave exactly as they do today.
  - `BackLink` and `CaseNav` are rendered by `app/work/[slug]/page.tsx:27-29` and need no work.
  - The collapsed title and `ArticleToc` are owned by the case component, copied from the
    pattern at `tactile-create.tsx:392-406`.
- **Typography matches the writings articles** — the scale in `components/content/markdown.tsx`
  (`p` → `text-lg leading-relaxed`, `h2` → `text-3xl`, accent `#2CA152`).
- **Tactile Create must render identically after the refactor.** Verified by screenshot, not by eye-rolling.

---

## Architecture

### New: `components/case-study/shared/`

All are client components except `tokens.ts`.

#### `tokens.ts`
Palette and layout constants, lifted verbatim from `tactile-create.tsx:16-21, 92-97`:
`FG`, `BG`, `MUTED`, `FAINT`, `ACCENT`, `FULL_BLEED`, `SHELF`, `SHELF_PAD`.

#### `media-card.tsx`
The primitive that makes aspect ratio a prop instead of a hardcoded class — this is what
lets one carousel serve both 16:10 desktop shots and 9:19.5 phone screens.

```
MediaCard({ src, aspect, className?, alt?, objectPosition? })
```

- Chooses `<video>` or `<img>` from the file extension (`.mp4`/`.webm` → video).
- Videos: `autoPlay muted loop playsInline preload="metadata"`.
- Shared shell: `rounded-xl border border-white/10 object-cover shadow-2xl`.
- Replaces `tactile-create.tsx`'s `VideoCard` (which becomes `MediaCard` with `aspect-[16/10]`).

```
ZoomableShot({ item, aspect, className?, onOpen })   // item: { src, caption }
```
`MediaCard` plus the hover dim + expand-icon overlay and the caption that fades in beneath —
i.e. today's `SmallShot` (`tactile-create.tsx:216-240`), generalised.

#### `statement.tsx`
```
Statement({ lines, trailing?, className? })
```
Today's `Statement` + `StatementLine` (`tactile-create.tsx:101-132`) with the copy lifted out
to props. Each line's opacity runs 0.05 → 1 across its scroll window; honours
`useReducedMotion` by rendering static lines.

#### `marquee-wall.tsx`
```
MarqueeWall({ rows, aspect, cardClass, durationsMs, onOpen })
// rows: Array<Array<{ src, caption }>>
```
Today's `Marquee` + `MarqueeWall` (`tactile-create.tsx:243-275`), generalised on row count,
aspect and card width. Preserved behaviour: per-frame motion so hover eases to 0.3× without a
jump, alternating direction per row, list duplicated for a seamless loop, reduced-motion static
fallback.

#### `lightbox.tsx`
Today's `Lightbox` (`tactile-create.tsx:278-306`), **extended to play video.** Cassi's carousel
pool is 5 videos and 2 images, so a click on a video currently opens nothing usable. When `src`
ends `.mp4`/`.webm` it renders `<video controls autoPlay loop playsInline>` in place of the
`<img>`; everything else (Esc to close, body-scroll lock, backdrop click, scale-in) is unchanged.

#### `faq-accordion.tsx`
```
FaqAccordion({ id, heading, items })   // items: { q, a }[]
```
Today's `FaqAccordion` (`tactile-create.tsx:340-365`) with heading and items as props.

#### `bento-grid.tsx` — new
```
BentoGrid({ id, heading, blurb?, tiles, onOpen })
// tile: { src, span: 'full' | 'half', title, blurb, aspect? }
```
- Two-column grid on `md:` and up (`grid md:grid-cols-2 gap-4`); `span: 'full'` tiles take
  `md:col-span-2`. Single column below `md`.
- Each tile is a card — faint border, `rgba(255,255,255,0.04)` fill, rounded — with `MediaCard`
  on top and `title` + `blurb` beneath, mirroring Apple Books' feature cards.
- `aspect` defaults per span: `16/9` for full, `4/3` for half. Overridable per tile.
- Media click calls `onOpen` for the lightbox.

#### `phone-row.tsx` — new
```
PhoneRow({ id, items })   // items: { src, alt? }[]
```
No captions — the row is a lineup, and `alt` is passed through to `MediaCard`.
- Full-bleed (`FULL_BLEED`), a centred row of uniform `aspect-[9/19.5]` `MediaCard`s.
- Desktop shows all items in one row. Below `md` it becomes a horizontal scroll strip
  (`SHELF` + `SHELF_PAD`) — five phone widths do not fit at 375px.
- Static, no scroll animation: the reference shows the lineup plainly and the videos inside
  are already moving.

### Rewritten: `components/case-study/cassi.tsx`

Drops `CaseStudyLayout`, the `SECTIONS` array, `prose`'s `P`/`Pull`/`List`, and `MetricsPanel`.
Gains its own collapsed title, bottom-edge fade, `ArticleToc` and `max-w-5xl` column, mirroring
`tactile-create.tsx:390-431`. Holds only its data (`STATEMENT`, `PHONES`, `CAROUSEL`, `BENTO`,
`FAQ`) and composes the shared components. Collapsed-title text stays `Cassi`.

### Refactored: `components/case-study/tactile-create.tsx`

Imports `Statement`, `MarqueeWall`, `Lightbox`, `FaqAccordion`, `MediaCard`, `ZoomableShot` and
`tokens` from `shared/`. Keeps its bespoke pieces local: `SuiteShelf`, `ScrollVideoCarousel`,
`FeatureCarousel`. Its data arrays stay local. **No visual change.**

### Untouched

`CaseStudyLayout` and `VisualStage` (six other case studies still use them),
`controls/bento.tsx`, `case-nav.tsx`, `article-toc.tsx`, `registry.ts`, `cases.ts`.

---

## The scroll flow

`BLOB = https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work`

Right-rail labels: `Overview`, `The app`, `In motion`, `Up close`, `FAQ` — five entries, the same
shape as Tactile Create. Section ids are `slugify(label)`.

### 1. `Overview` — wordmark + text slab
The `<header>` carries the wordmark: "Cassi" set in Galeria at the `text-5xl md:text-7xl` heading
scale the other case studies use for `h1`, followed by the credit line
(`Freelance · iOS + Web · 6 months · Solo designer`) and a rule — the same header furniture as
Tactile Create.

Below the header, a `Statement` of **3 lines** (~12–18 words each) fading in on scroll, then a
trailing paragraph (~45 words). Three lines rather than the reference's two: the per-line fade
needs enough lines to read as a sequence, and Tactile Create's `Statement` is already tuned for
three. No media in this section.

### 2. `The app` — row of mobiles
`PhoneRow`, five uniform 9:19.5 cards:

| # | Asset | Native | Crop |
|---|---|---|---|
| 1 | `cassi-onboarding-splash.mp4` | 736×1440 (0.511) | slight |
| 2 | `cassi-home-dashboard-concept.mp4` | 846×1440 (0.588) | most of the set |
| 3 | `property-listing-02.png` | 1028×1908 (0.539) | slight |
| 4 | `cassi-error-reporting.mp4` | 664×1440 (0.461) | none — exact |
| 5 | `fact-card-01.png` | 393×852 (0.461) | none — exact |

### 3. Blurb
`h2` (~6 words) + paragraph (~30 words) at article scale. Not a rail entry.

### 4. `In motion` — moving carousel
`MarqueeWall` with `aspect-[9/19.5]`, cards ~`w-[42vw] max-w-[220px] sm:w-[15vw]`.

**One row, not two.** There are only 7 portrait assets; two rows would show the same distinctive
phone screens twice in one viewport. One row of all 7 duplicates to 14 cards (~3000px), enough to
loop seamlessly on wide screens. `rows` is a prop, so a second row is a one-line change once
there are ≥12 portrait captures.

Pool: the five from `PhoneRow` plus `cassi-bathroom-maintenance-video.mp4` (774×1440) and
`mortgage-upload-01.png` (1112×1964). Captions reused from `lib/work/local.ts:16-39`.
Click → lightbox (video-capable, per above).

### 5. `Up close` — bento + blurb
`BentoGrid`, six tiles, using every non-portrait asset:

| Span | Asset | Native | Why here |
|---|---|---|---|
| full | `upload-progress-01.png` | 2068×782 (2.64) | five frames in a row — needs the full width |
| half | `cassi-maintenance-flow.mp4` | 1080×1080 (1:1) | square sits well in a half tile |
| half | `cassi-assistant-speaking.mp4` | 800×706 (1.13) | near-square |
| full | `onboarding-flow-01.png` | 1776×968 (1.84) | a wide flow map |
| half | `cassi-carousel.mp4` | 1440×1080 (4:3) | |
| half | `cassi-fundraising-deck.mp4` | 1440×1080 (4:3) | |

Tile titles ~4 words, blurbs ~25 words, all placeholder.

### 6. `FAQ`
`FaqAccordion`, five items. Questions follow the Tactile Create set (role, stack, challenges,
measuring success, learnings); answers are placeholder.

### 7. Next case studies
`CaseNav` — already rendered by the page. No work.

Every one of the 13 Cassi Blob assets appears exactly once in a primary role, and cropping only
ever touches the seven portrait ones.

---

## Placeholder copy

Plausible prose at the target length, never lorem ipsum, so the layout reads honestly. Every
placeholder run carries a `// PLACEHOLDER COPY` comment so it is greppable — following the
`{/* ASK JOY */}` convention already in `tactile-create.tsx`.

Target lengths, from the reference: statement lines 12–18 words each; the overview paragraph
~45 words; section blurb ~30 words; bento tile blurbs ~25 words.

---

## Implementation phasing

Land this in two phases so the regression risk is isolated and closed before anything is built
on top of it:

- **Phase 1 — extract.** Create `shared/`, move the six existing components out of
  `tactile-create.tsx`, point Tactile Create at them, extend the lightbox for video. Ship nothing
  new. Verify Tactile Create is pixel-identical before going further.
- **Phase 2 — build.** Add `BentoGrid` and `PhoneRow`, rewrite `cassi.tsx`.

## Verification

1. **Tactile Create is unchanged.** Screenshot `/work/tactile-create` at 1440 and 375 *before*
   the refactor; repeat after; compare. This is the one real regression risk in Approach A.
2. **Cassi renders** — every section present; `PhoneRow` shows 5 cards with videos playing;
   the marquee scrolls and eases to 0.3× on hover; the lightbox opens for **both** an image and
   a video; the FAQ toggles; rail labels jump to the right anchors; the collapsed title appears
   on scroll; `CaseNav` sits at the bottom.
3. **Responsive** — 375, 768, 1440.
4. **Reduced motion** — statement renders static, marquee stops.
5. `npx tsc --noEmit` — expect only the pre-existing `lib/color.ts:207` error.
6. No new console or server errors.

`pnpm lint` cannot run: `eslint` is not installed in this project.

## Out of scope

New or re-cropped Cassi assets; final copy; device-bezel chrome; changes to `CaseStudyLayout`
or the other six case studies that depend on it; the `.claude/` tracking question; fixing the
pre-existing `lib/color.ts` type error.
