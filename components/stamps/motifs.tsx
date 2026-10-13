import type { ReactNode } from 'react';
import {
  Amphora,
  Anchor,
  Car,
  Castle,
  Church,
  Clover,
  Coffee,
  Drum,
  Fish,
  Flame,
  Flower,
  Flower2,
  Gem,
  Hop,
  type LucideIcon,
  MoonStar,
  Music,
  Panda,
  Piano,
  Rose,
  Sailboat,
  Ship,
  Star,
  Sunset,
  TramFront,
  TreePalm,
  TreePine,
  Turtle,
  Wheat,
  Wine,
  Bean,
  Bird,
  Leaf,
} from 'lucide-react';

// The picture in the middle of each country's stamp. Every motif is line art on
// Lucide's 24-unit grid — 2-unit round strokes, 2 units of padding — so the drawn
// landmarks and the Lucide icons read as one engraving style once they're inked.
// Lucide covers the generic subjects (a coffee cup, a ship); the landmarks no
// icon set has (torii, Petronas, Nyhavn) are drawn here.

const pt = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)].map((n) => Math.round(n * 100) / 100);
};

// Straight rays between two radii, `n` of them starting at `offset` degrees.
function rays(n: number, r0: number, r1: number, offset = 0, cx = 12, cy = 12): string {
  return Array.from({ length: n }, (_, i) => {
    const deg = offset + (360 / n) * i;
    const [x0, y0] = pt(cx, cy, r0, deg);
    const [x1, y1] = pt(cx, cy, r1, deg);
    return `M${x0} ${y0}L${x1} ${y1}`;
  }).join('');
}

// Mirrors a right-half outline about x=12 into a closed symmetric path.
function mirrored(right: [number, number][]): string {
  const left = [...right].reverse().map(([x, y]) => [24 - x, y] as [number, number]);
  return `M${[...right, ...left].map(([x, y]) => `${x} ${y}`).join('L')}Z`;
}

