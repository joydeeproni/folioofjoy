# Cassi Case Study Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Cassi case study as an Apple Books-style scroll flow, extracting the components it shares with Tactile Create into a reusable `shared/` layer so there is one copy of each.

**Architecture:** Cassi stops using the two-column `CaseStudyLayout` and instead owns its own chrome (collapsed title, right-rail index, `max-w-5xl` column) exactly as `tactile-create.tsx` does. Six components currently private to `tactile-create.tsx` move to `components/case-study/shared/`, parameterised so aspect ratio and content are props. Two new components — `PhoneRow` and `BentoGrid` — are added there too. Phase 1 does the extraction and proves Tactile Create is unchanged; Phase 2 builds Cassi on top.

**Tech Stack:** Next.js 16.2 (App Router), React 19, `motion` v12 (`motion/react`), Tailwind v4, `lucide-react`. Media is served from Vercel Blob.

## Global Constraints

- **No test framework exists.** There is no jest/vitest/playwright, no test files, and `eslint` is not installed (`pnpm lint` fails). The test cycle for every task is: `npx tsc --noEmit`, then a browser DOM assertion via the Browser pane, then a screenshot where the change is visual. Do **not** add a test framework as part of this work.
- `npx tsc --noEmit` has **one pre-existing error** at `lib/color.ts:207` (`ThemeColors` missing `link`/`foreground`/`foregroundRgb`/`onAccent`). It is not caused by this work and must not be fixed here. A task passes typecheck when that is the *only* error reported.
- **Tactile Create must render identically** after Phase 1. This is the one real regression risk.
- **Chrome must not change:** `BackLink` and `CaseNav` come from `app/work/[slug]/page.tsx:27-29` — do not touch that file. The collapsed title and `ArticleToc` are owned by the case component.
- **Do not touch:** `CaseStudyLayout`, `VisualStage`, `controls/bento.tsx`, `case-nav.tsx`, `article-toc.tsx`, `registry.ts`, `cases.ts`, and the six other case studies that use `CaseStudyLayout`.
- **Palette (exact):** `FG #EDEAE0`, `BG #0B0B0B`, `MUTED rgba(237,234,224,0.55)`, `FAINT rgba(237,234,224,0.14)`, `ACCENT #2CA152`.
- **Blob base (exact):** `https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work`
- **All copy in this plan is placeholder.** Every placeholder run must carry a `// PLACEHOLDER COPY` comment so Joy can grep for it. Never lorem ipsum — plausible prose at the target length.
- Dev server: `preview_start` with `{name: "folioofjoy"}` (from `.claude/launch.json`, port 3000). Never run `next dev` via Bash.
- **`navigate` needs `force: true` in this environment.** Without it the call reports success but silently does not move, and you will assert against the previous page. Always confirm arrival before asserting anything:
  `(() => JSON.stringify({ href: location.href, h1: document.querySelector('h1')?.textContent }))()`
- **The right-rail index renders `<nav><button>`, not links, and is `hidden lg:flex`.** Read its labels with `[...document.querySelectorAll('nav button')].map(b => b.textContent.trim())`, at a viewport ≥1024px wide. `a[href^="/work/"]` matches `CaseNav`, which is a different thing.

---

## File Structure

**Create — `components/case-study/shared/`**

| File | Responsibility |
|---|---|
| `tokens.ts` | Palette + layout class constants. No React, server-safe. |
| `media-card.tsx` | `isVideo`, `Media` (bare element), `MediaCard` (framed), `ZoomableShot` (framed + hover overlay + caption), `MediaItem` type. |
| `statement.tsx` | `Statement` — scroll-driven per-line fade-in. |
| `lightbox.tsx` | `Lightbox` — click-to-open overlay, now video-capable. |
| `marquee-wall.tsx` | `MarqueeWall` — N auto-scrolling rows, alternating direction, hover-slows. |
| `faq-accordion.tsx` | `FaqAccordion` — single-open accordion. |
| `phone-row.tsx` | **New.** `PhoneRow` — lineup of uniform 9:19.5 cards. |
| `bento-grid.tsx` | **New.** `BentoGrid` — full/half tile grid, media + title + blurb. |

**Modify**

| File | Change |
|---|---|
| `components/case-study/tactile-create.tsx` | Import the six extracted components; delete the local copies. Keep `SuiteShelf`, `ScrollVideoCarousel`, `FeatureCarousel` and all data arrays local. No visual change. |
| `components/case-study/cassi.tsx` | Full rewrite. |

---

# PHASE 1 — Extract the shared layer

Ship nothing new. Tactile Create must look identical at the end.

## Task 1: Capture the Tactile Create baseline

**Files:** none (produces reference screenshots)

**Interfaces:**
- Consumes: nothing
- Produces: the geometry fingerprint and DOM counts for `/work/tactile-create` at 1440×900 and 375×812, recorded verbatim in the SDD ledger. No files on disk — the Browser tools return screenshots inline and cannot save them.

- [ ] **Step 1: Start the dev server**

Use `preview_start` with `{name: "folioofjoy"}`. If port 3000 is held by a stale `next dev`, note the PID and stop it first.

- [ ] **Step 2: Load Tactile Create and confirm it renders**

Navigate the Browser pane to `http://localhost:3000/work/tactile-create`. Run this assertion and record the output verbatim — it is the numeric baseline:

```js
(() => {
  const shots = document.querySelectorAll('img[src*="/work/tactile-create/"]');
  const vids  = document.querySelectorAll('video[src*="/work/tactile-create/"]');
  const faq   = document.querySelectorAll('[aria-expanded]');
  const toc   = [...document.querySelectorAll('nav button')].map(b => b.textContent.trim());
  return JSON.stringify({ imgs: shots.length, videos: vids.length, faqButtons: faq.length, toc });
})()
```

Expected shape: `imgs` and `videos` non-zero, `faqButtons` 5, `toc` containing `Overview, Creative Suite, In motion, Up close, FAQ`.

- [ ] **Step 3: Record the geometry fingerprint**

The Browser tools return screenshots inline; they cannot write PNGs to disk, so parity is
established numerically instead — which is stronger anyway, and survives into the ledger.

At 1440×900 and again at the `mobile` preset, run:

```js
(() => {
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + window.scrollY), Math.round(b.width), Math.round(b.height)]; };
  const q = (s) => document.querySelector(s);
  return JSON.stringify({
    docH: document.documentElement.scrollHeight,
    h1: r(q('h1')), header: r(q('#overview')), suite: r(q('#creative-suite')),
    inMotion: r(q('#in-motion')), upClose: r(q('#up-close')), faq: r(q('#faq')),
    marqueeRows: [...document.querySelectorAll('.overflow-hidden.pb-7')].map(r),
    suiteLogos: [...document.querySelectorAll('img[src*="-logo.png"]')].map(r),
    featureCards: [...document.querySelectorAll('#up-close button.cursor-zoom-in')].map(r),
    faqRows: [...document.querySelectorAll('#faq [aria-expanded]')].map(r),
  });
})()
```

