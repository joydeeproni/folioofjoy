# folioofjoy — Homepage Redesign Design Spec

**Date:** 2026-07-07
**Status:** Draft for review

A drastic redesign of the homepage plus two new routes (`/about`, `/writings`). The current lyric-matrix "Lounge Mode" homepage is replaced by a black, Geist-Pixel-led stage with a mouse-driven work reveal; Lounge Mode is preserved and moves behind the music player.

---

## 1. Goals & principles

- Replace the homepage with the black "seesaw + green pixel quote" concept from the reference mockups.
- Interaction-first: the page reacts to mouse movement (work screens cycle in the center; Photography hover flips the whole stage).
- One tight type system: **APK Galeria + Geist Pixel**, with **Praktikal** only for small tracked meta. No other typefaces.
- Fixed page colors (black / green / yellow / dark editorial) — the per-track palette theming stays on `/work` only, not the new pages.
- Nothing is destroyed: Lounge Mode, `/work`, and the experiments components remain reachable.

## 2. Scope

**Changes**
- `app/page.tsx` — swap `SongAnalyzer` for a new `HomeStage`.
- New `app/about/page.tsx`, new `app/writings/page.tsx` (+ post view).
- Add Geist Pixel font (`@font-face` + `--font-pixel` token) in `app/globals.css` and `styles/globals.css`.
- Lounge Mode becomes a full-screen overlay/experience opened by the music player (extracted from / reusing `SongAnalyzer`'s explore mode).
- `FloatingPill` collapsed state restyled to a white circle on the homepage, and its click opens Lounge Mode.

**Stays as-is**
- `/work` route and its pile-up + caption pattern (source of truth for the reveal mechanic).
- `components/matrix-visualization.tsx`, `explore-toolbar.tsx`, `pattern-guide.tsx`, `winamp-visualizer.tsx` (reused by Lounge Mode).
- `lib/audio-context.tsx`, `lib/scramble.ts`, `lib/color.ts`, `components/work-preview.tsx` (`WORK_ITEMS`).
- Analytics, dither transition, providers, admin, api.

**Not linked from the new nav** (reachable by URL only): `/work`, experiments.

## 3. Font system

| Role | Font | Notes |
|---|---|---|
| Display / hero quote / page headings / "snap!" | **Geist Pixel** | Google font, single style (400), `.ttf`, glyphs are native circular dots ("Circle" look). Self-hosted in `/public/fonts`. |
| Nav, body, captions, article body | **APK Galeria** | Regular 400 / Medium 500 (already loaded). |
| Small tracked meta labels (TITLED, POSTED ON, REFERENCE, post numbers) | **Praktikal** | Mono, uppercase, letter-spaced. Already loaded. |

- Geist Pixel `.ttf` is downloaded from Google Fonts and placed at `/public/fonts/GeistPixel-Regular.ttf`; `@font-face { font-family: 'Geist Pixel'; ... }` added to both `globals.css` files; expose `--font-pixel: 'Geist Pixel', monospace;` in the `@theme inline` block and a Tailwind utility (`font-pixel`).
- The existing `scrambleReveal(el, text, duration, delay)` drives Geist Pixel text with no changes (it swaps `textContent`).

## 4. Homepage — `HomeStage`

Full-screen, pure black (`#000`). Replaces `SongAnalyzer` in `app/page.tsx`.

### 4.1 Nav (fixed, Galeria, small ~14px, white)
- `Photography` — top-left. Hover → Photography state (§4.4). Click → `https://www.instagram.com/joyingntravelling/` (new tab).
- `Joy Sengupta` — top-center. Hover → About preview (§4.5). Click → `/about`.
- `Writings` — top-right. Click → `/writings`.
- In the Photography state, the non-hovered items dim to ~40% opacity (per Image #2).

### 4.2 Default center — quote + seesaw
- The quote **"i awoke and saw that life was service. i acted and behold, service was joy."** set in **Geist Pixel, green**, centered, large. Scramble-revealed on first load via `scrambleReveal` (same loader/feel as the current hero lines).
- Green: start with `#4FE06A`-ish (tunable; mockup green). Text sits behind/around the seesaw.
- **Seesaw**: `/public/home/seesaw.svg` (828×676, ungrouped paths), rendered inline or via `<img>`, centered over the quote.
  - **Teeter animation**: rotate the whole illustration between **−1° and +1°**, ~2.5s loop, `ease-in-out` (sinusoidal), infinite. `transform-origin` set near the red fulcrum (≈ `50% 62%`) so it reads as a balancing seesaw. CSS keyframes (like the existing `bounce-subtle`) — no JS needed.

### 4.3 Center interaction — "movement cycles, stop hides"
- On `mousemove` within the center zone: fade the quote out and begin piling up **`WORK_ITEMS`** project screens exactly like `/work` (overlapping, small deterministic offsets, `shadow-2xl`), advancing as the mouse moves.
- **Bottom-center caption** describes the top screen — **mix Geist Pixel + Galeria** (e.g. a short Geist-Pixel index/label + the Galeria caption sentence). Reuse the `/work` dot/caption-fade treatment.
- **Idle** (~700ms without movement): fade all screens out, restore the green quote + seesaw.
- Advance cadence: throttle so continuous movement advances ~1 screen per ~250–350ms (feels like scrubbing through the pile); wraps at the end.
- **Mobile** (no hover/mouse): center auto-cycles the pile on a timer (reuse `/work`'s `runSequence`); nav items are taps.

### 4.4 Photography state (Image #2)
- Trigger: hovering the `Photography` nav item (desktop).
- Center flips to big **Geist Pixel "snap!"** in **yellow** (`#F2E30C`-ish), other nav items dimmed.
- A **photo pile** appears with the same movement-cycle behavior — **reusing work images** for now (swap for real photos later).
- `mouseleave` → restore default homepage. Click on `Photography` → Instagram (new tab).

### 4.5 About hover preview
- Hovering `Joy Sengupta` shows a small **"about"** label + a **tiny clipart** thumbnail beside the name (asset gap — placeholder `/public/home/about-clip.png`).
- Click → `/about`.

### 4.6 Music circle → Lounge Mode
- The existing `FloatingPill` renders bottom-right; its collapsed appearance is a **white circle** on the black homepage.
- **Click opens Lounge Mode**: a full-screen experience showing `MatrixVisualization` (the lyric-pattern dots) + `ExploreToolbar` (playback + pattern controls) + `PatternGuide`, with music playing. Closing (Back/✕/Esc) returns to `HomeStage`.
- Implementation: extract the explore-mode portion of `SongAnalyzer` into a reusable `LoungeMode` overlay (or a `/lounge` route) so it no longer depends on the old homepage. Music state stays in the global `AudioProvider`.

## 5. `/about` — green page

- Solid **green** background (tunable; readable off-white/near-black text picked for contrast).
- **"about"** heading in Geist Pixel.
- Body = the existing bio copy (reused from `hero-overlay.tsx` / `song-analyzer.tsx` — the two "dry, observant…" and "This site is perpetually half-built…" paragraphs), set in Galeria.
- **Circle "back home" button** top-left (links to `/`). Optional tiny clipart accent.

## 6. `/writings` — dark editorial typography playground

Reference: the "CMS Breakdown" editorial article layout (Image #3), **in dark**. Super minimal for now.

- **Surface**: near-black (`#0B0B0B`) with warm off-white type (`#EDEAE0`).
- **Circle "back home" button** top-left (matches About).

### 6.1 Post view (`/writings/[slug]`)
- **Huge display title** spanning the top — tight tracking, large. Galeria Medium at display size (the reference's black weight isn't in our files; large Galeria Medium + tight tracking approximates it). A small **Geist Pixel post number** (e.g. `04`) as an accent.
- Optional **hero image** under the title (posts "can have images"; the reference's isometric diagram slot).
- A full-width **horizontal rule**.
- **Three-column editorial grid**:
  - **Left** — meta labels in Praktikal, uppercase, tracked: `TITLED` / `POSTED ON` (+ values in Galeria).
  - **Center** — article body: a bold Galeria subhead + Galeria body at a comfortable measure (~60–66ch). Typographic details (kept minimal): a drop cap on the first paragraph, generous leading.
  - **Right** — `REFERENCE` links (Praktikal label + Galeria links).
- Responsive: columns stack on mobile (meta → body → reference).

### 6.2 Index (`/writings`)
- Minimal list of post titles (large, Galeria), each with a Geist Pixel number and a Praktikal date; click → post. (Kept intentionally spare for v1.)

### 6.3 Example content
- 3–4 dummy posts with real editorial-length copy (not lorem) so the type reads true. Stored as a simple typed array/`.ts` module (mirroring `WORK_ITEMS`), each: `slug`, `title`, `number`, `postedOn`, `titled`, `references[]`, `body` (paragraphs), optional `heroImage`.

## 7. Assets

| Asset | Status | Path |
|---|---|---|
| Seesaw illustration | ✅ provided | `/public/home/seesaw.svg` |
| Geist Pixel font | ⬇ download from Google Fonts during build | `/public/fonts/GeistPixel-Regular.ttf` |
| About clipart | ⛳ placeholder now, user provides later | `/public/home/about-clip.png` |
| Photography photos | reuse `WORK_ITEMS` for now | — |
| Writings hero images | optional per post; placeholders ok | `/public/writings/*` |

## 8. Reuse map

- `lib/scramble.ts` → hero quote + "snap!" reveal.
- `components/work-preview.tsx` `WORK_ITEMS` → center pile + Photography pile + captions.
- `app/work/page.tsx` pile-up/caption logic → adapted into `HomeStage` center (movement-driven) and the mobile timer fallback.
- `lib/audio-context.tsx` `FloatingPill` → white music circle + Lounge entry.
- `components/matrix-visualization.tsx`, `explore-toolbar.tsx`, `pattern-guide.tsx` → Lounge Mode overlay.

## 9. Colors (all tunable)

- Homepage bg `#000000`; quote green `~#4FE06A`; Photography "snap!" yellow `~#F2E30C`.
- About bg: solid green (TBD exact value, e.g. `#1F6E3B`), text auto-contrast.
- Writings bg `#0B0B0B`; text `#EDEAE0`; hairline rules `rgba(237,234,224,0.15)`.

## 10. Deferred / open

- Real Photography photos, About clipart, Writings hero images (user-provided later).
- Exact green/yellow hex values — dial in during build.
- Whether Lounge Mode is an overlay vs a `/lounge` route — decide in the implementation plan (overlay preferred for a seamless "patterns bloom from the circle" feel).

## 11. Component breakdown (for the implementation plan)

- `components/home/home-stage.tsx` — orchestrates nav + center + states.
- `components/home/center-stage.tsx` — quote+seesaw / work-pile / photo-pile + movement→cycle logic + idle reset.
- `components/home/seesaw.tsx` — inline SVG + teeter.
- `components/lounge-mode.tsx` — extracted explore experience.
- `app/about/page.tsx`, `app/writings/page.tsx`, `app/writings/[slug]/page.tsx`, `lib/writings.ts` (dummy posts).
- Font wiring in both `globals.css` files.
