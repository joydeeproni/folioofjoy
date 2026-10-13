'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type SVGProps } from 'react';
import { PlaneLanding } from 'lucide-react';
import { BRAND, type BrandColor } from '@/lib/brand';
import type { CountryStamp as Spec, StampBorder, StampFace, StampShape } from '@/lib/stamps/catalog';
import { PIXEL, PIXEL_GAPS, SANS, SCRIPT_FONTS } from '@/components/about/stamp-fonts';
import { Motif } from './motifs';
import { InkFilter, hashSeed, type InkSettings } from './ink';
import { bandSpan, circlePts, extent, outline, toPath, type Pt } from './shapes';

// Renders one country's stamp from its catalog spec into a 0–100 viewBox.
// The spec picks a silhouette, a border, a layout, a motif and a typeface; this
// file turns those choices into geometry. All text is fitted to the room the
// silhouette leaves at its height, so long names compress instead of spilling.

const FLEX = "var(--font-google-sans-flex), 'Google Sans Flex', system-ui, sans-serif";

interface Face {
  family: string;
  weight: number;
  settings?: string;
  /** Letter-spacing, em. */
  track: number;
}

const FACES: Record<StampFace, Face> = {
  pixel: { family: PIXEL, weight: 400, track: 0.06 },
  praktikal: { family: "'Praktikal', monospace", weight: 700, track: 0.05 },
  wide: { family: FLEX, weight: 720, settings: '"wdth" 125, "GRAD" 0, "ROND" 0', track: 0.02 },
  condensed: { family: FLEX, weight: 640, settings: '"wdth" 58, "GRAD" 0, "ROND" 0', track: 0.06 },
  serif: { family: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif", weight: 700, track: 0.07 },
};

// Each border is a stack of strokes at given insets; `content` is where the
// stamp's interior begins.
const BORDERS: Record<StampBorder, { lines: { inset: number; w: number; dash?: string; round?: boolean }[]; content: number }> = {
  single: { lines: [{ inset: 1.2, w: 2.4 }], content: 4.5 },
  double: { lines: [{ inset: 0.9, w: 1.8 }, { inset: 4, w: 0.9 }], content: 6.5 },
  heavy: { lines: [{ inset: 1.9, w: 3.8 }, { inset: 6, w: 0.9 }], content: 8.5 },
  dashed: { lines: [{ inset: 0.9, w: 1.8, dash: '3.4 2' }, { inset: 3.8, w: 0.8 }], content: 6 },
  beaded: { lines: [{ inset: 0.8, w: 1.5 }, { inset: 4, w: 2, dash: '0 3.1', round: true }], content: 7 },
  ticks: { lines: [{ inset: 0.8, w: 1.5 }, { inset: 3.6, w: 3, dash: '0.6 1.5' }, { inset: 5.8, w: 0.7 }], content: 7.5 },
};

const LABELS = ['ARRIVAL', 'ADMITTED', 'ENTRY', 'VISITOR', 'ARRIVED', 'GUEST'];

// ---------- text ----------

// Shrinks a line to `maxW` only when it's actually too long, measured in the
// browser after the fonts land — estimating widths across a dozen scripts and
// five faces is a losing game, so we don't.
//
// Measurements are batched: every pending line is reset, then all are read,
// then all are written. Interleaving a write and a read per line forces a full
// layout each time, which with a page of stamps is quadratic and takes minutes.
const live = new Map<SVGTextContentElement, number>();
const pending = new Map<SVGTextContentElement, number>();
let scheduled = false;
let watchingFonts = false;

function flushFits() {
  scheduled = false;
  const items = [...pending];
  pending.clear();
  for (const [el] of items) {
    el.removeAttribute('textLength');
    el.removeAttribute('lengthAdjust');
  }
  const widths = items.map(([el]) => (el.isConnected ? el.getComputedTextLength() : 0));
  items.forEach(([el, maxW], i) => {
    if (widths[i] > maxW) {
      el.setAttribute('textLength', String(maxW));
      el.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
  });
}

function queueFit(el: SVGTextContentElement, maxW: number) {
  pending.set(el, maxW);
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(flushFits);
}

// Script faces (Noto, Kefa, Sangam…) arrive one by one as each stamp asks for
// them, long after fonts.ready first resolved — so every arrival re-fits
// everything on screen.
function watchFonts() {
  if (watchingFonts || !document.fonts) return;
  watchingFonts = true;
  document.fonts.addEventListener('loadingdone', () => {
    for (const [el, maxW] of live) queueFit(el, maxW);
  });
}

function useFit(ref: React.RefObject<SVGTextContentElement | null>, maxW: number, key: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    watchFonts();
    live.set(el, maxW);
    queueFit(el, maxW);
    return () => {
      live.delete(el);
      pending.delete(el);
    };
  }, [ref, maxW, key]);
}

