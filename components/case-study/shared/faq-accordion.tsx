'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { FG, MUTED, FAINT } from './tokens';

// Single-open accordion. Item 0 starts open so the section never reads as empty.
export function FaqAccordion({
  id,
  heading,
  items,
}: {
  id?: string;
  heading: string;
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id={id} className="scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <h2 className="mb-8 font-sans font-medium text-2xl md:text-3xl tracking-tight" style={{ color: FG }}>
          {heading}
        </h2>
      </Reveal>
      <Reveal className="max-w-[70ch]">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ borderTop: `1px solid ${FAINT}` }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span
                  className="font-sans text-[17px] md:text-lg leading-relaxed transition-opacity group-hover:opacity-70"
                  style={{ color: FG }}
                >
                  {item.q}
                </span>
                <span
                  className="shrink-0 text-[var(--faq-icon-muted)] transition-colors group-hover:text-[var(--faq-icon-fg)]"
                  style={{ '--faq-icon-muted': MUTED, '--faq-icon-fg': FG } as React.CSSProperties}
                >
                  {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <p className="max-w-[68ch] pb-6 font-sans text-[17px] md:text-lg leading-relaxed" style={{ color: MUTED }}>
                  {item.a}
                </p>
              </motion.div>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
