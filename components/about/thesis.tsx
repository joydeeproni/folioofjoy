'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Para } from '@/lib/content/types';
import { RichText } from '@/components/rich-text';

const MUTED = 'rgba(237,234,224,0.5)';
const RULE = 'rgba(237,234,224,0.14)';

// A single hairline accordion — a mono label and a +/− glyph over a rule. Holds
// the long-form "so what is design, then" answer so the essay above stays short.
export function Thesis({ title, paras }: { title: string; paras: Para[] }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();

  return (
    <section className="my-12 mx-auto max-w-2xl">
      <div className="border-t border-b" style={{ borderColor: RULE }}>
        <h2>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="group flex w-full items-center justify-between gap-4 py-4 text-left outline-none"
          >
            <span
              className="font-mono text-[11px] uppercase tracking-[0.25em] transition-colors group-hover:text-current"
              style={{ color: open ? undefined : MUTED }}
            >
              {title}
            </span>
            <span
              aria-hidden
              className="font-mono text-sm leading-none transition-transform duration-300"
              style={{ color: MUTED, transform: open ? 'rotate(45deg)' : 'none' }}
            >
              +
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
