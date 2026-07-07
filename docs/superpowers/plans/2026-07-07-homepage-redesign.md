# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Lounge-Mode homepage with a black, Geist-Pixel stage (teetering seesaw + green quote, mouse-driven work reveal, Photography "snap!" state), add `/about` (green) and `/writings` (dark editorial), and move Lounge Mode behind the music circle.

**Architecture:** New client components under `components/home/` orchestrate the homepage; the mouse-reveal reuses `WORK_ITEMS` and the `/work` pile-up pattern. Lounge Mode is extracted from `SongAnalyzer` into a global overlay driven by new `AudioProvider` state and opened by `FloatingPill`. Two new App-Router routes render `/about` and `/writings`. All new pages use fixed colors; the per-track palette theming remains only on `/work`.

**Tech Stack:** Next.js 16 (App Router, React 19), Tailwind CSS v4, GSAP (scramble loader), `lucide-react`, self-hosted OTF/TTF fonts.

## Testing approach

This repo has **no test runner** and the deliverables are visual/interactive. Do **not** add a test framework. Each task is verified by:
1. `pnpm build` — must compile with no TypeScript/ESLint errors (the correctness gate).
2. `pnpm dev` then open `http://localhost:3000` — perform the task's **Manual check** and confirm the described behavior.

Follow the existing code conventions: `'use client'` at the top of interactive components, `useAudio()` for audio/theme, Tailwind utility classes, inline `style={{ ... }}` for dynamic colors.

## Global Constraints

- **Fonts:** Only **APK Galeria** (`font-sans`), **Geist Pixel** (`font-pixel`, added here), and **Praktikal** (`font-mono`) — no other typefaces.
- **Homepage / About / Writings use fixed colors**, independent of the per-track palette. Homepage bg `#000000`, quote green `#4FE06A`, Photography "snap!" yellow `#F2E30C`, About bg green `#1F6E3B`, Writings bg `#0B0B0B` / text `#EDEAE0`. (Hex values are tunable but use these as defaults.)
- **Preserve** `/work`, the experiments components, and Lounge Mode (MatrixVisualization + ExploreToolbar + PatternGuide). Do not delete `SongAnalyzer`.
- **Nav copy (exact):** `Photography` → `https://www.instagram.com/joyingntravelling/` (new tab); `Joy Sengupta` → `/about`; `Writings` → `/writings`.
- **Hero quote (exact):** `i awoke and saw that life was service. i acted and behold, service was joy.`
- **Photography background word (exact):** `snap!`
- Commit after each task **only if the user has asked for commits**; otherwise leave changes staged/unstaged and let the user commit. (Repo convention: commit only when asked.)

---

### Task 1: Add the Geist Pixel font

**Files:**
- Create: `public/fonts/GeistPixel-Regular.ttf` (downloaded)
- Modify: `app/globals.css` (add `@font-face` after line 27; add `--font-pixel` in `@theme inline`)
- Modify: `styles/globals.css` (mirror the same additions)

**Interfaces:**
- Produces: a `font-pixel` Tailwind utility and CSS var `--font-pixel: 'Geist Pixel', monospace;` usable as `className="font-pixel"` or `style={{ fontFamily: 'var(--font-pixel)' }}`.

- [ ] **Step 1: Download the font file**

```bash
curl -L -o public/fonts/GeistPixel-Regular.ttf \
  "$(curl -s 'https://fonts.googleapis.com/css2?family=Geist+Pixel' -H 'User-Agent: Mozilla/5.0' | grep -oE 'https://[^)]+' | head -1)"
ls -la public/fonts/GeistPixel-Regular.ttf   # expect a non-zero .ttf (~tens of KB)
```

- [ ] **Step 2: Add the `@font-face` rule** — in `app/globals.css`, immediately after the closing `}` of the last `Galeria` face (line 27):

```css
@font-face {
  font-family: 'Geist Pixel';
  src: url('/fonts/GeistPixel-Regular.ttf') format('truetype');
  font-weight: 400;
  font-display: swap;
}
```

- [ ] **Step 3: Register the token** — in `app/globals.css`, inside `@theme inline` (after line 74 `--font-heading`), add:

```css
  --font-pixel: 'Geist Pixel', monospace;
```

- [ ] **Step 4: Mirror both edits into `styles/globals.css`** (same `@font-face` after its Galeria faces, same `--font-pixel` line in its `@theme inline` block near line 108).

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: compiles with no errors.

- [ ] **Step 6: Manual check** — temporarily add `<p className="font-pixel text-4xl text-white">snap!</p>` to `app/page.tsx`, run `pnpm dev`, confirm it renders as circular-dot pixel glyphs, then remove it.

---

### Task 2: Seesaw component with teeter animation

