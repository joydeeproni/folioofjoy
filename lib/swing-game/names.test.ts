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
