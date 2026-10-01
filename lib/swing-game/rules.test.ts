import { describe, expect, it } from 'vitest';
import {
  ARC_MAX_RAD, ARC_START_RAD, MAX_SCORE, RUN_MS, WARMUP_GAP_MS,
  TICKET_MIN_AGE_MS, acceptsRunTap, arcCapFor, countsAsKeyTap, countsAsPointerTap, isAssistiveClick, isValidScore,
  ticketSubmitDelay, warmupTap,
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

describe('ticketSubmitDelay', () => {
  it('waits until the ticket is at least the minimum age, measured from when it arrived', () => {
    expect(ticketSubmitDelay(1000, 1000 + TICKET_MIN_AGE_MS)).toBe(0);
    expect(ticketSubmitDelay(1000, 1000 + TICKET_MIN_AGE_MS + 500)).toBe(0);
    // ticket came back 2s into the run: at the 10s mark it is only 8s old
    expect(ticketSubmitDelay(2000, 10_000)).toBe(TICKET_MIN_AGE_MS - 8000);
  });
});

describe('isAssistiveClick', () => {
  it('treats a click with no pointer detail (screen reader, voice control) as a tap', () => {
    expect(isAssistiveClick({ detail: 0 })).toBe(true);
    expect(isAssistiveClick({ detail: 1 })).toBe(false);
  });
});