const DRAWN: Record<string, ReactNode> = {
  taj: (
    <>
      <path d="M2 21h20M6 21v-7h12v7M8 14c0-3 1.8-5 4-6 2.2 1 4 3 4 6M12 8V4.5" />
      <path d="M10.5 21v-3a1.5 1.5 0 0 1 3 0v3M3.5 21V10M20.5 21V10M2.7 10h1.6M19.7 10h1.6" />
    </>
  ),
  liberty: (
    <>
      <path d="M12 2c1.6 1.8 2.6 3.3 2.6 4.7a2.6 2.6 0 0 1-5.2 0C9.4 5.3 10.4 3.8 12 2z" />
      <path d="M8 9.5h8l-1.6 3H9.6zM10.6 12.5 11 21h2l.4-8.5M8.5 21h7" />
    </>
  ),
  'rice-terrace': (
    <>
      <path d="M2 21c4-1 7-1 10-3s6-2.5 10-2.5M2 16.5c3-1 6-1 8-3s5-2.5 8-2.5M2 12c2.5-1 5-1 6.5-3S12 6.5 14 6.5" />
      <circle cx="19" cy="5" r="2" />
    </>
  ),
  redeemer: (
    <>
      <circle cx="12" cy="4" r="1.6" />
      <path d="M3.5 8.5h17M10.6 7.5 9.6 18h4.8l-1-10.5M2 22c3.5-3.5 6.5-4 10-4s6.5.5 10 4" />
    </>
  ),
  'onion-dome': (
    <path d="M12 3c0 2.2-5 4-5 8.5a5 5 0 0 0 10 0C17 7 12 5.2 12 3zM12 3V1M10.8 1.8h2.4M7.5 16.5h9V22h-9zM11 22v-3h2v3" />
  ),
  torii: <path d="M2 4.5c4 1.4 16 1.4 20 0M4 9h16M6.5 5.6V22M17.5 5.6V22M12 6v3M5 22h3M16 22h3" />,
  cactus: (
    <path d="M10 22V6a2 2 0 0 1 4 0v16M10 15H8a2 2 0 0 1-2-2V9.5M14 12.5h2a2 2 0 0 0 2-2V7M5 22h14" />
  ),
  'sun-rays': (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d={rays(8, 5.6, 9.8)} />
      <path d={rays(8, 5.8, 7.6, 22.5)} strokeWidth={1.2} />
    </>
  ),
  'conical-hat': (
    <path d="M2 14h20L12 3.5zM6.5 14c1 3.4 3 5.5 5.5 5.5s4.5-2.1 5.5-5.5M9 9.5h6M7.2 11.8h9.6" />
  ),
  pyramids: (
    <>
      <path d="M1.5 20h21M2.5 20 9 9l7 11M12.6 14.3 15.5 10l5 10M9 9l1.6 11" />
      <circle cx="19" cy="4.5" r="1.8" />
    </>
  ),
  brandenburg: (
    <path d="M3 7.5h18M3 10h18M6.5 7.5V5h11v2.5M10.5 5V3h3v2M5 10v10M8.8 10v10M15.2 10v10M19 10v10M3 20h18" />
  ),
  tulip: (
    <path d="M8 4l2 3 2-3 2 3 2-3v5a4 4 0 0 1-8 0zM12 13v9M12 19.5c-3 0-5-1.8-5-4 3 0 5 1.8 5 4zM12 20.5c2.6 0 4.6-1.6 4.6-3.6-2.6 0-4.6 1.6-4.6 3.6z" />
  ),
  pomegranate: (
    <>
      <circle cx="12" cy="14" r="7" />
      <path d="M9.5 7.6 9 4l1.8 1.5L12 3.4l1.2 2.1L15 4l-.5 3.6M10 13.5h.01M14 15h.01M12 17.5h.01M11.5 11h.01" />
    </>
  ),
  'big-ben': (
    <>
      <path d="M8 22V9h8v13M8 9l1-2h6l1 2M9.5 7 12 2l2.5 5M10.5 16.5V20M13.5 16.5V20M6.5 22h11" />
      <circle cx="12" cy="12.4" r="2.1" />
    </>
  ),
  eiffel: (
    <path d="M6 22c2.2-4 4-8.5 5-14M18 22c-2.2-4-4-8.5-5-14M11 8l1-6 1 6M8 16h8M9.6 11h4.8M9 22a3 3 0 0 1 6 0" />
  ),
  chedi: (
    <path d="M4 22h16M6 22v-3h12v3M8 19v-3h8v3M9 16c0-3 1.4-4.6 3-5.6 1.6 1 3 2.6 3 5.6M12 10.4V2M10.8 8h2.4M11.2 5.5h1.6" />
  ),
  colosseum: (
    <path d="M2 21V9c0-2 4.5-3.5 10-3.5S22 7 22 9v12zM2 13.5h20M5 21v-3.5a1.5 1.5 0 0 1 3 0V21M10.5 21v-3.5a1.5 1.5 0 0 1 3 0V21M16 21v-3.5a1.5 1.5 0 0 1 3 0V21M5.5 10.5h.01M9.5 10h.01M14.5 10h.01M18.5 10.5h.01" />
  ),
  'hanok-roof': (
    <path d="M2 10c3 0 5-1.2 7-4h6c2 2.8 4 4 7 4M9 6h6M5 10.4V20M19 10.4V20M5 13h14M3 20h18M10 20v-4.5h4V20" />
  ),
  fan: (
    <path d="M12 19 3 10.5a12.5 12.5 0 0 1 18 0zM12 19 7.2 5.6M12 19V4.6M12 19l4.8-13.4M12 19v3M10 22h4" />
  ),
  'sun-face': (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d={rays(8, 6.2, 10)} />
      <path d={rays(8, 6.4, 8.4, 22.5)} strokeWidth={1.2} />
      <path d="M10.4 11h.01M13.6 11h.01M10.4 13.6c1 .8 2.2.8 3.2 0" strokeWidth={1.4} />
    </>
  ),
  'table-mountain': (
    <path d="M2 18l4-8h12l4 8M6.8 8.4c1-1.4 3-1.4 4 0 1-1.4 3.4-1.4 4.4 0M2 21.5c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1" />
  ),
  lantern: (
    <path d="M12 2v2M9 6h6l-3-2zM8 6h8l2 6-2 6H8l-2-6zM12 6v12M6.6 12h10.8M10 18l2 3.5 2-3.5" />
  ),
  petronas: (
    <path d="M5 22V9l2-3 2 3v13M15 22V9l2-3 2 3v13M7 6V2M17 6V2M9 13h6M10.5 13 12 15.5 13.5 13M5 12h4M15 12h4M5 16h4M15 16h4" />
  ),
  'maasai-shield': (
    <path d="M12 2.5c3.6 2.8 5 6.4 5 9.5s-1.4 6.7-5 9.5C8.4 18.7 7 15.1 7 12s1.4-6.7 5-9.5zM3 21 7.3 16.7M16.7 7.3 21 3M12 6.5v11M9.6 12h4.8" />
  ),
  dunes: (
    <>
      <path d="M2 19.5c3-4 6.5-4 9.5 0M8.5 16.5c3.5-5 8-6 13.5-1M2 21.5h20" />
      <circle cx="7" cy="7" r="2.6" />
    </>
  ),
  ziggurat: (
    <path d="M3 21h18M5 21v-4h14v4M7 17v-4h10v4M9 13V9h6v4M12 21V9M10.5 9V7h3v2" />
  ),
  'machu-picchu': (
    <path d="M2 20l6-11 3 4 3.5-8.5L22 20M2 21.5h20M4.5 17h5M14.5 17h5.5M6 14.5h3" />
  ),
  'ribbed-dome': (
    <path d="M6 13a6 6 0 0 1 12 0M12 7v6M9 8l1 5M15 8l-1 5M6 13h12v3H6zM4 22v-6h16v6M10 22v-3a2 2 0 0 1 4 0v3M12 7V4" />
  ),
  waterfall: (
    <path d="M2 7h7v15M22 9h-6v13M10.5 7v12M12.8 8v11M15 9v10M8.5 21.5c1.5-1 3-1 3.8 0s3 1 3.7 0" />
  ),
  stupa: (
    <path d="M5 22h14M7 22l1-3h8l1 3M8 19c0-4 2-6 4-7 2 1 4 3 4 7M12 12V2M10.5 10h3M11 7.5h2M10.8 4.5h2.4" />
  ),
  kilimanjaro: (
    <path d="M2 20 9 9h6l7 11zM9 9l1.5 2.5L12 10l1.5 1.5L15 9M2 21.8h20" />
  ),
  'opera-house': (
    <path d="M3 18c0-6 3-10 7-12-1 5-1 8 1 12M9 18c0-5 3-9 7-10-1 4 0 7 2 10M15 18c1-4 3-7 6-8 0 3 0 6-1 8M2 18h20M3 21h4M10 21h5M18 21h3" />
  ),
  windmill: (
    <path d="M9 22l1-12h4l1 12zM10 10l2-2 2 2M12 8 4.5 2.5M12 8l7.5-5.5M12 8l-6.5 6M12 8l6.5 6M11 22v-2.5h2V22" />
  ),
  baiterek: (
    <>
      <circle cx="12" cy="6" r="3" />
      <path d="M8.8 6.5C7.6 4.5 7.8 3 8.8 1.8M15.2 6.5c1.2-2 1-3.5 0-4.7M12 9v13M12 13.5 9 22M12 13.5l3 8.5M7 22h10" />
    </>
  ),
  'taipei-101': (
    <path
      d={`M8 22h8M10 22v-4h4v4${[18, 15, 12, 9]
        .map((y) => `M9 ${y}l1-2.6h4l1 2.6z`)
        .join('')}M11 6.4V4.5h2v1.9M12 4.5V1.5`}
    />
  ),
  kite: <path d="M12 2l6 7-6 9-6-9zM12 2v16M6 9h12M12 18c-1.2 1.4 1.2 2.2 0 4M10.4 20.2l1.2-.6M12.4 21.4l1.2-.6" />,
  'prayer-flags': (
    <path d="M2 21.5 9 10l4 5 3-3.5 6 10zM2 3.5c6 4 14 4 20 0M5.5 5.3v3.4l1.6-1M10 6.6V10l1.6-1M14 6.6V10l1.6-1M18.5 5.3v3.4l1.6-1" />
  ),
  moai: (
    <path d="M8 22V9c0-4 2-7 5-7s3 2 3 4v4l1 3-2 1v8M9 8h6M13 8v5h2M11 15.5h4M4 22h16" />
  ),
  football: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 8.4l3.4 2.5-1.3 4h-4.2l-1.3-4zM12 8.4V2.5M15.4 10.9l5.1-1.7M14.1 14.9l3 4.4M9.9 14.9l-3 4.4M8.6 10.9 3.5 9.2" />
    </>
  ),
  tikal: (
    <path d="M4 22h16M5 22l1-4h12l1 4M6.5 18l1-4h9l1 4M8 14l1-4h6l1 4M9.5 10V6h5v4M10.5 6V2.5h3V6M12 22v-4" />
  ),
  atomium: (
    <>
      <path d="M12 3 5 8v8l7 5 7-5V8zM12 12 5 8M12 12l7-4M12 12l-7 4M12 12l7 4M12 3v18" strokeWidth={1.2} />
      {[
        [12, 3],
        [5, 8],
        [19, 8],
        [12, 12],
        [5, 16],
        [19, 16],
        [12, 21],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.9" />
      ))}
    </>
  ),
  'dala-horse': (
    <path d="M4 10.5c0-1.2 1-2.5 2.2-2.5h8l3-4 2 .4 1.6 3.1-1.4 1-1.2-.9-1.2 3v3.2l-1 .8V21h-2v-5.2H8V21H6v-5.6c-1.3-.6-2-1.7-2-2.8zM8.5 10.6c1.2 1 3.6 1 4.8 0M10.9 8v-.01" />
  ),
  paprika: (
    <path d="M8 8c-3 2-3 7-1 10.5s5 4 7 3 4-5.2 3-9.5c-.6-2.5-2-4-4-4.4M11 6.8c0-2.3 1-3.4 3-4.6M8 8c1.5-1.5 4.5-2 6.4-1.4" />
  ),
  'tunis-door': (
    <path d="M5 22V10a7 7 0 0 1 14 0v12M8 22V11a4 4 0 0 1 8 0v11M3 22h18M10 14h.01M14 14h.01M10 18h.01M14 18h.01M12 10h.01" />
  ),
  wiphala: (
    <>
      <rect x="3" y="3" width="18" height="18" />
      {Array.from({ length: 16 }, (_, i) => {
        const r = Math.floor(i / 4);
        const c = i % 4;
        return (r + c) % 2 === 0 ? (
          <rect key={i} x={3 + c * 4.5} y={3 + r * 4.5} width="4.5" height="4.5" fill="currentColor" stroke="none" />
        ) : null;
      })}
    </>
  ),
  menorah: (
    <path d="M8 22h8M12 22V6M12 18c-5 0-7-3-7-8.5M12 18c5 0 7-3 7-8.5M12 15c-2.6 0-4-2-4-5.5M12 15c2.6 0 4-2 4-5.5M5 7V4.5M8 7V4.5M12 3.5V2M16 7V4.5M19 7V4.5" />
  ),
  burj: (
    <path d="M12 1.5V6M10 22V8l2-2 2 2v14M10 12H8v10M14 10h2v12M8 16H6v6M16 14.5h2V22M4 22h16" />
  ),
  bison: (
    <path d="M3 13c0-3 2-5.5 5-6.2 2.5-.6 4.5.2 6 1.2h4.2c1.6 0 2.8 1.6 2.8 3.4v1.6l-1.6.8V21h-2v-5h-6v5h-2v-4.4C7 17 6 16.6 5 15.8V21H3zM5.6 8.6 4.4 6.4M17.4 11.6h.01" />
  ),
  matterhorn: (
    <path d="M2 21 9 11.5l2.4-1.8L14 3l2.2 6.6L22 21zM11.4 9.7l2.2 2.2 1.6-1.4 1.4 1.4M2 21.8h20" />
  ),
  baobab: (
    <path d="M10 22c1-3 1-8 0-12h4c-1 4-1 9 0 12zM10 10 7 6.5M12 10V5.5M14 10l3-3.5M4 6.5c0-2 2-3 4-2.2.8-2 4-2.4 5-.4 1.2-1.6 4.2-1.4 5 .4 2-.8 4 .2 3 2.2M3 22h18" />
  ),
  petra: (
    <path d="M2 22V3h20v19M6 22v-7M10 22v-7M14 22v-7M18 22v-7M5 15l7-3 7 3zM9 11V7h6v4M10 7a2 2 0 0 1 4 0" />
  ),
  'junk-boat': (
    <path d="M3 17h18l-3 4H6zM12 17V3M12 4c3 1 5 3 6 6.5l-6 1M12 6.6l5 1.3M12 9l5.6.4M11 6c-2 1.5-4 4-5 8.5h5M11 9H8M11 12H7" />
  ),
  nyhavn: (
    <path d="M1 22h22M2 22V11.5l3-4 3 4V22M8 22V10h1.5V8H11V6h2v2h1.5v2H16v12M16 22v-9.5l3-3 3 3V22M5 14h.01M5 18h.01M12 12.5h.01M12 16.5h.01M19 15h.01M19 19h.01" />
  ),
  raspberry: (
    <>
      {[
        [10, 10],
        [14, 10],
        [8, 13.5],
        [12, 13.5],
        [16, 13.5],
        [10, 17],
        [14, 17],
        [12, 20],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />
      ))}
      <path d="M12 8V3M9 6.5c1-1.5 2-2 3-2s2 .5 3 2" />
    </>
  ),
  longship: (
    <path d="M2 15c2 4 5 5.5 10 5.5s8-1.5 10-5.5M2 15c-.5-3 .5-5 2.2-5.5M22 15c.5-3-.5-5-2.2-5.5M12 19V2.5M7 4h10v8H7zM10.3 4v8M13.7 4v8M6 17h.01M9 17.6h.01M15 17.6h.01M18 17h.01" />
  ),
  'marina-bay': (
    <path d="M5 22V8.5h3V22M10.5 22V8h3v14M16 22V8.5h3V22M3 6.5c5-1.2 13-1.2 18 0M2 22h20" />
  ),
  'double-cross': (
    <path d="M12 3v13.5M8.5 7h7M7 11h10M2 21c1.4-3 4.2-3 5.5 0M7.5 21c1.6-4.2 7.4-4.2 9 0M16.5 21c1.3-3 4.1-3 5.5 0" />
  ),
  koru: (
    <path d="M12 22v-8c0-5 4-9 8-8.5 2.2.3 2.6 3 0 4.5-2 1.1-4-.4-3.5-2.4M12 17.5c-3 0-6-2-6-5 0-2 2-3 3.5-2 1.2.8.5 2.5-1 2.3" />
  ),
  cedar: (
    <path d="M12 2.5 7 6.8h10zM12 6.5l-7 5h14zM12 10.5 3 16.5h18zM12 16.5V22M9 22h6" />
  ),
  harp: (
    <path d="M6 21V3M6 3c4 0 8 3 10 6s3 6 4 12M5 21h16M9 21V4.6M12 21V6.6M15 21V10M18 21v-6" />
  ),
  angkor: (
    <path d="M10 22V9c0-3 1-5 2-7 1 2 2 4 2 7v13M5 22v-8c0-2 .7-3.6 1.5-5 .8 1.4 1.5 3 1.5 5v8M16 22v-8c0-2 .7-3.6 1.5-5 .8 1.4 1.5 3 1.5 5v8M2 22h20M2 18h20" />
  ),
  tunduk: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="5.5" />
      <path d="M9.6 7v10M12 6.5v11M14.4 7v10M7 9.6h10M6.5 12h11M7 14.4h10" strokeWidth={1.2} />
    </>
  ),
  shibam: (
    <path d="M3 22V9h4v13M7 22V5.5h5V22M12 22V7.5h4V22M16 22V11h5v11M2 22h20M9.5 8.5h.01M9.5 12h.01M9.5 15.5h.01M14 10.5h.01M14 14h.01M5 12.5h.01M18.5 14h.01" />
  ),
  volcano: (
    <path d="M2 21l7-11h6l7 11zM9 10c1 1.2 5 1.2 6 0M11 7.5c-1-1.5 0-3 1-3.6M14 7.5c1-1.6 1-3.2 2-4.2M2 21.8h20" />
  ),
  'oxcart-wheel': (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="2.2" />
      <path d={rays(12, 2.2, 9.5)} strokeWidth={1.2} />
      <circle cx="12" cy="12" r="6" strokeDasharray="1.6 1.6" strokeWidth={1.4} />
    </>
  ),
  basketball: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5v19M5.3 5.3c2.6 2.6 2.6 10.8 0 13.4M18.7 5.3c-2.6 2.6-2.6 10.8 0 13.4" />
    </>
  ),
  'maple-leaf': (
    <path
      d={mirrored([
        [12, 2],
        [13.6, 5.3],
        [15.4, 4.6],
        [14.8, 9.2],
        [18, 5.8],
        [18.6, 7.7],
        [21, 7.2],
        [20, 10.4],
        [21.2, 11.1],
        [17, 14.7],
        [17.6, 16.3],
        [12.6, 15.8],
        [12.6, 22],
      ])}
    />
  ),
  'victoria-falls': (
    <path d="M2 6.5h20M2 9h7M15 9h7M9 9c1 3 1 7 0 10M12 9v10M15 9c-1 3-1 7 0 10M6 21c1-2 3-2 4 0 1-2 3-2 4 0 1-2 3-2 4 0M5 13.5l-1-1M19 13.5l1-1M5 17l-1.4-.2M19 17l1.4-.2" />
  ),
};

