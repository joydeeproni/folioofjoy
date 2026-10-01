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

// Only the primary button counts, so a right-click (context menu) isn't a tap.
export function countsAsPointerTap(e: { pointerType: string; button: number }): boolean {
  return e.button === 0;
}

// Screen readers and voice control activate a button with a bare click
// (detail 0) — no pointerdown, no keydown — so that click has to count too.
export function isAssistiveClick(e: { detail: number }): boolean {
  return e.detail === 0;
}

export function countsAsKeyTap(e: { key: string; repeat: boolean }): boolean {
  return !e.repeat && (e.key === ' ' || e.key === 'Enter');
}

// Frantic tapping should look frantic: the swing's arc cap opens up with the count.
export function arcCapFor(count: number): number {
  return ARC_START_RAD + (ARC_MAX_RAD - ARC_START_RAD) * Math.min(1, count / ARC_FULL_AT);
}

// The server stamps a ticket when it answers, which can be well after the run
// began if that first request was slow (cold start, mobile). Waiting until the
// ticket is old enough by the client's own clock guarantees the server sees a
// valid age, and costs nothing when the ticket came back promptly.
export function ticketSubmitDelay(arrivedAt: number, now: number): number {
  return Math.max(0, arrivedAt + TICKET_MIN_AGE_MS - now);
}
