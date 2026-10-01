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
