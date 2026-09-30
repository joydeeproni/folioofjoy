# Swing Tap Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the homepage hero swing into a 10-second tap game with a public, anonymous leaderboard stored in Vercel Blob.

**Architecture:** Pure, unit-tested rules live in `lib/swing-game/*`: warm-up, energy, names, tickets, board ranking and flags. A thin Blob I/O layer (`store.ts`) and two route handlers (`/api/swing/start`, `/api/swing`) sit on top of them. On the client, a `useSwingGame` hook owns the `idle → playing → results` state machine. `HomeStage` hosts the hook and hides the page chrome during play. `CenterStage` renders the swing, the warm-up squares, the canvas HUD and the full-bleed results screen.

**Tech Stack:** Next.js 16 App Router (route handlers, Node runtime), React 19, Tailwind v4, `@vercel/blob` 2.4, Vitest (new dev dependency), pnpm 11.

**Spec:** `docs/superpowers/specs/2026-09-30-swing-tap-game-design.md`
**Visual reference:** `docs/superpowers/prototypes/2026-09-29-swing-tap-game/template.html`. The look is signed off; port its measurements and colours exactly.

## Global Constraints

- Score = raw tap count in a **10 s** window (`RUN_MS = 10_000`). Maximum accepted score `MAX_SCORE = 250`.
- Warm-up: **5 taps** (`WARMUP_TAPS = 5`), each ≤ **1500 ms** after the previous (`WARMUP_GAP_MS = 1500`). Warm-up taps never score.
- Tickets: HMAC-SHA256 signed with `BLOB_READ_WRITE_TOKEN`. Accept only when age is in **[9 000 ms, 120 000 ms]**.
- Blob pathnames: `swing/<env>/<visitorHash>/<score>-<CC>.json`, where `<env>` ∈ `production | preview | dev` (from `VERCEL_ENV`; anything else → `dev`) and `CC` = `XX` when the country is unknown.
- One entry per visitor, best score only. Raw visitor hashes never appear in an API response.
- Arc cap grows from **26°** to **70°**, reaching the maximum at **120 taps**.
- All game numbers use **Praktikal** (`font-mono` in this codebase, since `--font-mono: 'Praktikal'`) with `tabular-nums`.
- Colours: count `#efe4ce`, rate `#43c779`, countdown and clock `#e83c35`, graph line `#43c779`, baseline `#1f3a2c`, playhead ring `#7b93ff`, peak ring `#f7eedc`, sparkline `#2f6b66`, results score `#f4c51b`, player row bg `#1c1a08` / text `#e8d84a`.
- The swing's "click to push ♪" / "one more?" hint is removed.
- `next.config.mjs` has `typescript.ignoreBuildErrors: true`, so `pnpm build` does not type-check. Every task's verification runs `pnpm exec tsc --noEmit` and requires **no errors in files this plan touches**. Pre-existing errors elsewhere are ignored.
- Commit after every task, ending the message with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. **Non-primary input** — a right-click, middle-click or held key (auto-repeat) must not count as a tap. Pinned by the `countsAsPointerTap` / `countsAsKeyTap` tests in Task 2.
2. **Taps after the 10 s mark but before the next animation frame ends the run** must not raise the score. Pinned by the `acceptsRunTap` test in Task 2.
3. **Unknown country** (local dev, privacy browsers) must store `XX`, show no flag and not break parsing. Pinned by the `scorePath`/`parseScorePath`/`flagEmoji('')` tests in Tasks 5 and 3.
4. **A lower score than the visitor's best** must leave their entry untouched and report `improved: false`. Pinned by the `shouldReplace` test in Task 5 and the route test in Task 6.
5. **The visitor hash changing between ticket and submit** (e.g. a phone switching Wi-Fi to cellular) must return 403. The player still sees their score, with "couldn't save". Pinned by the route test in Task 6 and handled in `finish()` in Task 9.

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `vitest.config.ts` | create | Vitest config with the `@/` alias |
| `lib/visitor.ts` | create | `visitorHash`, `countryOf` (moved from guestbook route) |
| `lib/visitor.test.ts` | create | tests |
| `app/api/guestbook/route.ts` | modify | import the two helpers instead of defining them |
| `lib/swing-game/rules.ts` | create | constants, score validation, warm-up, tap filters, arc cap |
| `lib/swing-game/rules.test.ts` | create | tests |
| `lib/swing-game/energy.ts` | create | energy (taps/s) model and graph scale |
| `lib/swing-game/energy.test.ts` | create | tests |
| `lib/swing-game/names.ts` | create | `animalName(hash)` |
| `lib/swing-game/flag.ts` | create | `flagEmoji(cc)` |
| `lib/swing-game/names.test.ts` | create | tests for names and flag |
| `lib/swing-game/ticket.ts` | create | `issueTicket`, `verifyTicket` |
| `lib/swing-game/ticket.test.ts` | create | tests |
| `lib/swing-game/board.ts` | create | pure pathnames, parsing, ranking, view building |
| `lib/swing-game/board.test.ts` | create | tests |
| `lib/swing-game/store.ts` | create | Blob I/O: `readRanked`, `writeBest` |
| `app/api/swing/start/route.ts` | create | `POST` → ticket |
| `app/api/swing/route.ts` | create | `GET` board, `POST` score |
| `app/api/swing/route.test.ts` | create | route tests with a mocked store |
| `lib/swing-game/client.ts` | create | browser fetch wrappers |
| `components/circle-button.tsx` | modify | optional `href` (button mode) and `tone` |
| `components/home/swing-set.tsx` | modify | `onTap`, `setArcCap`, `angle`, `kick(pitch)`, hint removed |
| `components/home/swing-game/use-swing-game.ts` | create | state machine hook |
| `components/home/swing-game/draw.ts` | create | canvas drawing for the graph and sparkline |
| `components/home/swing-game/game-hud.tsx` | create | readout and graph with its rAF loop |
| `components/home/swing-game/game-results.tsx` | create | full-bleed results screen |
| `components/home/swing-game/warmup-dots.tsx` | create | 5 progress squares |
| `components/home/home-stage.tsx` | modify | host the hook, fade the chrome |
| `components/home/center-stage.tsx` | modify | render swing, dots, HUD, quit, results |
| `package.json` | modify | `vitest` dev dependency, `test` script |

---

### Task 1: Test harness and shared visitor helpers

**Files:**
- Create: `vitest.config.ts`, `lib/visitor.ts`, `lib/visitor.test.ts`
- Modify: `package.json` (scripts, devDependencies), `app/api/guestbook/route.ts:1-41`

**Interfaces:**
- Produces: `countryOf(req: Request): string` (two uppercase letters, or `''`); `visitorHash(req: Request): string` (16 lowercase hex chars).

- [ ] **Step 1: Install dependencies and Vitest**

```bash
pnpm install
pnpm add -D vitest
```

Then add to `package.json` `"scripts"`: `"test": "vitest run"`.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  test: { environment: 'node', include: ['**/*.test.ts'], exclude: ['node_modules/**', '.next/**'] },
});
```

- [ ] **Step 3: Write the failing test `lib/visitor.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { countryOf, visitorHash } from './visitor';

const req = (headers: Record<string, string>) => new Request('http://localhost/', { headers });

describe('countryOf', () => {
  it('prefers the Vercel geo header, uppercased', () => {
    expect(countryOf(req({ 'x-vercel-ip-country': 'dk', 'accept-language': 'en-US' }))).toBe('DK');
  });
  it('falls back to the Accept-Language region subtag', () => {
    expect(countryOf(req({ 'accept-language': 'da-DK,da;q=0.9' }))).toBe('DK');
  });
  it('returns empty string when it cannot tell', () => {
    expect(countryOf(req({ 'accept-language': 'en' }))).toBe('');
    expect(countryOf(req({}))).toBe('');
  });
});

describe('visitorHash', () => {
  it('is 16 hex chars and stable for the same IP', () => {
    const a = visitorHash(req({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }));
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    expect(visitorHash(req({ 'x-forwarded-for': '1.2.3.4' }))).toBe(a);
  });
  it('differs for different IPs', () => {
    expect(visitorHash(req({ 'x-forwarded-for': '1.2.3.4' }))).not.toBe(visitorHash(req({ 'x-forwarded-for': '5.6.7.8' })));
  });
});
```

- [ ] **Step 4: Run it to confirm it fails**

Run: `pnpm test lib/visitor.test.ts`
Expected: FAIL — `Failed to resolve import "./visitor"`.

- [ ] **Step 5: Create `lib/visitor.ts` (moved verbatim from the guestbook route)**

```ts
import { createHash } from 'node:crypto';

// Where the visitor is. On Vercel this is the edge's own geo header; locally
// there is no such header, so we fall back to the region subtag of
// Accept-Language (da-DK -> DK), which is the closest honest guess a dev box
// can make. Returns '' rather than a fake country when we truly can't tell.
export function countryOf(req: Request): string {
  const vercel = req.headers.get('x-vercel-ip-country');
  if (vercel) return vercel.toUpperCase();

  const langs = req.headers.get('accept-language') ?? '';
  const region = langs.match(/[a-z]{2,3}-([A-Z]{2})/);
  return region ? region[1].toUpperCase() : '';
}

