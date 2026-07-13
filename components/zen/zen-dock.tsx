'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SlidersHorizontal, X } from 'lucide-react';
import { MODE_OPTIONS, SHAPE_OPTIONS, PALETTES, type ZenConfig } from './zen-config';
import { ProportionalSlider } from '@/components/ui/proportional-slider';

const RANGES: { key: keyof ZenConfig; label: string; min: number; max: number; step: number }[] = [
  { key: 'cellSize', label: 'Cell', min: 4, max: 40, step: 1 },
  { key: 'spacing', label: 'Spacing', min: 0.6, max: 4, step: 0.05 },
  { key: 'sizeVariation', label: 'Variation', min: 0, max: 1, step: 0.05 },
  { key: 'gain', label: 'Gain', min: 0.2, max: 5, step: 0.1 },
  { key: 'smoothing', label: 'Smoothing', min: 0, max: 0.97, step: 0.01 },
  { key: 'feather', label: 'Feather', min: 0, max: 0.6, step: 0.01 },
  { key: 'scale', label: 'Scale', min: 0.01, max: 0.3, step: 0.005 },
];

const decimalsOf = (step: number) => Math.max(0, (String(step).split('.')[1] || '').length);
const toPct = (v: number, min: number, max: number) => ((v - min) / (max - min)) * 100;
const fromPct = (pct: number, min: number, max: number, step: number) => {
  const raw = min + (pct / 100) * (max - min);
  return parseFloat((Math.round(raw / step) * step).toFixed(decimalsOf(step)));
};

const iconBtn = 'flex items-center justify-center w-9 h-9 text-white/80 hover:text-white transition-colors disabled:opacity-30';

export function ZenDock({
  sourceLabel,
  isPlaying,
  isMuted,
  hasAudio,
  onTogglePlay,
  onToggleMute,
  onChange,
  config,
  onChangeConfig,
  onSave,
  onReset,
  visible,
}: {
  sourceLabel: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  hasAudio: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onChange: () => void;
  config: ZenConfig;
  onChangeConfig: (patch: Partial<ZenConfig>) => void;
  onSave: () => void;
  onReset: () => void;
  visible: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  const labelCls = 'block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1';

  const transport = (
    <>
      <button onClick={onTogglePlay} disabled={!hasAudio} aria-label={isPlaying ? 'Pause' : 'Play'} className={iconBtn}>
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
      </button>
      <button onClick={onToggleMute} disabled={!hasAudio} aria-label={isMuted ? 'Unmute' : 'Mute'} className={iconBtn}>
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
      {sourceLabel && <span className="text-xs font-mono uppercase tracking-widest text-white/60 truncate max-w-[140px]">{sourceLabel}</span>}
      <button onClick={onChange} className="text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white underline underline-offset-4">change</button>
    </>
  );

  return (
    <>
      {/* Transport cluster — floats top-right when closed; fades as it "merges" into the panel */}
      <div className={`fixed top-6 right-6 z-40 flex items-center gap-3 transition-all duration-500 ${visible && !open ? 'opacity-100' : 'opacity-0 pointer-events-none translate-x-2'}`}>
        {transport}
        <button onClick={() => setOpen(true)} aria-label="Show controls" className={iconBtn}>
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Right-side controls panel — full height, 0 radius, slides in from the right */}
      <div
        className={`fixed top-0 right-0 z-30 h-full w-[380px] max-w-[88vw] bg-[#0a0a0a]/95 backdrop-blur border-l border-white/10 transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex h-full flex-col">
          {/* Header — the transport info merged in */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
            {transport}
            <button onClick={() => setOpen(false)} aria-label="Hide controls" className={`${iconBtn} ml-auto`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <label>
                <span className={labelCls}>Mode</span>
                <select value={config.mode} onChange={(e) => onChangeConfig({ mode: e.target.value })} className="w-full bg-white/10 px-2 py-1.5 text-sm capitalize text-white outline-none">
                  {MODE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label>
                <span className={labelCls}>Shape</span>
                <select value={config.shape} onChange={(e) => onChangeConfig({ shape: e.target.value })} className="w-full bg-white/10 px-2 py-1.5 text-sm capitalize text-white outline-none">
                  {SHAPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
            </div>

            {/* Palette — each named preset sets both colour and background */}
            <div className="mb-6">
              <span className={labelCls}>Palette</span>
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map((p) => {
                  const active =
                    config.color.toLowerCase() === p.color.toLowerCase() &&
                    config.background.toLowerCase() === p.background.toLowerCase();
                  return (
                    <button
                      key={p.name}
                      onClick={() => onChangeConfig({ color: p.color, background: p.background })}
                      className={`flex items-center gap-2 px-3 py-2 border transition-colors ${active ? 'border-white bg-white/10' : 'border-white/15 hover:bg-white/5'}`}
                    >
                      <span className="flex -space-x-1.5">
                        <span className="h-4 w-4 rounded-full border border-black/40" style={{ backgroundColor: p.background }} />
                        <span className="h-4 w-4 rounded-full border border-black/40" style={{ backgroundColor: p.color }} />
                      </span>
                      <span className="font-mono text-xs uppercase tracking-wider text-white/80">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              {RANGES.map((rg) => (
                <ProportionalSlider
                  key={rg.key}
                  leftLabel={rg.label}
                  rightLabel=""
                  value={toPct(config[rg.key] as number, rg.min, rg.max)}
                  onChange={(p) => onChangeConfig({ [rg.key]: fromPct(p, rg.min, rg.max, rg.step) } as Partial<ZenConfig>)}
                  leftColor={config.color}
                  rightColor="linear-gradient(135deg, #3a3a3a, #202020)"
                  height={40}
                  gap={12}
                  radius={8}
                />
              ))}
            </div>

            <div className="flex gap-2 mt-8">
              <button onClick={save} className="flex-1 py-2 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
                {saved ? 'Saved ✓' : 'Save'}
              </button>
              <button onClick={onReset} className="px-4 py-2 bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
