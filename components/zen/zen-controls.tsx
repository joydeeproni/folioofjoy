'use client';

import { useState } from 'react';
import { MODE_OPTIONS, SHAPE_OPTIONS, type ZenConfig } from './zen-config';

const RANGES: { key: keyof ZenConfig; label: string; min: number; max: number; step: number }[] = [
  { key: 'cellSize', label: 'Cell size', min: 4, max: 40, step: 1 },
  { key: 'spacing', label: 'Spacing', min: 0.6, max: 4, step: 0.05 },
  { key: 'sizeVariation', label: 'Size variation', min: 0, max: 1, step: 0.05 },
  { key: 'gain', label: 'Gain', min: 0.2, max: 5, step: 0.1 },
  { key: 'smoothing', label: 'Smoothing', min: 0, max: 0.97, step: 0.01 },
  { key: 'feather', label: 'Feather', min: 0, max: 0.6, step: 0.01 },
  { key: 'scale', label: 'Scale', min: 0.01, max: 0.3, step: 0.005 },
];

export function ZenControls({
  config,
  onChange,
  onSave,
  onReset,
  onClose,
}: {
  config: ZenConfig;
  onChange: (patch: Partial<ZenConfig>) => void;
  onSave: () => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const save = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  const labelCls = 'text-[11px] font-mono uppercase tracking-wider text-white/50';

  return (
    <div className="w-72 max-h-[78vh] overflow-y-auto rounded-2xl bg-black/85 backdrop-blur border border-white/10 p-4 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-white/60">Visualizer</span>
        <button onClick={onClose} aria-label="Close controls" className="text-white/50 hover:text-white">✕</button>
      </div>

      <label className="block mb-3">
        <span className={labelCls}>Mode</span>
        <select value={config.mode} onChange={(e) => onChange({ mode: e.target.value })} className="mt-1 w-full bg-white/10 rounded px-2 py-1.5 text-sm capitalize">
          {MODE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <label className="block mb-4">
        <span className={labelCls}>Shape</span>
        <select value={config.shape} onChange={(e) => onChange({ shape: e.target.value })} className="mt-1 w-full bg-white/10 rounded px-2 py-1.5 text-sm capitalize">
          {SHAPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>

      {RANGES.map((rg) => (
        <label key={rg.key} className="block mb-3">
          <span className={`flex justify-between ${labelCls}`}>
            <span>{rg.label}</span>
            <span className="text-white/70">{config[rg.key] as number}</span>
          </span>
          <input
            type="range"
            min={rg.min}
            max={rg.max}
            step={rg.step}
            value={config[rg.key] as number}
            onChange={(e) => onChange({ [rg.key]: parseFloat(e.target.value) } as Partial<ZenConfig>)}
            className="mt-1 w-full accent-white"
          />
        </label>
      ))}

      <div className="flex gap-3 mb-4">
        <label className="flex-1">
          <span className={labelCls}>Colour</span>
          <input type="color" value={config.color} onChange={(e) => onChange({ color: e.target.value })} className="mt-1 w-full h-8 bg-transparent rounded cursor-pointer" />
        </label>
        <label className="flex-1">
          <span className={labelCls}>Background</span>
          <input type="color" value={config.background} onChange={(e) => onChange({ background: e.target.value })} className="mt-1 w-full h-8 bg-transparent rounded cursor-pointer" />
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={save} className="flex-1 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
          {saved ? 'Saved ✓' : 'Save'}
        </button>
        <button onClick={onReset} className="py-2 px-3 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">Reset</button>
      </div>
    </div>
  );
}