// Stable per-visitor key that isn't a stored IP. Salted with the blob token so
// the hash isn't reversible via a rainbow table of the v4 space.
export function visitorHash(req: Request): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const salt = process.env.BLOB_READ_WRITE_TOKEN ?? 'folioofjoy';
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 16);
}
```

- [ ] **Step 6: Point the guestbook route at it**

In `app/api/guestbook/route.ts`:
- Delete the `countryOf` and `visitorHash` function definitions and their comments (lines 18–41).
- Change `import { createHash, randomUUID } from 'node:crypto';` to `import { randomUUID } from 'node:crypto';`.
- Add `import { countryOf, visitorHash } from '@/lib/visitor';` after the `next/server` import.

- [ ] **Step 7: Verify**

Run: `pnpm test` → PASS (5 tests).
Run: `pnpm exec tsc --noEmit 2>&1 | grep -E "lib/visitor|api/guestbook|vitest.config"` → no output.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts lib/visitor.ts lib/visitor.test.ts app/api/guestbook/route.ts
git commit -m "refactor: share visitor hash and country helpers; add vitest

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Game rules

**Files:**
- Create: `lib/swing-game/rules.ts`, `lib/swing-game/rules.test.ts`

**Interfaces:**
- Produces:
  - Constants: `WARMUP_TAPS`, `WARMUP_GAP_MS`, `RUN_MS`, `MAX_SCORE`, `TICKET_MIN_AGE_MS`, `TICKET_MAX_AGE_MS`, `BOARD_SIZE`, `ARC_START_RAD`, `ARC_MAX_RAD`.
  - `isValidScore(v: unknown): v is number`
  - `warmupTap(times: readonly number[], now: number): number[]`
  - `acceptsRunTap(startedAt: number, now: number): boolean`
  - `countsAsPointerTap(e: { pointerType: string; button: number }): boolean` (only the primary button counts)
  - `countsAsKeyTap(e: { key: string; repeat: boolean }): boolean`
  - `arcCapFor(count: number): number` (radians)

- [ ] **Step 1: Write the failing test `lib/swing-game/rules.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import {
  ARC_MAX_RAD, ARC_START_RAD, MAX_SCORE, RUN_MS, WARMUP_GAP_MS,
  acceptsRunTap, arcCapFor, countsAsKeyTap, countsAsPointerTap, isValidScore, warmupTap,
} from './rules';

describe('isValidScore', () => {
  it('accepts integers 0..MAX_SCORE', () => {
    expect(isValidScore(0)).toBe(true);
    expect(isValidScore(MAX_SCORE)).toBe(true);
  });
  it('rejects everything else', () => {
    for (const v of [-1, MAX_SCORE + 1, 1.5, NaN, Infinity, '12', null, undefined]) expect(isValidScore(v)).toBe(false);
  });
});

describe('warmupTap', () => {
  it('accumulates taps within the gap', () => {
    let t: number[] = [];
    for (let i = 0; i < 5; i++) t = warmupTap(t, i * 200);
    expect(t).toHaveLength(5);
  });
  it('keeps a tap exactly at the gap limit', () => {
    expect(warmupTap([0], WARMUP_GAP_MS)).toHaveLength(2);
  });
  it('starts over after a longer gap', () => {
    expect(warmupTap([0, 200, 400], 400 + WARMUP_GAP_MS + 1)).toEqual([400 + WARMUP_GAP_MS + 1]);
  });
});

describe('acceptsRunTap', () => {
  it('accepts taps inside the window and rejects at/after the end', () => {
    expect(acceptsRunTap(1000, 1000)).toBe(true);
    expect(acceptsRunTap(1000, 1000 + RUN_MS - 1)).toBe(true);
    expect(acceptsRunTap(1000, 1000 + RUN_MS)).toBe(false);
  });
});

describe('tap filters', () => {
  it('counts touch, pen and left mouse; ignores right and middle mouse buttons', () => {
    expect(countsAsPointerTap({ pointerType: 'touch', button: 0 })).toBe(true);
    expect(countsAsPointerTap({ pointerType: 'mouse', button: 0 })).toBe(true);
    expect(countsAsPointerTap({ pointerType: 'mouse', button: 2 })).toBe(false);
    expect(countsAsPointerTap({ pointerType: 'mouse', button: 1 })).toBe(false);
    expect(countsAsPointerTap({ pointerType: 'pen', button: 0 })).toBe(true);
  });
  it('counts Space/Enter presses but not auto-repeat', () => {
    expect(countsAsKeyTap({ key: ' ', repeat: false })).toBe(true);
    expect(countsAsKeyTap({ key: 'Enter', repeat: false })).toBe(true);
    expect(countsAsKeyTap({ key: ' ', repeat: true })).toBe(false);
    expect(countsAsKeyTap({ key: 'a', repeat: false })).toBe(false);
  });
});

