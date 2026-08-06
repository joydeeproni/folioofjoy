'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Para } from '@/lib/content/types';
import { RichText } from '@/components/rich-text';
import { scrambleSwap } from '@/lib/scramble';

const MUTED = 'rgba(237,234,224,0.5)';
const RULE = 'rgba(237,234,224,0.14)';

const HOVER_LABEL = 'What design means to me';

// A single hairline accordion whose label explains itself on hover. Holds the
// long-form "so what is design, then" answer so the essay above stays short.
export function Thesis({ title, paras }: { title: string; paras: Para[] }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();
  const labelRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<ReturnType<typeof scrambleSwap> | null>(null);

  const scrambleTo = useCallback(
    (nextLabel: string) => {
      const label = labelRef.current;
      if (!label) return;
      tweenRef.current?.kill();
      if (reduce) {
        label.textContent = nextLabel;
        return;
      }
      tweenRef.current = scrambleSwap(label, label.textContent ?? title, nextLabel, 0.42);
    },
    [reduce, title],
  );

  useEffect(() => () => tweenRef.current?.kill(), []);

  return (
    <section className="my-12 mx-auto max-w-2xl">
      <div className="border-t border-b" style={{ borderColor: RULE }}>
        <h2>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            onMouseEnter={() => scrambleTo(HOVER_LABEL)}
            onMouseLeave={() => scrambleTo(title)}
            onFocus={() => scrambleTo(HOVER_LABEL)}
            onBlur={() => scrambleTo(title)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={title}
            className="flex w-full items-center py-4 text-left outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4"
          >
            <span
              ref={labelRef}
              className="font-mono text-[11px] uppercase tracking-[0.25em]"
              style={{ color: open ? undefined : MUTED }}
            >
              {title}
            </span>
          </button>
        </h2>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              key="panel"
              initial={reduce ? undefined : { height: 0, opacity: 0 }}
              animate={reduce ? undefined : { height: 'auto', opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pb-6 space-y-6 font-sans text-lg md:text-xl leading-relaxed text-pretty">
                <RichText paras={paras} reveal={false} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