type TextProps = Omit<SVGProps<SVGTextElement>, 'ref'> & { maxW: number; children: string };

function Fit({ maxW, children, ...rest }: TextProps) {
  const ref = useRef<SVGTextElement>(null);
  useFit(ref, maxW, children + String(rest.fontSize) + JSON.stringify(rest.style));
  return (
    <text ref={ref} {...rest}>
      {children}
    </text>
  );
}

function FitPath({
  href,
  maxW,
  children,
  ...rest
}: Omit<SVGProps<SVGTextElement>, 'ref'> & { href: string; maxW: number; children: string }) {
  const ref = useRef<SVGTextPathElement>(null);
  useFit(ref, maxW, children + String(rest.fontSize));
  return (
    <text {...rest}>
      <textPath ref={ref} href={href} startOffset="50%" textAnchor="middle">
        {children}
      </textPath>
    </text>
  );
}

function latin(face: Face, text: string): CSSProperties {
  // Geist Pixel has no Vietnamese Ệ; switch the whole line rather than mix faces.
  const family = face.family === PIXEL && PIXEL_GAPS.test(text) ? SANS : face.family;
  return {
    fontFamily: family,
    fontWeight: face.weight,
    fontVariationSettings: family === FLEX ? face.settings : undefined,
    letterSpacing: `${face.track}em`,
  };
}

// The greeting uses the stamp's face when it's Latin, otherwise the script tier.
function hello(spec: Spec, face: Face): { style: CSSProperties; scale: number; rtl: boolean } {
  if (spec.font === 'pixel') return { style: latin(face, spec.hello), scale: 1, rtl: false };
  const tier = SCRIPT_FONTS[spec.font];
  return {
    style: { fontFamily: tier.family, fontWeight: 700, letterSpacing: `${tier.tracking / 10}em` },
    scale: tier.scale,
    rtl: !!tier.rtl,
  };
}

