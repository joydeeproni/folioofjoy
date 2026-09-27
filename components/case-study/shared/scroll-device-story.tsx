'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/reveal';
import { DeviceFrame, DEVICE_RATIO, ScreenContent, useIsMd, type DeviceKind, type FrameScreen } from './device-frame';
import { FG, MUTED } from './tokens';

// Apple's sticky feature pattern: the device stays pinned while short text
// steps scroll past it, and the screen inside changes to match the step in
// view. A step can `pan` a full-length screenshot, so a long page scrolls
// inside the device like a screen recording. Below md each step becomes a
// plain device-then-text block — pinning on a phone fights the reader.

export type StoryStep = {
  title: string;
  body: ReactNode;
  screen: FrameScreen;
  /** Full content height ÷ width of `screen.src` (e.g. 1527/1600). When set,
   *  the image pans from top to bottom while the step is active. */
  panRatio?: number;
};

export function ScrollDeviceStory({
  id,
  kind,
  steps,
  ratio,
  url,
  deviceSide = 'right',
  intro,
}: {
  id?: string;
  kind: DeviceKind;
  steps: StoryStep[];
  ratio?: number;
  url?: string;
  deviceSide?: 'left' | 'right';
  intro?: ReactNode;
}) {
  const md = useIsMd();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const r = ratio ?? DEVICE_RATIO[kind];

  useEffect(() => {
    if (!md) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: '-48% 0px -48% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [md, steps.length]);

  if (!md) {
    return (
      <section id={id} className="scroll-mt-24 py-16">
        {intro && <Reveal className="mb-12">{intro}</Reveal>}
        <div className="space-y-16">
          {steps.map((s, i) => (
            <Reveal key={i}>
              <DeviceFrame kind={kind} screen={s.screen} ratio={r} url={url} className={kind === 'phone' ? 'mx-auto w-[64vw] max-w-[300px]' : 'w-full'} />
              <h3 className="mt-6 font-sans font-medium text-xl" style={{ color: FG }}>
                {s.title}
              </h3>
              <div className="mt-2 font-sans text-base leading-relaxed" style={{ color: MUTED }}>
                {s.body}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  const phone = kind === 'phone';
  const device = (
    <div className="sticky top-0 flex h-dvh items-center justify-center">
      <DeviceFrame kind={kind} ratio={r} url={url} className={phone ? 'w-[min(22vw,340px,calc(78dvh*0.44))]' : 'w-full'}>
        {steps.map((s, i) => (
          <Layer key={i} step={s} on={i === active} ratio={r} kind={kind} reduce={!!reduce} />
        ))}
      </DeviceFrame>
    </div>
  );

  const text = (
    <div className="pb-[30vh] pt-[30vh]">
      {steps.map((s, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          data-i={i}
          className="flex min-h-[72vh] flex-col justify-center transition-opacity duration-500"
          style={{ opacity: i === active ? 1 : 0.28 }}
        >
          <p className="mb-3 font-mono text-[11px] tracking-[0.25em]" style={{ color: MUTED }}>
            {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </p>
          <h3 className="font-sans font-medium text-2xl md:text-3xl tracking-tight text-balance" style={{ color: FG }}>
            {s.title}
          </h3>
          <div className="mt-3 max-w-[42ch] font-sans text-lg leading-relaxed" style={{ color: MUTED }}>
            {s.body}
          </div>
        </div>
      ))}
    </div>
  );

  // Web and tablet screens want the width, so the device column is wider.
  const cols = phone ? 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : deviceSide === 'right' ? 'grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]' : 'grid-cols-[minmax(0,1.28fr)_minmax(0,0.72fr)]';

  return (
    <section id={id} className="scroll-mt-24 pt-16 md:pt-24">
      {intro && <Reveal>{intro}</Reveal>}
      {/* Web and tablet stories break out of the text column, so the device can
          be big enough to read — Apple lets the product, not the prose, set the width. */}
      <div className={`grid gap-10 lg:gap-16 ${cols} ${phone ? '' : 'ml-[calc(50%-min(46vw,660px))] w-[min(92vw,1320px)]'}`}>
        {deviceSide === 'left' ? (
          <>
            {device}
            {text}
          </>
        ) : (
          <>
            {text}
            {device}
          </>
        )}
      </div>
    </section>
  );
}

function Layer({ step, on, ratio, kind, reduce }: { step: StoryStep; on: boolean; ratio: number; kind: DeviceKind; reduce: boolean }) {
  // Pan distance: how much of the full image is below the fold, as a % of the
  // image's own height (translateY % is relative to the element itself).
  const pan = step.panRatio ? Math.max(0, (1 - 1 / ratio / step.panRatio) * 100) : 0;

  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: on ? 1 : 0, scale: on || reduce ? 1 : 1.03 }}
      transition={{ duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden={!on}
    >
      {pan > 0 ? (
        <motion.img
          src={step.screen.src}
          alt={step.screen.alt ?? ''}
          draggable={false}
          className="absolute left-0 top-0 w-full"
          initial={false}
          animate={{ y: on && !reduce ? `-${pan}%` : '0%' }}
          transition={on ? { duration: 7, ease: [0.45, 0, 0.55, 1], delay: 0.6 } : { duration: 0.4 }}
        />
      ) : (
        <ScreenContent screen={step.screen} kind={kind} />
      )}
    </motion.div>
  );
}