Write both outputs to the ledger verbatim. Also take screenshots at both sizes for a human
sanity check, but the fingerprint is the gate.

- [ ] **Step 4: Record the typecheck baseline**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `1` (the pre-existing `lib/color.ts` error). If it is more than 1, stop and report — the tree was already dirty.

No commit — this task produces reference material only.

---

## Task 2: Extract tokens and the media primitives

**Files:**
- Create: `components/case-study/shared/tokens.ts`
- Create: `components/case-study/shared/media-card.tsx`
- Modify: `components/case-study/tactile-create.tsx` (delete `VideoCard` at lines 203-211 and `SmallShot` at lines 216-240; delete the palette constants at lines **16-20 only** — line 21 is `IMG` and must stay — and the layout constants at 92-97; add imports)

**Interfaces:**
- Consumes: nothing
- Produces:
  - `tokens.ts`: `FG`, `BG`, `MUTED`, `FAINT`, `ACCENT`, `FULL_BLEED`, `SHELF`, `SHELF_PAD` — all `string`
  - `media-card.tsx`: `isVideo(src: string): boolean`; `type MediaItem = { src: string; caption?: string; alt?: string }`; `Media({ src, className?, alt? })`; `MediaCard({ src, aspect, className?, alt?, objectPosition? })` — `objectPosition` defaults to `'object-center'`, which is what the `VideoCard` it replaces used; do **not** default it to `object-top`; `ZoomableShot({ item, aspect, className?, onOpen })` where `onOpen: (src: string) => void`

- [ ] **Step 1: Create `tokens.ts`**

```ts
// Shared palette + layout constants for the bespoke (non-CaseStudyLayout) case
// studies, so Cassi and Tactile Create cannot drift apart.

export const FG = '#EDEAE0';
export const BG = '#0B0B0B';
export const MUTED = 'rgba(237,234,224,0.55)';
export const FAINT = 'rgba(237,234,224,0.14)';
export const ACCENT = '#2CA152';

// Span the whole viewport regardless of the parent's max-width.
export const FULL_BLEED = 'w-screen ml-[calc(50%-50vw)]';

// A full-viewport-width scroll strip whose FIRST card is padded to line up with
// the content column — so a row "starts aligned with the text, then scrolls edge
// to edge". SHELF_PAD is that left inset (matches the max-w-5xl column).
export const SHELF =
  'w-screen ml-[calc(50%-50vw)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
export const SHELF_PAD = 'pl-[max(1.5rem,calc(50vw-32rem))] pr-6 md:pl-[max(4rem,calc(50vw-32rem))]';
```

- [ ] **Step 2: Create `media-card.tsx`**

