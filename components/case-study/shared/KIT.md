# Case-study kit (Apple-style)

Components for bespoke case studies in the shape of **Cassi** (mobile) and **Tactile Create** (web), borrowing Apple product-page structure. Instead of a product, show UI screens. Instead of lifestyle photos, show mockups. Instead of spec bentos, take the components apart.

Reference pilots: `../convey-health.tsx` (web) and `../sellcrowd.tsx` (mobile).

## Before you write a word

Load the project skill **`writing-case-studies`** (`.claude/skills/writing-case-studies/`) and follow it. Its rules win on copy and voice:

- Never invent facts, users, numbers or turning points. Unknowns become `// ASK JOY:` comments. If a whole FAQ answer is unknown, leave the question out rather than filling it.
- Headings are lines from the story, never framework labels.
- Write in Joy's voice: short, plain and specific. No em-dash floods.

Take facts from the project's `~/Desktop/Redesigns/<dir>/CASESTUDY.md`, the original files, and the existing page. Drop anything those don't support.

## Page shape

```
CaseShell (h1, lede, credits, collapsed bar, right-rail TOC, lightbox)
  Statement          problem statement, 3 lines + trailing context paragraph
  ScaleHero          first screen arrives oversized, settles, lineup pans past
  ScrollDeviceStory  pinned device; 4–6 text steps swap the screen
  MarqueeWall        every screen (mobile: 2026 row over the original row)
  CloserLook         "Take a closer look": pills + one big stage
  DeconstructBento   the parts: exploded layers, anatomy pins, palette, states
  BeforeAfter        drag divider on one screen + "compare" fact rows
  HighlightBanner    one full-bleed mockup (a Dribbble board, not a person)
  FaqAccordion       role, what's original vs 2026, testing — true answers only
```

Vary the order and drop pieces per project. Mobile follows Cassi (lineup early, marquee high). Web follows Tactile Create (hero → story → closer look). Don't use every piece if the project hasn't earned it.

## Components

**`CaseShell`** (`case-shell.tsx`): `title, lede, people, meta, toc, children: (open) => …`. `toc[0]` is the header. The other labels must match section `id`s via `sectionId(label)`. Keep `meta` short (e.g. `GGK{SEP}2018{SEP}Revisited 2026`), because SEP uses non-breaking spaces and a long chain overflows at 390px. `SectionIntro({eyebrow?, heading, children})` is the heading-plus-intro block.

**`DeviceFrame`** (`device-frame.tsx`): `kind: 'phone' | 'browser' | 'tablet' | 'bare'`, plus `screen` or custom `children`, `ratio?` and `url?` (the browser pill text). Size it by width with `className`; everything inside scales with container units.
- A `FrameScreen` is `{ src, alt?, live?, width? }`. `src` is an image or MP4, and also the poster for a live screen.
- `live` is a real HTML screen at `/work/<slug>/live/<file>.html`. It renders in an iframe scaled to the frame, mounts only near the viewport, and fades in over the poster.
- Use live screens sparingly, one or two per page, for the hero screen.
- The default ratios are phone 390/844, browser 1440/900 and tablet 4/3.

**`ScaleHero`** (`scale-hero.tsx`): `kind, screens, ratio?, url?, fromScale?, widthVw?`. It takes 5–7 screens. Put a `SectionIntro` above it; it has no heading of its own.

**`ScrollDeviceStory`** (`scroll-device-story.tsx`): `kind, steps, intro?, deviceSide?, url?`.
- A step is `{ title, body, screen, panRatio? }`.
- `panRatio` is the full screenshot's height ÷ width (e.g. 1527/1600). With it, a long page scrolls inside the device while its step is active.
- Web and tablet stories break out of the text column to about 1320px. Below md, each step renders as a stacked device then its text.

**`CloserLook`** (`closer-look.tsx`): `items: { label, body, screen, kind?, ratio? }[]`, `kind?`, `stageAspect?` (default 4/3, which matches the 1600×1200 reels).
- It autoplays while in view and stops for good on the first click.
- Bare images and MP4s are shown contained. Set `kind: 'phone'` on an item to frame a single screen.

**`DeconstructBento`** (`deconstruct-bento.tsx`): `tiles` sit on a 6-column grid, with `span` set to `full`, `two-thirds`, `half` or `third`. Tile kinds:
- `exploded`, `{ layers: {src,label}[], ratio }`: real layers tilt apart in 3D. Hovering a legend row isolates that layer, and clicking assembles the stack again.
- `anatomy`, `{ src, ratio, pins: {x,y,label}[] }`: numbered pins as percentages. Place them in the gaps next to the element, never on top of its text (see the pilots).
- `palette`, `{ swatches: {hex,name}[], font?: {family, href, sample, note} }`: use the project's real tokens from `screens/*.css`.
- `states`, `{ items: {src,label}[], ratio }`: the same component in different moments.
- `media`, `{ src, aspect?, fit? }`.

**`BeforeAfter`** (`before-after.tsx`): `kind, before: {src,label}, after: {src,label}, facts?: {label,before,after}[]`. It sweeps once on first view, then responds to drag or arrow keys. Facts must be visible in the two images or stated in the project files.

The older shared pieces still apply: `Statement`, `MarqueeWall`, `HighlightBanner`, `FaqAccordion` and `PhoneRow`.

## Assets

Put everything under `public/work/<slug>/kit/` as webp: desktop screens 1600 wide, phone screens 780, details 1200. MP4 reels go in `public/work/<slug>/`.

- **Cosmos screens** (`deliverables/cosmos/screen-*.png`) are full-length, which suits `panRatio`.
- **Live screens:** copy `~/Desktop/Redesigns/<dir>/screens/*` to `public/work/<slug>/live/`. Copy the project's logo to `live/_logo.png` and rewrite the `../../_logos/<x>.png` references to it. The screens' CSS already blurs the logo.
- **Exploded layers and anatomy:** capture them from the live HTML with playwright-core.
  - For each layer, add a style tag: `html,body{background:transparent!important} body{visibility:hidden!important} <part>{visibility:visible!important}`. Hide a part's children with `<part> *{visibility:hidden!important}`.
  - Screenshot the same clip rect each time with `omitBackground: true`.
  - Give content layers a white backing (`background:#fff;border-radius`) so they still read once pulled apart.
  - For anatomy pins, read element bounds with `getBoundingClientRect` relative to the clip.
  - The pilots' capture script is `scripts/case-kit-capture.mjs`; copy its `layers()` and `anatomy()` helpers.
- **Logos:** client logos are always blurred, including inside "before" screenshots. Blur them with a soft-edged Gaussian mask before converting (sigma about 0.16× the logo height). The 2018 Convey before image needed this.

## Verify

1. `./node_modules/.bin/tsc --noEmit`: only the known `lib/color.ts` error is allowed.
2. With the dev server on :3123, screenshot the whole page at 1440×900 and 390×844 with playwright-core. Log console errors and any response ≥400, and check that `scrollWidth` equals the viewport.
3. Look at every frame. Check that pins are off the text, the story device is readable, the mobile pill row doesn't widen its column, and the meta line wraps cleanly.
