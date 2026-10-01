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
