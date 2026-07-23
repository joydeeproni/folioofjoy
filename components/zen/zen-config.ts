export type PaletteName = 'subdued' | 'lit' | 'mono';

export interface ZenConfig {
  mode: string;
  cellSize: number;
  spacing: number;
  shape: string;
  sizeVariation: number;
  gain: number;
  smoothing: number;
  feather: number;
  scale: number;
  palette: PaletteName;
  color: string;      // derived from the palette's c1 — the visualizer mark colour
  background: string; // always black under the current palettes
}

export const DEFAULT_ZEN_CONFIG: ZenConfig = {
  mode: 'plasma',
  cellSize: 12,
  spacing: 1.1,
  shape: 'mix',
  sizeVariation: 0.45,
  gain: 1.6,
  smoothing: 0.82,
  feather: 0.15,
  scale: 0.025,
  palette: 'subdued',
  color: '#2CA152',   // SUBDUED c1
  background: '#000000',
};

export const MODE_OPTIONS = ['field', 'radial', 'ripple', 'plasma', 'spectrum', 'waveform', 'image'];
export const SHAPE_OPTIONS = ['dot', 'square', 'plus', 'cross', 'minus', 'binary', 'mix'];

// Three palettes. Each is a set of three accent roles (c1/c2/c3) plus black &
// white as needed; every UI accent is derived from these. Default is LIT.
export interface Palette { name: PaletteName; label: string; c1: string; c2: string; c3: string; }
export const PALETTES: Palette[] = [
  { name: 'subdued', label: 'SUBDUED', c1: '#2CA152', c2: '#DD3430', c3: '#705292' },
  { name: 'lit', label: 'LIT', c1: '#5300FF', c2: '#FF3D00', c3: '#D8F31F' },
  { name: 'mono', label: 'MONO', c1: '#FFFFFF', c2: '#A4A4A4', c3: '#4F4F4F' },
];

export const paletteOf = (name: PaletteName): Palette =>
  PALETTES.find((p) => p.name === name) ?? PALETTES[0];

const KEY = 'zen-config';

export function loadZenConfig(): ZenConfig {
  if (typeof window === 'undefined') return DEFAULT_ZEN_CONFIG;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_ZEN_CONFIG;
    return { ...DEFAULT_ZEN_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ZEN_CONFIG;
  }
}

export function saveZenConfig(cfg: ZenConfig) {
  try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch {}
}
