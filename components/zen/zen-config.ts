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
  color: string;
  background: string;
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
  color: '#FFFFFF',
  background: '#000000',
};

export const MODE_OPTIONS = ['field', 'radial', 'ripple', 'plasma', 'spectrum', 'waveform', 'image'];
export const SHAPE_OPTIONS = ['dot', 'square', 'plus', 'cross', 'minus', 'binary', 'mix'];

// Named palettes — picking one sets BOTH the mark colour and the background,
// so each is a complete, coordinated look.
export const PALETTES: { name: string; color: string; background: string }[] = [
  { name: 'Grass', color: '#2CA152', background: '#0A1A10' },
  { name: 'Ember', color: '#F2653C', background: '#160B08' },
  { name: 'Gold', color: '#F2E30C', background: '#14120A' },
  { name: 'Sky', color: '#4FA3E3', background: '#0A1420' },
  { name: 'Plasma', color: '#8B5CF6', background: '#161022' },
  { name: 'Rose', color: '#F472B6', background: '#1A0E15' },
  { name: 'Ocean', color: '#14B8A6', background: '#07171A' },
  { name: 'Snow', color: '#FFFFFF', background: '#000000' },
];

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
