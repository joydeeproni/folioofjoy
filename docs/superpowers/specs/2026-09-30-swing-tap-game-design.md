# Swing Tap Game + Public Leaderboard — Design

**Date:** 2026-09-30
**Status:** Approved in brainstorm and via prototype; pending spec review.
**Visual reference:** `docs/superpowers/prototypes/2026-09-29-swing-tap-game/` (build with `node …/build.mjs`). The prototype's look is signed off. Match it; don't redesign it.

## Goal

Turn the homepage hero swing into a tiny game. A visitor taps the swing quickly and the page clears to a game view. They tap as many times as they can in 10 seconds, then see where they rank on a public leaderboard. No sign-up and no typing: each player gets a cute animal name and a country flag.

Success looks like this: it feels like a toy that belongs on the page, not a bolted-on widget. The homepage stays exactly as it is for anyone who doesn't tap. A casual cheater can't post 99999.

## Decisions (settled in brainstorm)

| Topic | Decision |
|---|---|
| Score | Raw tap count in a fixed **10 s** window. |
| Trigger | **5 warm-up taps**, each within **1.5 s** of the previous one. A longer gap resets the warm-up. Warm-up taps don't score. |
| Identity | Auto-generated cute animal name ("Fluffy Hedgehog"), derived deterministically from the anonymous visitor hash, plus a **country flag**. |
| Entries | **One per visitor**, keeping only their best score. |
| Storage | **Vercel Blob** (the store the guestbook already uses). No new integration. |
| Anti-cheat | Signed run ticket plus a plausibility cap. Details below. No admin UI. |
| Leaderboard surface | Only on the results screen. No separate page. |

## User flow

1. **Idle.** The homepage is unchanged, except that the swing's "click to push ♪" / "one more?" hint is **removed**.
2. **Warm-up (taps 1–5).** Each tap pushes the swing as today. After the first tap, 5 small progress squares appear under the swing and fill yellow per tap. If the visitor waits too long between taps, they reset and disappear.
3. **Game starts (5th tap).**
   - The client requests a run ticket.
   - The nav, hero quote, "Preview Work" link and rotated copyright strip fade out.
   - The swing scales up slightly.
   - The HUD fades in at the top and a quit `×` appears top-right.
4. **Playing (10 s).**
   - Every `pointerdown` on the swing counts, with no throttle. The existing 120 ms throttle keeps limiting only the physics push.
   - Space/Enter on the focused swing also counts; key auto-repeat (`event.repeat`) is ignored.
   - The swing's arc cap rises from 26° toward 70° as the count climbs, reaching the maximum at 120 taps.
   - The push chirp's pitch rises with the count.
   - Esc or `×` quits back to idle without saving.
5. **Time's up.**
   - Tapping stops.
   - The client submits `{ ticket, score }`.
   - The results screen replaces everything: the swing hides and the background is full-bleed black.
6. **Results → RETRY** starts a new 10 s run immediately, with a new ticket and no warm-up. **BACK** returns to idle and the homepage chrome fades back in.

## Visual spec (from the approved prototype)

### HUD (top centre, `min(86vw, 380px)` wide; on screens ≤560 px wide, drops below the `×`)

- **Readout row:** all numbers in **Praktikal Regular, 18 px, tabular figures**, in one flex row.
  - Tap count in cream `#efe4ce`.
  - `♩+N` in green `#43c779`, where N is the current taps per second, rounded.
  - A swing sparkline canvas that fills the remaining width: the last ~120 frames of swing angle, drawn in teal `#2f6b66`, with the newest ~18 samples in green.
  - The countdown `7.5` plus a 9×9 **pixel clock icon**, both red `#e83c35`.
- **Energy graph** (canvas, 96 px tall, drawn in 2 px "pixels"):
  - **X axis** is the 10 s timer.
  - **Y value** is the energy signal. Each tap adds `1/τ`, with `τ = 0.3 s` exponential decay, so the value approximates taps per second and naturally draws a saw-tooth.
  - The Y scale is `max(14, peak × 1.12)`, so it never clips.
  - Stepped green `#43c779` line over a dark-green baseline `#1f3a2c`.
  - Dashed vertical playhead with a blue `#7b93ff` ring at the current value.
  - Dashed line with a white `#f7eedc` ring at the peak.

### Results (full-bleed black, centred column `min(100%, 400px)`)

- **Header:**
  - Score in **Praktikal, 72 px, yellow**.
  - "your score" in 15 px.
  - `🇩🇰 Fluffy Hedgehog · #7 of 318` in 16 px.
