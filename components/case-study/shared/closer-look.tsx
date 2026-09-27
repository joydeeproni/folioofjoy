'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { DeviceFrame, type DeviceKind, type FrameScreen } from './device-frame';
import { Media } from './media-card';
import { FG, MUTED } from './tokens';

// "Take a closer look": one big stage and a stack of feature pills beside it.
// The active pill opens to a short caption and swaps the stage. It advances by
// itself while on screen (with a progress hairline), and stops for good the
// moment someone picks a pill — autoplay is a demo, not a trap.

export type CloserItem = {
  label: string;
  body: string;
  /** Media for the stage. Rendered inside `kind`'s device, or bare. */
  screen: FrameScreen;
  /** Per-item override, e.g. one phone among browser shots. */
  kind?: DeviceKind;
  ratio?: number;
};

export function CloserLook({
  id,
  heading = 'Take a closer look.',
  items,
  kind = 'bare',
  ratio,
  stageAspect = 'aspect-[4/3]',
  intervalMs = 6500,
}: {
  id?: string;
  heading?: string;
  items: CloserItem[];
  kind?: DeviceKind;
  ratio?: number;
  /** Tailwind aspect of the stage box. The device/media is centred inside it. */
  stageAspect?: string;
  intervalMs?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.45 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const playing = auto && inView && !reduce;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % items.length), intervalMs);
    return () => clearTimeout(t);
  }, [playing, active, items.length, intervalMs]);

  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  const item = items[active];
  const k = item.kind ?? kind;

  const stage = (
    <div className={`relative w-full overflow-hidden rounded-3xl ${stageAspect}`} style={{ background: 'radial-gradient(120% 90% at 50% 100%, rgba(237,234,224,0.07), rgba(237,234,224,0.02))' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduce ? 1 : 1.02, transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center p-[5%]"
        >
          {k === 'bare' ? (
            <Media src={item.screen.src} alt={item.screen.alt ?? item.label} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
          ) : k === 'phone' ? (
            // A phone is sized by the stage's height: 0.475 is the whole frame's
            // ratio (a 390×844 screen plus its bezel).
            <div className="aspect-[0.475] h-full">
              <DeviceFrame kind="phone" screen={item.screen} ratio={item.ratio ?? ratio} className="w-full" />
            </div>
          ) : (
            <DeviceFrame kind={k} screen={item.screen} ratio={item.ratio ?? ratio} className="w-full max-w-[92%]" />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <section id={id} ref={ref} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <h2 className="mb-8 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>
          {heading}
        </h2>
      </Reveal>
      <Reveal className="grid gap-6 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-center md:gap-10">
        <div className="order-2 min-w-0 md:order-1">
          {/* Below md the pills become a swipeable row; the caption sits under it. */}
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 [scrollbar-width:none] md:mx-0 md:flex-col md:overflow-visible md:px-0">
            {items.map((it, i) => {
              const on = i === active;
              return (
                <button
                  key={it.label}
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  className="group relative shrink-0 overflow-hidden text-left transition-colors duration-300"
                  style={{ backgroundColor: on ? 'rgba(237,234,224,0.1)' : 'rgba(237,234,224,0.05)' }}
                >
                  <span className="flex items-center gap-3 px-4 py-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-300"
                      style={{ color: FG, transform: on ? 'rotate(45deg)' : 'none' }}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="font-sans font-medium text-[15px] whitespace-nowrap md:whitespace-normal" style={{ color: FG }}>
                      {it.label}
                    </span>
                  </span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span
                        className="hidden md:block"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <span className="block px-4 pb-4 pl-[3.25rem] font-sans text-[14.5px] leading-relaxed" style={{ color: MUTED }}>
                          {it.body}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {on && playing && (
                    <motion.span
                      key={`p${active}`}
                      className="absolute bottom-0 left-0 h-px origin-left"
                      style={{ backgroundColor: FG, width: '100%' }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: intervalMs / 1000, ease: 'linear' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-4 font-sans text-[15px] leading-relaxed md:hidden" style={{ color: MUTED }}>
            {item.body}
          </p>
        </div>
        <div className="order-1 min-w-0 md:order-2">{stage}</div>
      </Reveal>
    </section>
  );
}
