'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/reveal';
import { DeviceFrame, DEVICE_RATIO, type DeviceKind } from './device-frame';
import { FG, MUTED, FAINT } from './tokens';

// The old screen and the new one in the same frame, with a divider you drag
// (or arrow-key) across. It sweeps once on first view so people know it moves.
// Below it, an Apple "compare models" strip: what actually changed, row by row.

export function BeforeAfter({
  id,
  heading,
  blurb,
  kind = 'bare',
  ratio,
  url,
  before,
  after,
  facts,
  className = '',
}: {
  id?: string;
  heading: string;
  blurb?: ReactNode;
  kind?: DeviceKind;
  ratio?: number;
  url?: string;
  before: { src: string; label: string };
  after: { src: string; label: string };
  /** Row label, then the before and after values. */
  facts?: { label: string; before: string; after: string }[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6, once: true });
  const reduce = useReducedMotion();
  const [p, setP] = useState(50);
  const touched = useRef(false);
  const r = ratio ?? DEVICE_RATIO[kind];

  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(50, [50, 22, 78, 50], {
      duration: 2.4,
      ease: 'easeInOut',
      delay: 0.3,
      onUpdate: (v) => !touched.current && setP(v),
    });
    return () => c.stop();
  }, [inView, reduce]);

  const slider = (
    <div className="absolute inset-0 select-none">
      <img src={after.src} alt={after.label} draggable={false} className="absolute inset-0 h-full w-full object-cover object-top" />
      <img
        src={before.src}
        alt={before.label}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-top"
        style={{ clipPath: `inset(0 ${100 - p}% 0 0)` }}
      />
      <span className="pointer-events-none absolute inset-y-0 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" style={{ left: `${p}%` }} />
      <span
        className="pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0B0B0B] shadow-lg"
        style={{ left: `${p}%` }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
        </svg>
      </span>
      <Tag side="left">{before.label}</Tag>
      <Tag side="right">{after.label}</Tag>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={p}
        aria-label={`Drag to compare ${before.label} and ${after.label}`}
        onChange={(e) => {
          touched.current = true;
          setP(Number(e.target.value));
        }}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );

  return (
    <section id={id} className={`scroll-mt-24 py-16 md:py-24 ${className}`}>
      <Reveal>
        <h2 className="mb-4 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>
          {heading}
        </h2>
        {blurb && (
          <p className="mb-10 max-w-[60ch] font-sans text-lg leading-relaxed" style={{ color: MUTED }}>
            {blurb}
          </p>
        )}
      </Reveal>
      <Reveal>
        <div ref={ref} className={kind === 'phone' ? 'mx-auto w-[72vw] max-w-[340px]' : 'w-full'}>
          <DeviceFrame kind={kind} ratio={r} url={url} className="w-full">
            {slider}
          </DeviceFrame>
        </div>
      </Reveal>
      {facts && facts.length > 0 && (
        <Reveal>
          <dl className="mt-12 border-t" style={{ borderColor: FAINT }}>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]" style={{ color: MUTED }}>
              <span className="hidden md:block" />
              <span>{before.label}</span>
              <span>{after.label}</span>
            </div>
            {facts.map((f) => (
              <div key={f.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-4 gap-y-1 border-t py-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]" style={{ borderColor: FAINT }}>
                <dt className="col-span-2 font-sans text-[13px] md:col-span-1 md:text-[15px]" style={{ color: MUTED }}>
                  {f.label}
                </dt>
                <dd className="font-sans text-[15px]" style={{ color: MUTED }}>
                  {f.before}
                </dd>
                <dd className="font-sans text-[15px]" style={{ color: FG }}>
                  {f.after}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )}
    </section>
  );
}

function Tag({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return (
    <span
      className={`pointer-events-none absolute bottom-3 rounded-full px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] backdrop-blur ${side === 'left' ? 'left-3' : 'right-3'}`}
      style={{ backgroundColor: 'rgba(11,11,11,0.62)', color: FG }}
    >
      {children}
    </span>
  );
}