function formatDate(d: Date, kind: 'long' | 'short' | 'dots'): string {
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mon = d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }).toUpperCase();
  const yyyy = d.getUTCFullYear();
  if (kind === 'dots') return `${dd}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${yyyy}`;
  if (kind === 'short') return `${dd} ${mon} ${String(yyyy).slice(2)}`;
  return `${dd} ${mon} ${yyyy}`;
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const a = (Math.PI / 5) * k - Math.PI / 2;
    const rr = k % 2 ? r * 0.42 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`;
  });
  return <polygon points={pts.join(' ')} />;
}

// ---------- layouts ----------

interface Ctx {
  spec: Spec;
  face: Face;
  uid: string;
  date: Date;
  label: string;
  serial: string;
  /** The interior polygon, inside the border. */
  inner: Pt[];
  k: number;
}

const pad = 2.5;

// Usable width for a line whose baseline is `y` and cap height ~0.72·size.
function room(inner: Pt[], y: number, size: number, inset = pad): [number, number] {
  const [a, b] = bandSpan(inner, y - size * 0.78, y + size * 0.12);
  return [a + inset, b - inset];
}

function Rule({ inner, y, inset = pad, w = 0.8 }: { inner: Pt[]; y: number; inset?: number; w?: number }) {
  const [a, b] = room(inner, y, 0.5, inset);
  return <line x1={a} x2={b} y1={y} y2={y} stroke="currentColor" strokeWidth={w} />;
}

function Centered({ inner, y, size, text, style, rtl, widthFactor = 1 }: {
  inner: Pt[];
  y: number;
  size: number;
  text: string;
  style: CSSProperties;
  rtl?: boolean;
  widthFactor?: number;
}) {
  const [a, b] = room(inner, y, size);
  const w = (b - a) * widthFactor;
  return (
    <Fit x={(a + b) / 2} y={y} fontSize={size} textAnchor="middle" direction={rtl ? 'rtl' : undefined} style={style} maxW={Math.max(w, 4)}>
      {text}
    </Fit>
  );
}

// Round stamps: greeting arcs over the top, place under the bottom, motif and
// date in the middle — the classic cancellation ring. Also used, smaller, as
// the ring of the postmark layout.
function Ring({
  c,
  cx,
  cy,
  ro,
  top,
  bottom,
  center,
  innerShape,
}: {
  c: Ctx;
  cx: number;
  cy: number;
  ro: number;
  top: { text: string; style: CSSProperties; scale: number; rtl?: boolean };
  bottom: { text: string; style: CSSProperties };
  center: ReactNode;
  innerShape?: Pt[];
}) {
  const band = Math.max(9.5, ro * 0.3);
  const ri = ro - band;
  const rt = ri + band * 0.2;
  const rb = ro - band * 0.2;
  const topId = `${c.uid}-top`;
  const botId = `${c.uid}-bot`;
  const size = band * 0.66;
  const rm = (ri + ro) / 2;
  return (
    <>
      <defs>
        <path id={topId} d={`M ${cx - rt},${cy} A ${rt},${rt} 0 0 1 ${cx + rt},${cy}`} />
        <path id={botId} d={`M ${cx - rb},${cy} A ${rb},${rb} 0 0 0 ${cx + rb},${cy}`} />
      </defs>
      <path d={toPath(innerShape ?? circlePts(cx, cy, ri))} fill="none" stroke="currentColor" strokeWidth={0.9} />
      <FitPath
        href={`#${topId}`}
        fontSize={size * top.scale}
        direction={top.rtl ? 'rtl' : undefined}
        style={top.style}
        maxW={Math.PI * rt * 0.7}
      >
        {top.text}
      </FitPath>
      <FitPath href={`#${botId}`} fontSize={size * 0.86} style={bottom.style} maxW={Math.PI * rb * 0.62}>
        {bottom.text}
      </FitPath>
      <Star cx={cx - rm} cy={cy} r={band * 0.2} />
      <Star cx={cx + rm} cy={cy} r={band * 0.2} />
      {center}
    </>
  );
}

function RingLayout(c: Ctx) {
  const { spec, face } = c;
  const ro = 47 - c.k;
  const h = hello(spec, face);
  const ri = ro - Math.max(9.5, ro * 0.3);
  return (
    <Ring
      c={c}
      cx={50}
      cy={50}
      ro={ro}
      innerShape={spec.shape === 'octagon' ? outline('octagon', 47 - ri) : undefined}
      top={{ text: spec.hello, style: h.style, scale: h.scale, rtl: h.rtl }}
      bottom={{ text: spec.place, style: latin(face, spec.place) }}
      center={
        <>
          <Motif id={spec.motif} cx={50} cy={50 - ri * 0.16} size={ri * 1.08} />
          <Fit x={50} y={50 + ri * 0.72} fontSize={ri * 0.17} textAnchor="middle" style={latin(face, '')} maxW={ri * 1.2}>
            {formatDate(c.date, 'long')}
          </Fit>
        </>
      }
    />
  );
}

