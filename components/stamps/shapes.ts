import type { StampShape } from '@/lib/stamps/catalog';

// Every silhouette is a polygon in the stamp's 0–100 box, generated at any inset
// so borders can nest inside it and layouts can ask how wide the shape is at a
// given height. Curves are sampled finely enough that the ink filter's edge
// roughening hides the facets.

export type Pt = [number, number];

const C = 50;

function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, n: number): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
}

function rectPts(x0: number, y0: number, x1: number, y1: number): Pt[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

function roundedRect(x0: number, y0: number, x1: number, y1: number, r: number): Pt[] {
  const k = Math.max(r, 0.01);
  return [
    ...arc(x1 - k, y0 + k, k, k, -90, 0, 6),
    ...arc(x1 - k, y1 - k, k, k, 0, 90, 6),
    ...arc(x0 + k, y1 - k, k, k, 90, 180, 6),
    ...arc(x0 + k, y0 + k, k, k, 180, 270, 6),
  ];
}

// Scales a convex polygon toward the centre so its edges move in by `i`.
function shrink(pts: Pt[], apothem: number, i: number, cx = C, cy = C): Pt[] {
  const f = (apothem - i) / apothem;
  return pts.map(([x, y]) => [cx + (x - cx) * f, cy + (y - cy) * f]);
}

// Perforated postage edge: semicircular bites along each side of the outer rect.
function perforated(x0: number, y0: number, x1: number, y1: number, pitch: number, r: number): Pt[] {
  const out: Pt[] = [];
  const side = (ax: number, ay: number, bx: number, by: number) => {
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.round(len / pitch));
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    // Inward normal for a clockwise outline.
    const nx = -uy;
    const ny = ux;
    for (let k = 0; k < n; k++) {
      const s = (k + 0.5) * (len / n);
      const mx = ax + ux * s;
      const my = ay + uy * s;
      out.push([mx - ux * r, my - uy * r]);
      for (let j = 1; j < 6; j++) {
        const t = Math.PI - (Math.PI * j) / 6;
        out.push([mx + ux * r * Math.cos(t) + nx * r * Math.sin(t), my + uy * r * Math.cos(t) + ny * r * Math.sin(t)]);
      }
      out.push([mx + ux * r, my + uy * r]);
    }
  };
  side(x0, y0, x1, y0);
  side(x1, y0, x1, y1);
  side(x1, y1, x0, y1);
  side(x0, y1, x0, y0);
  return out;
}

// Ticket: rectangle with quarter-circle notches cut from each corner.
function ticket(x0: number, y0: number, x1: number, y1: number, r: number): Pt[] {
  return [
    ...arc(x1, y0, r, r, 180, 90, 6),
    ...arc(x1, y1, r, r, 270, 180, 6),
    ...arc(x0, y1, r, r, 0, -90, 6),
    ...arc(x0, y0, r, r, 90, 0, 6),
  ];
}

