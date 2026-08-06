'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

// Scroll-linked brightening, the same move the case-study Statement makes
// (components/case-study/shared/statement.tsx): content enters dim near the
// bottom of the viewport and reaches full strength by the time it's climbed to
// mid-screen. Unlike Reveal this is continuous rather than a one-shot trigger —
// scrolling back down dims it again, so the page reads as a light moving up it.
//
// Anything already above the start offset on load (the top of the page) reports
// progress 1 and renders at full opacity, so there's no dim first screen.
export function ScrollFade({
  children,
  className,
  style,
  from = 0.12,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Opacity at the moment the element enters at the bottom of the viewport. */
  from?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.95', 'start 0.45'],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [from, 1]);

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ ...style, opacity }}>
      {children}
    </motion.div>
  );
}
