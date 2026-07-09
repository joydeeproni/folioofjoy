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
export const SHAPE_OPTIONS = ['dot', 'square', 'plus', 'cross', 'minus', 'mix'];

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
