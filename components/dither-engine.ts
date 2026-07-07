import { animate } from 'motion';

// Shared dither-reveal engine used by BOTH the route transition and the
// in-page nav-preview transition, so every dither looks identical. This is the
// original "drift" reveal (organic fbm cloud clearing from the edges).

// Classic recursive 8x8 ordered (Bayer) dither matrix, values 0..63.
const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const tl = hash2(xi, yi);
  const tr = hash2(xi + 1, yi);
  const bl = hash2(xi, yi + 1);
  const br = hash2(xi + 1, yi + 1);
  const u = smooth(xf);
  const v = smooth(yf);
  const top = tl + (tr - tl) * u;
  const bot = bl + (br - bl) * u;
  return top + (bot - top) * v;
}

function fbm(x: number, y: number, octaves: number): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq);
    norm += amp;
    freq *= 2;
    amp *= 0.5;
  }
  return sum / norm;
}

export interface DriftSettings {
  scale: number;
  spread: string;
  direction: number;
  directionStrength: number;
  grain: number;
  octaves: number;
}

export interface DitherSettings {
  cellSize: number;
  gap: number;
  duration: number;
  pattern: string;
  shape: string;
  feather: number;
  drift: DriftSettings;
  easing: string;
  color: string;
}

// Shared dither color for every transition.
export const DITHER_COLOR = '#2CA152';

// The "good one" — the original first-load reveal that animates in from the
// corners (drift + edge spread). `color` is supplied per use.
export const DEFAULT_DITHER: Omit<DitherSettings, 'color'> = {
  cellSize: 14,
  gap: 0,
  duration: 1550,
  pattern: 'drift',
  shape: 'square',
  feather: 0.2,
  drift: {
    scale: 7,
    spread: 'edges',
    direction: 90,
    directionStrength: 0.5,
    grain: 0.2,
    octaves: 3,
  },
  easing: 'easeOut',
};

interface Grid {
  cols: number;
  rows: number;
  cell: number;
  thresholds: Float32Array;
}

function buildGrid(cfg: DitherSettings, seed: number, w: number, h: number, origin?: { x: number; y: number }): Grid {
  const cell = Math.max(2, Math.round(cfg.cellSize));
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const thresholds = new Float32Array(cols * rows);

  if (cfg.pattern === 'drift') {
    const { scale, spread, direction, directionStrength, grain, octaves } = cfg.drift;
    const useOrigin = !!origin;
    const radial = useOrigin || spread === 'center' || spread === 'edges';
    const a = (direction * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const corners = [0, (cols - 1) * dx, (rows - 1) * dy, (cols - 1) * dx + (rows - 1) * dy];
    const minP = Math.min(...corners);
    const range = Math.max(...corners) - minP || 1;
    // Radial centre: the hovered link's position (in cell coords) if given,
    // otherwise the grid centre.
    const cxc = useOrigin ? origin!.x / cell : (cols - 1) / 2;
    const cyc = useOrigin ? origin!.y / cell : (rows - 1) / 2;
    const maxD = useOrigin
      ? Math.max(
          Math.hypot(cxc, cyc),
          Math.hypot(cols - 1 - cxc, cyc),
          Math.hypot(cxc, rows - 1 - cyc),
          Math.hypot(cols - 1 - cxc, rows - 1 - cyc),
        ) || 1
      : Math.hypot(cxc, cyc) || 1;
    const offX = seed * 13.7;
    const offY = seed * 7.3;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let along: number;
        if (radial) {
          const d = Math.hypot(c - cxc, r - cyc) / maxD;
          // Origin / centre spread outward; edges spread inward.
          along = useOrigin || spread === 'center' ? d : 1 - d;
        } else {
          along = (c * dx + r * dy - minP) / range;
        }
        const n = fbm(c / scale + offX, r / scale + offY, octaves);
        let t =
          directionStrength * along +
          (1 - directionStrength) * n +
          (hash2(c + seed * 31, r + seed * 17) - 0.5) * grain;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;
        thresholds[r * cols + c] = t;
      }
    }
  } else {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        thresholds[r * cols + c] =
          cfg.pattern === 'random'
            ? hash2(c, r)
            : (BAYER_8[(r % 8) * 8 + (c % 8)] + 0.5) / 64;
      }
    }
  }
  return { cols, rows, cell, thresholds };
}

function drawDither(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  cfg: DitherSettings,
  progress: number,
  w: number,
  h: number,
) {
  const { cols, rows, cell, thresholds } = grid;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = cfg.color;

  const feather = cfg.feather;
  const isDot = cfg.shape === 'dot';
  const gap = Math.min(cfg.gap, cell - 1);
  const drawn = Math.max(1, cell - gap);
  const inset = gap / 2;
  const rMax = drawn / 2;
  const eff = progress * (1 + feather);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = thresholds[r * cols + c];
      let a: number;
      if (feather <= 0) {
        a = eff > t ? 0 : 1;
      } else {
        a = 1 - (eff - t) / feather;
        if (a > 1) a = 1;
        else if (a < 0) a = 0;
      }
      if (a <= 0.003) continue;
      const x = c * cell;
      const y = r * cell;
      if (isDot) {
        ctx.globalAlpha = 1;
        const rad = a * rMax * 1.15;
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, rad, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.globalAlpha = a;
        if (gap <= 0) ctx.fillRect(x, y, cell + 1, cell + 1);
        else ctx.fillRect(x + inset, y + inset, drawn, drawn);
      }
    }
  }
  ctx.globalAlpha = 1;
}

// Play a full cover→clear reveal across the whole viewport on `canvas`.
export function playDither(
  canvas: HTMLCanvasElement,
  cfg: DitherSettings,
  seed: number,
  origin?: { x: number; y: number },
): { stop: () => void } {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return { stop() {} };
  }
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { stop() {} };
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const grid = buildGrid(cfg, seed, w, h, origin);
  canvas.style.display = 'block';
  drawDither(ctx, grid, cfg, 0, w, h);

  const controls = animate(0, 1, {
    duration: Math.max(0.05, cfg.duration / 1000),
    ease: cfg.easing as 'easeOut',
    onUpdate: (v: number) => drawDither(ctx, grid, cfg, v, w, h),
    onComplete: () => { canvas.style.display = 'none'; },
  });

  return { stop: () => controls.stop() };
}