function wave(x0: number, x1: number, y: number, amp: number, len: number): string {
  let d = `M${x0} ${y}`;
  for (let x = x0; x < x1; x += len) {
    const xe = Math.min(x + len, x1);
    d += `Q${x + len / 4} ${y - amp} ${x + len / 2} ${y}T${xe} ${y}`;
  }
  return d;
}

// RTL note: with direction="rtl", text-anchor "start" is the right-hand edge, so
// right-to-left greetings keep the default anchor and move x to the right side.
function PostmarkLayout(c: Ctx) {
  const { spec, face } = c;
  const cx = 28;
  const R = 27;
  const b = BORDERS[spec.border];
  const ro = R - b.content + 1.5;
  const ri = ro - Math.max(9.5, ro * 0.3);
  const h = hello(spec, face);
  return (
    <>
      {b.lines.map((l, i) => (
        <path
          key={i}
          d={toPath(circlePts(cx, 50, R - l.inset))}
          fill="none"
          stroke="currentColor"
          strokeWidth={l.w}
          strokeDasharray={l.dash}
          strokeLinecap={l.round ? 'round' : undefined}
        />
      ))}
      <Ring
        c={c}
        cx={cx}
        cy={50}
        ro={ro}
        top={{ text: spec.place, style: latin(face, spec.place), scale: 1 }}
        bottom={{ text: `${spec.port} · ${c.serial}`, style: latin(face, '') }}
        center={
          <>
            <Motif id={spec.motif} cx={cx} cy={50 - ri * 0.2} size={ri * 1} />
            <Fit x={cx} y={50 + ri * 0.62} fontSize={ri * 0.24} textAnchor="middle" style={latin(face, '')} maxW={ri * 1.5}>
              {formatDate(c.date, 'short')}
            </Fit>
          </>
        }
      />
      <g fill="none" stroke="currentColor" strokeWidth={1.3}>
        {[30, 36, 42, 58, 64, 70].map((y) => (
          <path key={y} d={wave(cx + R + 3, 98, y, 1.7, 9)} />
        ))}
      </g>
      <Fit
        x={h.rtl ? 98 : cx + R + 3}
        y={53.6}
        fontSize={10 * h.scale}
        direction={h.rtl ? 'rtl' : undefined}
        style={h.style}
        maxW={98 - (cx + R + 3)}
      >
        {spec.hello}
      </Fit>
    </>
  );
}

// Vertical fractions [place, motif, greeting, date] — pointed silhouettes pull
// the top and bottom lines inward to where there's room.
const EMBLEM_Y: Partial<Record<StampShape, [number, number, number, number]>> = {
  diamond: [0.26, 0.42, 0.66, 0.8],
  shield: [0.13, 0.38, 0.66, 0.8],
  arch: [0.2, 0.43, 0.72, 0.88],
  circle: [0.19, 0.42, 0.72, 0.86],
  seal: [0.19, 0.42, 0.72, 0.86],
  oval: [0.2, 0.43, 0.72, 0.87],
  hexagon: [0.16, 0.41, 0.72, 0.88],
  octagon: [0.15, 0.41, 0.72, 0.88],
};

