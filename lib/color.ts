export interface ThemeColors {
  background: string;
  accent: string;          // the "highlight": matrix dots, hero/work shape, dither
  link: string;            // nav links — = highlight per-palette, near-white in accessible mode
  toolbar: string;
  backgroundRgb: string;
  foreground: string;      // WCAG black/white picked against the background
  foregroundRgb: string;   // "0, 0, 0" or "255, 255, 255" — for building rgba() at any opacity
  onAccent: string;        // WCAG black/white picked against the accent (text over the shape)
  hue: number;
  saturation: number;
  shades: string[];        // 6 shades from the highlight hue at different lightness
}

// Curated two-tone palettes: [background, highlight]. One per track (wraps).
export const PALETTES: Array<{ bg: string; highlight: string }> = [
  { bg: '#2F0250', highlight: '#97FBA3' },
  { bg: '#5B1F04', highlight: '#FFC3FE' },
  { bg: '#E5F0FF', highlight: '#0E3A15' },
  { bg: '#393939', highlight: '#FFD6FF' },
  { bg: '#D74C00', highlight: '#D2FFD8' },
  { bg: '#A69B21', highlight: '#FFECEC' },
  { bg: '#FFFF7E', highlight: '#005756' },
];

// High-contrast accessible theme: black bg, dark-grey highlight, white text.
export const ACCESSIBLE_THEME: { bg: string; highlight: string } = {
  bg: '#000000',
  highlight: '#3F3F3F',
};

function hexToRgbTuple(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Relative luminance per WCAG 2.x.
function luminance([r, g, b]: [number, number, number]): number {
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrast(a: number, b: number): number {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

// Pick black or white — whichever has the higher contrast ratio against the surface.
function pickReadable(surfaceHex: string): { hex: string; rgb: string } {
  const L = luminance(hexToRgbTuple(surfaceHex));
  const white = contrast(L, 1);
  const black = contrast(L, 0);
  return black >= white
    ? { hex: '#000000', rgb: '0, 0, 0' }
    : { hex: '#FFFFFF', rgb: '255, 255, 255' };
}

function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgbTuple(hex);
  return rgbToHsl(r, g, b);
}

export function buildTheme(palette: { bg: string; highlight: string }): ThemeColors {
  const [r, g, b] = hexToRgbTuple(palette.bg);
  const fg = pickReadable(palette.bg);
  const onAccent = pickReadable(palette.highlight);
  const [hHue, hSat] = hexToHsl(palette.highlight);
  return {
    background: palette.bg,
    accent: palette.highlight,
    link: palette.highlight,
    // Self-contained dark glass for the floating controls — readable on any palette.
    toolbar: 'rgba(20, 20, 22, 0.9)',
    backgroundRgb: `rgb(${r}, ${g}, ${b})`,
    foreground: fg.hex,
    foregroundRgb: fg.rgb,
    onAccent: onAccent.hex,
    hue: hHue,
    saturation: hSat,
    shades: generateShades(hHue, Math.max(20, Math.min(80, hSat))),
  };
}

// Map a track index to a palette (wraps around the 8).
export function themeForTrack(index: number): ThemeColors {
  const i = ((index % PALETTES.length) + PALETTES.length) % PALETTES.length;
  return buildTheme(PALETTES[i]);
}

export function accessibleTheme(): ThemeColors {
  // The dark-grey highlight is intentional for the decorative shape, but it's
  // unreadable as link text on black — use near-white for links instead.
  return { ...buildTheme(ACCESSIBLE_THEME), link: '#FFFFFF' };
}

function generateShades(hue: number, sat: number): string[] {
  return [25, 35, 45, 55, 65, 75].map(
    (l) => `hsl(${hue}, ${sat}%, ${l}%)`
  );
}

const DEFAULT_THEME: ThemeColors = {
  // Pure black so the mobile browser chrome (theme-color follows this) blends
  // seamlessly with the black homepage instead of showing an off-black seam.
  // Switches to a per-track colour once audio plays.
  background: '#000000',
  accent: 'hsl(170, 70%, 50%)',
  link: 'hsl(170, 70%, 50%)',
  toolbar: 'rgba(20, 20, 22, 0.9)',
  backgroundRgb: 'rgb(0, 0, 0)',
  foreground: '#FFFFFF',
  foregroundRgb: '255, 255, 255',
  onAccent: '#000000',
  hue: 210,
  saturation: 30,
  shades: generateShades(210, 30),
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

export function extractDominantColor(imageUrl: string): Promise<ThemeColors> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 50; // sample at 50x50
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(DEFAULT_THEME); return; }

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Collect hue buckets (ignore very dark/light pixels)
        const hueBuckets = new Array(36).fill(0); // 10-degree buckets
        let totalSat = 0;
        let satCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const [h, s, l] = rgbToHsl(data[i], data[i+1], data[i+2]);
          if (l > 10 && l < 90 && s > 15) {
            hueBuckets[Math.floor(h / 10)] += s; // weight by saturation
            totalSat += s;
            satCount++;
          }
        }

        // Find dominant hue bucket
        let maxBucket = 0;
        let maxVal = 0;
        for (let i = 0; i < 36; i++) {
          if (hueBuckets[i] > maxVal) {
            maxVal = hueBuckets[i];
            maxBucket = i;
          }
        }

        const dominantHue = maxBucket * 10 + 5;
        const avgSat = satCount > 0 ? Math.round(totalSat / satCount) : 30;
        const sat = Math.max(20, Math.min(70, avgSat));
        const analogousHue = (dominantHue + 30) % 360;

        resolve({
          background: `hsl(${dominantHue}, ${sat}%, 10%)`,
          accent: `hsl(${analogousHue}, 70%, 50%)`,
          toolbar: `hsl(${dominantHue}, ${sat}%, 5%)`,
          backgroundRgb: hslToRgb(dominantHue, sat, 10),
          hue: dominantHue,
          saturation: sat,
          shades: generateShades(dominantHue, sat),
        });
      } catch {
        resolve(DEFAULT_THEME);
      }
    };
    img.onerror = () => resolve(DEFAULT_THEME);
    img.src = imageUrl;
  });
}

export { DEFAULT_THEME };
