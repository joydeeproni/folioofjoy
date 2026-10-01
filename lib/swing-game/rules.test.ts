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