function EmblemLayout(c: Ctx) {
  const { spec, face, inner } = c;
  const { y0, y1 } = extent(inner);
  const H = y1 - y0;
  const [fp, fm, fh, fd] = EMBLEM_Y[spec.shape] ?? [0.14, 0.4, 0.72, 0.89];
  const small = Math.min(Math.max(H * 0.072, 4.2), 6.2);
  const h = hello(spec, face);
  const my = y0 + H * fm;
  const [ma, mb] = room(inner, my + H * 0.1, H * 0.2, 0);
  // The motif must clear the greeting's cap height below it.
  const gap = H * (fh - fm) - Math.min(Math.max(H * 0.15, 7), 13) * 0.8;
  const msize = Math.min(H * 0.4, (mb - ma) * 0.72, (gap - 1) * 2);
  return (
    <>
      <Centered inner={inner} y={y0 + H * fp} size={small} text={spec.place} style={latin(face, spec.place)} />
      <Motif id={spec.motif} cx={50} cy={my} size={msize} />
      <Centered
        inner={inner}
        y={y0 + H * fh}
        size={Math.min(Math.max(H * 0.15, 7), 13) * h.scale}
        text={spec.hello}
        style={h.style}
        rtl={h.rtl}
        widthFactor={0.94}
      />
      <Centered inner={inner} y={y0 + H * fd} size={small * 0.86} text={formatDate(c.date, 'long')} style={latin(face, '')} />
    </>
  );
}

const BOXY = new Set<StampShape>(['rect', 'tall', 'square', 'rounded', 'postage', 'ticket']);

function StackLayout(c: Ctx) {
  const { spec, face, inner } = c;
  const { y0, y1 } = extent(inner);
  const H = y1 - y0;
  const h = hello(spec, face);
  const small = Math.min(Math.max(H * 0.068, 4), 6);
  // Rectangular stamps read cleaner without the hairlines; the rules only help
  // shapes whose edges don't already frame the text.
  const rules = !BOXY.has(spec.shape);
  return (
    <>
      <Motif id={spec.motif} cx={50} cy={y0 + H * 0.17} size={H * 0.22} />
      <Centered inner={inner} y={y0 + H * 0.38} size={small} text={spec.place} style={latin(face, spec.place)} />
      {rules && <Rule inner={inner} y={y0 + H * 0.43} />}
      <Centered
        inner={inner}
        y={y0 + H * 0.6}
        size={Math.min(Math.max(H * 0.15, 7), 14) * h.scale}
        text={spec.hello}
        style={h.style}
        rtl={h.rtl}
      />
      {rules && <Rule inner={inner} y={y0 + H * 0.67} />}
      <Centered inner={inner} y={y0 + H * 0.79} size={small} text={formatDate(c.date, 'long')} style={latin(face, '')} />
      <Centered
        inner={inner}
        y={y0 + H * 0.9}
        size={small * 0.78}
        text={`${c.label} · ${spec.port} · ${c.serial}`}
        style={latin(face, '')}
      />
    </>
  );
}

