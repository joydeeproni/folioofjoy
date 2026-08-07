'use client';

import { useMemo, useState } from 'react';
import { useDialKit } from 'dialkit';
import { GuestbookStamp, StampDefs } from '@/components/about/guestbook-stamp';
import { Notebook } from '@/components/about/notebook';
import { GREETINGS, greetingFor, type StampFont } from '@/lib/guestbook/greetings';
import { STAMP_DEFAULTS, NOTEBOOK_DEFAULTS, type NotebookDesign, type StampDesign } from '@/lib/guestbook/design';
import { BRAND_ORDER, type BrandColor } from '@/lib/brand';
import { STAMP_STYLES, type Stamp, type StampStyle } from '@/lib/guestbook/types';

const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.5)';
const RULE = 'rgba(237,234,224,0.14)';

// One representative country per font tier, so every branch of SCRIPT_FONTS is
// on screen at once — that's the whole point of the lab. If a script renders as
// tofu on your machine, you'll see it here rather than after someone stamps it.
const TIER_SAMPLES: { font: StampFont; country: string }[] = [
  { font: 'pixel', country: 'DK' },
  { font: 'sans', country: 'RU' },
  { font: 'devanagari', country: 'IN' },
  { font: 'bengali', country: 'BD' },
  { font: 'sinhala', country: 'LK' },
  { font: 'japanese', country: 'JP' },
  { font: 'han', country: 'CN' },
  { font: 'hangul', country: 'KR' },
  { font: 'thai', country: 'TH' },
  { font: 'hebrew', country: 'IL' },
  { font: 'arabic', country: 'SA' },
  { font: 'greek', country: 'GR' },
];

const AT = '2026-08-07T00:00:00.000Z';

function makeStamp(country: string, i: number, color?: BrandColor, style: StampStyle = 'postal'): Stamp {
  const g = greetingFor(country);
  return {
    id: `lab-${country}`,
    page: 1,
    x: 0.5,
    y: 0.5,
    rot: 0,
    color: color ?? BRAND_ORDER[i % BRAND_ORDER.length],
    country,
    hello: g.hello,
    place: g.place,
    line: g.line,
    font: g.font,
    style,
    at: AT,
  };
}