**Files:**
- Create: `components/home/seesaw.tsx`
- Modify: `app/globals.css` (add `@keyframes seesaw-teeter` + `.animate-seesaw` after the existing `bounce-subtle` block, ~line 138)

**Interfaces:**
- Produces: `export function Seesaw(props: { className?: string })` — renders `/public/home/seesaw.svg` teetering ±1°.

- [ ] **Step 1: Add the keyframes** — append to `app/globals.css`:

```css
@keyframes seesaw-teeter {
  0%, 100% { transform: rotate(-1deg); }
  50%      { transform: rotate(1deg); }
}
.animate-seesaw {
  animation: seesaw-teeter 2.5s ease-in-out infinite;
  transform-origin: 50% 62%;
  will-change: transform;
}
```

- [ ] **Step 2: Create the component**

```tsx
'use client';

// Decorative seesaw illustration for the homepage hero. The art is a flat,
// ungrouped SVG (828×676); we rotate the whole thing ±1° around a pivot near
// the red fulcrum so it reads as a balancing seesaw.
export function Seesaw({ className }: { className?: string }) {
  return (
    <img
      src="/home/seesaw.svg"
      alt=""
      aria-hidden
      className={`animate-seesaw select-none pointer-events-none ${className ?? ''}`}
      draggable={false}
    />
  );
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: compiles with no errors.

- [ ] **Step 4: Manual check** — temporarily render `<Seesaw className="w-[500px]" />` on `app/page.tsx`, confirm the seesaw shows and gently teeters ±1°, then remove.

---

### Task 3: HomeStage — nav + default hero

**Files:**
- Create: `components/home/home-stage.tsx`
- Modify: `app/page.tsx` (render `HomeStage` instead of `SongAnalyzer`)

**Interfaces:**
- Consumes: `Seesaw` (Task 2), `scrambleReveal` from `@/lib/scramble`.
- Produces: `export function HomeStage()` — the full homepage. In this task it renders nav + the default hero only; later tasks add the center reveal (Task 4) and Photography state (Task 5).

- [ ] **Step 1: Create the component**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { scrambleReveal } from '@/lib/scramble';
import { Seesaw } from './seesaw';

const QUOTE = 'i awoke and saw that life was service. i acted and behold, service was joy.';
const GREEN = '#4FE06A';
const INSTAGRAM = 'https://www.instagram.com/joyingntravelling/';

export function HomeStage() {
  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const hasScrambled = useRef(false);

  useEffect(() => {
    if (hasScrambled.current || !quoteRef.current) return;
    hasScrambled.current = true;
    scrambleReveal(quoteRef.current, QUOTE, 1.6, 0.2);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-8 text-sm font-sans">
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 transition-opacity">
          Photography
        </a>
        <Link href="/about" className="opacity-90 hover:opacity-100 transition-opacity">
          Joy Sengupta
        </Link>
        <Link href="/writings" className="opacity-90 hover:opacity-100 transition-opacity">
          Writings
        </Link>
      </nav>

      {/* Default hero: green pixel quote behind the teetering seesaw */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <p
          ref={quoteRef}
          suppressHydrationWarning
          className="font-pixel text-center leading-[1.35] max-w-[1100px] text-[5vw] md:text-[3.4vw]"
          style={{ color: GREEN }}
        >
          {QUOTE}
        </p>
        <Seesaw className="absolute w-[62vw] max-w-[720px] h-auto" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Swap the homepage** — replace the body of `app/page.tsx`:

```tsx
'use client';

import { HomeStage } from '@/components/home/home-stage';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <HomeStage />
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: compiles with no errors.

- [ ] **Step 4: Manual check** — `pnpm dev`, open `/`: black page, nav shows `Photography` / `Joy Sengupta` / `Writings`, the green quote scrambles in (Geist Pixel dots), the seesaw teeters over it, and the music circle still sits bottom-right. `Joy Sengupta` → `/about` (404 for now is fine), `Writings` → `/writings` (404 for now), `Photography` opens Instagram.

---

### Task 4: Center reveal — movement cycles the work pile, stop hides

**Files:**
- Create: `components/home/center-stage.tsx`
- Modify: `components/home/home-stage.tsx` (move the hero into `<CenterStage>`)

**Interfaces:**
- Consumes: `WORK_ITEMS` from `@/components/work-preview`, `Seesaw`, `scrambleReveal`.
- Produces: `export function CenterStage(props: { photographyActive: boolean })` — renders the hero when idle and a mouse-driven pile when active. (`photographyActive` is wired in Task 5; pass `false` here.)