function BannerLayout(c: Ctx) {
  const { spec, face, inner, uid } = c;
  const { y0, y1 } = extent(inner);
  const H = y1 - y0;
  const h = hello(spec, face);
  const bandC = y0 + H * 0.56;
  const bandH = H * 0.25;
  const size = Math.min(bandH * 0.62, 13) * h.scale;
  const [a, b] = room(inner, bandC + size * 0.35, size, 3);
  const my = y0 + H * 0.24;
  const msize = H * 0.36;
  const [sa, sb] = room(inner, my + 2, 4.5, 3);
  const flank = sb - sa > msize + 26;
  const small = Math.min(Math.max(H * 0.07, 4), 6);
  return (
    <>
      <defs>
        <clipPath id={`${uid}-clip`}>
          <path d={toPath(inner)} />
        </clipPath>
        <mask id={`${uid}-band`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect x="0" y={bandC - bandH / 2} width="100" height={bandH} fill="#fff" />
          <Fit
            x={(a + b) / 2}
            y={bandC + size * 0.35}
            fontSize={size}
            textAnchor="middle"
            direction={h.rtl ? 'rtl' : undefined}
            style={h.style}
            fill="#000"
            maxW={b - a}
          >
            {spec.hello}
          </Fit>
        </mask>
      </defs>
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="0" y={bandC - bandH / 2} width="100" height={bandH} mask={`url(#${uid}-band)`} />
      </g>
      <Motif id={spec.motif} cx={50} cy={my} size={msize} />
      {flank && (
        <>
          <Fit x={sa} y={my + 2} fontSize={4.5} style={latin(face, '')} maxW={(sb - sa - msize) / 2 - 3}>
            {spec.port}
          </Fit>
          <Fit x={sb} y={my + 2} fontSize={4.5} textAnchor="end" style={latin(face, '')} maxW={(sb - sa - msize) / 2 - 3}>
            {c.serial}
          </Fit>
        </>
      )}
      <Centered inner={inner} y={y0 + H * 0.8} size={small} text={spec.place} style={latin(face, spec.place)} />
      <Centered inner={inner} y={y0 + H * 0.91} size={small * 0.8} text={formatDate(c.date, 'dots')} style={latin(face, '')} />
    </>
  );
}

function GridLayout(c: Ctx) {
  const { spec, face, inner } = c;
  const { y0, y1, x0, x1 } = extent(inner);
  const H = y1 - y0;
  const W = x1 - x0;
  const s = Math.min(H, W * 0.72);
  const h = hello(spec, face);
  const L = x0 + 3;
  const R = x1 - 3;
  const top = y0 + H * 0.26;
  const bot = y0 + H * 0.74;
  const div = L + Math.min(s * 0.46, W * 0.36);
  const small = Math.min(Math.max(s * 0.085, 4.2), 6.4);
  const headY = y0 + H * 0.17;
  const footY = y0 + H * 0.9;
  const cell = R - div - 3;
  return (
    <>
      <Fit x={L} y={headY} fontSize={small} style={latin(face, spec.place)} maxW={(R - L) * 0.68}>
        {spec.place}
      </Fit>
      <Fit x={R} y={headY} fontSize={small} textAnchor="end" style={latin(face, '')} maxW={(R - L) * 0.28}>
        {spec.port}
      </Fit>
      <Motif id={spec.motif} cx={(L + div) / 2} cy={(top + bot) / 2} size={Math.min(div - L - 1, bot - top - 1)} />
      <Fit x={div + 3} y={top + (bot - top) * 0.3} fontSize={small * 0.8} style={latin(face, '')} maxW={cell}>
        {c.label}
      </Fit>
      <Fit
        x={h.rtl ? R : div + 3}
        y={top + (bot - top) * 0.78}
        fontSize={Math.min(s * 0.17, 13) * h.scale}
        direction={h.rtl ? 'rtl' : undefined}
        style={h.style}
        maxW={cell}
      >
        {spec.hello}
      </Fit>
      <Fit x={L} y={footY} fontSize={small} style={latin(face, '')} maxW={(R - L) * 0.6}>
        {formatDate(c.date, 'dots')}
      </Fit>
      <Fit x={R} y={footY} fontSize={small} textAnchor="end" style={latin(face, '')} maxW={(R - L) * 0.36}>
        {c.serial}
      </Fit>
    </>
  );
}

function PortLayout(c: Ctx) {
  const { spec, face, inner } = c;
  const { y0, y1 } = extent(inner);
  const H = y1 - y0;
  const h = hello(spec, face);
  const codeY = y0 + H * 0.6;
  const codeSize = H * 0.3;
  const [a, b] = room(inner, codeY, codeSize, 3);
  const icon = codeSize * 1.1;
  const dateY = y0 + H * 0.79;
  const dateSize = Math.min(H * 0.085, 6);
  const [da, db] = room(inner, dateY, dateSize, 8);
  const boxW = Math.min(db - da, 46);
  const small = Math.min(H * 0.065, 5);
  return (
    <>
      <Centered
        inner={inner}
        y={y0 + H * 0.24}
        size={Math.min(H * 0.15, 11) * h.scale}
        text={spec.hello}
        style={h.style}
        rtl={h.rtl}
      />
      <Motif id={spec.motif} cx={a + icon / 2} cy={codeY - codeSize * 0.36} size={icon} />
      <Fit
        x={50}
        y={codeY}
        fontSize={codeSize}
        textAnchor="middle"
        style={{ ...latin(face, ''), letterSpacing: '0.04em' }}
        maxW={b - a - icon * 2 - 4}
      >
        {spec.port}
      </Fit>
      <PlaneLanding
        x={b - icon}
        y={codeY - codeSize * 0.36 - icon / 2}
        width={icon}
        height={icon}
        strokeWidth={2}
        color="currentColor"
        aria-hidden
      />
      <rect
        x={50 - boxW / 2}
        y={dateY - dateSize * 1.15}
        width={boxW}
        height={dateSize * 1.65}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
      />
      <Fit x={50} y={dateY} fontSize={dateSize} textAnchor="middle" style={latin(face, '')} maxW={boxW - 3}>
        {formatDate(c.date, 'short')}
      </Fit>
      <Centered
        inner={inner}
        y={y0 + H * 0.95}
        size={small}
        text={`${spec.place} · ${c.label}`}
        style={latin(face, spec.place)}
      />
    </>
  );
}

const LAYOUTS = {
  ring: RingLayout,
  postmark: PostmarkLayout,
  emblem: EmblemLayout,
  stack: StackLayout,
  banner: BannerLayout,
  grid: GridLayout,
  port: PortLayout,
};

// ---------- stamp ----------

export interface CountryStampProps {
  spec: Spec;
  /** Overrides the catalog's ink colour. */
  color?: BrandColor;
  /** ISO date printed on the stamp. */
  at?: string;
  /** Varies the press — pressure, speckle, double strike. */
  seed?: number;
  /** false renders clean vector art, for comparing against the inked press. */
  inked?: boolean;
  ink?: InkSettings;
  className?: string;
  style?: CSSProperties;
}

export function CountryStampArt(props: CountryStampProps) {
  // Client-only: the geometry is trig-heavy and the text is fitted by measuring
  // in the browser, so a server render could never match the hydrated one.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <svg viewBox="0 0 100 100" className={props.className} style={props.style} aria-hidden />;
  return <Stamp {...props} />;
}

function Stamp({ spec, color, at, seed = 0, inked = true, ink, className, style }: CountryStampProps) {
  const uid = `cs${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const hex = BRAND[color ?? spec.ink];
  const face = FACES[spec.face];
  const border = BORDERS[spec.border];
  const press = hashSeed(`${spec.code}:${seed}`);
  // About one press in six lands twice, slightly offset — the faint ghost of a
  // stamp that bounced.
  const ghost = inked && press % 6 === 0;
  const date = at ? new Date(at) : new Date();
  const ctx: Ctx = {
    spec,
    face,
    uid,
    date,
    label: LABELS[hashSeed(spec.code) % LABELS.length],
    serial: `NO ${String(spec.rank).padStart(3, '0')}`,
    k: border.content,
    inner: outline(spec.shape, border.content + 1),
  };
  const Layout = LAYOUTS[spec.layout];
  const showsOutline = spec.layout !== 'postmark';

  const art = (
    <>
      {showsOutline &&
        border.lines.map((l, i) => (
          <path
            key={i}
            d={toPath(outline(spec.shape, l.inset))}
            fill="none"
            stroke="currentColor"
            strokeWidth={l.w}
            strokeDasharray={l.dash}
            strokeLinecap={l.round ? 'round' : undefined}
            strokeLinejoin="round"
          />
        ))}
      <Layout {...ctx} />
    </>
  );

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ overflow: 'visible', ...style }}
      role="img"
      aria-label={`${spec.line}, ${formatDate(date, 'long')}`}
    >
      <defs>{inked && <InkFilter id={`${uid}-ink`} seed={press} ink={ink} />}</defs>
      <g color={hex} fill="currentColor" filter={inked ? `url(#${uid}-ink)` : undefined}>
        {ghost && (
          <g transform="translate(0.9 -0.7)" opacity={0.2}>
            {art}
          </g>
        )}
        {art}
      </g>
    </svg>
  );
}
