'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { DeviceFrame, useIsMd, type DeviceKind, type FrameScreen } from './device-frame';
import { SHELF, SHELF_PAD, FULL_BLEED } from './tokens';

// Apple's product-hero move, with a UI instead of a phone: the first screen
// arrives oversized and pinned, settles to size as you scroll, then the rest
// of the lineup fades in beside it and the row pans past. Generalises Tactile
// Create's green video carousel so any device kind can use it.

const DEFAULT_WIDTH: Record<DeviceKind, [number, number]> = {
  // [mobile vw, desktop vw]
  phone: [58, 19],
  tablet: [80, 46],
  browser: [82, 46],
  bare: [82, 46],
};

export function ScaleHero({
  id,
  kind,
  screens,
  ratio,
  url,
  fromScale,
  widthVw,
}: {
  id?: string;
  kind: DeviceKind;
  screens: FrameScreen[];
  ratio?: number;
  url?: string;
  /** How large the first device starts. Defaults suit each kind. */
  fromScale?: number;
  /** Card width in vw, [mobile, desktop]. */
  widthVw?: [number, number];
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const md = useIsMd();
  const [wm, wd] = widthVw ?? DEFAULT_WIDTH[kind];
  const w = md ? wd : wm;
  const gap = md ? 2 : 4;
  const start = fromScale ?? (kind === 'phone' ? (md ? 1.45 : 1.15) : md ? 1.9 : 1.12);
  const travel = (screens.length - 1) * (w + gap);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 0.45], [start, 1]);
  const fade = useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, (v - 0.45) / 0.15)));
  const x = useTransform(scrollYProgress, [0.55, 0.95], ['0vw', `-${travel}vw`]);

  const card = (s: FrameScreen, i: number) => (
    <DeviceFrame key={i} kind={kind} screen={s} ratio={ratio} url={url} className="w-full" />
  );

  if (reduce) {
    return (
      <section id={id} className="scroll-mt-24 py-16">
        <div className={`${SHELF} flex gap-4 pb-4 ${SHELF_PAD}`}>
          {screens.map((s, i) => (
            <div key={i} className="shrink-0" style={{ width: `${w}vw` }}>
              {card(s, i)}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={id} ref={ref} className={`relative scroll-mt-24 ${FULL_BLEED}`} style={{ height: `${160 + screens.length * 28}vh` }}>
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <motion.div
          style={{ x, paddingLeft: `${50 - w / 2}vw`, paddingRight: `${50 - w / 2}vw`, gap: `${gap}vw` }}
          className="flex w-max items-center will-change-transform"
        >
          <motion.div style={{ scale, width: `${w}vw` }} className="relative z-10 shrink-0 origin-center">
            {card(screens[0], 0)}
          </motion.div>
          {screens.slice(1).map((s, i) => (
            <motion.div key={i} style={{ opacity: fade, width: `${w}vw` }} className="shrink-0">
              {card(s, i + 1)}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
