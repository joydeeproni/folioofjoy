'use client';

import type { EQGains } from '@/lib/audio-engine';

interface EQPanelProps {
  eq: EQGains;
  volume: number;
  onEQ: (patch: Partial<EQGains>) => void;
  onVolume: (v: number) => void;
  toolbarColor: string;
  accentColor: string;
}

const RANGE = 12; // ±12 dB

function VerticalSlider({
  label,
  freqLabel,
  value,
  onChange,
  accentColor,
  min = -RANGE,
  max = RANGE,
  format,
}: {
  label: string;
  freqLabel?: string;
  value: number;
  onChange: (v: number) => void;
  accentColor: string;
  min?: number;
  max?: number;
  format?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col items-center gap-2 w-12">
      <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
        {format ? format(value) : value > 0 ? `+${value.toFixed(0)}` : value.toFixed(0)}
      </span>
      <div className="relative h-32 w-1 rounded-full bg-white/8">
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-100"
          style={{
            height: `${pct}%`,
            backgroundColor: accentColor,
            opacity: 0.6,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          style={{ writingMode: 'vertical-lr' as React.CSSProperties['writingMode'] }}
          aria-label={label}
        />
        {/* Center tick */}
        <div className="absolute left-1/2 top-1/2 w-3 h-px -translate-x-1/2 bg-white/20" />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-sans text-white/70 leading-none">{label}</span>
        {freqLabel && <span className="text-[9px] font-mono text-white/30 leading-none">{freqLabel}</span>}
      </div>
    </div>
  );
}

export function EQPanel({ eq, volume, onEQ, onVolume, toolbarColor, accentColor }: EQPanelProps) {
  return (
    <div
      className="backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 shadow-2xl"
      style={{ backgroundColor: toolbarColor }}
    >
      <div className="flex items-end gap-4">
        <VerticalSlider
          label="Bass"
          freqLabel="200Hz"
          value={eq.bass}
          onChange={(v) => onEQ({ bass: v })}
          accentColor={accentColor}
        />
        <VerticalSlider
          label="Mid"
          freqLabel="1kHz"
          value={eq.mid}
          onChange={(v) => onEQ({ mid: v })}
          accentColor={accentColor}
        />
        <VerticalSlider
          label="Treble"
          freqLabel="4kHz"
          value={eq.treble}
          onChange={(v) => onEQ({ treble: v })}
          accentColor={accentColor}
        />
        <div className="w-px h-32 bg-white/10 mx-1" />
        <VerticalSlider
          label="Vol"
          freqLabel="dB"
          value={volume}
          min={0}
          max={1}
          onChange={onVolume}
          accentColor={accentColor}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
        <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Equalizer</span>
        <button
          onClick={() => onEQ({ bass: 0, mid: 0, treble: 0 })}
          className="text-[9px] font-mono text-white/40 hover:text-white uppercase tracking-widest transition-colors"
        >
          Flat
        </button>
      </div>
    </div>
  );
}