const LUCIDE: Record<string, LucideIcon> = {
  panda: Panda,
  drum: Drum,
  'moon-star': MoonStar,
  sailboat: Sailboat,
  coffee: Coffee,
  castle: Castle,
  orchid: Flower,
  wheat: Wheat,
  palm: TreePalm,
  'black-star': Star,
  'nile-sunset': Sunset,
  church: Church,
  tortoise: Turtle,
  'tea-leaf': Leaf,
  crane: Bird,
  cocoa: Bean,
  diamond: Gem,
  'damask-rose': Rose,
  hop: Hop,
  tram: TramFront,
  amphora: Amphora,
  merengue: Music,
  flame: Flame,
  piano: Piano,
  'classic-car': Car,
  'reef-fish': Fish,
  pine: TreePine,
  shamrock: Clover,
  'rose-valley': Flower2,
  wine: Wine,
  anchor: Anchor,
  'canal-ship': Ship,
};

export const MOTIF_IDS: string[] = [...Object.keys(DRAWN), ...Object.keys(LUCIDE)];

// Lucide's grid keeps 2 units of padding on every side; stamps want the art to
// fill its slot, so the viewport is cropped to the drawing area. Strokes on the
// very edge spill out by half their width, which overflow="visible" allows.
const CROP = '2 2 20 20';

// Places a motif in the stamp's 0–100 space as a nested 24-unit viewport, so
// both kinds keep their own coordinates and stroke weights scale with the size.
export function Motif({
  id,
  cx,
  cy,
  size,
  strokeWidth = 2,
}: {
  id: string;
  cx: number;
  cy: number;
  size: number;
  strokeWidth?: number;
}) {
  const x = cx - size / 2;
  const y = cy - size / 2;
  const Icon = LUCIDE[id];
  if (Icon) {
    return (
      <Icon
        x={x}
        y={y}
        width={size}
        height={size}
        viewBox={CROP}
        overflow="visible"
        strokeWidth={strokeWidth}
        color="currentColor"
        aria-hidden
      />
    );
  }
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox={CROP}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
      aria-hidden
    >
      {DRAWN[id]}
    </svg>
  );
}