- **Board:**
  - Top 10 rows, 40 px tall, separated by 1 px `rgba(255,255,255,.07)` lines.
  - Columns: rank (11 px mono, 35% white), flag, name (15 px), score (Praktikal 16 px, right-aligned).
  - The player's row is tinted `#1c1a08` with yellow `#e8d84a` text.
  - If the player ranks below 10th, show a `⋯` row, then their own row.
- **Buttons** at the column's left and right edges, 72 px, reusing the site's circle-button design:
  - **Left:** yellow at rest, dark `RETRY` label; on hover or press, "PLAY AGAIN" spins round the disc.
  - **Right:** the dark default, yellow `BACK` label; on hover or press, "BACK TO HOME" spins round the disc.
- No "new best" note.

## Architecture

### Server

**`lib/visitor.ts`** (new, extracted)
- `visitorHash(req)` and `countryOf(req)` move out of `app/api/guestbook/route.ts` unchanged.
- The guestbook route imports them from here. This is a pure move with no behaviour change, so the guestbook and the game identify visitors the same way.

**`lib/swing-game/rules.ts`**
- Shared constants: `WARMUP_TAPS = 5`, `WARMUP_GAP_MS = 1500`, `RUN_MS = 10_000`, `MAX_SCORE = 250`, `TICKET_MIN_AGE_MS = 9_000`, `TICKET_MAX_AGE_MS = 120_000`.
- Imported by both client and server.

**`lib/swing-game/names.ts`**
- `animalName(hash)` maps the first bytes of the visitor hash into an adjective list and an animal list, about 40 × 40 for roughly 1,600 combinations.
- Deterministic and pure; it is never stored.
- Shared names between visitors are fine.

**`lib/swing-game/ticket.ts`**
- `issueTicket(visitor, now)` returns `"<startedAt>.<hmac>"`, where the HMAC is SHA-256 over `visitor.startedAt`.
- The secret is `BLOB_READ_WRITE_TOKEN`, the same salt pattern the guestbook uses, so there is no new env var.
- `verifyTicket(ticket, visitor, now)` returns `ok`, or a reason: `bad-signature`, `too-early` or `expired`.
- Uses constant-time comparison.
- The 9 s minimum age (not 10 s) absorbs the difference between request and response latency.

**`lib/swing-game/store.ts`**
- **Pathname:** `swing/<env>/<visitorHash>/<score>-<CC>.json`, where `CC` is `XX` when the country is unknown.
  - `<env>` is `production` or `preview` from `VERCEL_ENV`, and `dev` otherwise.
  - This matters because `.env.local` points at the **same Blob store as production**. Without the env segment, local and preview play would pollute the real board.
- **Body:** `{ "at": ISO }`. Everything the board needs is in the pathname.
- **`readBoard()`:**
  - `list({ prefix: 'swing/<env>/' })`, following `cursor` until exhausted.
  - Parse each pathname and group by visitor, keeping the max. This also absorbs the rare leftover from a write race.
  - Sort by score descending, then earliest upload.
  - Cache the result in module memory for **10 s**. Fluid Compute reuses instances, so most GETs skip `list()`. A successful write invalidates the cache.
- **`writeBest(visitor, score, country)`:**
  - List the visitor's own prefix (`swing/<env>/<hash>/`).
  - If the existing best is ≥ `score`, return it unchanged.
  - Otherwise `put` the new blob, then `del` the old ones.
  - Returns `{ best, improved }`.

**`app/api/swing/start/route.ts`**
- `POST` returns `{ ticket }`.
- `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`, `cache-control: no-store`.

**`app/api/swing/route.ts`**
- **`GET`** returns `{ top: Entry[10], me: { name, country, best, rank } | null, total }`.
  - `Entry = { rank, name, country, score, you }`.
  - Names are computed server-side from hashes, so **raw visitor hashes never leave the server**.
- **`POST { ticket, score }`:**
  - Validate: `score` is an integer from 0 to `MAX_SCORE`, and the ticket verifies for this visitor.
  - Then `writeBest` and return the same shape as `GET`, with `improved`.
  - Errors: `400` for invalid input, `403` for a bad or expired ticket, `500` for store failure. Each has a JSON `{ error }`.
- **Submitting 0 taps** skips the write but still returns the board.

### Client