export function StampLab() {
  const [tab, setTab] = useState<'tiers' | 'countries' | 'notebook' | 'styles'>('styles');
  // Which of the three designs the grids render. The notebook tab always mixes all
  // three, since that's what a real spread looks like.
  const [style, setStyle] = useState<StampStyle>('passport');

  // ---- Stamp geometry ----
  const geo = useDialKit('Stamp · geometry', {
    outerR: [STAMP_DEFAULTS.outerR, 30, 50, 0.5],
    outerW: [STAMP_DEFAULTS.outerW, 0.2, 4, 0.1],
    innerR: [STAMP_DEFAULTS.innerR, 20, 46, 0.5],
    innerW: [STAMP_DEFAULTS.innerW, 0.2, 4, 0.1],
    topArcR: [STAMP_DEFAULTS.topArcR, 26, 48, 0.5],
    bottomArcR: [STAMP_DEFAULTS.bottomArcR, 26, 48, 0.5],
  }) as unknown as Pick<StampDesign, 'outerR' | 'outerW' | 'innerR' | 'innerW' | 'topArcR' | 'bottomArcR'>;

  const type = useDialKit('Stamp · type', {
    arcSize: [STAMP_DEFAULTS.arcSize, 5, 16, 0.2],
    placeSize: [STAMP_DEFAULTS.placeSize, 5, 16, 0.2],
    dateSize: [STAMP_DEFAULTS.dateSize, 4, 14, 0.2],
    dateY: [STAMP_DEFAULTS.dateY, 44, 60, 0.2],
    ruleGap: [STAMP_DEFAULTS.ruleGap, 3, 16, 0.5],
    ruleInset: [STAMP_DEFAULTS.ruleInset, 10, 42, 1],
    ruleW: [STAMP_DEFAULTS.ruleW, 0.2, 3, 0.1],
  }) as unknown as Pick<StampDesign, 'arcSize' | 'placeSize' | 'dateSize' | 'dateY' | 'ruleGap' | 'ruleInset' | 'ruleW'>;

  const ink = useDialKit('Stamp · ink', {
    inkFreq: [STAMP_DEFAULTS.inkFreq, 0.05, 2, 0.01],
    inkOctaves: [STAMP_DEFAULTS.inkOctaves, 1, 6, 1],
    inkScale: [STAMP_DEFAULTS.inkScale, 0, 6, 0.1],
    textInkFreq: [STAMP_DEFAULTS.textInkFreq, 0.05, 2, 0.01],
    textInkScale: [STAMP_DEFAULTS.textInkScale, 0, 4, 0.05],
    opacity: [STAMP_DEFAULTS.opacity, 0.2, 1, 0.01],
    sizePct: [STAMP_DEFAULTS.sizePct, 8, 40, 0.5],
    blend: {
      type: 'select' as const,
      options: ['screen', 'normal', 'multiply', 'plus-lighter', 'overlay', 'hard-light'],
      default: STAMP_DEFAULTS.blend,
    },
  }) as unknown as Pick<
    StampDesign,
    'inkFreq' | 'inkOctaves' | 'inkScale' | 'textInkFreq' | 'textInkScale' | 'opacity' | 'sizePct' | 'blend'
  >;

  // ---- Notebook ----
  const nb = useDialKit('Notebook', {
    leafAspect: [NOTEBOOK_DEFAULTS.leafAspect, 0.45, 1.2, 0.01],
    perspective: [NOTEBOOK_DEFAULTS.perspective, 400, 4000, 50],
    tiltX: [NOTEBOOK_DEFAULTS.tiltX, -20, 30, 0.5],
    leafRotY: [NOTEBOOK_DEFAULTS.leafRotY, 0, 20, 0.25],
    cornerRadius: [NOTEBOOK_DEFAULTS.cornerRadius, 0, 40, 1],
    dotPitch: [NOTEBOOK_DEFAULTS.dotPitch, 8, 48, 1],
    dotRadius: [NOTEBOOK_DEFAULTS.dotRadius, 0.4, 4, 0.05],
    dotOpacity: [NOTEBOOK_DEFAULTS.dotOpacity, 0, 0.6, 0.01],
    pageColor: { type: 'color' as const, default: NOTEBOOK_DEFAULTS.pageColor },
    gutterWidth: [NOTEBOOK_DEFAULTS.gutterWidth, 0, 40, 0.5],
    gutterDark: [NOTEBOOK_DEFAULTS.gutterDark, 0, 1, 0.01],
    spineHighlight: [NOTEBOOK_DEFAULTS.spineHighlight, 0, 0.4, 0.005],
    stackCount: [NOTEBOOK_DEFAULTS.stackCount, 0, 8, 1],
    stackOffset: [NOTEBOOK_DEFAULTS.stackOffset, 0, 16, 0.5],
    shadowBlur: [NOTEBOOK_DEFAULTS.shadowBlur, 0, 160, 2],
    shadowOpacity: [NOTEBOOK_DEFAULTS.shadowOpacity, 0, 1, 0.01],
    shadowY: [NOTEBOOK_DEFAULTS.shadowY, -40, 80, 1],
    turnDuration: [NOTEBOOK_DEFAULTS.turnDuration, 0.2, 2.5, 0.05],
  }) as unknown as NotebookDesign;

  const stampDesign: StampDesign = useMemo(
    () => ({ ...STAMP_DEFAULTS, ...geo, ...type, ...ink }),
    [geo, type, ink],
  );
  const notebookDesign: NotebookDesign = useMemo(() => ({ ...NOTEBOOK_DEFAULTS, ...nb }), [nb]);

  const tierStamps = useMemo(
    () => TIER_SAMPLES.map((t, i) => makeStamp(t.country, i, undefined, style)),
    [style],
  );
  const allStamps = useMemo(
    () => Object.keys(GREETINGS).map((c, i) => makeStamp(c, i, undefined, style)),
    [style],
  );
  // Side-by-side of the three designs in all four brand colours.
  const styleMatrix = useMemo(
    () =>
      STAMP_STYLES.flatMap((st) =>
        BRAND_ORDER.map((c, i) => ({
          ...makeStamp(['DK', 'IN', 'JP', 'GR'][i], i, c, st),
          id: `m-${st}-${c}`,
        })),
      ),
    [],
  );

  // Everything the lab is currently showing, ready to paste into
  // lib/guestbook/design.ts.
  const exportJson = JSON.stringify({ stamp: stampDesign, notebook: notebookDesign }, null, 2);

  return (
    <main className="min-h-dvh px-6 py-10 md:px-12" style={{ backgroundColor: '#0B0B0B', color: FG }}>
      <StampDefs design={stampDesign} />

      <header className="mx-auto max-w-6xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
          Local only · not reachable in production
        </p>
        <h1 className="mt-2 font-pixel text-3xl md:text-4xl">Stamp lab</h1>
        <p className="mt-3 max-w-2xl font-sans text-base" style={{ color: MUTED }}>
          Every stamp design and the notebook shell, driven by the dialkit panel (top
          right). Tune, then hit <em>Copy design JSON</em> and paste it back — the values
          map 1:1 onto <code>STAMP_DEFAULTS</code> / <code>NOTEBOOK_DEFAULTS</code> in{' '}
          <code>lib/guestbook/design.ts</code>.
        </p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ['styles', 'All 3 styles × 4 colours'],
              ['tiers', 'Font tiers (12)'],
              ['countries', `All countries (${Object.keys(GREETINGS).length})`],
              ['notebook', 'Notebook'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 transition-opacity hover:opacity-70"
              style={{
                border: `1px solid ${RULE}`,
                backgroundColor: tab === k ? 'rgba(237,234,224,0.1)' : 'transparent',
              }}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 self-center font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
            style
          </span>
          {STAMP_STYLES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStyle(st)}
              className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 transition-opacity hover:opacity-70"
              style={{
                border: `1px solid ${RULE}`,
                backgroundColor: style === st ? 'rgba(237,234,224,0.1)' : 'transparent',
              }}
            >
              {st}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(exportJson)}
            className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 transition-opacity hover:opacity-70"
            style={{ border: `1px solid ${RULE}` }}
          >
            Copy design JSON
          </button>
        </nav>
      </header>

      <div className="mx-auto mt-10 max-w-6xl">
        {tab === 'notebook' && (
          <NotebookPreview stampDesign={stampDesign} notebookDesign={notebookDesign} />
        )}

        {tab === 'styles' && <StampGrid stamps={styleMatrix} design={stampDesign} showTier />}

        {tab === 'tiers' && (
          <StampGrid stamps={tierStamps} design={stampDesign} showTier />
        )}

        {tab === 'countries' && <StampGrid stamps={allStamps} design={stampDesign} />}
      </div>

      <details className="mx-auto mt-14 max-w-6xl" style={{ borderTop: `1px solid ${RULE}` }}>
        <summary className="cursor-pointer py-4 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
          Design JSON
        </summary>
        <pre
          className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed"
          style={{ backgroundColor: 'rgba(237,234,224,0.04)', color: MUTED }}
        >
          {exportJson}
        </pre>
      </details>
    </main>
  );
}