- [ ] **Step 1: Create `center-stage.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { WORK_ITEMS } from '@/components/work-preview';
import { scrambleReveal } from '@/lib/scramble';
import { Seesaw } from './seesaw';

const QUOTE = 'i awoke and saw that life was service. i acted and behold, service was joy.';
const GREEN = '#4FE06A';
const ADVANCE_MS = 320;   // min gap between pile advances while moving
const IDLE_MS = 700;      // stop-moving delay before the hero returns
const AUTO_MS = 3000;     // mobile auto-cycle cadence

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

export function CenterStage({ photographyActive }: { photographyActive: boolean }) {
  const isMobile = useIsMobile();
  const [count, setCount] = useState(0); // 0 = hero; >0 = that many piled screens
  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const hasScrambled = useRef(false);
  const lastAdvance = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scramble the quote once on first mount.
  useEffect(() => {
    if (hasScrambled.current || !quoteRef.current) return;
    hasScrambled.current = true;
    scrambleReveal(quoteRef.current, QUOTE, 1.6, 0.2);
  }, []);

  const advance = useCallback(() => {
    setCount((c) => Math.min(c + 1, WORK_ITEMS.length));
  }, []);

  // Desktop: mouse movement grows the pile; idle resets to hero.
  const handleMove = useCallback(() => {
    if (isMobile || photographyActive) return;
    const now = performance.now();
    if (now - lastAdvance.current >= ADVANCE_MS) {
      lastAdvance.current = now;
      setCount((c) => (c === 0 ? 1 : Math.min(c + 1, WORK_ITEMS.length)));
    }
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setCount(0), IDLE_MS);
  }, [isMobile, photographyActive, advance]);

  useEffect(() => () => { if (idleTimer.current) clearTimeout(idleTimer.current); }, []);

  // Mobile: no hover — auto-cycle the pile on a timer (like /work).
  useEffect(() => {
    if (!isMobile || photographyActive) { return; }
    setCount(1);
    const id = setInterval(() => {
      setCount((c) => (c >= WORK_ITEMS.length ? 0 : c + 1));
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [isMobile, photographyActive]);

  const active = count > 0;
  const activeIndex = active ? (count - 1) % WORK_ITEMS.length : -1;
  const activeItem = activeIndex >= 0 ? WORK_ITEMS[activeIndex] : null;

  return (
    <div className="absolute inset-0" onMouseMove={handleMove}>
      {/* Hero (quote + seesaw) — fades out while the pile is active */}
      <div
        className={`absolute inset-0 flex items-center justify-center px-6 transition-opacity duration-500 ${active ? 'opacity-0' : 'opacity-100'}`}
      >
        <p
          ref={quoteRef}
          suppressHydrationWarning
          className="font-pixel text-center leading-[1.35] max-w-[1100px] text-[5vw] md:text-[3.4vw]"
          style={{ color: GREEN }}
        >
          {QUOTE}
        </p>
        <Seesaw className="absolute w-[62vw] max-w-[720px] h-auto" />
      </div>

      {/* Work pile — screens stack up as the mouse moves */}
      <div className={`absolute inset-0 flex items-center justify-center px-6 pb-28 pointer-events-none transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative">
          {WORK_ITEMS.map((item, i) => {
            const visible = i < count;
            const xOff = ((i * 37) % 40) - 20;
            const yOff = ((i * 53) % 30) - 15;
            return (
              <img
                key={item.src}
                src={item.src}
                alt={item.caption}
                className="absolute -translate-x-1/2 -translate-y-1/2 shadow-2xl"
                style={{
                  display: visible ? 'block' : 'none',
                  left: `calc(50% + ${xOff}px)`,
                  top: `calc(50% + ${yOff}px)`,
                  zIndex: i,
                  maxWidth: '78vw',
                  maxHeight: '68vh',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom caption — Geist Pixel index + Galeria description (mix) */}
      {activeItem && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 w-full px-6 pointer-events-none">
          <span className="font-pixel text-xs tracking-widest" style={{ color: GREEN }}>
            {String(activeIndex + 1).padStart(2, '0')} / {WORK_ITEMS.length}
          </span>
          <p key={activeIndex} className="text-base md:text-lg font-sans text-center leading-relaxed max-w-xl text-white animate-caption-fade" style={{ textWrap: 'balance' } as React.CSSProperties}>
            {activeItem.caption}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Use `CenterStage` in `home-stage.tsx`** — replace the hero block (the `<div className="absolute inset-0 flex items-center justify-center px-6">…</div>` and its `quoteRef`/`scrambleReveal` logic) with `<CenterStage photographyActive={false} />`. Remove the now-unused `quoteRef`, `hasScrambled`, `useEffect`, `scrambleReveal`, `Seesaw`, and `QUOTE` imports/consts from `home-stage.tsx` (they now live in `CenterStage`). Keep the nav and the outer `bg-black` wrapper. Add the import: `import { CenterStage } from './center-stage';`.

Resulting `home-stage.tsx` body:

```tsx
'use client';

import Link from 'next/link';
import { CenterStage } from './center-stage';

const INSTAGRAM = 'https://www.instagram.com/joyingntravelling/';

export function HomeStage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      <nav className="fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-8 text-sm font-sans">
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 transition-opacity">Photography</a>
        <Link href="/about" className="opacity-90 hover:opacity-100 transition-opacity">Joy Sengupta</Link>
        <Link href="/writings" className="opacity-90 hover:opacity-100 transition-opacity">Writings</Link>
      </nav>
      <CenterStage photographyActive={false} />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: compiles with no errors.

- [ ] **Step 4: Manual check** — `pnpm dev`, `/`: on load, the green quote + seesaw show. Move the mouse across the center → work screens pile up and a caption (Geist Pixel index + Galeria sentence) appears at the bottom. Stop moving ~0.7s → screens fade and the hero returns. Resize below 768px → the pile auto-cycles on a timer.

---

### Task 5: Photography hover state ("snap!" + photo pile)

**Files:**
- Modify: `components/home/home-stage.tsx` (track Photography hover, dim other nav, pass `photographyActive`)
- Modify: `components/home/center-stage.tsx` (render the yellow "snap!" + photo pile when `photographyActive`)

**Interfaces:**
- Consumes: `CenterStage`'s `photographyActive` prop (Task 4).
- Produces: no new exports.

- [ ] **Step 1: Add Photography state + nav dimming in `home-stage.tsx`**

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CenterStage } from './center-stage';

const INSTAGRAM = 'https://www.instagram.com/joyingntravelling/';

export function HomeStage() {
  const [photoHover, setPhotoHover] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      <nav className="fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-8 text-sm font-sans">
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setPhotoHover(true)}
          onMouseLeave={() => setPhotoHover(false)}
          className="opacity-90 hover:opacity-100 transition-opacity"
        >
          Photography
        </a>
        <Link href="/about" className={`transition-opacity ${photoHover ? 'opacity-40' : 'opacity-90 hover:opacity-100'}`}>Joy Sengupta</Link>
        <Link href="/writings" className={`transition-opacity ${photoHover ? 'opacity-40' : 'opacity-90 hover:opacity-100'}`}>Writings</Link>
      </nav>
      <CenterStage photographyActive={photoHover} />
    </div>
  );
}
```

- [ ] **Step 2: Render the Photography mode in `center-stage.tsx`** — add the constant and a `photographyActive` branch. Add near the other consts:

```tsx
const YELLOW = '#F2E30C';
const SNAP = 'snap!';
```

Then, inside the returned JSX of `CenterStage`, add this block as the **first child** of the root `<div>` (before the hero block) so it overlays when active:

```tsx
      {/* Photography state: big yellow "snap!" behind a photo pile */}
      {photographyActive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none">
          <span className="font-pixel text-[16vw] leading-none select-none" style={{ color: YELLOW }}>
            {SNAP}
          </span>
          <div className="absolute inset-0 flex items-center justify-center px-6 pb-16">
            <div className="relative">
              {WORK_ITEMS.slice(0, 6).map((item, i) => {
                const xOff = ((i * 41) % 60) - 30;
                const yOff = ((i * 29) % 40) - 20;
                const rot = ((i * 7) % 10) - 5;
                return (
                  <img
                    key={item.src}
                    src={item.src}
                    alt=""
                    className="absolute -translate-x-1/2 -translate-y-1/2 shadow-2xl"
                    style={{
                      left: `calc(50% + ${xOff}px)`,
                      top: `calc(50% + ${yOff}px)`,
                      transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                      zIndex: i,
                      maxWidth: '46vw',
                      maxHeight: '62vh',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
```

Also guard the hero + work-pile so they hide while Photography is active: change the hero wrapper's opacity condition to `${active || photographyActive ? 'opacity-0' : 'opacity-100'}` and the work-pile wrapper to `${active && !photographyActive ? 'opacity-100' : 'opacity-0'}`. (The existing `handleMove` and mobile-timer effects already early-return when `photographyActive`.)

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: compiles with no errors.

- [ ] **Step 4: Manual check** — `pnpm dev`, `/`: hover `Photography` → the center becomes big yellow "snap!" with a photo pile in front, and `Joy Sengupta` / `Writings` dim to ~40%. Move mouse off `Photography` → the default hero returns. Click `Photography` → Instagram opens in a new tab.

---

### Task 6: About preview + `/about` page

**Files:**
- Modify: `components/home/home-stage.tsx` (About hover preview beside the name)
- Create: `app/about/page.tsx`
- Asset: `public/home/about-clip.png` (placeholder — see Step 1)

**Interfaces:**
- Produces: the `/about` route.

- [ ] **Step 1: Add a placeholder clipart** so the preview has an image (user swaps later):

```bash
cp public/placeholder-user.jpg public/home/about-clip.png 2>/dev/null || cp public/placeholder.jpg public/home/about-clip.png
ls -la public/home/about-clip.png
```

- [ ] **Step 2: Add the hover preview to the `Joy Sengupta` nav item** in `home-stage.tsx` — wrap it so a small "about" label + clipart appears on hover:

```tsx
        <span
          className="relative"
          onMouseEnter={() => setAboutHover(true)}
          onMouseLeave={() => setAboutHover(false)}
        >
          <Link href="/about" className={`transition-opacity ${photoHover ? 'opacity-40' : 'opacity-90 hover:opacity-100'}`}>Joy Sengupta</Link>
          <span className={`pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center gap-1 transition-all duration-200 ${aboutHover ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
            <img src="/home/about-clip.png" alt="" className="w-10 h-10 rounded object-cover" />
            <span className="font-pixel text-[10px] tracking-widest text-white/80">about</span>
          </span>
        </span>
```

Add `const [aboutHover, setAboutHover] = useState(false);` alongside `photoHover`, and remove the old bare `<Link href="/about" …>` line it replaces.

- [ ] **Step 3: Create `app/about/page.tsx`** (green page, Geist Pixel heading, reused bio, circle home button)

```tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const GREEN = '#1F6E3B';

export default function About() {
  return (
    <main className="relative min-h-screen w-full px-8 md:px-16 py-10" style={{ backgroundColor: GREEN, color: '#F4FBF4' }}>
      {/* Circle back-home button */}
      <Link
        href="/"
        aria-label="Back home"
        className="fixed top-6 left-6 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-black hover:bg-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="max-w-3xl mx-auto pt-24">
        <h1 className="font-pixel text-6xl md:text-8xl mb-12">about</h1>
        <div className="space-y-6 font-sans text-lg md:text-xl leading-relaxed">
          <p>
            A dry, observant, tool-pilled in a practical way, and just self-aware enough to admit
            he&apos;s become the sort of product designer who can tell you exactly why your app feels
            slightly off, why your onboarding leaks users, why your AI feature is mostly a nervous mood
            board and might just look like a GPT wrapper.
          </p>
          <p>
            This site is perpetually half-built — no case studies, no past-work gallery, mostly because
            things are moving faster than any of us can keep up with, and he&apos;s made peace with being
            the sort of designer who&apos;s always a quarter behind their own work.
          </p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: compiles with no errors.

- [ ] **Step 5: Manual check** — `pnpm dev`: hover `Joy Sengupta` → a small clipart + "about" label appears under it; click → `/about` renders as a green page with "about" in Geist Pixel, the bio, and a white circle top-left that returns to `/`.

---

### Task 7: Music circle → Lounge Mode

**Files:**
- Create: `components/lounge-mode.tsx`
- Modify: `lib/audio-context.tsx` (add `loungeOpen` / `openLounge` / `closeLounge`; mount `<LoungeMode />`)
- Modify: `components/floating-pill.tsx` (collapsed click opens Lounge; white-circle look)

**Interfaces:**
- Consumes: `useAudio()` (tracks, currentTrack, theme, playback, restartKey, triggerRestart, startMusic), `MatrixVisualization`, `ExploreToolbar`, `PatternGuide`, `DEFAULT_THEME`.
- Produces: context additions `loungeOpen: boolean`, `openLounge(): void`, `closeLounge(): void`; component `export function LoungeMode()`.

- [ ] **Step 1: Extend the audio context** — in `lib/audio-context.tsx`, add to `AudioContextValue`:

```ts
  loungeOpen: boolean;
  openLounge: () => void;
  closeLounge: () => void;
```

In `AudioProvider`, add state and callbacks (near the other `useState`s):

```tsx
  const [loungeOpen, setLoungeOpen] = useState(false);
  const openLounge = useCallback(() => { setLoungeOpen(true); startMusic(); }, [startMusic]);
  const closeLounge = useCallback(() => { setLoungeOpen(false); }, []);
```

Add `loungeOpen, openLounge, closeLounge` to the `value` object. (`startMusic` is already defined above; if a lint error about use-before-define appears, move the `openLounge` definition to just after `startMusic`.)

- [ ] **Step 2: Create `components/lounge-mode.tsx`** — a full-screen overlay that reuses the explore experience from `SongAnalyzer`:

```tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { MatrixVisualization, type ExploreSettings } from './matrix-visualization';
import { PatternGuide } from './pattern-guide';
import { ExploreToolbar } from './explore-toolbar';
import { useAudio } from '@/lib/audio-context';
import { DEFAULT_THEME } from '@/lib/color';

export function LoungeMode() {
  const {
    loungeOpen, closeLounge,
    currentTrack, theme, restartKey, triggerRestart,
    isPlaying, isMuted, currentTime, audioDuration,
    togglePlayPause, toggleMute, playNext, playPrevious,
  } = useAudio();

  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);
  const [settings, setSettings] = useState<ExploreSettings>({
    wave: 'center', colorMode: 'white', shapeMode: 'circles-ripple',
    shades: theme.shades, hue: theme.hue, saturation: theme.saturation,
  });

  useEffect(() => {
    setSettings((s) => ({ ...s, shades: theme.shades, hue: theme.hue, saturation: theme.saturation }));
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLounge(); };
    if (loungeOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loungeOpen, closeLounge]);

  const lyrics = currentTrack?.lyrics || '';
  const { words, wordMap } = useMemo(() => {
    if (!lyrics) return { words: [] as string[], wordMap: new Map<string, number[]>() };
    const normalized = lyrics.toLowerCase().split(/[\s\n]+/).map((w) => w.replace(/[^\w]/g, '')).filter((w) => w.length > 0);
    const map = new Map<string, number[]>();
    normalized.forEach((word, index) => { if (!map.has(word)) map.set(word, []); map.get(word)!.push(index); });
    return { words: normalized, wordMap: map };
  }, [lyrics]);

  if (!loungeOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden" style={{ backgroundColor: theme.background }}>
      {words.length > 0 && (
        <MatrixVisualization
          words={words} wordMap={wordMap} showSingleMatches
          opacity={1} restartKey={restartKey}
          backgroundColor={theme.backgroundRgb} cellColor={theme.accent}
          onCellHover={setHoveredCell}
          exploreSettings={settings}
          audioProgress={audioDuration > 0 ? currentTime / audioDuration : undefined}
        />
      )}

      <PatternGuide active restartKey={restartKey} />

      <button onClick={closeLounge} className="fixed top-6 right-6 z-[95] flex items-center gap-2 px-4 py-2 rounded-full text-white" aria-label="Close Lounge Mode">
        <X className="w-4 h-4" /><span className="text-sm font-sans">Back</span>
      </button>

      <ExploreToolbar
        active settings={settings} onChange={setSettings}
        onRestart={triggerRestart} toolbarColor={theme.toolbar} accentColor={theme.accent}
        currentTrack={currentTrack} isPlaying={isPlaying} isMuted={isMuted} currentTime={currentTime}
        onTogglePlayPause={togglePlayPause} onPlayNext={playNext} onPlayPrevious={playPrevious} onToggleMute={toggleMute}
        lyrics={lyrics} wordMap={wordMap}
      />
    </div>
  );
}
```

> Note: confirm `ExploreToolbar`'s prop names against `components/explore-toolbar.tsx` before finishing; they mirror the usage in `components/song-analyzer.tsx` lines 158–164. Adjust any that differ.

- [ ] **Step 3: Mount `<LoungeMode />`** — in `lib/audio-context.tsx`, import it (`import { LoungeMode } from '@/components/lounge-mode';`) and render it inside `AudioUI`'s returned fragment, after `<FloatingPill … />`:

```tsx
      <LoungeMode />
```

- [ ] **Step 4: Wire the pill click + white-circle look** — in `components/floating-pill.tsx`:
  - Add `onOpenLounge` to `FloatingPillProps` and destructure it.
  - Change the collapsed album-art buttons (both the mobile chip `onClick` at ~line 168 and the desktop album-art button `onClick` at ~line 198) from `() => setIsOpen(!isOpen)` / `() => { setIsOpen(!isOpen); }` to `onOpenLounge`.
  - Give the collapsed desktop circle a white look: on the desktop album-art button, when not expanded, use a white background. Replace its className with:

```tsx
              className={`flex items-center gap-2 p-1.5 rounded-full transition-all flex-shrink-0 bg-white text-black hover:bg-white/90`}
```

  In `lib/audio-context.tsx` `AudioUI`, pass the handler: add `onOpenLounge={openLounge}` to `<FloatingPill … />` and pull `openLounge` from `useAudio()`.

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: compiles with no errors.

- [ ] **Step 6: Manual check** — `pnpm dev`, `/`: the bottom-right music control reads as a white circle. Click it → Lounge Mode opens full-screen with the lyric-pattern dots animating and the explore/playback toolbar; music starts. Press `Esc` or click `Back` → returns to the homepage. Repeat on `/work` (the pill is global) — it opens Lounge there too.

---

### Task 8: Writings — dark editorial index + post view

**Files:**
- Create: `lib/writings.ts` (typed dummy posts)
- Create: `app/writings/page.tsx` (index)
- Create: `app/writings/[slug]/page.tsx` (post view)

**Interfaces:**
- Consumes: nothing new.
- Produces: `export interface WritingPost`, `export const WRITINGS: WritingPost[]`, `export function getWriting(slug: string): WritingPost | undefined`.

- [ ] **Step 1: Create `lib/writings.ts`**

```ts
export interface WritingPost {
  slug: string;
  number: string;      // e.g. "01"
  title: string;
  postedOn: string;    // human date
  titled: string;      // short label under "TITLED"
  references: { label: string; href: string }[];
  body: string[];      // paragraphs
  subhead: string;     // bold intro subhead
  heroImage?: string;
}

export const WRITINGS: WritingPost[] = [
  {
    slug: 'weight-of-a-button',
    number: '01',
    title: 'The Weight of a Button',
    postedOn: 'December 14th, 2025',
    titled: 'On why a button should feel expensive',
    subhead: 'Some interfaces are quiet',
    references: [
      { label: 'The cost of one more tap', href: '#' },
      { label: 'Affordances, revisited', href: '#' },
      { label: 'Motion as a promise', href: '#' },
    ],
    body: [
      'A button is the smallest contract a product makes with a person. Press here and something happens — reliably, quickly, without drama. When that contract is honoured, nobody notices. When it is broken, everybody does, and the whole thing starts to feel cheap in a way that is hard to name and easy to feel.',
      'Weight is the sum of a hundred small decisions: the radius, the shadow that says the surface can be pressed, the hundred-millisecond delay before the ripple, the way the label sits dead-centre no matter the language. None of these is visible on its own. Together they are the difference between software you trust and software you tolerate.',
      'The craft is in refusing to round any of them off. A button that feels expensive is not decorated — it is resolved. Every value has been argued for. That is the whole job, most days: arguing quietly for the values nobody will ever see.',
    ],
  },
  {
    slug: 'the-cms-cycle',
    number: '02',
    title: 'The CMS Cycle',
    postedOn: 'November 2nd, 2025',
    titled: 'A short field guide to shipping content',
    subhead: 'So, an organization spends',
    references: [
      { label: 'Problems your CMS will not solve', href: '#' },
      { label: 'Stop site degradation', href: '#' },
    ],
    body: [
      'So, an organization spends tens of thousands of dollars to build a website upon a full-access content management system. Over the coming months every department head is issued a login, and the careful thing that was launched begins, slowly, to become something else entirely.',
      'The cycle is always the same. A clean template meets a real deadline, and the template loses. Then the next deadline, and the next, until the homepage is a museum of exceptions nobody remembers agreeing to.',
      'The fix is not more governance. It is fewer, better decisions made once, early, and defended. A system is only as calm as the constraints you were willing to keep.',
    ],
  },
  {
    slug: 'notes-for-the-lazy',
    number: '03',
    title: 'Notes for the Lazy',
    postedOn: 'October 9th, 2025',
    titled: 'In praise of doing less, better',
    subhead: 'Laziness, done well',
    references: [
      { label: 'The joy of a small surface', href: '#' },
    ],
    body: [
      'Laziness, done well, is just taste with the boring parts removed. It is the instinct to delete the feature before you build the settings page for the feature. It is the refusal to solve problems you do not have yet.',
      'The lazy designer ships the smallest thing that could possibly be loved, then watches. Everything after that is earned. Most roadmaps would be shorter, and most products better, if we were all a little more honest about how little we actually need to add.',
    ],
  },
];

export function getWriting(slug: string): WritingPost | undefined {
  return WRITINGS.find((w) => w.slug === slug);
}
```

- [ ] **Step 2: Create the index `app/writings/page.tsx`**

```tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { WRITINGS } from '@/lib/writings';

const BG = '#0B0B0B';
const FG = '#EDEAE0';

export default function Writings() {
  return (
    <main className="relative min-h-screen w-full px-8 md:px-16 py-10" style={{ backgroundColor: BG, color: FG }}>
      <Link href="/" aria-label="Back home" className="fixed top-6 left-6 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-black hover:bg-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="max-w-4xl mx-auto pt-28">
        <p className="font-mono uppercase tracking-[0.25em] text-xs mb-16" style={{ color: FG, opacity: 0.5 }}>Writings</p>
        <ul className="divide-y" style={{ borderColor: 'rgba(237,234,224,0.15)' }}>
          {WRITINGS.map((post) => (
            <li key={post.slug}>
              <Link href={`/writings/${post.slug}`} className="group flex items-baseline gap-6 py-8">
                <span className="font-pixel text-sm" style={{ color: FG, opacity: 0.5 }}>{post.number}</span>
                <span className="font-sans text-4xl md:text-6xl tracking-tight transition-opacity group-hover:opacity-70">{post.title}</span>
                <span className="ml-auto font-mono uppercase tracking-widest text-[11px] self-center" style={{ opacity: 0.4 }}>{post.postedOn}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Create the post view `app/writings/[slug]/page.tsx`** (Next 16 params are async)

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { WRITINGS, getWriting } from '@/lib/writings';

const BG = '#0B0B0B';
const FG = '#EDEAE0';
const RULE = 'rgba(237,234,224,0.15)';

export function generateStaticParams() {
  return WRITINGS.map((w) => ({ slug: w.slug }));
}

export default async function WritingPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getWriting(slug);
  if (!post) notFound();

  return (
    <main className="relative min-h-screen w-full px-6 md:px-16 py-10" style={{ backgroundColor: BG, color: FG }}>
      <Link href="/" aria-label="Back home" className="fixed top-6 left-6 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-black hover:bg-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="max-w-5xl mx-auto pt-24">
        {/* Big display title + pixel number */}
        <div className="flex items-start gap-4">
          <span className="font-pixel text-base mt-3" style={{ opacity: 0.5 }}>{post.number}</span>
          <h1 className="font-sans font-medium text-6xl md:text-8xl leading-[0.95] tracking-tight">{post.title}</h1>
        </div>

        {post.heroImage && (
          <img src={post.heroImage} alt="" className="w-full mt-12 rounded-lg" />
        )}

        <hr className="my-12 border-0 border-t" style={{ borderColor: RULE }} />

        {/* Three-column editorial grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2.4fr_1fr] gap-10 md:gap-12">
          {/* Left — meta */}
          <aside className="space-y-8">
            <div>
              <p className="font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>Titled</p>
              <p className="font-sans mt-2">{post.titled}</p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>Posted on</p>
              <p className="font-sans mt-2">{post.postedOn}</p>
            </div>
          </aside>

          {/* Center — body */}
          <article className="max-w-[66ch]">
            <h2 className="font-sans font-medium text-3xl mb-6 tracking-tight">{post.subhead}</h2>
            {post.body.map((para, i) => (
              <p
                key={i}
                className={`font-sans text-lg leading-relaxed mb-6 ${i === 0 ? 'first-letter:font-pixel first-letter:text-5xl first-letter:mr-2 first-letter:float-left first-letter:leading-none' : ''}`}
              >
                {para}
              </p>
            ))}
          </article>

          {/* Right — references */}
          <aside>
            <p className="font-mono uppercase tracking-widest text-[11px] mb-4" style={{ opacity: 0.5 }}>Reference</p>
            <ul className="space-y-3">
              {post.references.map((ref) => (
                <li key={ref.label}>
                  <a href={ref.href} className="font-sans underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity" style={{ textDecorationColor: RULE }}>{ref.label}</a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: compiles with no errors (static params generate the three post routes).

- [ ] **Step 5: Manual check** — `pnpm dev`: `/writings` shows a dark index with large Galeria titles, Geist Pixel numbers, and Praktikal dates; the top-left circle returns home. Click a post → the dark editorial layout renders: huge title + pixel number, a rule, then the three columns (TITLED/POSTED ON · body with a Geist-Pixel drop cap · REFERENCE links). Resize to mobile → columns stack.

---

## Self-Review

**Spec coverage:**
- Fonts (Geist Pixel + token) → Task 1. ✓
- Seesaw + ±1° teeter → Task 2. ✓
- Homepage nav + black canvas + green pixel quote + scramble → Task 3. ✓
- Center "movement cycles, stop hides" + caption + mobile timer → Task 4. ✓
- Photography "snap!" yellow + photo pile + nav dim + Instagram → Task 5. ✓
- About hover preview + `/about` green page + circle home button + reused bio → Task 6. ✓
- Music circle white + click → Lounge Mode (patterns preserved) → Task 7. ✓
- `/writings` dark editorial index + post grid + 3–4 dummy posts + Galeria/Pixel/Praktikal → Task 8. ✓
- `/work` + experiments untouched and unlinked → satisfied (no tasks modify them; nav omits them). ✓

**Placeholder scan:** No "TBD/TODO/handle edge cases" left in steps. Asset placeholders (about clipart, photos) are explicit, real fallbacks, not vague. Hex values are concrete defaults. ✓

**Type consistency:** `CenterStage({ photographyActive })` used identically in Tasks 4–5; `WritingPost`/`WRITINGS`/`getWriting` defined in Task 8 Step 1 and consumed in Steps 2–3; context additions `loungeOpen`/`openLounge`/`closeLounge` defined and consumed consistently in Task 7; `Seesaw({ className })` defined Task 2, used Tasks 3–4. ✓

**Known verification-time check:** Task 7 Step 2 depends on `ExploreToolbar`'s exact prop names — the plan flags confirming them against `components/explore-toolbar.tsx` (they mirror `song-analyzer.tsx:158–164`).