**`components/home/swing-set.tsx`** (modified)
- Add an `onTap?: () => void` prop, fired on `pointerdown` and on non-repeat Space/Enter `keydown`. `onClick` no longer pushes when `onTap` is set, which avoids double counting.
- Add `setArcCap(radians)` to `SwingSetHandle`. `kick()` and the physics use the current cap instead of the `PUSH` constant.
- `kick(pitch?)` accepts an optional chirp pitch multiplier.
- Remove the hover/pressed hint span.

**`components/home/swing-game/use-swing-game.ts`**
- A hook holding the state machine `idle → playing → results`.
- It tracks warm-up tap times, the run count, `startedAt`, the ticket promise and the board response.
- It exposes `mode`, `warm`, `count`, `onTap`, `retry`, `exit` and a ref-based `energy` reader for the graph.
- Timing uses `performance.now()`; the run ends on the first animation frame past `RUN_MS`.
- At tap 5 it fires the ticket request and a `GET /api/swing` board prefetch in parallel, without blocking play. If the ticket fails, the run still plays, and the results say "couldn't save" (small mono note) and show the last board fetched, if any.

**`components/home/swing-game/game-hud.tsx`**
- The readout row and `<EnergyGraph>`.
- A single `requestAnimationFrame` loop owned here draws both canvases. It reads the swing angle through the `SwingSetHandle` (add a read-only `angle` getter).
- Updating text and canvases runs outside React state, so there are no per-frame re-renders.

**`components/home/swing-game/game-results.tsx`**
- The results layout above.
- Flag emoji come from `String.fromCodePoint` over the regional indicators. On Windows, where flag emoji don't render, the two letters show instead, which is acceptable.

**`components/circle-button.tsx`** (extended, backward-compatible)
- `href` becomes optional. Without it, the component renders a `<button type="button">` with `onClick`.
- Add `tone?: 'dark' | 'yellow'`. `yellow` means a yellow disc at rest with a dark label; the hover arc works as today.
- Existing call sites are unchanged.

**`components/home/home-stage.tsx` / `center-stage.tsx`** (modified)
- `HomeStage` owns `useSwingGame()` and passes `gameMode` down.
- Nav, copyright strip, quote and "Preview Work" get a 450 ms opacity fade and become `inert`/`aria-hidden` when `gameMode !== 'idle'`.
- `CenterStage` renders the warm-up squares, HUD, quit button and results.

### Accessibility and motion

- **Reduced motion:** the swing stays still (existing behaviour) and the game still works. The HUD graph still draws, since it's data, not decoration.
- **Results:** rendered as `role="dialog" aria-modal="true"` with focus moved to RETRY. Esc triggers BACK.
- **Screen readers:** the swing's `aria-label` becomes "Push the swing. Tap quickly five times to play". The HUD is `aria-live="off"` to avoid announcing every tap. The final score is announced once through a polite live region.

## Error handling

| Failure | Behaviour |
|---|---|
| Ticket request fails | The run plays and the result shows "couldn't save". |
| POST 403 (expired, e.g. tab backgrounded) | "couldn't save". The board is still shown from the GET. |
| POST/GET 500 or offline | The score is still shown and the board area says "leaderboard unavailable". |
| Tab hidden mid-run | The run is abandoned on `visibilitychange` and returns to idle with no submit. An early submit would fail the ticket's 9 s minimum anyway. |
| Blob list partially unreadable | Not possible: parsing uses pathnames only, and unparseable pathnames are skipped. |

## Testing

- **Add Vitest** (dev dependency, `pnpm test`) for the pure server logic. There is no test runner today; this is the smallest addition that makes the rules verifiable.
  - `names.ts`: deterministic output, always two words from the lists.
  - `ticket.ts`: valid round trip; tampered signature, other visitor, too early and expired are rejected.
  - `store.ts` path parsing and board building: grouping by visitor keeps the max, sort order, env prefix, junk pathnames skipped. The pure functions are factored out of the `list`/`put` calls, so they need no Blob mocking.
  - Route validation for score bounds (non-integer, negative, >250) using the exported handler with a stubbed store.
- **In-browser check** (per the `run` skill): `pnpm dev`, then play through warm-up, run and results on desktop and a 390 px viewport, against the `dev` env prefix. Screenshot each state next to the prototype.
- `pnpm build` passes.

## Out of scope

- A standalone leaderboard page, profiles, name rerolls, sharing.
- Moderation UI. Bad entries are removed by deleting the blob in the Vercel dashboard.
- Server-side replay or verification of tap timings.
- Changing the About-page swing (non-interactive; untouched).