export function outline(shape: StampShape, i: number): Pt[] {
  switch (shape) {
    case 'circle':
      return arc(C, C, 47 - i, 47 - i, 0, 360, 120);
    case 'seal': {
      // Scalloped rim on the outermost line only; inner lines are plain circles.
      const r = 47 - i;
      if (i >= 2) return arc(C, C, r - 1.6, r - 1.6, 0, 360, 120);
      return Array.from({ length: 241 }, (_, k) => {
        const a = (k / 240) * Math.PI * 2;
        const rr = r - 1.6 + 1.6 * Math.cos(a * 28);
        return [C + rr * Math.cos(a), C + rr * Math.sin(a)] as Pt;
      });
    }
    case 'oval':
      return arc(C, C, 48 - i, 35 - i, 0, 360, 120);
    case 'rect':
      return rectPts(2 + i, 16 + i, 98 - i, 84 - i);
    case 'tall':
      return rectPts(16 + i, 2 + i, 84 - i, 98 - i);
    case 'square':
      return rectPts(4 + i, 4 + i, 96 - i, 96 - i);
    case 'rounded':
      return roundedRect(3 + i, 12 + i, 97 - i, 88 - i, Math.max(1, 11 - i * 0.7));
    case 'octagon': {
      const h = 47;
      const c = 14;
      return shrink(
        [
          [C - h + c, C - h],
          [C + h - c, C - h],
          [C + h, C - h + c],
          [C + h, C + h - c],
          [C + h - c, C + h],
          [C - h + c, C + h],
          [C - h, C + h - c],
          [C - h, C - h + c],
        ],
        h,
        i,
      );
    }
    case 'hexagon':
      return shrink(
        [
          [2, 50],
          [26, 8],
          [74, 8],
          [98, 50],
          [74, 92],
          [26, 92],
        ],
        42,
        i,
      );
    case 'diamond':
      return shrink(
        [
          [50, 2],
          [98, 50],
          [50, 98],
          [2, 50],
        ],
        33.9,
        i,
      );
    case 'shield': {
      const x0 = 12 + i;
      const x1 = 88 - i;
      const top = 4 + i;
      const tip = 97 - i * 1.5;
      const shoulder = 56;
      const right: Pt[] = Array.from({ length: 13 }, (_, k) => {
        const t = k / 12;
        // Quadratic from the shoulder to the tip, bowing outward.
        const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * x1 + t * t * C;
        const y = (1 - t) ** 2 * shoulder + 2 * (1 - t) * t * (tip - 12) + t * t * tip;
        return [x, y];
      });
      const left = right
        .slice(0, -1)
        .reverse()
        .map(([x, y]) => [100 - x, y] as Pt);
      return [[x0, top], [x1, top], ...right, ...left];
    }
    case 'arch': {
      const x0 = 15 + i;
      const x1 = 85 - i;
      const r = (x1 - x0) / 2;
      const cy = 4 + i + r;
      return [...arc(C, cy, r, r, 180, 360, 40), [x1, 97 - i], [x0, 97 - i]];
    }
    case 'postage':
      return i < 2
        ? perforated(9 + i, 2 + i, 91 - i, 98 - i, 5.3, 1.6)
        : rectPts(9 + i, 2 + i, 91 - i, 98 - i);
    case 'ticket':
      return ticket(2 + i, 17 + i, 98 - i, 83 - i, 7);
  }
}

export function circlePts(cx: number, cy: number, r: number): Pt[] {
  return arc(cx, cy, r, r, 0, 360, 120);
}

export function toPath(pts: Pt[]): string {
  return `M${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`;
}

/** Horizontal extent of a polygon at height y, or null outside it. */
export function span(pts: Pt[], y: number): [number, number] | null {
  const xs: number[] = [];
  for (let k = 0; k < pts.length; k++) {
    const [ax, ay] = pts[k];
    const [bx, by] = pts[(k + 1) % pts.length];
    if ((ay <= y && by > y) || (by <= y && ay > y)) {
      xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
    }
  }
  if (xs.length < 2) return null;
  return [Math.min(...xs), Math.max(...xs)];
}

/** Narrowest horizontal extent over a band of heights — what a line of text can use. */
export function bandSpan(pts: Pt[], yTop: number, yBottom: number): [number, number] {
  let lo = -Infinity;
  let hi = Infinity;
  for (let k = 0; k <= 4; k++) {
    const s = span(pts, yTop + ((yBottom - yTop) * k) / 4);
    if (!s) return [C, C];
    lo = Math.max(lo, s[0]);
    hi = Math.min(hi, s[1]);
  }
  return [lo, hi];
}

export function extent(pts: Pt[]): { y0: number; y1: number; x0: number; x1: number } {
  const ys = pts.map((p) => p[1]);
  const xs = pts.map((p) => p[0]);
  return { y0: Math.min(...ys), y1: Math.max(...ys), x0: Math.min(...xs), x1: Math.max(...xs) };
}
