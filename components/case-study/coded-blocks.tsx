'use client';

import { useState, type ReactNode } from 'react';
import { MetricsPanel } from './controls/metrics-panel';
import { Knob } from './controls/knob';
import { ProportionalSlider } from '@/components/ui/proportional-slider';
import { MiniCanvas } from './controls/mini-canvas';

const KNOB_ACCENT = '#2CA152';

// ── Live demos (own their own state; the stage renders them as interactive).
// Copied verbatim from components/case-study/knobs.tsx during the migration to
// editable JSON overlays — see 'knobs:*' entries below. ──

function KnobDemo({ label = 'GAIN', initial = 0.5 }: { label?: string; initial?: number }) {
  const [v, setV] = useState(initial);
  return <Knob label={label} value={v} min={0} max={1} step={0.01} accent={KNOB_ACCENT} onChange={setV} />;
}

function KnobRowDemo() {
  const [bass, setBass] = useState(0.6);
  const [treb, setTreb] = useState(0.35);
  const [mix, setMix] = useState(0.5);
  return (
    <div className="flex items-start justify-center gap-10">
      <Knob label="BASS" value={bass} min={0} max={1} step={0.05} accent={KNOB_ACCENT} onChange={setBass} />
      <Knob label="TREB" value={treb} min={0} max={1} step={0.05} accent={KNOB_ACCENT} onChange={setTreb} />
      <Knob label="MIX" value={mix} min={0} max={1} step={0.01} accent={KNOB_ACCENT} onChange={setMix} />
    </div>
  );
}

function SliderDemo() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6">
      <ProportionalSlider
        leftLabel="Coffee"
        rightLabel="Milk"
        leftColor="linear-gradient(135deg,#7c4a24,#3a2414)"
        rightColor="linear-gradient(135deg,#e9e2d4,#b8ad97)"
        defaultValue={62}
        height={56}
      />
      <ProportionalSlider
        leftLabel="Work"
        rightLabel="Life"
        leftColor="linear-gradient(135deg,#2CA152,#186034)"
        rightColor="linear-gradient(135deg,#3a3a3a,#1c1c1c)"
        defaultValue={45}
        height={56}
      />
    </div>
  );
}

// Hand-coded visuals that can't be expressed as data, addressable by id from a
// case study's JSON overlay ({ kind: 'coded', ref: '<id>' }). Add entries here as
// coded studies are migrated.
export const CODED_BLOCKS: Record<string, () => ReactNode> = {
  'deterge:outcome-metrics': () => (
    <MetricsPanel stats={[{ value: '80+', label: 'weekly active' }, { value: '₹30k', label: 'invested' }, { value: '6', label: 'months' }]} />
  ),
  'cassi:outcome': () => (
    <MetricsPanel progression stats={[{ value: '$3M', label: 'seed' }, { value: '$10M', label: 'Series A' }]} />
  ),
  'verizon:result': () => <MetricsPanel stats={[{ value: '500+', label: 'hours of scanning saved' }]} />,
  'knobs:obsession': () => <KnobDemo label="GAIN" />,
  'knobs:knob': () => <KnobRowDemo />,
  'knobs:slider': () => <SliderDemo />,
  'knobs:identity': () => <KnobDemo label="TRUST" initial={0.85} />,
  'canvas:method': () => <MiniCanvas />,
  'canvas:states': () => <MiniCanvas />,
  'canvas:outcome': () => (
    <MetricsPanel stats={[{ value: '500–1k', label: 'users' }, { value: '<6', label: 'months · 2 people' }]} />
  ),
};

// The ids available to pick from in the admin visual editor's "Coded" dropdown.
export const CODED_REFS = Object.keys(CODED_BLOCKS);

export function renderCoded(ref: string): ReactNode {
  const block = CODED_BLOCKS[ref];
  if (block) return block();
  return <div className="font-mono text-sm text-white/40">coded block: {ref}</div>;
}
