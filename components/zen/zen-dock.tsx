'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, MoveRight } from 'lucide-react';
import { MODE_OPTIONS, SHAPE_OPTIONS, PALETTES, paletteOf, type PaletteName, type ZenConfig } from './zen-config';

// Config knobs — 4-character labels per the spec.
const RANGES: { key: keyof ZenConfig; label: string; min: number; max: number; step: number }[] = [
  { key: 'cellSize', label: 'CELL', min: 4, max: 40, step: 1 },
  { key: 'spacing', label: 'SPCE', min: 0.6, max: 4, step: 0.05 },
  { key: 'sizeVariation', label: 'VARI', min: 0, max: 1, step: 0.05 },
  { key: 'gain', label: 'GAIN', min: 0.2, max: 5, step: 0.1 },
  { key: 'smoothing', label: 'SMOO', min: 0, max: 0.97, step: 0.01 },
  { key: 'feather', label: 'FTHR', min: 0, max: 0.6, step: 0.01 },
  { key: 'scale', label: 'SCLE', min: 0.01, max: 0.3, step: 0.005 },
];

const decimalsOf = (step: number) => Math.max(0, (String(step).split('.')[1] || '').length);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// ── colour helpers ──────────────────────────────────────────────────────────
function rgbOf(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function withAlpha(hex: string, a: number) { const [r, g, b] = rgbOf(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; }
function lighten(hex: string, t: number) { const [r, g, b] = rgbOf(hex); const m = (c: number) => Math.round(c + (255 - c) * t); return `rgb(${m(r)}, ${m(g)}, ${m(b)})`; }
// Black or white, whichever reads on the given fill — for selected-item text.
function readableText(hex: string) { const [r, g, b] = rgbOf(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#0a0a0a' : '#ffffff'; }

// ── SVG arc helper (deg: 0 = top, clockwise) ─────────────────────────────────
function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

// ── live clock ───────────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  if (!now) return { time: '00:00:00', gmt: '' };
  const time = now.toLocaleTimeString('en-GB', { hour12: false });
  const off = -now.getTimezoneOffset() / 60; // hours ahead of UTC
  const sign = off >= 0 ? '+' : '-';
  const ah = Math.abs(off);
  const gmt = Number.isInteger(ah) ? `${sign}${ah}` : `${sign}${Math.floor(ah)}:${String(Math.round((ah % 1) * 60)).padStart(2, '0')}`;
  return { time, gmt };
}

type Levels = { bass: number; treb: number; mast: number; l: number; r: number };
type Stereo = { left: AnalyserNode | null; right: AnalyserNode | null };

// ── real audio monitor ──────────────────────────────────────────────────────
// BASS/TREB/MAST from the mono analyser's frequency bands; L/R from the RMS of
// the split per-channel analysers. Throttled to ~30fps and eased for a
// natural-looking VU fall-off.
function useAudioMonitor(playing: boolean, getAnalyser?: () => AnalyserNode | null, getStereo?: () => Stereo) {
  const [lv, setLv] = useState<Levels>({ bass: 0, treb: 0, mast: 0, l: 0, r: 0 });
  const raf = useRef(0);
  const smooth = useRef<Levels>({ bass: 0, treb: 0, mast: 0, l: 0, r: 0 });
  useEffect(() => {
    if (!playing) { smooth.current = { bass: 0, treb: 0, mast: 0, l: 0, r: 0 }; setLv(smooth.current); return; }
    const mono = getAnalyser?.() ?? null;
    const st = getStereo?.() ?? { left: null, right: null };
    const freq = mono ? new Uint8Array(mono.frequencyBinCount) : null;
    const tdL = st.left ? new Uint8Array(st.left.fftSize) : null;
    const tdR = st.right ? new Uint8Array(st.right.fftSize) : null;
    let last = 0;
    const rms = (an: AnalyserNode | null, buf: Uint8Array | null) => {
      if (!an || !buf) return 0;
      an.getByteTimeDomainData(buf);
      let s = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; s += v * v; }
      return Math.sqrt(s / buf.length);
    };
    const tick = (t: number) => {
      raf.current = requestAnimationFrame(tick);
      if (t - last < 33) return; // ~30fps
      last = t;
      let bass = 0, treb = 0, mast = 0;
      if (mono && freq) {
        mono.getByteFrequencyData(freq);
        const n = freq.length;
        const band = (a: number, b: number) => {
          const lo = Math.floor(a * n), hi = Math.max(lo + 1, Math.floor(b * n));
          let s = 0; for (let i = lo; i < hi; i++) s += freq[i];
          return s / ((hi - lo) * 255);
        };
        bass = band(0, 0.1); treb = band(0.45, 1);
        let sum = 0; for (let i = 0; i < n; i++) sum += freq[i]; mast = sum / (n * 255);
      }
      const l = Math.min(rms(st.left, tdL) * 2.4, 1);
      const r = Math.min(rms(st.right, tdR) * 2.4, 1);
      // ease toward the new target (fast attack, slow release)
      const s = smooth.current;
      const ease = (cur: number, tgt: number) => cur + (tgt - cur) * (tgt > cur ? 0.6 : 0.2);
      smooth.current = {
        bass: ease(s.bass, Math.min(bass * 1.3, 1)),
        treb: ease(s.treb, Math.min(treb * 1.6, 1)),
        mast: ease(s.mast, Math.min(mast * 1.4, 1)),
        l: ease(s.l, l), r: ease(s.r, r),
      };
      setLv({ ...smooth.current });
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, getAnalyser, getStereo]);
  return lv;
}

// ASCII glyph preview of the selected shape — 2 lines × 3 chars.
const SHAPE_GLYPH: Record<string, string> = { dot: '•', square: '■', plus: '+', cross: 'X', minus: '-' };
function shapePreview(shape: string): [string, string] {
  if (shape === 'mix') return ['+X-', 'X-+'];
  if (shape === 'binary') return ['010', '101'];
  const g = SHAPE_GLYPH[shape] ?? '•';
  return [g.repeat(3), g.repeat(3)];
}

function sourceTypeOf(label: string | null): string {
  const l = (label || '').toLowerCase();
  if (l.startsWith('radio')) return 'RADIO';
  if (l.startsWith('file')) return 'FILE';
  if (l.startsWith('our songs')) return 'PLAYLIST';
  return 'AUDIO';
}

// ── vertical LED meter (short = closed card; tall = panel) ───────────────────
function Meter({ level, c1, c2, label, segments, peak, width }: {
  level: number; c1: string; c2: string; label?: string; segments: number; peak: number; width: number;
}) {
  const lit = Math.round(level * segments);
  return (
    <div className="flex flex-col items-center gap-[10px]" style={{ width }}>
      <div className="flex flex-col gap-[2px] items-start w-full">
        {Array.from({ length: segments }).map((_, i) => {
          const fromBottom = segments - 1 - i;
          const on = fromBottom < lit;
          const isPeak = i < peak;
          const bg = on ? (isPeak ? c2 : c1) : (isPeak ? withAlpha(c2, 0.2) : 'rgba(255,255,255,0.2)');
          return <div key={i} className="h-px w-full transition-colors duration-100" style={{ background: bg }} />;
        })}
      </div>
      {label && <span className="text-[12px] leading-none text-white font-mono w-full">{label}</span>}
    </div>
  );
}

// ── L / R arc gauge — VU + peak monitor ──────────────────────────────────────
// Green fills with the channel level; the fixed red segment at the far end is
// the peak indicator — dim normally, lit only when the level pins the meter.
function ArcGauge({ label, c1, c2, fill }: { label: string; c1: string; c2: string; fill: number }) {
  const a0 = 270, span = 180, peakStart = 0.85, peakThresh = 0.9;
  const level = clamp(fill, 0, 1);
  const greenEnd = a0 + Math.min(level, peakStart) * span;
  const peakOn = level >= peakThresh;
  return (
    <div className="relative" style={{ width: 70, height: 70 }}>
      <svg viewBox="0 0 70 70" width={70} height={70} className="absolute inset-0">
        <path d={arc(35, 35, 30, a0, a0 + span)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        {level > 0.01 && <path d={arc(35, 35, 30, a0, greenEnd)} fill="none" stroke={c1} strokeWidth="2" strokeLinecap="round" />}
        {/* peak segment fixed at the end */}
        <path
          d={arc(35, 35, 30, a0 + peakStart * span, a0 + span)}
          fill="none" stroke={c2} strokeWidth="2"
          style={{ opacity: peakOn ? 1 : 0.25, filter: peakOn ? `drop-shadow(0 0 4px ${c2})` : 'none', transition: 'opacity 90ms' }}
        />
      </svg>
      <span className="absolute font-mono text-[28px] text-white" style={{ opacity: 0.2, left: 'calc(50% - 8px)', top: 17.5 }}>{label}</span>
    </div>
  );
}

// ── rotary knob (drag vertically to set) ─────────────────────────────────────
function Knob({ label, value, min, max, step, accent, onChange }: {
  label: string; value: number; min: number; max: number; step: number; accent: string; onChange: (v: number) => void;
}) {
  const pct = clamp((value - min) / (max - min), 0, 1);
  const dec = decimalsOf(step);
  const angle = 225 + pct * 270; // 0 = top, clockwise; sweep 270°
  const drag = useRef<{ y: number; pct: number } | null>(null);
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const active = hover || dragging;

  const apply = (p: number) => {
    const raw = min + clamp(p, 0, 1) * (max - min);
    onChange(parseFloat((Math.round(raw / step) * step).toFixed(dec)));
  };
  const onDown = (e: React.PointerEvent) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { y: e.clientY, pct }; setDragging(true); };
  const onMove = (e: React.PointerEvent) => { if (!drag.current) return; apply(drag.current.pct + (drag.current.y - e.clientY) / 140); };
  const onUp = (e: React.PointerEvent) => { drag.current = null; setDragging(false); e.currentTarget.releasePointerCapture(e.pointerId); };

  const [ix, iy] = polar(24, 24, 17, angle);
  const circ = 2 * Math.PI * 22;
  return (
    <div
      className="flex flex-col items-center gap-[7px] select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="text-[12px] leading-none text-center font-mono text-white">{label}</span>
      <svg viewBox="0 0 48 54" width={48} height={54} className="touch-none cursor-ns-resize" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>
        <path d={arc(24, 24, 22, 225, 495)} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <path d={arc(24, 24, 22, 225, angle)} fill="none" stroke={accent} strokeWidth={dragging ? 3 : 2} strokeLinecap="round" style={{ transition: 'stroke-width 120ms' }} />
        {/* hover flourish: the accent ring draws around the full circle */}
        {active && (
          <circle
            cx="24" cy="24" r="22" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"
            className="animate-knob-fill"
            style={{ ['--circ' as string]: `${circ}px`, strokeDasharray: circ, transform: 'rotate(-90deg)', transformOrigin: '24px 24px' }}
          />
        )}
        <circle cx="24" cy="24" r="19" fill="#c9c9c9" />
        <line x1="24" y1="24" x2={ix} y2={iy} stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="font-mono text-[37px] leading-none text-center" style={{ color: '#ffffff', opacity: dragging ? 1 : active ? 0.85 : 0.5, transition: 'opacity 200ms', fontWeight: 300 }}>
        {value.toFixed(dec)}
      </span>
    </div>
  );
}

export function ZenDock({
  sourceLabel, isPlaying, isMuted, hasAudio,
  onTogglePlay, onToggleMute, onChange,
  config, onChangeConfig, onSave, onReset, visible,
  getAnalyser, getStereo, onSelectSource,
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
  getAnalyser?: () => AnalyserNode | null;
  getStereo?: () => Stereo;
  onSelectSource?: (kind: 'playlist' | 'file' | 'radio') => void;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hoverPalette, setHoverPalette] = useState<PaletteName | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const set = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  const { time, gmt } = useClock();
  const levels = useAudioMonitor(isPlaying, getAnalyser, getStereo);
  const sourceType = sourceTypeOf(sourceLabel);

  const p = paletteOf(config.palette);
  const { c1, c2, c3 } = p;
  const lav = lighten(c3, 0.4);        // CHANGE / PLAY / SET / tag text
  const lavBorder = lighten(c3, 0.15); // tag / list borders
  const shapeText = lighten(c1, 0.55);
  const modeText = lighten(c3, 0.55);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setSourceOpen(false); } };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!sourceOpen) return;
    const close = () => setSourceOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [sourceOpen]);

  // Source dropdown items — the three pickable sources.
  const SOURCES: { label: string; kind: 'playlist' | 'file' | 'radio' }[] = [
    { label: 'MEDIA', kind: 'file' },
    { label: 'PLAY', kind: 'playlist' },
    { label: 'RADIO', kind: 'radio' },
  ];
  const currentKind = sourceType === 'RADIO' ? 'radio' : sourceType === 'FILE' ? 'file' : 'playlist';

  // Time + stacked GMT offset + source-type tag (opens a source dropdown).
  const headerTop = (
    <div className="flex items-start justify-center gap-[8px] p-[8px]">
      <span className="text-[28px] leading-none text-white font-mono whitespace-nowrap tabular-nums">{time}</span>
      <div className="flex flex-col items-start pb-[4px] text-[9px] leading-tight text-white font-mono">
        <span>GMT</span>
        <span>{gmt}</span>
      </div>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setSourceOpen((o) => !o)}
          className="border border-solid px-[8px] pt-[8px] pb-[6px] text-[14px] leading-none font-mono whitespace-nowrap transition-opacity hover:opacity-80"
          style={{ borderColor: lavBorder, color: lav, letterSpacing: '-0.7px' }}
        >
          {sourceType}
        </button>
        {sourceOpen && (
          <div className="absolute top-full right-0 mt-1 z-50 flex flex-col bg-black border-r border-solid pr-[8px]" style={{ borderColor: c3 }}>
            {SOURCES.map((s) => {
              const on = s.kind === currentKind;
              return (
                <button
                  key={s.label}
                  onClick={() => { onSelectSource?.(s.kind); setSourceOpen(false); }}
                  className="flex items-center justify-center px-[8px] pt-[4px] pb-[2px]"
                  style={{ background: on ? c3 : 'transparent' }}
                >
                  <span className="text-[12px] leading-none font-mono whitespace-nowrap" style={{ color: on ? readableText(c3) : lav }}>{s.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // CHANGE / PLAY / STOP / volume (+ optional CONFIG). Stops click-through.
  const transportRow = (opts: { showConfig?: boolean }) => (
    <div className="flex items-center gap-[24px]" onClick={(e) => e.stopPropagation()}>
      {opts.showConfig && (
        <button onClick={() => setOpen(true)} className="text-[18px] leading-none font-mono whitespace-nowrap transition-opacity hover:opacity-80" style={{ color: lav, letterSpacing: '-0.9px' }}>CONFIG</button>
      )}
      <button onClick={onTogglePlay} disabled={!hasAudio} className="text-[18px] leading-none font-mono whitespace-nowrap transition-opacity hover:opacity-80" style={{ color: lav, letterSpacing: '-0.9px', opacity: isPlaying ? 0.2 : 1 }}>PLAY</button>
      <button onClick={onTogglePlay} disabled={!hasAudio} className="text-[18px] leading-none font-mono whitespace-nowrap transition-opacity hover:opacity-80" style={{ color: c2, letterSpacing: '-0.9px', opacity: isPlaying ? 1 : 0.2 }}>STOP</button>
      <button onClick={onToggleMute} disabled={!hasAudio} aria-label={isMuted ? 'Unmute' : 'Mute'} className="text-white/80 hover:text-white transition-colors disabled:opacity-30">
        {isMuted ? <VolumeX className="w-[23px] h-[23px]" /> : <Volume2 className="w-[23px] h-[23px]" />}
      </button>
    </div>
  );

  const paletteIndex = PALETTES.findIndex((pp) => pp.name === config.palette);

  return (
    <>
      {/* ── Closed card — top-right ── */}
      <div className={`fixed top-6 right-6 z-40 transition-all duration-500 ${visible && !open ? 'opacity-100' : 'opacity-0 pointer-events-none translate-x-2'}`}>
        <div onClick={() => setOpen(true)} role="button" aria-label="Open controls" className="flex flex-col items-center gap-[8px] bg-black p-[8px] cursor-pointer select-none">
          <div className="flex items-center justify-center gap-[8px] p-[8px]">
            <Meter level={levels.bass} c1={c1} c2={c2} label="B" segments={9} peak={2} width={9} />
            <Meter level={levels.treb} c1={c1} c2={c2} label="T" segments={9} peak={2} width={9} />
            {headerTop}
          </div>
          {transportRow({ showConfig: true })}
        </div>
      </div>

      {/* ── Backdrop (click to close) ── */}
      {open && <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />}

      {/* ── Config panel — full-height right slide-in ── */}
      <div
        className={`fixed top-0 right-0 z-30 h-full w-[380px] max-w-[92vw] flex flex-col transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'rgba(9,9,11,0.96)', borderLeft: '1px solid rgba(237,233,221,0.14)', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
       <div className="flex-1 overflow-y-auto">
        {/* Header + meters */}
        <div className="bg-black flex flex-col gap-[32px] items-center px-[24px] py-[8px]">
          <div className="flex flex-col gap-[8px] items-center w-full pt-2">
            {headerTop}
            {transportRow({})}
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-[16px] items-center">
              <Meter level={levels.bass} c1={c1} c2={c2} label="BASS" segments={26} peak={3} width={29} />
              <Meter level={levels.treb} c1={c1} c2={c2} label="TREB" segments={26} peak={3} width={29} />
              <Meter level={levels.mast} c1={c1} c2={c2} label="MAST" segments={26} peak={3} width={29} />
            </div>
            <div className="flex gap-[16px] items-center">
              <ArcGauge label="L" c1={c1} c2={c2} fill={levels.l} />
              <ArcGauge label="R" c1={c1} c2={c2} fill={levels.r} />
            </div>
          </div>
        </div>

        {/* Nudge box + Shape / Mode lists */}
        <div className="bg-black px-[24px] py-[40px]">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-center justify-center p-[24px] border border-solid" style={{ borderColor: withAlpha(c1, 0.3) }}>
              <div className="text-[20px] text-white font-mono leading-tight text-center" style={{ fontWeight: 300, letterSpacing: '0.2em' }}>
                {shapePreview(config.shape).map((line, i) => <p key={i} className="mb-0">{line}</p>)}
              </div>
            </div>
            <div className="flex gap-[16px] items-center">
              {/* Shape list — no divider; selected fills the column */}
              <div className="flex flex-col items-stretch">
                {SHAPE_OPTIONS.map((s) => {
                  const on = s === config.shape;
                  return (
                    <button key={s} onClick={() => onChangeConfig({ shape: s })} className="w-full flex items-center justify-center px-[8px] pt-[4px] pb-[2px]" style={{ background: on ? c1 : 'transparent' }}>
                      <span className="text-[12px] leading-none font-mono uppercase whitespace-nowrap" style={{ color: on ? readableText(c1) : shapeText }}>{s}</span>
                    </button>
                  );
                })}
              </div>
              {/* Mode list — keeps its outer divider */}
              <div className="flex flex-col items-stretch pr-[8px] border-r border-solid" style={{ borderColor: c3 }}>
                {MODE_OPTIONS.map((m) => {
                  const on = m === config.mode;
                  return (
                    <button key={m} onClick={() => onChangeConfig({ mode: m })} className="w-full flex items-center justify-center px-[8px] pt-[4px] pb-[2px]" style={{ background: on ? c3 : 'transparent' }}>
                      <span className="text-[12px] leading-none font-mono uppercase whitespace-nowrap" style={{ color: on ? readableText(c3) : modeText }}>{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Palette selector */}
        <div className="bg-black flex flex-col gap-[8px] px-[24px] py-[24px]">
          <div className="grid grid-cols-3 text-[12px] leading-none font-mono h-[14px]">
            {PALETTES.map((pp, i) => {
              const shown = (hoverPalette ?? config.palette) === pp.name;
              return (
                <span
                  key={pp.name}
                  className="transition-opacity duration-200"
                  style={{
                    textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right',
                    color: hoverPalette === pp.name ? lighten(pp.c1, 0.3) : '#ffffff',
                    opacity: shown ? 1 : 0,
                  }}
                >
                  {pp.label}
                </span>
              );
            })}
          </div>
          <div className="flex gap-px items-end w-full h-[8px]">
            {PALETTES.map((pp) => {
              const raised = pp.name === config.palette || pp.name === hoverPalette;
              return (
                <button
                  key={pp.name}
                  onClick={() => onChangeConfig({ palette: pp.name as PaletteName, color: pp.c1, background: '#000000' })}
                  onMouseEnter={() => setHoverPalette(pp.name)}
                  onMouseLeave={() => setHoverPalette((h) => (h === pp.name ? null : h))}
                  className={`flex flex-1 min-w-0 items-end h-[8px] cursor-pointer`}
                  aria-label={pp.label}
                >
                  {[pp.c1, pp.c2, pp.c3].map((c, j) => (
                    <span
                      key={j}
                      className="flex-1 min-w-0 transition-[height,opacity] duration-200 ease-out"
                      style={{ background: c, height: raised ? 8 : 1, opacity: raised ? 1 : 0.75 }}
                    />
                  ))}
                </button>
              );
            })}
          </div>
        </div>

        {/* Knob grid */}
        <div className="flex flex-col gap-[24px] px-[24px] pt-[28px] pb-[24px]">
          <div className="grid grid-cols-3 gap-x-[8px] gap-y-[24px] justify-items-center">
            {RANGES.map((rg) => (
              <Knob
                key={rg.key}
                label={rg.label}
                value={config[rg.key] as number}
                min={rg.min} max={rg.max} step={rg.step}
                accent={c1}
                onChange={(v) => onChangeConfig({ [rg.key]: v } as Partial<ZenConfig>)}
              />
            ))}
          </div>
        </div>
       </div>

        {/* SET / RESET — pinned footer */}
        <div className="flex gap-[16px] items-center px-[24px] py-[20px] bg-black" style={{ borderTop: '1px solid rgba(237,233,221,0.12)' }}>
          <button onClick={set} className="flex flex-1 gap-[8px] items-center transition-opacity hover:opacity-80">
            <MoveRight className="w-[24px] h-[24px]" style={{ color: lav }} />
            <span className="text-[18px] leading-none font-mono whitespace-nowrap" style={{ color: lav, letterSpacing: '-0.9px' }}>{saved ? 'SET ✓' : 'SET'}</span>
          </button>
          <button onClick={onReset} className="text-[18px] leading-none font-mono text-white whitespace-nowrap transition-opacity hover:opacity-80" style={{ letterSpacing: '-0.9px' }}>RESET</button>
        </div>
      </div>
    </>
  );
}
