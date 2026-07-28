'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import { Reveal } from '@/components/reveal';
import { FG } from './tokens';

const LINE = 'font-sans font-light text-3xl leading-[1.18] tracking-tight md:text-5xl';

// One line, brightening 5% → 100% as it scrolls up through the view.
function StatementLine({
  progress,
  index,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  children: string;
}) {
  const start = index * 0.28;
  const opacity = useTransform(progress, [start, start + 0.45], [0.05, 1]);
  return (
    <motion.p style={{ opacity }} className={LINE}>
      {children}
    </motion.p>
  );
}

// A big statement that fades in line by line on scroll, with an optional
// smaller paragraph revealed underneath it.
export function Statement({
  lines,
  trailing,
  className = '',
}: {
  lines: string[];
  trailing?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.55'] });

  return (
    <section ref={ref} className={`py-16 md:py-28 ${className}`}>
      <div className="max-w-3xl space-y-8 md:space-y-10" style={{ color: FG }}>
        {lines.map((line, i) =>
          reduce ? (
            <p key={i} className={LINE}>
              {line}
            </p>
          ) : (
            <StatementLine key={i} progress={scrollYProgress} index={i}>
              {line}
            </StatementLine>
          ),
        )}
      </div>
      {trailing && (
        <Reveal>
          <div className="mt-14 max-w-3xl font-sans text-base leading-relaxed md:text-lg" style={{ color: FG }}>
            {trailing}
          </div>
        </Reveal>
      )}
    </section>
  );
}
