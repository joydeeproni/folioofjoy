import { describe, expect, it } from 'vitest';
import { STAMP_CATALOG } from './catalog';
import { MOTIF_IDS } from '@/components/stamps/motifs';
import { SCRIPT_FONTS } from '@/components/about/stamp-fonts';

const ROUND = new Set(['circle', 'seal', 'octagon']);
const BOXY = new Set(['rect', 'rounded', 'square', 'ticket', 'postage', 'oval']);

describe('stamp catalog', () => {
  it('has 100 countries, each once', () => {
    expect(STAMP_CATALOG).toHaveLength(100);
    expect(new Set(STAMP_CATALOG.map((s) => s.code)).size).toBe(100);
  });

  it('gives every country its own motif', () => {
    const seen = new Map<string, string>();
    for (const s of STAMP_CATALOG) {
      expect(seen.get(s.motif), `${s.code} reuses ${s.motif}`).toBeUndefined();
      seen.set(s.motif, s.code);
    }
  });

  it('never repeats a silhouette + border + layout + face combination', () => {
    const keys = STAMP_CATALOG.map((s) => `${s.shape}/${s.border}/${s.layout}/${s.face}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('only references motifs and font tiers that exist', () => {
    for (const s of STAMP_CATALOG) {
      expect(MOTIF_IDS, s.code).toContain(s.motif);
      expect(SCRIPT_FONTS[s.font], s.code).toBeDefined();
    }
  });

  it('puts each layout on a silhouette it fits', () => {
    for (const s of STAMP_CATALOG) {
      if (s.layout === 'ring' || s.layout === 'postmark') expect(ROUND.has(s.shape), s.code).toBe(true);
      if (s.layout === 'grid' || s.layout === 'port') expect(BOXY.has(s.shape), s.code).toBe(true);
    }
  });

  it('uses three-letter airport codes', () => {
    for (const s of STAMP_CATALOG) expect(s.port, s.code).toMatch(/^[A-Z]{3}$/);
  });
});
