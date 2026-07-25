'use client';

import type { ReactNode } from 'react';
import { MetricsPanel } from './controls/metrics-panel';

// Hand-coded visuals that can't be expressed as data, addressable by id from a
// case study's JSON overlay ({ kind: 'coded', ref: '<id>' }). Add entries here as
// coded studies are migrated.
export const CODED_BLOCKS: Record<string, () => ReactNode> = {
  'deterge:outcome-metrics': () => (
    <MetricsPanel stats={[{ value: '80+', label: 'weekly active' }, { value: '₹30k', label: 'invested' }, { value: '6', label: 'months' }]} />
  ),
};

// The ids available to pick from in the admin visual editor's "Coded" dropdown.
export const CODED_REFS = Object.keys(CODED_BLOCKS);

export function renderCoded(ref: string): ReactNode {
  const block = CODED_BLOCKS[ref];
  if (block) return block();
  return <div className="font-mono text-sm text-white/40">coded block: {ref}</div>;
}