```tsx
'use client';

import { Expand } from 'lucide-react';
import { FG, MUTED } from './tokens';

// Which srcs are video. Query strings tolerated so Blob URLs with params work.
export const isVideo = (src: string) => /\.(mp4|webm)(\?|$)/i.test(src);

export type MediaItem = { src: string; caption?: string; alt?: string };

// A bare media element — no frame. The caller owns the shell, which is what lets
// ZoomableShot put its own button/overlay around the same renderer.
export function Media({
  src,
  className = '',
  alt = '',
}: {
  src: string;
  className?: string;
  alt?: string;
}) {
  return isVideo(src) ? (
    <video src={src} autoPlay muted loop playsInline preload="metadata" className={className} />
  ) : (
    <img src={src} alt={alt} loading="lazy" draggable={false} className={className} />
  );
}

const SHELL = 'rounded-xl border border-white/10 shadow-2xl';

// Framed media. `aspect` is a Tailwind aspect class — the single knob that lets one
// component serve 16:10 desktop shots and 9:19.5 phone screens.
export function MediaCard({
  src,
  aspect,
  className = '',
  alt = '',
  objectPosition = 'object-center',
}: {
  src: string;
  aspect: string;
  className?: string;
  alt?: string;
  /** Which edge survives the crop. Defaults to centre, matching the video cards
   *  this replaced — pass `object-top` for UI screenshots, where the top matters. */
  objectPosition?: string;
}) {
  return (
    <Media src={src} alt={alt} className={`${aspect} ${SHELL} object-cover ${objectPosition} ${className}`} />
  );
}

// Framed media that opens in the lightbox, with a hover dim + expand affordance
// and a caption that fades in beneath.
export function ZoomableShot({
  item,
  aspect,
  className = '',
  onOpen,
}: {
  item: MediaItem;
  aspect: string;
  className?: string;
  onOpen: (src: string) => void;
}) {
  return (
    <div className={`group relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => onOpen(item.src)}
        className={`relative block w-full cursor-zoom-in overflow-hidden ${aspect} ${SHELL}`}
      >
        <Media src={item.src} alt={item.alt ?? ''} className="h-full w-full object-cover object-top" />
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ backgroundColor: 'rgba(11,11,11,0.28)' }}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(11,11,11,0.55)', border: '1px solid rgba(237,234,224,0.35)' }}
          >
            <Expand className="h-5 w-5" style={{ color: FG }} aria-hidden />
          </span>
        </span>
      </button>
      {item.caption && (
        <span
          className="pointer-events-none absolute inset-x-0 top-full mt-2 truncate text-center font-sans text-[13px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ color: MUTED }}
        >
          {item.caption}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Rewire `tactile-create.tsx`**

Delete the palette constants at **lines 16-20 only** — line 21 is `const IMG = '/work/tactile-create'` and is still used throughout the file, so it **must stay**. Then delete the `FULL_BLEED`/`SHELF`/`SHELF_PAD` block (lines 92-97), `VideoCard` (203-211) and `SmallShot` (216-240). Add:

```tsx
import { FG, BG, MUTED, FAINT, FULL_BLEED, SHELF, SHELF_PAD } from './shared/tokens';
import { MediaCard, ZoomableShot, type MediaItem } from './shared/media-card';
```

`ACCENT` is declared but unused in `tactile-create.tsx` today — do not import it.

Replace the two call sites:
- `<VideoCard className="w-[44vw] max-w-[720px]" src={v} />` → `<MediaCard src={`${IMG}/${v}`} aspect="aspect-[16/10]" className="w-[44vw] max-w-[720px]" />` (three occurrences: lines ~178, ~189, ~193)
- Inside `Marquee`'s map: `<SmallShot key={i} shot={s} onOpen={onOpen} />` → `<ZoomableShot key={i} item={{ src: `${IMG}/${s.file}`, caption: s.caption }} aspect="aspect-[16/10]" className="w-[70vw] max-w-[520px] sm:w-[40vw]" onOpen={onOpen} />`

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"`
Expected: exactly one line, the `lib/color.ts:207` error. Any error mentioning `shared/` or `tactile-create` means Step 2 or 3 is wrong — fix before continuing.

- [ ] **Step 5: Verify Tactile Create is unchanged**

Reload `/work/tactile-create`. Re-run the Task 1 Step 2 assertion — `imgs`, `videos`, `faqButtons` and `toc` must match the recorded baseline exactly. Then confirm the hover affordance still exists:

```js
(() => {
  const b = document.querySelector('button.cursor-zoom-in');
  return JSON.stringify({ zoomButtons: document.querySelectorAll('button.cursor-zoom-in').length, hasExpandIcon: !!b?.querySelector('svg') });
})()
```
Expected: `zoomButtons` ≥ 12, `hasExpandIcon` true.

Re-run the Task 1 geometry fingerprint at 1440×900 and diff it against the ledger's recorded values. Any numeric deviation is a bug in this task.

**Then check crop parity, which the fingerprint cannot see.** A changed `object-position`
shifts what is visible *inside* an unchanged box, so box geometry proves nothing about it:

```js
(() => [...document.querySelectorAll('video[src*="/work/tactile-create/"], img[src*="/work/tactile-create/"]')]
  .map(m => [m.getAttribute('src').split('/').pop(), getComputedStyle(m).objectPosition])
)()
```
Every one of the six `*-preview-*.mp4` videos must report `50% 50%`. Any `50% 0%` among them
means `object-top` leaked into `MediaCard`. Scroll through the "In motion" section and
screenshot it — that section is where this task's regression risk actually lives, and it is
easy to skip because it sits inside a 300vh sticky scroll.

- [ ] **Step 6: Commit**

```bash
git add components/case-study/shared/tokens.ts components/case-study/shared/media-card.tsx components/case-study/tactile-create.tsx
git commit -m "refactor(case-study): extract tokens and media primitives to shared/"
```

---

## Task 3: Extract the Statement

**Files:**
- Create: `components/case-study/shared/statement.tsx`
- Modify: `components/case-study/tactile-create.tsx` (delete `StatementLine` 101-105 and `Statement` 107-132; keep the `STATEMENT` array at 27-31 local)

**Interfaces:**
- Consumes: `tokens.ts` (`FG`)
- Produces: `Statement({ lines, trailing?, className? })` — `lines: string[]`, `trailing?: ReactNode`

- [ ] **Step 1: Create `statement.tsx`**

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import { Reveal } from '@/components/reveal';
import { FG } from './tokens';

const LINE = 'font-sans font-light text-3xl leading-[1.18] tracking-tight md:text-5xl';

// One line, brightening 5% → 100% as it scrolls up through the view.
function StatementLine({
  progress,
  index,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  children: string;
}) {
  const start = index * 0.28;
  const opacity = useTransform(progress, [start, start + 0.45], [0.05, 1]);
  return (
    <motion.p style={{ opacity }} className={LINE}>
      {children}
    </motion.p>
  );
}

// A big statement that fades in line by line on scroll, with an optional
// smaller paragraph revealed underneath it.
export function Statement({
  lines,
  trailing,
  className = '',
}: {
  lines: string[];
  trailing?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.55'] });

  return (
    <section ref={ref} className={`py-16 md:py-28 ${className}`}>
      <div className="max-w-3xl space-y-8 md:space-y-10" style={{ color: FG }}>
        {lines.map((line, i) =>
          reduce ? (
            <p key={i} className={LINE}>
              {line}
            </p>
          ) : (
            <StatementLine key={i} progress={scrollYProgress} index={i}>
              {line}
            </StatementLine>
          ),
        )}
      </div>
      {trailing && (
        <Reveal>
          <div className="mt-14 max-w-3xl font-sans text-base leading-relaxed md:text-lg" style={{ color: FG }}>
            {trailing}
          </div>
        </Reveal>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Rewire `tactile-create.tsx`**

Delete `StatementLine` and `Statement`. Add `import { Statement } from './shared/statement';`. Replace `<Statement />` in the body (line ~425) with:

```tsx
<Statement
  lines={STATEMENT}
  trailing={
    <>
      Tactile has invested for years in building tech and tools to bridge this gap — to enable studios around
      the globe, including their own, to iterate and ship quality games. Create Suite lets game studios scout,
      plan, design, spec, prototype, launch and test games, all in one place. The suite has several tools; I led
      the product design, prototyping, and usability improvements on the main three: Create Hub, Art &amp; Code.
    </>
  }
/>
```

The trailing copy is moved verbatim from the deleted `Statement` (lines 123-128). The original wrapped it in `<p>`; `Statement` now supplies the wrapper `<div>`, so pass a fragment, not a `<p>`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`.

- [ ] **Step 4: Verify the statement is unchanged**

Reload `/work/tactile-create`. Assert the three statement lines are present with the right classes:

```js
(() => {
  const ps = [...document.querySelectorAll('p')].filter(p => p.className.includes('font-light') && p.className.includes('md:text-5xl'));
  return JSON.stringify({ count: ps.length, first: ps[0]?.textContent.slice(0, 40) });
})()
```
Expected: `count` 3, `first` starting `Mobile games is a competitive industry`.

Scroll through the statement and confirm the lines still brighten in sequence; screenshot mid-statement.

- [ ] **Step 5: Commit**

```bash
git add components/case-study/shared/statement.tsx components/case-study/tactile-create.tsx
git commit -m "refactor(case-study): extract Statement to shared/"
```

---

## Task 4: Extract the Lightbox and teach it video

**Files:**
- Create: `components/case-study/shared/lightbox.tsx`
- Modify: `components/case-study/tactile-create.tsx` (delete `Lightbox` 278-306)

**Interfaces:**
- Consumes: `media-card.tsx` (`isVideo`)
- Produces: `Lightbox({ src, onClose })` — `src: string | null`, `onClose: () => void`

- [ ] **Step 1: Create `lightbox.tsx`**

Video support is the new behaviour: five of Cassi's seven portrait assets are `.mp4`, so without it a click in Cassi's carousel would open a broken `<img>`.

```tsx
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { isVideo } from './media-card';

const FRAME = 'max-h-[90dvh] max-w-[94vw] rounded-xl object-contain';

// Click-to-open media overlay. Esc or a backdrop click closes it; body scroll is
// locked while open. Renders a player for video srcs and an image otherwise.
export function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-6 md:p-12"
          style={{ backgroundColor: 'rgba(11,11,11,0.93)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          {isVideo(src) ? (
            <motion.video
              src={src}
              controls
              autoPlay
              loop
              playsInline
              className={FRAME}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <motion.img
              src={src}
              alt=""
              draggable={false}
              className={FRAME}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Rewire `tactile-create.tsx`**

Delete the local `Lightbox`. Add `import { Lightbox } from './shared/lightbox';`. The call site at line ~433 (`<Lightbox src={lightbox} onClose={() => setLightbox(null)} />`) is unchanged.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`.

- [ ] **Step 4: Verify the image path still works**

Reload `/work/tactile-create`, scroll to the marquee, click a shot. Then assert:

```js
(() => {
  const d = document.querySelector('[role="dialog"][aria-modal="true"]');
  return JSON.stringify({ open: !!d, tag: d?.querySelector('img,video')?.tagName ?? null, locked: document.body.style.overflow });
})()
```
Expected: `open` true, `tag` `"IMG"`, `locked` `"hidden"`. Press Escape and re-run — expect `open` false.

The video branch is exercised in Task 10; it cannot be reached from Tactile Create, which has no video in its lightbox pool.

- [ ] **Step 5: Commit**

```bash
git add components/case-study/shared/lightbox.tsx components/case-study/tactile-create.tsx
git commit -m "feat(case-study): extract Lightbox to shared/ and support video"
```

---

## Task 5: Extract the MarqueeWall

**Files:**
- Create: `components/case-study/shared/marquee-wall.tsx`
- Modify: `components/case-study/tactile-create.tsx` (delete `Marquee` 243-264 and `MarqueeWall` 266-275)

**Interfaces:**
- Consumes: `media-card.tsx` (`ZoomableShot`, `MediaItem`), `tokens.ts` (`FULL_BLEED`)
- Produces: `MarqueeWall({ rows, aspect, cardClass, durationsMs, onOpen, className? })` — `rows: MediaItem[][]`, `aspect: string`, `cardClass: string`, `durationsMs: number[]`, `onOpen: (src: string) => void`

Row `i` uses `durationsMs[i]` and scrolls in the opposite direction to row `i-1` (row 0 scrolls left).

- [ ] **Step 1: Create `marquee-wall.tsx`**

```tsx
'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimationFrame, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/reveal';
import { ZoomableShot, type MediaItem } from './media-card';
import { FULL_BLEED } from './tokens';

// One auto-scrolling row. Speed is applied per frame rather than as a CSS
// animation so hover can ease it down smoothly instead of jumping.
function Marquee({
  items,
  reverse = false,
  durationMs,
  aspect,
  cardClass,
  onOpen,
}: {
  items: MediaItem[];
  reverse?: boolean;
  durationMs: number;
  aspect: string;
  cardClass: string;
  onOpen: (src: string) => void;
}) {
  const reduce = useReducedMotion();
  const pct = useMotionValue(reverse ? -50 : 0);
  const x = useTransform(pct, (v) => `${v}%`);
  const speed = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const step = (delta / durationMs) * 50 * speed.current;
    let v = pct.get() + (reverse ? step : -step);
    if (v <= -50) v += 50;
    if (v >= 0) v -= 50;
    pct.set(v);
  });

  // Duplicated so the loop is seamless — pct wraps over half the track.
  const loop = [...items, ...items];

  return (
    <div
      className="overflow-hidden pb-7"
      onMouseEnter={() => (speed.current = 0.3)}
      onMouseLeave={() => (speed.current = 1)}
    >
      <motion.div className="flex w-max gap-4" style={reduce ? undefined : { x }}>
        {loop.map((item, i) => (
          <ZoomableShot key={i} item={item} aspect={aspect} className={cardClass} onOpen={onOpen} />
        ))}
      </motion.div>
    </div>
  );
}

// Full-bleed stack of marquee rows, each scrolling opposite its neighbour.
export function MarqueeWall({
  rows,
  aspect,
  cardClass,
  durationsMs,
  onOpen,
  className = '',
}: {
  rows: MediaItem[][];
  aspect: string;
  cardClass: string;
  durationsMs: number[];
  onOpen: (src: string) => void;
  className?: string;
}) {
  return (
    <Reveal>
      <div className={`${FULL_BLEED} space-y-3 pb-16 ${className}`}>
        {rows.map((items, i) => (
          <Marquee
            key={i}
            items={items}
            reverse={i % 2 === 1}
            durationMs={durationsMs[i] ?? 48000}
            aspect={aspect}
            cardClass={cardClass}
            onOpen={onOpen}
          />
        ))}
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 2: Rewire `tactile-create.tsx`**

Delete `Marquee` and `MarqueeWall`. Add `import { MarqueeWall } from './shared/marquee-wall';`. Replace `<MarqueeWall onOpen={setLightbox} />` (line ~428) with:

```tsx
<MarqueeWall
  rows={[
    SHOTS.slice(0, 6).map((s) => ({ src: `${IMG}/${s.file}`, caption: s.caption })),
    SHOTS.slice(6).map((s) => ({ src: `${IMG}/${s.file}`, caption: s.caption })),
  ]}
  aspect="aspect-[16/10]"
  cardClass="w-[70vw] max-w-[520px] sm:w-[40vw]"
  durationsMs={[46000, 54000]}
  onOpen={setLightbox}
  className="-mt-[12vh] md:-mt-[18vh]"
/>
```

The `-mt-[12vh] md:-mt-[18vh]` pull-up was on the old wrapper div (line 269) and must be preserved — it is what tucks the marquee under the green carousel.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`.

- [ ] **Step 4: Verify the marquee is unchanged**

Reload `/work/tactile-create`, scroll to the marquee. Assert both rows and the duplication:

```js
(() => {
  const rows = [...document.querySelectorAll('.overflow-hidden.pb-7')];
  return JSON.stringify({ rows: rows.length, perRow: rows.map(r => r.querySelectorAll('button.cursor-zoom-in').length) });
})()
```
Expected: `rows` 2, `perRow` `[12, 12]` (6 and 6, each duplicated).

Confirm it is moving, then hover a row and confirm it slows without a jump. Re-run the geometry fingerprint and check `marqueeRows` against the ledger — it must still read `[[-7,4531,1440,353],[-7,4896,1440,353]]`, which is what proves the pull-up survived.

- [ ] **Step 5: Commit**

```bash
git add components/case-study/shared/marquee-wall.tsx components/case-study/tactile-create.tsx
git commit -m "refactor(case-study): extract MarqueeWall to shared/"
```

---

## Task 6: Extract the FaqAccordion

**Files:**
- Create: `components/case-study/shared/faq-accordion.tsx`
- Modify: `components/case-study/tactile-create.tsx` (delete `FaqAccordion` 340-365)

**Interfaces:**
- Consumes: `tokens.ts` (`FG`, `MUTED`, `FAINT`)
- Produces: `FaqAccordion({ id, heading, items })` — `items: { q: string; a: string }[]`

- [ ] **Step 1: Create `faq-accordion.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { FG, MUTED, FAINT } from './tokens';

// Single-open accordion. Item 0 starts open so the section never reads as empty.
export function FaqAccordion({
  id,
  heading,
  items,
}: {
  id?: string;
  heading: string;
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id={id} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <h2 className="mb-8 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>
          {heading}
        </h2>
      </Reveal>
      <Reveal className="max-w-[70ch]">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ borderTop: `1px solid ${FAINT}` }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span
                  className="font-sans text-[17px] md:text-lg leading-relaxed transition-opacity group-hover:opacity-70"
                  style={{ color: FG }}
                >
                  {item.q}
                </span>
                <span className="shrink-0 text-[rgba(237,234,224,0.55)] transition-colors group-hover:text-[#EDEAE0]">
                  {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <p className="max-w-[68ch] pb-6 font-sans text-[17px] md:text-lg leading-relaxed" style={{ color: MUTED }}>
                  {item.a}
                </p>
              </motion.div>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Rewire `tactile-create.tsx`**

Delete the local `FaqAccordion`. Add `import { FaqAccordion } from './shared/faq-accordion';`. Replace `<FaqAccordion />` (line ~430) with:

```tsx
<FaqAccordion id={id('FAQ')} heading="The questions I get asked." items={FAQ} />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`.

- [ ] **Step 4: Verify the FAQ is unchanged**

Reload, scroll to the FAQ. Assert:

```js
(() => {
  const bs = [...document.querySelectorAll('[aria-expanded]')];
  return JSON.stringify({
    count: bs.length,
    openIndex: bs.findIndex(b => b.getAttribute('aria-expanded') === 'true'),
    firstQ: bs[0]?.textContent.trim().slice(0, 30),
    sectionId: document.querySelector('section#faq') ? 'faq' : null,
  });
})()
```
Expected: `count` 5, `openIndex` 0, `firstQ` starting `What was your role`, `sectionId` `"faq"`.

Click item 2 and confirm item 0 closes. Re-run the geometry fingerprint and check `faq` and `faqRows` against the ledger's recorded values.

- [ ] **Step 5: Commit**

```bash
git add components/case-study/shared/faq-accordion.tsx components/case-study/tactile-create.tsx
git commit -m "refactor(case-study): extract FaqAccordion to shared/"
```

---

## Task 7: Phase 1 gate — prove Tactile Create is unchanged

**Files:** none (verification only)

**Interfaces:**
- Consumes: everything from Tasks 2-6
- Produces: a green light for Phase 2

- [ ] **Step 1: Confirm `tactile-create.tsx` shrank and kept only its bespoke parts**

Run: `grep -nE "^(function|export function|const) " components/case-study/tactile-create.tsx`
Expected remaining local definitions: `SuiteShelf`, `ScrollVideoCarousel`, `FeatureCarousel`, `TactileCreate`, plus the data consts (`TOC`, `STATEMENT`, `SHOTS`, `VIDEOS`, `SUITE`, `FEATURE`, `FAQ`, `IMG`, `id`).
Expected gone: `StatementLine`, `Statement`, `VideoCard`, `SmallShot`, `Marquee`, `MarqueeWall`, `Lightbox`, `FaqAccordion`.

- [ ] **Step 2: Confirm no orphaned imports or dead constants**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`.
Run: `grep -nE "ACCENT|useMotionValue|useAnimationFrame|AnimatePresence|Plus|Minus" components/case-study/tactile-create.tsx`
Expected: no matches. All of those moved to `shared/`. If any remain, the import list was not trimmed.

- [ ] **Step 3: Production build**

Run: `npx next build 2>&1 | tail -25`
Expected: build completes; `/work/[slug]` listed as a static route. No errors.

- [ ] **Step 4: Full visual comparison**

Re-run the Task 1 Step 3 geometry fingerprint at 1440×900 and at the `mobile` preset and diff both against the values the ledger recorded in Task 1. **Any numeric deviation is a regression** — fix it before starting Phase 2. Take screenshots at both sizes too, as a human sanity check.

- [ ] **Step 5: Check for console and server errors**

Read console messages (errors only) and the dev-server error log. Expected: none.

- [ ] **Step 6: Commit the gate**

Nothing to commit if Steps 1-5 pass clean. If fixes were needed:

```bash
git add -A components/case-study
git commit -m "fix(case-study): restore Tactile Create parity after extraction"
```

---

# PHASE 2 — Build Cassi

## Task 8: Rewrite the Cassi shell — chrome, header, statement

**Files:**
- Modify: `components/case-study/cassi.tsx` (full rewrite, 219 lines → ~90)

**Interfaces:**
- Consumes: `shared/tokens`, `shared/statement`, `shared/lightbox`, `ArticleToc`, `slugify`
- Produces: the `Cassi` component; a `CASSI_TOC` label list; a `lightbox` state + `setLightbox` passed to later sections; the module-level `BLOB` const

- [ ] **Step 1: Replace `cassi.tsx` entirely**

The old file's `SECTIONS` array, `CaseStudyLayout` usage, `prose` imports and `MetricsPanel` all go. Chrome mirrors `tactile-create.tsx:390-431`.

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ArticleToc } from '@/components/writings/article-toc';
import { slugify } from '@/lib/writings/slug';
import { FG, FAINT, MUTED } from './shared/tokens';
import { Statement } from './shared/statement';
import { Lightbox } from './shared/lightbox';

// Cassi — Apple-Books-style scroll case study. Keeps the standard chrome (back
// link and case nav come from the page; collapsed title + right rail are here).
// All copy is placeholder pending Joy's edit.

const BLOB = 'https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work';

const TOC = ['Overview', 'The app', 'In motion', 'Up close', 'FAQ'];
const id = (label: string) => slugify(label);

// PLACEHOLDER COPY — three lines, 12–18 words each, matching the reference rhythm.
const STATEMENT = [
  'Owning a home means a hundred small decisions a year, and nobody obvious to ask about any of them.',
  'Most home apps answer that with a dashboard. A dashboard is just the question, rearranged.',
  'Cassi answers by doing the thing — quietly, and usually before you thought to ask.',
];

export function Cassi() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const recompute = () => {
      frame = 0;
      const el = headerRef.current;
      if (el) setCollapsed(el.getBoundingClientRect().bottom <= 56);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(recompute);
    };
    recompute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden={!collapsed}
        className={`fixed inset-x-0 top-0 z-40 hidden justify-center px-16 pt-[calc(1.5rem+var(--sat))] pb-8 transition-opacity duration-300 ease-out md:flex ${
          collapsed ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ background: 'linear-gradient(to bottom, rgba(11,11,11,0.92), rgba(11,11,11,0))' }}
      >
        <span className="font-sans font-medium text-sm" style={{ color: FG }}>
          Cassi
        </span>
      </div>

      {/* Progressive fade at the bottom edge — mirrors the top. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[16vh] md:h-[22vh]"
        style={{ background: 'linear-gradient(to top, rgba(11,11,11,0.95), rgba(11,11,11,0))' }}
      />

      <ArticleToc sections={TOC.map((label) => ({ label, level: 1 as const }))} />

      <div className="mx-auto w-full max-w-5xl" style={{ color: FG }}>
        <header ref={headerRef} id={id('Overview')} className="scroll-mt-24 pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: FG }}>
            Cassi
          </h1>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
            Freelance&nbsp;&nbsp;//&nbsp;&nbsp;iOS + Web&nbsp;&nbsp;//&nbsp;&nbsp;6 months&nbsp;&nbsp;//&nbsp;&nbsp;Solo designer
          </p>
          <hr className="mt-8 border-0 border-t" style={{ borderColor: FAINT }} />
        </header>

        <Statement
          lines={STATEMENT}
          trailing={
            /* PLACEHOLDER COPY — ~45 words, matching the reference body paragraph. */
            <>
              A pre-revenue founder needed a prototype real enough to raise on, not a deck of pretty frames. I was
              the solo designer alongside one engineer for six months, and the bar never moved: every state a real
              homeowner would hit had to already exist.
            </>
          }
        />
      </div>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
```

`setLightbox` is unused until Task 10 (the carousel is the first thing that opens the lightbox — `PhoneRow` in Task 9 is not clickable). TypeScript will not complain about it. Leave it in place.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`. An error about `MetricsPanel` or `prose` means an import was left behind.

- [ ] **Step 3: Verify the shell**

Load `http://localhost:3000/work/cassi`. Assert:

```js
(() => {
  const h1 = document.querySelector('h1');
  const lines = [...document.querySelectorAll('p')].filter(p => p.className.includes('md:text-5xl') && p.className.includes('font-light'));
  const nav = [...document.querySelectorAll('nav button')].map(b => b.textContent.trim());
  return JSON.stringify({
    h1: h1?.textContent,
    statementLines: lines.length,
    toc: nav,
    hasOverviewId: !!document.querySelector('#overview'),
    caseNav: document.body.innerText.includes('NEXT') || !!document.querySelector('a[href^="/work/"]'),
  });
})()
```
Expected: `h1` `"Cassi"`, `statementLines` 3, `toc` `["Overview","The app","In motion","Up close","FAQ"]`, `hasOverviewId` true, `caseNav` true.

Scroll past the header and confirm the collapsed "Cassi" title fades in at the top. Screenshot at 1440.

- [ ] **Step 4: Commit**

```bash
git add components/case-study/cassi.tsx
git commit -m "feat(cassi): rewrite shell with own chrome, wordmark header and statement"
```

---

## Task 9: Add PhoneRow and the row of mobiles

**Files:**
- Create: `components/case-study/shared/phone-row.tsx`
- Modify: `components/case-study/cassi.tsx` (add `PHONES` data + render)

**Interfaces:**
- Consumes: `shared/media-card` (`MediaCard`, `MediaItem`), `shared/tokens` (`FULL_BLEED`)
- Produces: `PhoneRow({ id, items })` — `items: MediaItem[]`

- [ ] **Step 1: Create `phone-row.tsx`**

```tsx
'use client';

import { Reveal } from '@/components/reveal';
import { MediaCard, type MediaItem } from './media-card';
import { FULL_BLEED } from './tokens';

// Every screen is forced to the same 9:19.5 card so the row reads as a lineup of
// phones. Only two of Cassi's assets are natively that ratio; object-cover takes
// the difference off the top and bottom of the rest.
const PHONE = 'aspect-[9/19.5]';

// A lineup of uniform phone screens. Static — the videos inside already move.
// Desktop centres the whole row; below md it becomes a scroll strip, because five
// phone widths do not fit at 375px.
export function PhoneRow({ id, items }: { id?: string; items: MediaItem[] }) {
  return (
    <section id={id} className="scroll-mt-24 py-12 md:py-20">
      <Reveal>
        <div
          className={`${FULL_BLEED} overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-x-visible`}
        >
          <div className="flex w-max gap-3 px-6 md:mx-auto md:w-full md:justify-center md:gap-4 md:px-16">
            {items.map((item) => (
              <MediaCard
                key={item.src}
                src={item.src}
                alt={item.alt ?? ''}
                aspect={PHONE}
                objectPosition="object-top"
                className="w-[38vw] max-w-[190px] shrink-0 md:w-[15vw] md:max-w-[170px]"
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Wire it into `cassi.tsx`**

Add the import `import { PhoneRow } from './shared/phone-row';` and this data const beside `STATEMENT`:

```tsx
// The five most phone-shaped assets. error-reporting and fact-card are natively
// 9:19.5; the rest take a small crop.
const PHONES = [
  { src: `${BLOB}/cassi-onboarding-splash.mp4`, alt: 'Cassi onboarding splash screens' },
  { src: `${BLOB}/cassi-home-dashboard-concept.mp4`, alt: 'Cassi home dashboard concept' },
  { src: `${BLOB}/property-listing-02.png`, alt: "A home's full profile from just an address" },
  { src: `${BLOB}/cassi-error-reporting.mp4`, alt: 'Reporting a problem and watching it get fixed' },
  { src: `${BLOB}/fact-card-01.png`, alt: 'Did-you-know cards surfacing a home fact' },
];
```

Render it directly after `<Statement ... />`, still inside the `max-w-5xl` div:

```tsx
<PhoneRow id={id('The app')} items={PHONES} />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`.

- [ ] **Step 4: Verify the row**

Reload `/work/cassi`. Assert five cards at the right ratio, and that the videos are actually playing:

```js
(() => {
  const sec = document.querySelector('#the-app');
  const cards = [...(sec?.querySelectorAll('img, video') ?? [])];
  const vids = cards.filter(c => c.tagName === 'VIDEO');
  const r = cards[0]?.getBoundingClientRect();
  return JSON.stringify({
    count: cards.length,
    videos: vids.length,
    ratio: r ? +(r.width / r.height).toFixed(3) : null,
    playing: vids.map(v => !v.paused),
    loaded: cards.map(c => c.tagName === 'VIDEO' ? c.readyState > 0 : c.complete),
  });
})()
```
Expected: `count` 5, `videos` 3, `ratio` ≈ `0.462`, `playing` all true, `loaded` all true.

Screenshot at 1440 (all five in a centred row) and at 375 (a scroll strip — confirm the page itself does not scroll horizontally: `document.documentElement.scrollWidth <= window.innerWidth`).

- [ ] **Step 5: Commit**

```bash
git add components/case-study/shared/phone-row.tsx components/case-study/cassi.tsx
git commit -m "feat(cassi): add PhoneRow and the row of mobiles"
```

---

## Task 10: Add the blurb and the moving carousel

**Files:**
- Modify: `components/case-study/cassi.tsx` (add the blurb section, `CAROUSEL` data, `MarqueeWall` render)

**Interfaces:**
- Consumes: `shared/marquee-wall` (`MarqueeWall`), `shared/lightbox` (already wired in Task 8)
- Produces: nothing new for later tasks

- [ ] **Step 1: Add the blurb section and carousel data**

Add `import { MarqueeWall } from './shared/marquee-wall';`. Add this data const:

```tsx
// All seven portrait-ish assets. Captions are the ones already written in
// lib/work/local.ts, trimmed of the leading "Cassi — ".
const CAROUSEL = [
  { src: `${BLOB}/cassi-onboarding-splash.mp4`, caption: 'Onboarding splash screens that feel like a deep breath, not a signup.' },
  { src: `${BLOB}/property-listing-02.png`, caption: "A home's full profile from just an address: value, flood-zone risk, the works." },
  { src: `${BLOB}/cassi-bathroom-maintenance-video.mp4`, caption: 'Booking bathroom maintenance by just walking it through on video.' },
  { src: `${BLOB}/fact-card-01.png`, caption: 'Did-you-know cards that surface a home fact before you thought to ask.' },
  { src: `${BLOB}/cassi-home-dashboard-concept.mp4`, caption: 'A home dashboard concept: everything about the house in one calm view.' },
  { src: `${BLOB}/mortgage-upload-01.png`, caption: 'A mortgage assistant that reads your terms and says, plainly, whether to refinance.' },
  { src: `${BLOB}/cassi-error-reporting.mp4`, caption: 'Reporting a problem and watching it get fixed, no ticket number required.' },
];
```

Render after `<PhoneRow />`:

```tsx
{/* PLACEHOLDER COPY — heading ~6 words, paragraph ~30 words. */}
<section id={id('In motion')} className="scroll-mt-24 pt-16 md:pt-24">
  <h2 className="mb-4 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>
    Every screen, not just the good ones.
  </h2>
  <p className="max-w-[60ch] font-sans text-lg leading-relaxed" style={{ color: MUTED }}>
    Onboarding, uploads, the half-booked job, the fact you needed back in March. The in-between states are the
    product — everything else is a screenshot you cannot tap.
  </p>
</section>

<MarqueeWall
  rows={[CAROUSEL]}
  aspect="aspect-[9/19.5]"
  cardClass="w-[42vw] max-w-[200px] sm:w-[15vw] sm:max-w-[180px]"
  durationsMs={[52000]}
  onOpen={setLightbox}
  className="mt-10"
/>
```

**One row, not two.** Seven distinctive phone screens across two rows would visibly repeat in a single viewport. Seven duplicates to fourteen cards (~2900px at 200px each), enough to loop on a wide display. `rows` is a prop, so adding a second row is a one-line change once there are ~12 portrait captures.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`.

- [ ] **Step 3: Verify the carousel**

Reload, scroll to the carousel. Assert one row, fourteen cards, and that it is moving:

```js
(async () => {
  const row = document.querySelector('.overflow-hidden.pb-7');
  const track = row?.querySelector('div[style*="translate"], div.flex.w-max');
  const before = track?.getBoundingClientRect().left;
  await new Promise(r => setTimeout(r, 600));
  const after = track?.getBoundingClientRect().left;
  return JSON.stringify({
    rows: document.querySelectorAll('.overflow-hidden.pb-7').length,
    cards: row?.querySelectorAll('button.cursor-zoom-in').length,
    moved: before !== after,
  });
})()
```
Expected: `rows` 1, `cards` 14, `moved` true.

- [ ] **Step 4: Verify the lightbox opens a video — the new behaviour from Task 4**

Click a card whose src ends `.mp4` (the first card is `cassi-onboarding-splash.mp4`), then assert:

```js
(() => {
  const d = document.querySelector('[role="dialog"][aria-modal="true"]');
  const m = d?.querySelector('img,video');
  return JSON.stringify({ open: !!d, tag: m?.tagName, controls: m?.hasAttribute('controls'), src: m?.getAttribute('src')?.split('/').pop() });
})()
```
Expected: `open` true, `tag` `"VIDEO"`, `controls` true, `src` `"cassi-onboarding-splash.mp4"`. Press Escape, then click an image card (`property-listing-02.png`) and confirm `tag` is `"IMG"`.

- [ ] **Step 5: Verify hover slows the row**

Hover a card, wait 600ms, and confirm the track still moves but by a visibly smaller delta than in Step 3. Then move the pointer away and confirm it speeds back up.

- [ ] **Step 6: Commit**

```bash
git add components/case-study/cassi.tsx
git commit -m "feat(cassi): add the blurb and the phone-screen carousel"
```

---

## Task 11: Add BentoGrid and the up-close section

**Files:**
- Create: `components/case-study/shared/bento-grid.tsx`
- Modify: `components/case-study/cassi.tsx` (add `BENTO` data + render)

**Interfaces:**
- Consumes: `shared/media-card` (`Media`), `shared/tokens` (`FG`, `MUTED`, `FAINT`)
- Produces: `BentoGrid({ id, heading, blurb?, tiles, onOpen })`; `type BentoTile = { src: string; span: 'full' | 'half'; title: string; blurb: string; aspect?: string }`

This is the reusable component Joy asked for — it must not hardcode any asset path or project.

- [ ] **Step 1: Create `bento-grid.tsx`**

```tsx
'use client';

import { Reveal } from '@/components/reveal';
import { Media } from './media-card';
import { FG, MUTED, FAINT } from './tokens';

export type BentoTile = {
  src: string;
  span: 'full' | 'half';
  title: string;
  blurb: string;
  /** Tailwind aspect class. Defaults by span; override for very wide media. */
  aspect?: string;
};

// A grid of media tiles, each captioned with a title and a blurb. `full` tiles
// span both columns. Reusable across case studies — no asset paths baked in.
export function BentoGrid({
  id,
  heading,
  blurb,
  tiles,
  onOpen,
}: {
  id?: string;
  heading: string;
  blurb?: string;
  tiles: BentoTile[];
  onOpen: (src: string) => void;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <h2 className="mb-4 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>
          {heading}
        </h2>
        {blurb && (
          <p className="mb-8 max-w-[60ch] font-sans text-lg leading-relaxed" style={{ color: MUTED }}>
            {blurb}
          </p>
        )}
      </Reveal>
      <Reveal className="grid gap-4 md:grid-cols-2">
        {tiles.map((t) => (
          <div
            key={t.src}
            className={`overflow-hidden rounded-2xl ${t.span === 'full' ? 'md:col-span-2' : ''}`}
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${FAINT}` }}
          >
            <button type="button" onClick={() => onOpen(t.src)} className="group block w-full cursor-zoom-in overflow-hidden">
              <Media
                src={t.src}
                className={`w-full ${t.aspect ?? (t.span === 'full' ? 'aspect-[16/9]' : 'aspect-[4/3]')} object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]`}
              />
            </button>
            <div className="px-5 pb-6 pt-5 md:px-6">
              <h3 className="font-sans font-medium text-lg" style={{ color: FG }}>
                {t.title}
              </h3>
              <p className="mt-2 font-sans text-[15px] leading-relaxed" style={{ color: MUTED }}>
                {t.blurb}
              </p>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Wire it into `cassi.tsx`**

Add `import { BentoGrid, type BentoTile } from './shared/bento-grid';` and this data const. Note the two `aspect` overrides — `upload-progress-01` is natively 2.64 and `onboarding-flow-01` is 1.84, so the default `16/9` would crop them badly.

```tsx
// The six non-portrait assets. All titles and blurbs are PLACEHOLDER COPY —
// ~4-word titles, ~25-word blurbs.
const BENTO: BentoTile[] = [
  {
    src: `${BLOB}/upload-progress-01.png`,
    span: 'full',
    aspect: 'aspect-[21/8]',
    title: 'The states nobody screenshots',
    blurb: 'Uploading a document in five frames: parsing, almost-there, and the one field we could not read. Skip these and the prototype feels fake.',
  },
  {
    src: `${BLOB}/cassi-maintenance-flow.mp4`,
    span: 'half',
    title: 'A season ahead',
    blurb: 'The maintenance flow hands over a seasonal checklist before the season turns, so the next right step is already waiting.',
  },
  {
    src: `${BLOB}/cassi-assistant-speaking.mp4`,
    span: 'half',
    title: 'Talking to your house',
    blurb: 'Sometimes the fastest input is your voice. Describe the problem out loud, watch it listen, get an answer back.',
  },
  {
    src: `${BLOB}/onboarding-flow-01.png`,
    span: 'full',
    aspect: 'aspect-[16/9]',
    title: 'Onboarding, mapped',
    blurb: 'The whole first run drawn end to end, from the home-intelligence score through to the first insurance upload.',
  },
  {
    src: `${BLOB}/cassi-carousel.mp4`,
    span: 'half',
    title: 'Scored at a glance',
    blurb: 'Animated home-condition cards, each property scored so the comparison happens before anyone opens a spreadsheet.',
  },
  {
    src: `${BLOB}/cassi-fundraising-deck.mp4`,
    span: 'half',
    title: 'The pitch itself',
    blurb: 'The fundraising deck that carried the prototype into the room and helped land the first round of funding.',
  },
];
```

Render after the `MarqueeWall`:

```tsx
<BentoGrid
  id={id('Up close')}
  heading="A few moments, up close."
  /* PLACEHOLDER COPY */
  blurb="The parts that do not fit on a phone screen: the flows, the pitch, and the states in between."
  tiles={BENTO}
  onOpen={setLightbox}
/>
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`.

- [ ] **Step 4: Verify the grid**

Reload, scroll to it. Assert six tiles with the right spans and no broken media:

```js
(() => {
  const sec = document.querySelector('#up-close');
  const tiles = [...(sec?.querySelectorAll(':scope > div > div') ?? [])].filter(d => d.className.includes('rounded-2xl'));
  return JSON.stringify({
    tiles: tiles.length,
    fullSpan: tiles.filter(t => t.className.includes('md:col-span-2')).length,
    titles: tiles.map(t => t.querySelector('h3')?.textContent),
    broken: [...sec.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).length,
  });
})()
```
Expected: `tiles` 6, `fullSpan` 2, six titles, `broken` 0.

Click a tile and confirm the lightbox opens. Screenshot at 1440 (two full-width tiles, two rows of pairs) and at 375 (single column).

- [ ] **Step 5: Commit**

```bash
git add components/case-study/shared/bento-grid.tsx components/case-study/cassi.tsx
git commit -m "feat(cassi): add reusable BentoGrid and the up-close section"
```

---

## Task 12: Add the FAQ and run the final verification pass

**Files:**
- Modify: `components/case-study/cassi.tsx` (add `FAQ` data + render)

**Interfaces:**
- Consumes: `shared/faq-accordion` (`FaqAccordion`)
- Produces: the finished page

- [ ] **Step 1: Add the FAQ**

Add `import { FaqAccordion } from './shared/faq-accordion';` and:

```tsx
// PLACEHOLDER COPY — questions mirror the Tactile Create set; answers are Joy's to write.
const FAQ = [
  { q: 'What was your role in this?', a: 'Solo designer for six months, working with one engineer. I owned the maintenance flow end to end and designed every state around it.' },
  { q: 'What was your design stack?', a: 'Figma for design, and a clickable prototype real enough that investors could hold it rather than watch a walkthrough.' },
  { q: 'What were some design challenges?', a: 'Placeholder — the honest answer is about drawing the in-between states nobody screenshots, and keeping the assistant out of the way.' },
  { q: 'How did you measure success of this project?', a: 'Placeholder — the prototype raised a $3M seed and the company went on to a $10M Series A.' },
  { q: 'What were your learnings from this?', a: 'Placeholder — a prototype earns trust in its edges, not its hero screens.' },
];
```

Render after `<BentoGrid />`, as the last child of the `max-w-5xl` div:

```tsx
<FaqAccordion id={id('FAQ')} heading="The questions I get asked." items={FAQ} />
```

- [ ] **Step 2: Typecheck and build**

Run: `npx tsc --noEmit 2>&1 | grep "error TS"` → expect only `lib/color.ts:207`.
Run: `npx next build 2>&1 | tail -25` → completes, no errors.

- [ ] **Step 3: Verify the whole page end to end**

Reload `/work/cassi` and assert every section, in order, plus the chrome:

```js
(() => {
  const ids = ['overview', 'the-app', 'in-motion', 'up-close', 'faq'];
  return JSON.stringify({
    sections: ids.map(i => !!document.querySelector('#' + i)),
    order: [...document.querySelectorAll('[id]')].map(e => e.id).filter(i => ids.includes(i)),
    toc: [...document.querySelectorAll('nav button')].map(b => b.textContent.trim()),
    faqButtons: document.querySelectorAll('[aria-expanded]').length,
    caseNavLinks: [...document.querySelectorAll('a[href^="/work/"]')].map(a => a.getAttribute('href')),
    noHScroll: document.documentElement.scrollWidth <= window.innerWidth,
    brokenImgs: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).length,
  });
})()
```
Expected: `sections` all true; `order` exactly `["overview","the-app","in-motion","up-close","faq"]`; `toc` the five labels; `faqButtons` 5; `caseNavLinks` non-empty; `noHScroll` true; `brokenImgs` 0.

- [ ] **Step 4: Click every rail label**

Click each of the five right-rail entries and confirm the page scrolls to the matching section rather than jumping to the top. A label whose `slugify` output does not match its section `id` will silently do nothing.

- [ ] **Step 5: Responsive pass**

Screenshot at 375, 768 and 1440. At each, confirm `document.documentElement.scrollWidth <= window.innerWidth`. The phone row scrolls horizontally *inside its own container* at 375; the page must not.

- [ ] **Step 6: Reduced-motion pass**

Set the viewport to emulate `prefers-reduced-motion: reduce`, reload, and confirm: the statement lines render at full opacity immediately, and the marquee track does not move (compare its `left` across 600ms — it must be identical).

- [ ] **Step 7: Confirm Tactile Create still matches its baseline**

Load `/work/tactile-create` one last time and re-run the Task 1 geometry fingerprint at 1440×900, diffing against the ledger's recorded values. Phase 2 should not have touched it, but the shared components it now depends on were edited in Task 4 — this is the check that catches an accidental regression.

- [ ] **Step 8: Console and server errors**

Read console errors and dev-server errors for both `/work/cassi` and `/work/tactile-create`. Expected: none.

- [ ] **Step 9: Commit**

```bash
git add components/case-study/cassi.tsx
git commit -m "feat(cassi): add the FAQ section"
```

- [ ] **Step 10: Report what is placeholder**

Run: `grep -rn "PLACEHOLDER COPY" components/case-study/`
List every hit for Joy, so he knows exactly which strings are his to rewrite.

---

## Definition of done

- `/work/cassi` renders the seven beats in order: wordmark header → statement → row of five phones → blurb → one-row carousel → bento of six → FAQ → case nav.
- All 13 Cassi Blob assets appear; none broken; cropping only on the seven portrait ones.
- The lightbox plays video and shows images.
- `/work/tactile-create` is pixel-identical to its Task 1 baseline at 1440 and 375.
- `npx tsc --noEmit` reports only the pre-existing `lib/color.ts:207` error.
- `npx next build` completes.
- No horizontal page scroll at 375, 768 or 1440. No console or server errors.
- Every placeholder string is greppable via `PLACEHOLDER COPY`.
