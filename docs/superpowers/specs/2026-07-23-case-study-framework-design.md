# Case Study Framework — Design

> Spec for a reusable, scroll-driven, two-column case study framework, populated
> with the Cassi case study as its first instance. Brainstormed 2026-07-23.

## Goal

Build a reusable framework for portfolio case studies where the article reads in a
left column and a right-hand visual **stage** swaps its image/video as each section
scrolls into view — the pattern from Emil Kowalski / Rauno-style scrollytelling case
studies. Ship it with a complete **Cassi** case study. Design (but do not build) an
interactive-component slot so a later pass can reuse the framework for a Lounge-mode
panel component showcase.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Scope of this pass | Reusable framework **+ full Cassi case study**. Lounge-mode showcase is a separate later pass; only the interactive slot's *type* ships now. |
| Route | New dedicated `app/work/[slug]` route (e.g. `/work/cassi`), separate from `/writings`. |
| Visual transition | **Clean crossfade** with a subtle scale settle. No dither — the dither reveal stays reserved for route transitions. |
| Mobile behaviour | **Pinned visual band at the top** of the viewport; prose scrolls underneath and swaps the band's visual off the same active-section signal. |
| Theme / language | Reuse the existing editorial dark theme (`#0B0B0B` / `#EDEAE0`), pixel/sans/mono fonts, green accent `#2CA152`. |

## Architecture

### Route & registry
- `app/work/[slug]/page.tsx` — a Server Component. `generateStaticParams` reads a
  small registry. Renders a **full-bleed dark shell** (not the padded writings
  `SHELL`) with a `BackLink` to `/preview`, then mounts the case study's component.
- `components/case-study/registry.ts` — `Record<string, { title: string; Component }>`.
  First entry: `cassi`. `getCaseStudy(slug)` / `getCaseStudySlugs()` helpers.
- Light link-in: add optional `caseStudy?: 'cassi'` to Cassi `WorkItem`s in
  `lib/work/local.ts`; a preview card with that field links to `/work/{caseStudy}`.
  Wiring *which* cards get it is a trivial follow-up, not part of the framework.

### Framework component — `CaseStudyLayout` (client)
`components/case-study/case-study-layout.tsx`. Props: `{ sections: CaseStudySection[] }`.

```ts
type Annotation = { id: string; x: number; y: number; label: string }  // 0–1 fractions

type Visual =
  | { kind: 'image';  src: string; alt: string; fit?: 'contain' | 'cover' }
  | { kind: 'video';  src: string; poster?: string; alt?: string }
  | { kind: 'component'; render: () => ReactNode; annotations?: Annotation[] } // future lounge slot

type CaseStudySection = {
  id: string
  act?: string       // chapter label, e.g. "Process" / "Product"
  eyebrow?: string    // small mono label above heading
  heading?: string
  body: ReactNode     // prose built from the shared primitives
  visual: Visual
}
```

Behaviour:
- **Desktop (≥md):** CSS grid — left prose column (`max-w-[60ch]`, normal scroll) and a
  right **sticky visual stage** (`position: sticky`, ~`100dvh`, vertically centred)
  that renders the *active* section's visual.
- **Mobile (<md):** the stage becomes a **pinned band** at the top of the viewport
  (`position: sticky; top: 0`, ~`42dvh`); the single prose column scrolls beneath it.
  Same `activeIndex` drives both layouts — the stage is rendered once and positioned
  by responsive classes.
- **Active-section detection:** `IntersectionObserver` watches each left section; a
  section becomes active when its top crosses ~40% of the viewport. The impure IO
  wiring lives in the component; the decision logic is extracted to a pure helper.

### Pure helper (the TDD target)
`components/case-study/active-section.ts`:
```ts
// Given the set of currently-intersecting sections and their bounding info,
// return the index that should be "active". Deterministic, no DOM — unit-tested.
export function pickActiveSection(entries: SectionState[]): number
```
`SectionState` carries `{ index, top, ratio }` (viewport-relative). Rule: among
sections whose top has crossed the activation line, pick the last one (furthest
scrolled); before any have, pick 0. This is the unit under test.

### Visual stage — crossfade
`components/case-study/visual-stage.tsx` (client). Renders one `Visual` at a time
inside `AnimatePresence` (from `motion`): outgoing fades out, incoming fades in with
`scale 0.98 → 1`. Keyed by section id. `image`/`video` render straightforwardly;
`component` calls `render()` (annotation overlay is **not** built this pass — the
prop is accepted and ignored, reserved for the lounge showcase).

### Prose primitives
`components/case-study/prose.tsx` — `H2`, `P` (with optional lead drop-cap), `Pull`,
`List`, `Eyebrow`, mirroring the look of `components/writings/designing-for-low-literacy.tsx`.
The existing article is **not** refactored in this pass (no reason to risk it);
the duplication is noted for a future extract.

## Cassi content

`components/case-study/cassi.tsx` — a `sections[]` array authored in Joy's voice from
`docs/project-reference.md` §4. Proposed flow (order is the author's to adjust):

1. **Intro** — "Cassi", the one-liner (AI assistant for homeowners; omnipresent but
   unobtrusive), the outcome ($3M seed → $10M Series A). *Visual:* `cassi-onboarding-splash.mp4`.
2. **Process** — the brief (pre-revenue founder needs a realistic prototype to raise);
   the philosophy (invisible intelligence, memory that matters, never in the way);
   owning the MVP maintenance flow (low cognitive load, edge cases, lifecycle,
   microcopy); onboarding flow mapped; document-upload in-between states.
   *Visuals:* `onboarding-flow-01.png`, `upload-progress-01.png`, `cassi-maintenance-flow.mp4`.
3. **Product** — a home's full profile from an address; did-you-know fact cards;
   talking to Cassi out loud (voice); the home dashboard concept.
   *Visuals:* `property-listing-02.png`, `fact-card-01.png`, `cassi-assistant-speaking.mp4`,
   `cassi-home-dashboard-concept.mp4`.
4. **Outcome** — a prototype that directly moved real money. *Visual:* `cassi-fundraising-deck.mp4`.

Media are served from the existing Vercel Blob store (`.../work/...`) used by
`lib/work/local.ts`; local `public/work/cassi-*.png` are fallbacks.

## Motion & accessibility
- `prefers-reduced-motion` → drop the scale settle; use instant or opacity-only swaps.
- Every visual carries `alt`; the prose column is complete on its own so screen-reader
  and no-JS users get the full case study. The stage mirrors scroll position and is
  supplementary.
- `IntersectionObserver` is created in an effect and cleaned up on unmount; the layout
  is a client component (SSR renders the first section's visual as the initial state).

## Testing & verification
- **Unit:** `pickActiveSection` pure helper (TDD) — activation threshold, last-crossed
  wins, empty/pre-scroll → 0.
- **Build/type:** `next build` / `tsc` clean.
- **SSR smoke:** `curl /work/cassi` returns 200 and contains the section headings.
- **Caveat:** Chrome is not installed in this environment, so the scroll/crossfade
  behaviour cannot be driven here. Joy should eyeball it in a browser; the report will
  say so plainly rather than claim the interaction was verified.

## Out of scope (this pass)
- Annotation overlay rendering.
- The Lounge-mode panel component showcase content.
- Refactoring the existing writings article onto shared primitives.
- Wiring every Cassi preview card to the case study (one-field follow-up).