describe('arcCapFor', () => {
  it('grows linearly from the start arc to the max at 120 taps, then holds', () => {
    expect(arcCapFor(0)).toBeCloseTo(ARC_START_RAD);
    expect(arcCapFor(60)).toBeCloseTo((ARC_START_RAD + ARC_MAX_RAD) / 2);
    expect(arcCapFor(120)).toBeCloseTo(ARC_MAX_RAD);
    expect(arcCapFor(500)).toBeCloseTo(ARC_MAX_RAD);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test lib/swing-game/rules.test.ts` → FAIL (cannot resolve `./rules`).

- [ ] **Step 3: Implement `lib/swing-game/rules.ts`**

```ts
// The swing tap game's rules, shared by the client game loop and the API so
// both sides agree on what counts.

export const WARMUP_TAPS = 5;
export const WARMUP_GAP_MS = 1500;
export const RUN_MS = 10_000;
// ~25 taps/s for 10s — past what two fast thumbs manage, so anything higher
// is a forged request rather than a good run.
export const MAX_SCORE = 250;
// 9s, not 10s: the ticket is stamped when the server answers, so request and
// response latency can make a genuine run look slightly short.
export const TICKET_MIN_AGE_MS = 9_000;
export const TICKET_MAX_AGE_MS = 120_000;
export const BOARD_SIZE = 10;

const deg = (d: number) => (d * Math.PI) / 180;
export const ARC_START_RAD = deg(26);
export const ARC_MAX_RAD = deg(70);
const ARC_FULL_AT = 120;

export function isValidScore(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= MAX_SCORE;
}

// Warm-up taps must come in quick succession; a long pause starts over.
export function warmupTap(times: readonly number[], now: number): number[] {
  const last = times[times.length - 1];
  const kept = last !== undefined && now - last <= WARMUP_GAP_MS ? times : [];
  return [...kept, now];
}

// A tap can land after the 10s mark but before the frame that ends the run.
export function acceptsRunTap(startedAt: number, now: number): boolean {
  return now - startedAt < RUN_MS;
}

export function countsAsPointerTap(e: { pointerType: string; button: number }): boolean {
  return e.button === 0;
}

export function countsAsKeyTap(e: { key: string; repeat: boolean }): boolean {
  return !e.repeat && (e.key === ' ' || e.key === 'Enter');
}

// Frantic tapping should look frantic: the swing's arc cap opens up with the count.
export function arcCapFor(count: number): number {
  return ARC_START_RAD + (ARC_MAX_RAD - ARC_START_RAD) * Math.min(1, count / ARC_FULL_AT);
}
```

- [ ] **Step 4: Verify**

Run: `pnpm test lib/swing-game/rules.test.ts` → PASS.
Run: `pnpm exec tsc --noEmit 2>&1 | grep "lib/swing-game"` → no output.

- [ ] **Step 5: Commit**

```bash
git add lib/swing-game/rules.ts lib/swing-game/rules.test.ts
git commit -m "feat(swing-game): shared game rules

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Energy model, animal names and flags

**Files:**
- Create: `lib/swing-game/energy.ts`, `lib/swing-game/energy.test.ts`, `lib/swing-game/names.ts`, `lib/swing-game/flag.ts`, `lib/swing-game/names.test.ts`

**Interfaces:**
- Produces:
  - `ENERGY_TAU_S = 0.3`
  - `decay(energy: number, dtSeconds: number): number`
  - `tapImpulse(energy: number): number`
  - `graphScale(samples: readonly number[]): number`
  - `animalName(hash: string): string`
  - `ADJECTIVES`, `ANIMALS` (readonly string arrays, 40 each)
  - `flagEmoji(cc: string): string`

- [ ] **Step 1: Write the failing tests**

`lib/swing-game/energy.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { decay, graphScale, tapImpulse } from './energy';

describe('energy', () => {
  it('averages to roughly the tap rate under steady tapping', () => {
    let e = 0;
    let sum = 0;
    let n = 0;
    // 8 taps/s for 3s, sampled every 1ms; average over the last second.
    for (let ms = 1; ms <= 3000; ms++) {
      e = decay(e, 0.001);
      if (ms % 125 === 0) e = tapImpulse(e);
      if (ms > 2000) { sum += e; n++; }
    }
    expect(sum / n).toBeGreaterThan(7);
    expect(sum / n).toBeLessThan(9);
  });
  it('decays toward zero and never goes negative', () => {
    expect(decay(10, 5)).toBeLessThan(0.01);
    expect(decay(10, -1)).toBe(10);
  });
  it('scale has a floor and headroom above the peak', () => {
    expect(graphScale([])).toBe(14);
    expect(graphScale([3, 5])).toBe(14);
    expect(graphScale([20])).toBeCloseTo(22.4);
  });
});
```

`lib/swing-game/names.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ADJECTIVES, ANIMALS, animalName } from './names';
import { flagEmoji } from './flag';

describe('animalName', () => {
  it('has 40 × 40 unique words', () => {
    expect(new Set(ADJECTIVES).size).toBe(40);
    expect(new Set(ANIMALS).size).toBe(40);
  });
  it('is deterministic and built from the lists', () => {
    const name = animalName('a1b2c3d4e5f60718');
    expect(animalName('a1b2c3d4e5f60718')).toBe(name);
    const adj = ADJECTIVES.find((a) => name.startsWith(`${a} `));
    expect(adj).toBeDefined();
    expect(ANIMALS).toContain(name.slice(adj!.length + 1));
  });
  it('varies across hashes', () => {
    const names = new Set(['0000', '1234', 'abcd', 'ffff', '9f3e', '7777'].map((p) => animalName(`${p}${p}${p}${p}`)));
    expect(names.size).toBeGreaterThan(3);
  });
  it('survives a malformed hash', () => {
    expect(animalName('zz')).toBe(`${ADJECTIVES[0]} ${ANIMALS[0]}`);
  });
});

describe('flagEmoji', () => {
  it('maps a country code to regional indicators', () => {
    expect(flagEmoji('DK')).toBe('🇩🇰');
    expect(flagEmoji('us')).toBe('🇺🇸');
  });
  it('returns empty for unknown or malformed codes', () => {
    expect(flagEmoji('')).toBe('');
    expect(flagEmoji('XX')).toBe('');
    expect(flagEmoji('D1')).toBe('');
  });
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `pnpm test lib/swing-game/energy.test.ts lib/swing-game/names.test.ts` → FAIL (modules missing).

- [ ] **Step 3: Implement `lib/swing-game/energy.ts`**

```ts
// The HUD's "energy": each tap adds 1/τ and the total decays with time
// constant τ, so the value tracks taps per second and draws the jagged
// saw-tooth of real tapping without any smoothing tricks.
export const ENERGY_TAU_S = 0.3;
const MIN_GRAPH_SCALE = 14;

export const decay = (energy: number, dtSeconds: number) =>
  energy * Math.exp(-Math.max(0, dtSeconds) / ENERGY_TAU_S);

export const tapImpulse = (energy: number) => energy + 1 / ENERGY_TAU_S;

// Y-axis ceiling: a floor so slow runs don't look huge, headroom so fast runs never clip.
export const graphScale = (samples: readonly number[]) =>
  Math.max(MIN_GRAPH_SCALE, Math.max(0, ...samples) * 1.12);
```

- [ ] **Step 4: Implement `lib/swing-game/names.ts`**

```ts
// Every player gets a cute animal name derived from their anonymous visitor
// hash: nothing to type, nothing to moderate, and the same person is always
// the same animal. Never stored — recomputed wherever it's shown.
export const ADJECTIVES = [
  'Cute', 'Fluffy', 'Sleepy', 'Tiny', 'Bouncy', 'Cheeky', 'Snuggly', 'Wobbly', 'Giggly', 'Fuzzy',
  'Sunny', 'Dozy', 'Plucky', 'Squishy', 'Zippy', 'Humble', 'Chubby', 'Dreamy', 'Jolly', 'Perky',
  'Peppy', 'Cosy', 'Dainty', 'Merry', 'Nifty', 'Silly', 'Sparkly', 'Toasty', 'Wiggly', 'Bubbly',
  'Cuddly', 'Dizzy', 'Frisky', 'Gentle', 'Happy', 'Lucky', 'Mellow', 'Nimble', 'Rosy', 'Sprightly',
] as const;

export const ANIMALS = [
  'Panda', 'Hedgehog', 'Otter', 'Bunny', 'Penguin', 'Kitten', 'Duckling', 'Koala', 'Fox', 'Hamster',
  'Seal', 'Lamb', 'Owl', 'Axolotl', 'Capybara', 'Quokka', 'Red Panda', 'Corgi', 'Puppy', 'Piglet',
  'Fawn', 'Chick', 'Sloth', 'Squirrel', 'Raccoon', 'Hippo', 'Llama', 'Alpaca', 'Chinchilla', 'Ferret',
  'Gecko', 'Turtle', 'Frog', 'Bee', 'Ladybug', 'Koi', 'Puffin', 'Wombat', 'Meerkat', 'Lemur',
] as const;

const index = (hex: string, size: number) => {
  const n = parseInt(hex, 16);
  return Number.isNaN(n) ? 0 : n % size;
};

export function animalName(hash: string): string {
  return `${ADJECTIVES[index(hash.slice(0, 4), ADJECTIVES.length)]} ${ANIMALS[index(hash.slice(4, 8), ANIMALS.length)]}`;
}
```

- [ ] **Step 5: Implement `lib/swing-game/flag.ts`**

```ts
// ISO country code → flag emoji via regional indicator symbols. Windows shows
// the two letters instead of a flag, which is fine.
export function flagEmoji(cc: string): string {
  const code = cc.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || code === 'XX') return '';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}
```

- [ ] **Step 6: Verify**

Run: `pnpm test lib/swing-game` → PASS.
Run: `pnpm exec tsc --noEmit 2>&1 | grep "lib/swing-game"` → no output.

- [ ] **Step 7: Commit**

```bash
git add lib/swing-game/energy.ts lib/swing-game/energy.test.ts lib/swing-game/names.ts lib/swing-game/flag.ts lib/swing-game/names.test.ts
git commit -m "feat(swing-game): energy model, animal names and flags

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Run tickets

**Files:**
- Create: `lib/swing-game/ticket.ts`, `lib/swing-game/ticket.test.ts`

**Interfaces:**
- Consumes: `TICKET_MIN_AGE_MS`, `TICKET_MAX_AGE_MS` from `./rules`.
- Produces:
  - `type TicketCheck = 'ok' | 'malformed' | 'bad-signature' | 'too-early' | 'expired'`
  - `issueTicket(visitor: string, now?: number): string`
  - `verifyTicket(ticket: unknown, visitor: string, now?: number): TicketCheck`

- [ ] **Step 1: Write the failing test `lib/swing-game/ticket.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { issueTicket, verifyTicket } from './ticket';

const V = 'a1b2c3d4e5f60718';
const T0 = 1_750_000_000_000;

describe('tickets', () => {
  it('accepts a genuine run', () => {
    expect(verifyTicket(issueTicket(V, T0), V, T0 + 10_000)).toBe('ok');
  });
  it('rejects runs shorter than 9s and older than 2 min', () => {
    expect(verifyTicket(issueTicket(V, T0), V, T0 + 8_999)).toBe('too-early');
    expect(verifyTicket(issueTicket(V, T0), V, T0 + 120_001)).toBe('expired');
  });
  it('rejects another visitor’s ticket', () => {
    expect(verifyTicket(issueTicket(V, T0), 'ffffffffffffffff', T0 + 10_000)).toBe('bad-signature');
  });
  it('rejects a moved timestamp', () => {
    const [, sig] = issueTicket(V, T0).split('.');
    expect(verifyTicket(`${T0 - 60_000}.${sig}`, V, T0 + 10_000)).toBe('bad-signature');
  });
  it('rejects junk', () => {
    for (const t of [undefined, 42, '', 'abc', `${T0}.short`]) expect(verifyTicket(t, V, T0 + 10_000)).toBe('malformed');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test lib/swing-game/ticket.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement `lib/swing-game/ticket.ts`**

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';
import { TICKET_MAX_AGE_MS, TICKET_MIN_AGE_MS } from './rules';

// A run ticket is "<startedAt>.<hmac>", issued when a run starts and required
// to submit its score. It can't stop a scripted tapper, but it does stop a
// one-line POST of a made-up score: the score must arrive from this visitor,
// at least a run's length after the server saw the run begin.
export type TicketCheck = 'ok' | 'malformed' | 'bad-signature' | 'too-early' | 'expired';

const secret = () => process.env.BLOB_READ_WRITE_TOKEN ?? 'folioofjoy';
const sign = (visitor: string, startedAt: number) =>
  createHmac('sha256', secret()).update(`swing:${visitor}.${startedAt}`).digest('base64url');

export function issueTicket(visitor: string, now = Date.now()): string {
  return `${now}.${sign(visitor, now)}`;
}

export function verifyTicket(ticket: unknown, visitor: string, now = Date.now()): TicketCheck {
  if (typeof ticket !== 'string') return 'malformed';
  const m = /^(\d{10,16})\.([A-Za-z0-9_-]{43})$/.exec(ticket);
  if (!m) return 'malformed';
  const startedAt = Number(m[1]);
  const expected = Buffer.from(sign(visitor, startedAt));
  const given = Buffer.from(m[2]);
  if (!timingSafeEqual(expected, given)) return 'bad-signature';
  const age = now - startedAt;
  if (age < TICKET_MIN_AGE_MS) return 'too-early';
  if (age > TICKET_MAX_AGE_MS) return 'expired';
  return 'ok';
}
```

(Both buffers are always 43 bytes, because the regex pins the length. So `timingSafeEqual` never throws.)

- [ ] **Step 4: Verify**

Run: `pnpm test lib/swing-game/ticket.test.ts` → PASS.
Run: `pnpm exec tsc --noEmit 2>&1 | grep "lib/swing-game"` → no output.

- [ ] **Step 5: Commit**

```bash
git add lib/swing-game/ticket.ts lib/swing-game/ticket.test.ts
git commit -m "feat(swing-game): signed run tickets

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Board logic and Blob store

**Files:**
- Create: `lib/swing-game/board.ts`, `lib/swing-game/board.test.ts`, `lib/swing-game/store.ts`

**Interfaces:**
- Consumes: `BOARD_SIZE`, `MAX_SCORE` from `./rules`; `animalName` from `./names`.
- Produces (board.ts):
  - `type BlobEnv = 'production' | 'preview' | 'dev'`
  - `blobEnv(vercelEnv?: string): BlobEnv`
  - `boardPrefix(env): string`, `visitorPrefix(env, visitor): string`
  - `scorePath(env, visitor, score, country): string`
  - `interface ScoreBlob { visitor: string; score: number; country: string; uploadedAt: Date; pathname: string }`
  - `parseScorePath(pathname: string, uploadedAt: Date): ScoreBlob | null`
  - `rankBests(blobs: readonly ScoreBlob[]): ScoreBlob[]`
  - `shouldReplace(mine: readonly ScoreBlob[], score: number): boolean`
  - `interface BoardEntry { rank: number; name: string; country: string; score: number; you: boolean }`
  - `interface BoardView { top: BoardEntry[]; me: BoardEntry | null; total: number; player: { name: string; country: string } }`
  - `boardView(ranked: readonly ScoreBlob[], visitor: string, country: string): BoardView`
- Produces (store.ts):
  - `readRanked(now?: number): Promise<ScoreBlob[]>`
  - `writeBest(visitor: string, score: number, country: string): Promise<{ best: number; improved: boolean }>`

- [ ] **Step 1: Write the failing test `lib/swing-game/board.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { animalName } from './names';
import { blobEnv, boardView, parseScorePath, rankBests, scorePath, shouldReplace, type ScoreBlob } from './board';

const A = 'aaaaaaaaaaaaaaaa';
const B = 'bbbbbbbbbbbbbbbb';
const C = 'cccccccccccccccc';
const at = (s: number) => new Date(1_750_000_000_000 + s * 1000);
const blob = (visitor: string, score: number, t = 0, country = 'DK'): ScoreBlob =>
  ({ visitor, score, country, uploadedAt: at(t), pathname: scorePath('dev', visitor, score, country) });

describe('env and paths', () => {
  it('maps VERCEL_ENV to a board namespace', () => {
    expect(blobEnv('production')).toBe('production');
    expect(blobEnv('preview')).toBe('preview');
    expect(blobEnv('development')).toBe('dev');
    expect(blobEnv(undefined)).toBe('dev');
  });
  it('writes XX for unknown countries and round-trips', () => {
    const p = scorePath('production', A, 42, '');
    expect(p).toBe(`swing/production/${A}/42-XX.json`);
    expect(parseScorePath(p, at(0))).toMatchObject({ visitor: A, score: 42, country: '' });
    expect(parseScorePath(scorePath('dev', A, 7, 'DK'), at(0))).toMatchObject({ country: 'DK' });
  });
  it('skips junk and out-of-range pathnames', () => {
    for (const p of ['swing/dev/nothex/1-DK.json', `swing/dev/${A}/999-DK.json`, `guestbook/p1/${A}.json`, `swing/other/${A}/1-DK.json`]) {
      expect(parseScorePath(p, at(0))).toBeNull();
    }
  });
});

describe('rankBests', () => {
  it('keeps each visitor’s best and sorts by score, earliest first on ties', () => {
    const ranked = rankBests([blob(A, 10), blob(A, 30, 5), blob(B, 30, 1), blob(C, 20)]);
    expect(ranked.map((b) => [b.visitor, b.score])).toEqual([[B, 30], [A, 30], [C, 20]]);
  });
});

describe('shouldReplace', () => {
  it('writes only when strictly better than every existing entry', () => {
    expect(shouldReplace([], 1)).toBe(true);
    expect(shouldReplace([blob(A, 40)], 41)).toBe(true);
    expect(shouldReplace([blob(A, 40)], 40)).toBe(false);
    expect(shouldReplace([blob(A, 40)], 12)).toBe(false);
    expect(shouldReplace([], 0)).toBe(false);
  });
});

describe('boardView', () => {
  const ranked = rankBests(Array.from({ length: 14 }, (_, i) => blob(i.toString(16).padStart(16, '0'), 100 - i)));
  it('returns the top 10 with names, never raw hashes', () => {
    const v = boardView(ranked, 'ffffffffffffffff', 'DK');
    expect(v.top).toHaveLength(10);
    expect(v.top[0]).toEqual({ rank: 1, name: animalName('0000000000000000'), country: 'DK', score: 100, you: false });
    expect(JSON.stringify(v)).not.toContain('0000000000000000');
    expect(v.me).toBeNull();
    expect(v.total).toBe(14);
    expect(v.player).toEqual({ name: animalName('ffffffffffffffff'), country: 'DK' });
  });
  it('marks the player and reports their rank outside the top 10', () => {
    const me = '000000000000000c';
    const v = boardView(ranked, me, '');
    expect(v.me).toMatchObject({ rank: 13, score: 88, you: true });
    expect(v.top.some((e) => e.you)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test lib/swing-game/board.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement `lib/swing-game/board.ts`**

```ts
import { animalName } from './names';
import { BOARD_SIZE, MAX_SCORE } from './rules';

// Storage layout: swing/<env>/<visitorHash>/<score>-<CC>.json — one blob per
// visitor holding their best. Everything the board needs is in the pathname,
// so building it is one list() with no blob fetches.
//
// <env> keeps local and preview play off the real board: .env.local points at
// the same Blob store as production.
export type BlobEnv = 'production' | 'preview' | 'dev';

export function blobEnv(vercelEnv = process.env.VERCEL_ENV): BlobEnv {
  return vercelEnv === 'production' || vercelEnv === 'preview' ? vercelEnv : 'dev';
}

export const boardPrefix = (env: BlobEnv) => `swing/${env}/`;
export const visitorPrefix = (env: BlobEnv, visitor: string) => `${boardPrefix(env)}${visitor}/`;

export function scorePath(env: BlobEnv, visitor: string, score: number, country: string): string {
  const cc = /^[A-Z]{2}$/.test(country) ? country : 'XX';
  return `${visitorPrefix(env, visitor)}${score}-${cc}.json`;
}

export interface ScoreBlob {
  visitor: string;
  score: number;
  country: string;
  uploadedAt: Date;
  pathname: string;
}

const PATH = /^swing\/(?:production|preview|dev)\/([0-9a-f]{16})\/(\d{1,3})-([A-Z]{2})\.json$/;

export function parseScorePath(pathname: string, uploadedAt: Date): ScoreBlob | null {
  const m = PATH.exec(pathname);
  if (!m) return null;
  const score = Number(m[2]);
  if (score > MAX_SCORE) return null;
  return { visitor: m[1], score, country: m[3] === 'XX' ? '' : m[3], uploadedAt, pathname };
}

// One row per visitor — their best. A write race can leave two blobs for one
// visitor for a moment; keeping the max here makes that harmless.
export function rankBests(blobs: readonly ScoreBlob[]): ScoreBlob[] {
  const best = new Map<string, ScoreBlob>();
  for (const b of blobs) {
    const cur = best.get(b.visitor);
    if (!cur || b.score > cur.score || (b.score === cur.score && b.uploadedAt < cur.uploadedAt)) best.set(b.visitor, b);
  }
  return [...best.values()].sort((a, b) => b.score - a.score || a.uploadedAt.getTime() - b.uploadedAt.getTime());
}

export function shouldReplace(mine: readonly ScoreBlob[], score: number): boolean {
  return score > 0 && mine.every((b) => b.score < score);
}

export interface BoardEntry {
  rank: number;
  name: string;
  country: string;
  score: number;
  you: boolean;
}

export interface BoardView {
  top: BoardEntry[];
  me: BoardEntry | null;
  total: number;
  /** Who's looking — so the results can name them even before they rank. */
  player: { name: string; country: string };
}

export function boardView(ranked: readonly ScoreBlob[], visitor: string, country: string): BoardView {
  const entry = (b: ScoreBlob, i: number): BoardEntry => ({
    rank: i + 1,
    name: animalName(b.visitor),
    country: b.country,
    score: b.score,
    you: b.visitor === visitor,
  });
  const mine = ranked.findIndex((b) => b.visitor === visitor);
  return {
    top: ranked.slice(0, BOARD_SIZE).map(entry),
    me: mine === -1 ? null : entry(ranked[mine], mine),
    total: ranked.length,
    player: { name: animalName(visitor), country },
  };
}
```

- [ ] **Step 4: Implement `lib/swing-game/store.ts`**

```ts
import { del, list, put } from '@vercel/blob';
import { blobEnv, boardPrefix, parseScorePath, rankBests, scorePath, shouldReplace, visitorPrefix, type ScoreBlob } from './board';

// Fluid Compute reuses instances, so a short in-memory cache means most board
// reads skip list(). A successful write on this instance clears it.
const CACHE_MS = 10_000;
let cache: { at: number; ranked: ScoreBlob[] } | null = null;

async function listScores(prefix: string): Promise<ScoreBlob[]> {
  const out: ScoreBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const b of page.blobs) {
      const s = parseScorePath(b.pathname, new Date(b.uploadedAt));
      if (s) out.push(s);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

export async function readRanked(now = Date.now()): Promise<ScoreBlob[]> {
  if (cache && now - cache.at < CACHE_MS) return cache.ranked;
  const ranked = rankBests(await listScores(boardPrefix(blobEnv())));
  cache = { at: now, ranked };
  return ranked;
}

export async function writeBest(visitor: string, score: number, country: string): Promise<{ best: number; improved: boolean }> {
  const env = blobEnv();
  const mine = await listScores(visitorPrefix(env, visitor));
  if (!shouldReplace(mine, score)) {
    return { best: Math.max(0, ...mine.map((b) => b.score)), improved: false };
  }
  await put(scorePath(env, visitor, score, country), JSON.stringify({ at: new Date().toISOString() }), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  // New best first, old ones second: if the delete fails, rankBests still keeps the max.
  if (mine.length) await del(mine.map((b) => b.pathname));
  cache = null;
  return { best: score, improved: true };
}
```

- [ ] **Step 5: Verify**

Run: `pnpm test lib/swing-game` → PASS.
Run: `pnpm exec tsc --noEmit 2>&1 | grep "lib/swing-game"` → no output.

- [ ] **Step 6: Commit**

```bash
git add lib/swing-game/board.ts lib/swing-game/board.test.ts lib/swing-game/store.ts
git commit -m "feat(swing-game): leaderboard ranking and Blob store

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: API routes and browser client

**Files:**
- Create: `app/api/swing/start/route.ts`, `app/api/swing/route.ts`, `app/api/swing/route.test.ts`, `lib/swing-game/client.ts`

**Interfaces:**
- Consumes: `visitorHash`, `countryOf` (Task 1); `isValidScore` (Task 2); `issueTicket`, `verifyTicket` (Task 4); `boardView`, `BoardView` (Task 5); `readRanked`, `writeBest` (Task 5).
- Produces (HTTP):
  - `POST /api/swing/start` → `200 { ticket: string }`
  - `GET /api/swing` → `200 BoardView` | `500 { error }`
  - `POST /api/swing { ticket, score }` → `200 BoardView & { improved: boolean }` | `400 { error }` | `403 { error }` | `500 { error }`
- Produces (client.ts): `fetchTicket(): Promise<string>`, `fetchBoard(): Promise<BoardView>`, `submitScore(ticket: string, score: number): Promise<SubmitResult>`, `type SubmitResult = BoardView & { improved: boolean }`. Each throws on a non-2xx response.

- [ ] **Step 1: Write the failing test `app/api/swing/route.test.ts`**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/swing-game/store', () => ({
  readRanked: vi.fn(async () => []),
  writeBest: vi.fn(async (_v: string, score: number) => ({ best: score, improved: true })),
}));

import { readRanked, writeBest } from '@/lib/swing-game/store';
import { issueTicket } from '@/lib/swing-game/ticket';
import { visitorHash } from '@/lib/visitor';
import { GET, POST } from './route';
import { POST as START } from './start/route';

const HEADERS = { 'x-forwarded-for': '1.2.3.4', 'x-vercel-ip-country': 'DK', 'content-type': 'application/json' };
const me = visitorHash(new Request('http://x/', { headers: HEADERS }));
const post = (body: unknown) =>
  POST(new Request('http://x/api/swing', { method: 'POST', headers: HEADERS, body: JSON.stringify(body) }));
const goodTicket = () => issueTicket(me, Date.now() - 10_000);

beforeEach(() => vi.clearAllMocks());

describe('POST /api/swing/start', () => {
  it('issues a ticket', async () => {
    const res = await START(new Request('http://x/api/swing/start', { method: 'POST', headers: HEADERS }));
    expect(res.status).toBe(200);
    expect((await res.json()).ticket).toMatch(/^\d+\.[A-Za-z0-9_-]{43}$/);
  });
});

describe('GET /api/swing', () => {
  it('returns the board view for this visitor', async () => {
    const res = await GET(new Request('http://x/api/swing', { headers: HEADERS }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ top: [], me: null, total: 0, player: { country: 'DK' } });
  });
  it('500s when the store fails', async () => {
    vi.mocked(readRanked).mockRejectedValueOnce(new Error('blob down'));
    expect((await GET(new Request('http://x/api/swing', { headers: HEADERS }))).status).toBe(500);
  });
});

describe('POST /api/swing', () => {
  it('400s on invalid json and invalid scores', async () => {
    const bad = await POST(new Request('http://x/api/swing', { method: 'POST', headers: HEADERS, body: '{' }));
    expect(bad.status).toBe(400);
    for (const score of [-1, 251, 3.5, '40', null]) expect((await post({ ticket: goodTicket(), score })).status).toBe(400);
    expect(writeBest).not.toHaveBeenCalled();
  });
  it('403s on a ticket from another visitor or one too young', async () => {
    expect((await post({ ticket: issueTicket('ffffffffffffffff', Date.now() - 10_000), score: 40 })).status).toBe(403);
    expect((await post({ ticket: issueTicket(me, Date.now()), score: 40 })).status).toBe(403);
    expect(writeBest).not.toHaveBeenCalled();
  });
  it('saves a valid run with the request country', async () => {
    const res = await post({ ticket: goodTicket(), score: 40 });
    expect(res.status).toBe(200);
    expect(writeBest).toHaveBeenCalledWith(me, 40, 'DK');
    expect((await res.json()).improved).toBe(true);
  });
  it('reports improved:false when the score does not beat the best', async () => {
    vi.mocked(writeBest).mockResolvedValueOnce({ best: 90, improved: false });
    expect((await (await post({ ticket: goodTicket(), score: 12 })).json()).improved).toBe(false);
  });
  it('does not write a zero score but still returns the board', async () => {
    const res = await post({ ticket: goodTicket(), score: 0 });
    expect(res.status).toBe(200);
    expect(writeBest).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test app/api/swing` → FAIL (cannot resolve `./route`).

- [ ] **Step 3: Implement `app/api/swing/start/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { issueTicket } from '@/lib/swing-game/ticket';
import { visitorHash } from '@/lib/visitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Called on the 5th warm-up tap: stamps when this visitor's run began.
export async function POST(req: Request) {
  return NextResponse.json({ ticket: issueTicket(visitorHash(req)) }, { headers: { 'cache-control': 'no-store' } });
}
```

- [ ] **Step 4: Implement `app/api/swing/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { boardView } from '@/lib/swing-game/board';
import { isValidScore } from '@/lib/swing-game/rules';
import { readRanked, writeBest } from '@/lib/swing-game/store';
import { verifyTicket } from '@/lib/swing-game/ticket';
import { countryOf, visitorHash } from '@/lib/visitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'cache-control': 'no-store' };

export async function GET(req: Request) {
  try {
    const view = boardView(await readRanked(), visitorHash(req), countryOf(req));
    return NextResponse.json(view, { headers: NO_STORE });
  } catch (err) {
    console.error('[swing] GET failed', err);
    return NextResponse.json({ error: 'could not read the leaderboard' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { ticket, score } = (body ?? {}) as Record<string, unknown>;
  if (!isValidScore(score)) return NextResponse.json({ error: 'invalid score' }, { status: 400 });

  const visitor = visitorHash(req);
  const check = verifyTicket(ticket, visitor);
  if (check !== 'ok') return NextResponse.json({ error: `ticket ${check}` }, { status: 403 });

  try {
    const country = countryOf(req);
    const { improved } = score > 0 ? await writeBest(visitor, score, country) : { improved: false };
    const view = boardView(await readRanked(), visitor, country);
    return NextResponse.json({ ...view, improved }, { headers: NO_STORE });
  } catch (err) {
    console.error('[swing] POST failed', err);
    return NextResponse.json({ error: 'could not save your score' }, { status: 500 });
  }
}
```

- [ ] **Step 5: Implement `lib/swing-game/client.ts`**

```ts
import type { BoardView } from './board';

export type SubmitResult = BoardView & { improved: boolean };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`swing api ${res.status}`);
  return (await res.json()) as T;
}

export const fetchTicket = async () =>
  (await json<{ ticket: string }>(await fetch('/api/swing/start', { method: 'POST' }))).ticket;

export const fetchBoard = async () => json<BoardView>(await fetch('/api/swing', { cache: 'no-store' }));

export const submitScore = async (ticket: string, score: number) =>
  json<SubmitResult>(
    await fetch('/api/swing', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ticket, score }),
    }),
  );
```

- [ ] **Step 6: Verify**

Run: `pnpm test` → all suites PASS.
Run: `pnpm exec tsc --noEmit 2>&1 | grep -E "api/swing|lib/swing-game"` → no output.

If `next/server` fails to import under Vitest, replace `NextResponse.json(...)` with `Response.json(...)` in both routes. The signatures match, and the other assertions stay the same.

- [ ] **Step 7: Commit**

```bash
git add app/api/swing lib/swing-game/client.ts
git commit -m "feat(swing-game): ticket and leaderboard API routes

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: CircleButton button mode and yellow tone

**Files:**
- Modify: `components/circle-button.tsx`

**Interfaces:**
- Produces: `CircleButtonProps` gains `href?: string` (now optional), `tone?: 'dark' | 'yellow'` (default `'dark'`), and `onClick?: MouseEventHandler<HTMLElement>`. Without `href`, the component renders `<button type="button">`. Every existing call site keeps working unchanged.

- [ ] **Step 1: Edit `components/circle-button.tsx`**

Replace the props interface and the component body from `export interface CircleButtonProps` through the end of the file with:

```tsx
export interface CircleButtonProps {
  label: string; // default-state text, max 6 chars
  arcText: string; // full text spun around the disc on hover/press
  href?: string; // omit to render a <button> driven by onClick
  external?: boolean; // render an <a target="_blank"> instead of a Next <Link>
  size?: number; // disc diameter in px — every button uses the default for a uniform size
  tone?: 'dark' | 'yellow'; // yellow = primary action: yellow disc at rest, dark label
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
}

// Maps a work link's label (lib/work/local.ts) to the disc's two texts.
export function circleTexts(label: string): { label: string; arcText: string } {
  const l = label.toLowerCase();
  if (l.includes('live')) return { label: 'LIVE', arcText: 'VIEW LIVE PROJECT' };
  if (l.includes('explore')) return { label: 'OPEN', arcText: 'EXPLORE PROJECT' };
  return { label: label.slice(0, 6), arcText: label };
}

export function CircleButton({
  label,
  arcText,
  href,
  external,
  size = 60,
  tone = 'dark',
  className = '',
  onClick,
}: CircleButtonProps) {
  // The spinning arc only mounts while the button could show it (hover, press,
  // or keyboard focus) so idle discs don't run a perpetual animation each.
  const [engaged, setEngaged] = useState(false);

  const short = label.toUpperCase().slice(0, 6);
  if (process.env.NODE_ENV !== 'production' && label.length > 6) {
    console.warn(`CircleButton: label "${label}" is over the 6-char max; showing "${short}"`);
  }

  // 12px caps the label; below ~48px discs it shrinks further so it still fits.
  // External discs carry a trailing ↗, which costs about 1.5 characters.
  const labelSize = Math.min(12, (size * 0.8) / ((short.length + (external ? 1.5 : 0)) * 0.62));
  const arcSize = Math.max(10, Math.round(size * 0.115));
  // A dev-tools-indicator-sized disc can't fit a legible arc, so tiny discs
  // grow out of their corner (top-left origin) while hovered/pressed.
  const tiny = size < 48;
  // SpinningText's radius is in ch of its own font — aim the ring of letters
  // at ~74% of the disc radius (Praktikal advance ≈ 0.6em).
  const arcRadius = (size * 0.37) / (arcSize * 0.6);

  const commonProps = {
    onClick,
    'aria-label': arcText,
    className: `group relative inline-flex shrink-0 items-center justify-center rounded-full select-none ${
      tone === 'yellow' ? 'bg-[#E9D80C]' : 'bg-[#2C2C2C]'
    } transition-[background-color,transform] duration-200 hover:bg-[#E9D80C] active:bg-[#E9D80C] focus-visible:bg-[#E9D80C] focus-visible:outline-none ${
      tiny ? 'origin-top-left hover:scale-[2.2] active:scale-[2.2] focus-visible:scale-[2.2]' : ''
    } ${className}`,
    style: { width: size, height: size },
    onPointerEnter: () => setEngaged(true),
    onPointerDown: () => setEngaged(true),
    onPointerLeave: () => setEngaged(false),
    onFocus: () => setEngaged(true),
    onBlur: () => setEngaged(false),
  };

  const body = (
    <>
      <span
        aria-hidden
        className="inline-flex items-center gap-px font-mono font-bold uppercase transition-opacity duration-150 group-hover:opacity-0 group-active:opacity-0 group-focus-visible:opacity-0"
        style={{ color: tone === 'yellow' ? DARK : YELLOW, fontSize: labelSize }}
      >
        {short}
        {external && <ArrowUpRight strokeWidth={1} style={{ width: labelSize, height: labelSize }} />}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100"
      >
        {engaged && (
          <SpinningText
            duration={12}
            radius={arcRadius}
            className="font-mono font-bold uppercase"
            style={{ color: DARK, fontSize: arcSize }}
          >
            {arcText.toUpperCase()}
          </SpinningText>
        )}
      </span>
    </>
  );

  if (!href) {
    return (
      <button type="button" {...commonProps} className={`${commonProps.className} cursor-pointer border-0 p-0`}>
        {body}
      </button>
    );
  }
  return external ? (
    <a {...commonProps} href={href} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <Link {...commonProps} href={href}>
      {body}
    </Link>
  );
}
```

Also update the header comment's first line to: `// Circular action button (back / view live / explore / read case study / game actions).`

- [ ] **Step 2: Verify existing call sites still type-check**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -E "circle-button|back-link|case-study|work/"` → no output.
Run: `grep -rn "CircleButton" app components | grep -v "components/circle-button.tsx"`. Confirm every existing usage still passes `href`, so none of them turns into a button.

- [ ] **Step 3: Commit**

```bash
git add components/circle-button.tsx
git commit -m "feat(circle-button): button mode and yellow primary tone

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: SwingSet — tap hook, adjustable arc, pitch, hint removed

**Files:**
- Modify: `components/home/swing-set.tsx`

**Interfaces:**
- Consumes: `ARC_START_RAD`, `countsAsPointerTap`, `countsAsKeyTap` from `@/lib/swing-game/rules`.
- Produces: `SwingSetHandle` becomes:

```ts
export interface SwingSetHandle {
  readonly element: HTMLCanvasElement | null;
  readonly angle: number;
  energize: (active: boolean) => void;
  kick: (pitch?: number) => void;
  setArcCap: (radians: number | null) => void; // null restores the default 26° cap
}
```

  and the props become `{ className?: string; interactive?: boolean; onTap?: () => void }`.

- [ ] **Step 1: Edit the imports, constants and handle**

- Change `const PUSH = 26 * Math.PI / 180;` to `const PUSH = ARC_START_RAD;`.
- Add `import { ARC_START_RAD, countsAsKeyTap, countsAsPointerTap } from '@/lib/swing-game/rules';`.
- Replace the `SwingSetHandle` interface with the one above.
- Change the component signature to accept `onTap`:

```tsx
export const SwingSet = forwardRef<SwingSetHandle, { className?: string; interactive?: boolean; onTap?: () => void }>(
  function SwingSet({ className, interactive = false, onTap }, ref) {
```

- [ ] **Step 2: Remove the hint state and add the arc cap**

- Delete `const feedbackTimer = …`, `const [pushed, setPushed] = useState(false);` and every use of them: the `setPushed`/`feedbackTimer` lines at the end of `kick`, and `if (feedbackTimer.current) clearTimeout(feedbackTimer.current);` in the unmount cleanup.
- Remove `useState` from the React import if it's no longer used.
- Add `const cap = useRef(PUSH);` next to `const energized = useRef(false);`.

- [ ] **Step 3: Make the chirp and the push take a pitch and respect the cap**

- Change `const playPush = useCallback(() => {` to `const playPush = useCallback((pitch = 1) => {`.
- Multiply the three frequency values by `pitch`: `390 * pitch`, `780 * pitch`, `590 * pitch`.

Replace `kick` with:

```tsx
    const kick = useCallback((pitch = 1) => {
      const now = performance.now();
      if (now - lastPush.current < 120) return;
      lastPush.current = now;
      if (!reduce) {
        const s = state.current;
        s.boost = Math.min(1, s.boost + 0.75);
        // Add momentum in the current direction, capped at the maximum arc.
        // Position never jumps, even when clicking at a turning point. A
        // raised cap (the tap game) also adds a harder shove per push.
        const limit = FREQUENCY * Math.sqrt(Math.max(0, 2 * (Math.cos(s.angle) - Math.cos(cap.current))));
        const direction = Math.sign(s.velocity) || -Math.sign(s.angle) || 1;
        s.velocity = direction * Math.min(limit, Math.abs(s.velocity) + 0.16 + (cap.current - PUSH) * 0.25);
        effect.current = { age: 0, angle: s.angle };
      }
      playPush(pitch);
    }, [reduce, playPush]);
    const setArcCap = useCallback((radians: number | null) => { cap.current = radians ?? PUSH; }, []);
    useImperativeHandle(ref, () => ({
      get element() { return canvasRef.current; },
      get angle() { return state.current.angle; },
      energize, kick, setArcCap,
    }), [energize, kick, setArcCap]);
```

In the `useAnimationFrame` physics loop, change `const target = base + (PUSH - base) * s.boost;` to `const target = base + (cap.current - base) * s.boost;`.

- [ ] **Step 4: Route taps through `onTap` and drop the hint span**

Replace the interactive `return <button …>` block with:

```tsx
    if (!interactive) return <div className={className} aria-hidden="true">{canvas}</div>;
    return <button
      type="button"
      aria-label="Push the swing. Tap quickly five times to play"
      // With onTap the parent owns every tap (the tap game counts them); pointerdown
      // fires on touch-start, so counting has no click delay. Without it, a click pushes.
      onClick={onTap ? undefined : () => kick()}
      onPointerDown={onTap ? (e) => { if (countsAsPointerTap(e)) onTap(); } : undefined}
      onKeyDown={onTap ? (e) => { if (countsAsKeyTap(e)) { e.preventDefault(); onTap(); } } : undefined}
      onPointerEnter={() => energize(true)}
      onPointerLeave={() => energize(false)}
      onFocus={() => energize(true)}
      onBlur={() => energize(false)}
      className={`group pointer-events-none cursor-pointer touch-manipulation select-none border-0 bg-transparent p-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4c51b] ${className ?? ''}`}
    >
      {canvas}
      {/* Keep the empty corners transparent to the quote links behind the art. */}
      <span aria-hidden="true" className="absolute inset-0 pointer-events-auto"
        style={{ clipPath: 'polygon(15% 6%, 85% 28%, 97% 84%, 71% 95%, 4% 73%, 3% 65%)' }} />
    </button>;
```

(`onClick={onTap ? undefined : () => kick()}` wraps `kick` so the click event isn't passed in as `pitch`.)

- [ ] **Step 5: Verify**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -E "swing-set|center-stage"` → no output. `center-stage.tsx` still renders `<SwingSet interactive … />` without `onTap`, which is valid.
Run: `pnpm test` → still PASS.

- [ ] **Step 6: Commit**

```bash
git add components/home/swing-set.tsx
git commit -m "feat(swing-set): tap callback, adjustable arc cap and pitch; drop hint

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: `useSwingGame` state machine

**Files:**
- Create: `components/home/swing-game/use-swing-game.ts`

**Interfaces:**
- Consumes: `SwingSetHandle` (Task 8); `WARMUP_TAPS`, `WARMUP_GAP_MS`, `RUN_MS`, `warmupTap`, `acceptsRunTap`, `arcCapFor` (Task 2); `decay`, `tapImpulse` (Task 3); `fetchTicket`, `fetchBoard`, `submitScore` (Task 6); `BoardView` (Task 5).
- Produces:

```ts
export type GameMode = 'idle' | 'playing' | 'results';
export type RunStatus = 'saving' | 'saved' | 'unsaved' | 'unavailable';
export interface RunResult { score: number; board: BoardView | null; status: RunStatus }
export interface RunState { count: number; startedAt: number; energy: number; energyAt: number }
export interface SwingGame {
  mode: GameMode;
  warm: number;                  // warm-up taps so far (0 when none)
  result: RunResult | null;
  run: RefObject<RunState>;      // live values read by the HUD's rAF loop
  onTap: () => void;
  retry: () => void;
  exit: () => void;
}
export function useSwingGame(swing: RefObject<SwingSetHandle | null>): SwingGame;
```

- [ ] **Step 1: Create the hook**

```ts
'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { SwingSetHandle } from '../swing-set';
import type { BoardView } from '@/lib/swing-game/board';
import { fetchBoard, fetchTicket, submitScore } from '@/lib/swing-game/client';
import { decay, tapImpulse } from '@/lib/swing-game/energy';
import { RUN_MS, WARMUP_GAP_MS, WARMUP_TAPS, acceptsRunTap, arcCapFor, warmupTap } from '@/lib/swing-game/rules';

export type GameMode = 'idle' | 'playing' | 'results';
export type RunStatus = 'saving' | 'saved' | 'unsaved' | 'unavailable';
export interface RunResult { score: number; board: BoardView | null; status: RunStatus }
export interface RunState { count: number; startedAt: number; energy: number; energyAt: number }
export interface SwingGame {
  mode: GameMode;
  warm: number;
  result: RunResult | null;
  run: RefObject<RunState>;
  onTap: () => void;
  retry: () => void;
  exit: () => void;
}

// idle → (5 quick taps) → playing → (10s) → results → retry | exit.
// Taps arrive far faster than React renders, so the live run lives in refs and
// only mode changes go through state.
export function useSwingGame(swing: RefObject<SwingSetHandle | null>): SwingGame {
  const [mode, setMode] = useState<GameMode>('idle');
  const modeRef = useRef<GameMode>('idle');
  const [warm, setWarm] = useState(0);
  const warmTimes = useRef<number[]>([]);
  const warmReset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const run = useRef<RunState>({ count: 0, startedAt: 0, energy: 0, energyAt: 0 });
  const ticketReq = useRef<Promise<string | null>>(Promise.resolve(null));
  const boardReq = useRef<Promise<BoardView | null>>(Promise.resolve(null));
  // Bumped on every start/exit so a slow submit from an abandoned run can't
  // overwrite the screen of a newer one.
  const runId = useRef(0);

  const go = useCallback((next: GameMode) => { modeRef.current = next; setMode(next); }, []);

  const clearWarm = useCallback(() => {
    if (warmReset.current) clearTimeout(warmReset.current);
    warmTimes.current = [];
    setWarm(0);
  }, []);

  const start = useCallback(() => {
    const now = performance.now();
    runId.current++;
    run.current = { count: 0, startedAt: now, energy: 0, energyAt: now };
    ticketReq.current = fetchTicket().catch(() => null);
    boardReq.current = fetchBoard().catch(() => null);
    clearWarm();
    setResult(null);
    go('playing');
  }, [clearWarm, go]);

  const exit = useCallback(() => {
    runId.current++;
    swing.current?.setArcCap(null);
    clearWarm();
    setResult(null);
    go('idle');
  }, [clearWarm, go, swing]);

  const finish = useCallback(async () => {
    const id = runId.current;
    const score = run.current.count;
    swing.current?.setArcCap(null);
    setResult({ score, board: null, status: 'saving' });
    go('results');

    let board: BoardView | null = null;
    let status: RunStatus = 'unsaved';
    const ticket = await ticketReq.current;
    if (ticket) {
      try {
        board = await submitScore(ticket, score);
        status = 'saved';
      } catch {
        // 403 (e.g. the network changed mid-run) or 500 — fall back to the prefetched board.
      }
    }
    board ??= await boardReq.current;
    if (!board) status = 'unavailable';
    if (id === runId.current) setResult({ score, board, status });
  }, [go, swing]);

  const onTap = useCallback(() => {
    const now = performance.now();
    const current = modeRef.current;
    if (current === 'results') return;
    if (current === 'idle') {
      swing.current?.kick();
      warmTimes.current = warmupTap(warmTimes.current, now);
      if (warmTimes.current.length >= WARMUP_TAPS) return start();
      setWarm(warmTimes.current.length);
      if (warmReset.current) clearTimeout(warmReset.current);
      warmReset.current = setTimeout(clearWarm, WARMUP_GAP_MS);
      return;
    }
    const r = run.current;
    if (!acceptsRunTap(r.startedAt, now)) return;
    r.energy = tapImpulse(decay(r.energy, (now - r.energyAt) / 1000));
    r.energyAt = now;
    r.count++;
    swing.current?.setArcCap(arcCapFor(r.count));
    swing.current?.kick(1 + Math.min(r.count, 150) / 250);
  }, [clearWarm, start, swing]);

  // End the run on the first frame past RUN_MS.
  useEffect(() => {
    if (mode !== 'playing') return;
    let frame = requestAnimationFrame(function tick(t) {
      if (t - run.current.startedAt >= RUN_MS) void finish();
      else frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [mode, finish]);

  // Esc quits (or closes the results); a hidden tab abandons the run, because an
  // early submit would fail the ticket's minimum age anyway.
  useEffect(() => {
    if (mode === 'idle') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') exit(); };
    const onHide = () => { if (document.hidden && modeRef.current === 'playing') exit(); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [mode, exit]);

  useEffect(() => () => { if (warmReset.current) clearTimeout(warmReset.current); }, []);

  return { mode, warm, result, run, onTap, retry: start, exit };
}
```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit 2>&1 | grep "swing-game"` → no output.

- [ ] **Step 3: Commit**

```bash
git add components/home/swing-game/use-swing-game.ts
git commit -m "feat(swing-game): game state machine hook

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: HUD — readout, sparkline and energy graph

**Files:**
- Create: `components/home/swing-game/draw.ts`, `components/home/swing-game/game-hud.tsx`

**Interfaces:**
- Consumes: `RunState` (Task 9); `SwingSetHandle` (Task 8); `decay`, `graphScale` (Task 3); `RUN_MS` (Task 2).
- Produces:
  - `drawEnergyGraph(ctx: CanvasRenderingContext2D, samples: readonly number[], cols: number, rows: number): void`
  - `drawSparkline(ctx: CanvasRenderingContext2D, trace: readonly number[]): void`
  - `<GameHud run={RefObject<RunState>} swing={RefObject<SwingSetHandle | null>} />`

- [ ] **Step 1: Create `components/home/swing-game/draw.ts`** (ported from the prototype's `drawGraph`/`drawSpark`)

```ts
import { graphScale } from '@/lib/swing-game/energy';

// Drawn in 2px "pixels" so the graph matches the site's pixel art.
const P = 2;

export function drawEnergyGraph(ctx: CanvasRenderingContext2D, samples: readonly number[], cols: number, rows: number) {
  const px = (x: number, y: number, w = 1, h = 1) => ctx.fillRect(x * P, y * P, w * P, h * P);
  ctx.clearRect(0, 0, cols * P, rows * P);
  ctx.fillStyle = '#1f3a2c';
  px(0, rows - 1, cols, 1); // baseline
  if (!samples.length) return;

  const scale = graphScale(samples);
  const yOf = (v: number) => rows - 2 - Math.round(Math.min(1, v / scale) * (rows - 6));

  ctx.fillStyle = '#43c779';
  let prev = yOf(samples[0]);
  samples.forEach((v, x) => { // stepped line
    const y = yOf(v);
    px(x, Math.min(prev, y), 1, Math.abs(prev - y) + 1);
    prev = y;
  });

  const head = samples.length - 1;
  let peak = 0;
  samples.forEach((v, i) => { if (v > samples[peak]) peak = i; });
  const dashed = (x: number, color: string) => {
    ctx.fillStyle = color;
    for (let y = 0; y < rows - 1; y += 3) px(x, y);
  };
  const ring = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    px(x - 1, y - 3, 3, 1); px(x - 1, y + 3, 3, 1); px(x - 3, y - 1, 1, 3); px(x + 3, y - 1, 1, 3);
    px(x - 2, y - 2); px(x + 2, y - 2); px(x - 2, y + 2); px(x + 2, y + 2); px(x, y);
  };
  if (peak !== head && samples[peak] > 1) { dashed(peak, '#3b4a52'); ring(peak, yOf(samples[peak]), '#f7eedc'); }
  dashed(head, '#4a6470');
  ring(head, yOf(samples[head]), '#7b93ff');
}

// Live trace of the swing's angle; the newest samples glow green.
export function drawSparkline(ctx: CanvasRenderingContext2D, trace: readonly number[]) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  const mid = height / 2;
  trace.forEach((angle, i) => {
    ctx.fillStyle = i > trace.length - 18 ? '#43c779' : '#2f6b66';
    ctx.fillRect(i, Math.round(mid - angle * 11), 1, 2);
  });
}
```

- [ ] **Step 2: Create `components/home/swing-game/game-hud.tsx`**

```tsx
'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { SwingSetHandle } from '../swing-set';
import type { RunState } from './use-swing-game';
import { drawEnergyGraph, drawSparkline } from './draw';
import { decay } from '@/lib/swing-game/energy';
import { RUN_MS } from '@/lib/swing-game/rules';

const GRAPH_W = 380;
const GRAPH_H = 96;
const COLS = GRAPH_W / 2;
const ROWS = GRAPH_H / 2;
const SPARK_W = 120;

function ClockIcon() {
  return (
    <svg viewBox="0 0 9 9" fill="currentColor" aria-hidden="true" shapeRendering="crispEdges" className="h-[18px] w-[18px]">
      <path d="M3 0h3v1H3zM1 1h2v1H1zM6 1h2v1H6zM0 3h1v3H0zM8 3h1v3H8zM1 2h1v1H1zM7 2h1v1H7zM1 6h1v1H1zM7 6h1v1H7zM1 7h2v1H1zM6 7h2v1H6zM3 8h3v1H3zM4 2h1v3H4zM5 4h2v1H5z" />
    </svg>
  );
}

// The synth-style readout: count · ♩+taps/s · swing trace · countdown, over an
// energy graph whose x-axis is the 10s timer. Everything updates from one rAF
// loop writing straight to the DOM — no React renders per tap.
export function GameHud({ run, swing }: { run: RefObject<RunState>; swing: RefObject<SwingSetHandle | null> }) {
  const countRef = useRef<HTMLSpanElement>(null);
  const rateRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);
  const sparkRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const graph = graphRef.current?.getContext('2d');
    const spark = sparkRef.current?.getContext('2d');
    if (!graph || !spark) return;
    const samples: number[] = [];
    const trace: number[] = [];
    let frame = requestAnimationFrame(function tick(t) {
      const r = run.current;
      const progress = Math.min(1, (t - r.startedAt) / RUN_MS);
      const energy = decay(r.energy, (t - r.energyAt) / 1000);
      const head = Math.min(COLS - 1, Math.floor(progress * COLS));
      while (samples.length <= head) samples.push(energy);
      samples[head] = Math.max(samples[head], energy);
      trace.push(swing.current?.angle ?? 0);
      if (trace.length > SPARK_W) trace.shift();

      drawEnergyGraph(graph, samples, COLS, ROWS);
      drawSparkline(spark, trace);
      if (countRef.current) countRef.current.textContent = String(r.count);
      if (rateRef.current) rateRef.current.textContent = `♩+${Math.round(energy)}`;
      if (timeRef.current) timeRef.current.textContent = ((1 - progress) * RUN_MS / 1000).toFixed(1);
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [run, swing]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-1/2 top-[calc(3.75rem+var(--sat))] z-[55] w-[min(86vw,380px)] -translate-x-1/2 min-[561px]:top-[calc(1.25rem+var(--sat))]"
    >
      <div className="flex items-center gap-3 whitespace-nowrap font-mono text-[18px] leading-none tabular-nums">
        <span ref={countRef} className="min-w-[2.2ch] text-[#efe4ce]">0</span>
        <span ref={rateRef} className="min-w-[4.2ch] text-[#43c779]">♩+0</span>
        <canvas ref={sparkRef} width={SPARK_W} height={18} className="h-[18px] min-w-0 flex-1 [image-rendering:pixelated]" />
        <span className="inline-flex items-center gap-[7px] text-[#e83c35]">
          <span ref={timeRef}>10.0</span>
          <ClockIcon />
        </span>
      </div>
      <canvas ref={graphRef} width={GRAPH_W} height={GRAPH_H} className="mt-2.5 block h-24 w-full [image-rendering:pixelated]" />
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit 2>&1 | grep "swing-game"` → no output.

- [ ] **Step 4: Commit**

```bash
git add components/home/swing-game/draw.ts components/home/swing-game/game-hud.tsx
git commit -m "feat(swing-game): synth-style HUD with energy graph

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Results screen and warm-up dots

**Files:**
- Create: `components/home/swing-game/game-results.tsx`, `components/home/swing-game/warmup-dots.tsx`

**Interfaces:**
- Consumes: `RunResult` (Task 9); `BoardEntry` (Task 5); `flagEmoji` (Task 3); `CircleButton` with `tone` and without `href` (Task 7); `WARMUP_TAPS` (Task 2).
- Produces: `<GameResults result={RunResult} onRetry={() => void} onBack={() => void} />` and `<WarmupDots count={number} />`.

- [ ] **Step 1: Create `components/home/swing-game/warmup-dots.tsx`**

```tsx
import { WARMUP_TAPS } from '@/lib/swing-game/rules';

// Five squares under the swing that fill yellow per warm-up tap.
export function WarmupDots({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span aria-hidden="true" className="pointer-events-none absolute bottom-[4%] left-1/2 flex -translate-x-1/2 gap-1">
      {Array.from({ length: WARMUP_TAPS }, (_, i) => (
        <i key={i} className={`block h-1.5 w-1.5 ${i < count ? 'bg-[#f4c51b]' : 'bg-white/20'}`} />
      ))}
    </span>
  );
}
```

- [ ] **Step 2: Create `components/home/swing-game/game-results.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { CircleButton } from '@/components/circle-button';
import type { BoardEntry } from '@/lib/swing-game/board';
import { flagEmoji } from '@/lib/swing-game/flag';
import type { RunResult } from './use-swing-game';

const NOTE: Record<RunResult['status'], string> = {
  saving: 'saving…',
  saved: '',
  unsaved: 'couldn’t save',
  unavailable: 'leaderboard unavailable',
};

function Row({ e }: { e: BoardEntry }) {
  return (
    <li className={`grid h-10 grid-cols-[2.4em_1.8em_1fr_auto] items-center gap-1 border-b border-white/[.07] px-1 text-[15px] ${e.you ? 'bg-[#1c1a08] text-[#e8d84a]' : ''}`}>
      <span className="font-mono text-[11px] text-white/35">{e.rank}</span>
      <span className="text-xs">{flagEmoji(e.country)}</span>
      <span className="truncate">{e.name}</span>
      {/* Praktikal sits high on its line box; nudge it onto the names' baseline. */}
      <span className="translate-y-[3px] font-mono text-base leading-none tabular-nums">{e.score}</span>
    </li>
  );
}

export function GameResults({ result, onRetry, onBack }: { result: RunResult; onRetry: () => void; onBack: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => { rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus(); }, []);

  const { score, board, status } = result;
  const me = board?.me ?? null;
  const player = board?.player;
  const note = NOTE[status];

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Your score"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-y-auto bg-black px-5 py-8 text-white animate-in fade-in duration-300"
    >
      <p className="sr-only" aria-live="polite">You scored {score} taps.</p>
      <div className="w-[min(100%,400px)]">
        <div className="text-center">
          <div className="font-mono text-[72px] leading-none tabular-nums text-[#f4c51b]">{score}</div>
          <div className="mt-3.5 text-[15px]">your score</div>
          {player && (
            <div className="mt-2.5 text-base">
              {flagEmoji(player.country)} {player.name}
              {me && ` · #${me.rank} of ${board!.total}`}
            </div>
          )}
          {note && <div className="mt-2 font-mono text-[11px] text-white/40">{note}</div>}
        </div>

        {board && (
          <ol className="mt-10">
            {board.top.map((e) => <Row key={e.rank} e={e} />)}
            {me && me.rank > board.top.length && (
              <>
                <li aria-hidden="true" className="h-[22px] text-center text-xs leading-4 text-white/25">⋯</li>
                <Row e={me} />
              </>
            )}
          </ol>
        )}

        <div className="mt-[52px] flex justify-between">
          <CircleButton label="RETRY" arcText="PLAY AGAIN" tone="yellow" size={72} onClick={onRetry} />
          <CircleButton label="BACK" arcText="BACK TO HOME" size={72} onClick={onBack} />
        </div>
      </div>
    </div>
  );
}
```

(`animate-in fade-in` comes from `tw-animate-css`, already a dependency. Check that `app/globals.css` imports it: `grep -n "tw-animate" app/globals.css`. If it doesn't, drop those two classes; the fade is optional.)

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit 2>&1 | grep "swing-game"` → no output.

- [ ] **Step 4: Commit**

```bash
git add components/home/swing-game/game-results.tsx components/home/swing-game/warmup-dots.tsx
git commit -m "feat(swing-game): results screen and warm-up dots

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: Wire the game into the homepage

**Files:**
- Modify: `components/home/home-stage.tsx`, `components/home/center-stage.tsx`

**Interfaces:**
- Consumes: `useSwingGame`, `SwingGame` (Task 9); `GameHud` (Task 10); `GameResults`, `WarmupDots` (Task 11); `SwingSet`, `SwingSetHandle` (Task 8).
- Produces: `CenterStage` gains props `game: SwingGame` and `swingRef: RefObject<SwingSetHandle | null>`.

- [ ] **Step 1: Edit `components/home/home-stage.tsx`**

- Add imports: `import { useRef } from 'react';`, `import type { SwingSetHandle } from './swing-set';` and `import { useSwingGame } from './swing-game/use-swing-game';`.
- At the top of `HomeStage()`:

```tsx
  const swingRef = useRef<SwingSetHandle>(null);
  const game = useSwingGame(swingRef);
  // During a run the page steps aside: chrome fades out and leaves the tab order.
  const away = game.mode !== 'idle';
  const chromeCls = `transition-opacity duration-[450ms] ${away ? 'opacity-0 pointer-events-none' : ''}`;
```

- On the `<nav …>`: append `${chromeCls}` to its `className` and add `inert={away}`.
- On the rotated copyright `<p …>`: append `${chromeCls}` to its `className` and add `inert={away}`.
- Change `<CenterStage hoverTarget={null} />` to `<CenterStage hoverTarget={null} game={game} swingRef={swingRef} />`.

- [ ] **Step 2: Edit `components/home/center-stage.tsx`**

- Add imports:

```tsx
import type { RefObject } from 'react';
import type { SwingSetHandle } from './swing-set';
import type { SwingGame } from './swing-game/use-swing-game';
import { GameHud } from './swing-game/game-hud';
import { GameResults } from './swing-game/game-results';
import { WarmupDots } from './swing-game/warmup-dots';
```

- Extend the props:

```tsx
export function CenterStage({
  hoverTarget,
  hoverOrigin,
  game,
  swingRef,
}: {
  hoverTarget: HoverTarget;
  hoverOrigin?: { x: number; y: number } | null;
  game: SwingGame;
  swingRef: RefObject<SwingSetHandle | null>;
}) {
```

- After the `q` object, add:

```tsx
  const away = game.mode !== 'idle';
  const chromeCls = `transition-opacity duration-[450ms] ${away ? 'opacity-0 pointer-events-none' : ''}`;
```

- On the hero `<p ref={quoteRef} …>`: change `className="font-pixel"` to ``className={`font-pixel ${chromeCls}`}`` and add `inert={away}`.
- Replace the hero `<SwingSet interactive … />` line with:

```tsx
        <div
          className={`absolute w-[88vw] md:w-[62vw] max-w-[720px] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${game.mode === 'playing' ? 'scale-[1.08]' : ''}`}
        >
          <SwingSet ref={swingRef} interactive onTap={game.onTap} className="relative block w-full h-auto" />
          {game.mode === 'idle' && <WarmupDots count={game.warm} />}
        </div>
```

- On the "Preview Work" wrapper `<div className="fixed bottom-… z-30 …">`: append `${chromeCls}` to its `className` and add `inert={away}`.
- Just before `{/* Full-page dither transition … */}`, add:

```tsx
      {game.mode === 'playing' && (
        <>
          <GameHud run={game.run} swing={swingRef} />
          <button
            type="button"
            onClick={game.exit}
            aria-label="Quit game"
            className="fixed right-6 top-[calc(1.25rem+var(--sat))] z-[56] cursor-pointer border-0 bg-transparent font-mono text-xl text-white/50 hover:text-white"
          >
            ×
          </button>
        </>
      )}
      {game.mode === 'results' && game.result && (
        <GameResults result={game.result} onRetry={game.retry} onBack={game.exit} />
      )}
```

Note: the swing button's `className` previously carried `absolute …` sizing. The wrapper `div` now owns the sizing and scale, and the button fills it as `relative block w-full`. The warm-up dots are positioned inside the wrapper.

- [ ] **Step 3: Type-check and unit tests**

Run: `pnpm exec tsc --noEmit 2>&1 | grep -E "home-stage|center-stage|swing"` → no output.
Run: `pnpm test` → PASS.

- [ ] **Step 4: Commit**

```bash
git add components/home/home-stage.tsx components/home/center-stage.tsx
git commit -m "feat(home): play the swing tap game on the homepage

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: End-to-end check against the prototype

**Files:**
- Create (throwaway, not committed): `.context/e2e-swing.cjs`

- [ ] **Step 1: Start the dev server**

Run `pnpm dev` in the background and wait for `Ready` on http://localhost:3000. Locally `VERCEL_ENV` is unset, so every write lands in `swing/dev/…`, never on the production board.

- [ ] **Step 2: Drive it with Playwright**

Write `.context/e2e-swing.cjs` (Playwright, CommonJS). For each viewport (1280×800 and 390×844, `deviceScaleFactor: 2`):
1. Open `http://localhost:3000/` and wait 2.5 s for the quote's scramble reveal.
2. Find `button[aria-label^="Push the swing"]`, move to 50% / 55% of its box, and tap 5 times at 150 ms intervals.
3. Assert the nav is `inert` and the HUD is visible.
4. Tap in bursts of 30 at 60 ms, pause 1.2 s, then 25 at 55 ms.
5. Screenshot `.context/e2e-<vp>-playing.png`.
6. Wait for `[role="dialog"]`, wait 1.5 s, then screenshot `.context/e2e-<vp>-results.png`.
7. Hover the RETRY button and screenshot the buttons area.
8. Click BACK and assert the nav is no longer `inert`.
9. Collect `pageerror` events and assert there are none.

Run it with `NODE_PATH=/tmp/pw/node_modules node .context/e2e-swing.cjs`. Install Playwright to `/tmp/pw` first if it's missing: `npm i --no-save --prefix /tmp/pw playwright`, then launch with the cached `chromium_headless_shell` path, as the prototype did.

- [ ] **Step 3: Compare with the prototype**

Build and serve the prototype (`node docs/superpowers/prototypes/2026-09-29-swing-tap-game/build.mjs`, then `python3 -m http.server -d docs/superpowers/prototypes/2026-09-29-swing-tap-game 4173`). Take the same shots. Check side by side:
- HUD row order, colours and sizes, and the clock icon.
- Graph baseline and rings.
- Results header sizes, row tint, button tones and labels.
- On mobile, the HUD sits below the `×`.

Fix any drift in the owning component before moving on.

- [ ] **Step 4: Check the second run and the "not improved" path**

In the same session, press RETRY and tap only about 10 times. The results should show the old best's rank (the board is unchanged), with no error note.

- [ ] **Step 5: Production build**

Run: `pnpm build` → completes without errors. Then `pnpm test` → PASS.

- [ ] **Step 6: Clean up the dev board**

Delete the test entries so `swing/dev/` is empty for the next session:

```bash
node -e "require('@vercel/blob').list({prefix:'swing/dev/'}).then(r=>r.blobs.length&&require('@vercel/blob').del(r.blobs.map(b=>b.url))).then(()=>console.log('cleared'))"
```

(Needs `BLOB_READ_WRITE_TOKEN` in the environment: `set -a; source .env.local; set +a` first.)

- [ ] **Step 7: Commit any fixes from Step 3**

```bash
git add -A components lib app
git commit -m "fix(swing-game): match prototype after end-to-end check

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

(Skip this step if Step 3 needed no fixes.)
