'use client';

import { useState, type ReactNode } from 'react';
import { MetricsPanel } from './controls/metrics-panel';
import { Knob } from './controls/knob';
import { ProportionalSlider } from '@/components/ui/proportional-slider';
import { MiniCanvas } from './controls/mini-canvas';
import { ContactSheet } from './controls/contact-sheet';

const KNOB_ACCENT = '#2CA152';
const TC_MUTED = 'rgba(237,234,224,0.5)';

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

// Lightweight before/after mock — copied verbatim from components/case-study/
// tactile-core.tsx during the migration to the editable JSON overlay (see
// 'tactile-core:before-after' below). Stands in for the shadcn-style mock UIs.
function TCBeforeAfter() {
  return (
    <div className="grid w-full max-w-[520px] grid-cols-2 gap-4 px-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: TC_MUTED }}>Before</p>
        <div className="space-y-1.5">
          <div className="h-2 w-3/4 rounded bg-white/20" />
          <div className="h-2 w-full rounded bg-white/15" />
          <div className="h-6 w-full rounded bg-blue-500/50" />
          <div className="h-6 w-full rounded bg-red-500/40" />
          <div className="h-2 w-1/2 rounded bg-white/15" />
          <div className="h-6 w-2/3 rounded bg-yellow-500/40" />
        </div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: '#2CA152' }}>After</p>
        <div className="space-y-2">
          <div className="h-2 w-2/3 rounded" style={{ backgroundColor: 'rgba(237,234,224,0.5)' }} />
          <div className="h-2 w-1/2 rounded" style={{ backgroundColor: 'rgba(237,234,224,0.25)' }} />
          <div className="mt-3 h-7 w-28 rounded" style={{ backgroundColor: '#2CA152' }} />
        </div>
      </div>
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
  'tactile-core:before-after': () => <TCBeforeAfter />,
  'tactile-core:wall': () => <ContactSheet />,
};

// The ids available to pick from in the admin visual editor's "Coded" dropdown.
export const CODED_REFS = Object.keys(CODED_BLOCKS);

export function renderCoded(ref: string): ReactNode {
  const block = CODED_BLOCKS[ref];
  if (block) return block();
  return <div className="font-mono text-sm text-white/40">coded block: {ref}</div>;
}