function StampGrid({
  stamps,
  design,
  showTier = false,
}: {
  stamps: Stamp[];
  design: StampDesign;
  showTier?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {stamps.map((s) => (
        <figure key={s.id} className="flex flex-col items-center gap-3">
          {/* Each cell gets its own dark square so a stamp is judged against the
              paper it'll actually sit on, not against the page background. */}
          <div
            className="relative grid aspect-square w-full place-items-center"
            style={{ backgroundColor: '#0E0E0E', border: `1px solid ${RULE}` }}
          >
            <div className="h-[78%] w-[78%]">
              <GuestbookStamp stamp={s} design={design} />
            </div>
          </div>
          <figcaption className="text-center">
            <span className="block font-sans text-sm">{s.line}</span>
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
              {s.country}
              {showTier ? ` · ${s.font}` : ''} · {s.color} · {s.style}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// The spread with a spray of stamps across it, plus working page-turn buttons —
// so the notebook can be judged in motion, not just as a still.
function NotebookPreview({
  stampDesign,
  notebookDesign,
}: {
  stampDesign: StampDesign;
  notebookDesign: NotebookDesign;
}) {
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null);
  const [count, setCount] = useState(8);

  const spread = useMemo(() => {
    const codes = Object.keys(GREETINGS);
    // Deterministic scatter — a fixed lattice with a hash-based jitter, so the
    // layout doesn't reshuffle on every dial tweak and you can compare frames.
    return Array.from({ length: count }, (_, i) => {
      const s = makeStamp(codes[(i * 7) % codes.length], i);
      const h = (i * 2654435761) % 1000;
      return {
        ...s,
        x: 0.1 + ((i % 4) * 0.26) + ((h % 40) / 1000),
        y: 0.18 + (Math.floor(i / 4) % 3) * 0.28 + ((h % 70) / 1400),
        rot: ((h % 33) - 16),
      };
    });
  }, [count]);

  const flip = (dir: 'next' | 'prev') => {
    if (turning) return;
    setTurning(dir);
    window.setTimeout(() => setTurning(null), notebookDesign.turnDuration * 1000);
  };

  return (
    <>
      <Notebook design={notebookDesign} turning={turning}>
        {spread.map((s) => (
          <div
            key={s.id}
            className="pointer-events-none absolute"
            style={{
              left: `${s.x * 100}%`,
              top: `${s.y * 100}%`,
              width: `${stampDesign.sizePct}%`,
              aspectRatio: '1',
              transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
            }}
          >
            <GuestbookStamp stamp={s} design={stampDesign} />
          </div>
        ))}
      </Notebook>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <LabButton onClick={() => flip('prev')} disabled={!!turning}>
          ← Turn back
        </LabButton>
        <LabButton onClick={() => flip('next')} disabled={!!turning}>
          Turn over →
        </LabButton>
        <LabButton onClick={() => setCount((c) => Math.max(0, c - 4))}>Fewer stamps</LabButton>
        <LabButton onClick={() => setCount((c) => Math.min(42, c + 4))}>More stamps</LabButton>
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
          {spread.length} on the spread
        </span>
      </div>
    </>
  );
}

function LabButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 transition-opacity disabled:opacity-30 hover:opacity-70"
      style={{ border: `1px solid ${RULE}`, color: FG }}
    >
      {children}
    </button>
  );
}
