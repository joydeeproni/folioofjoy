'use client';

import { useCallback, useEffect, useRef } from 'react';
import { scrambleSwap } from '@/lib/scramble';
import { cn } from '@/lib/utils';

// A text label that scrambles into a second label on hover/focus and back out
// again on leave. Reserves the width of the longer of the two so nothing around
// it shifts mid-animation. Honours prefers-reduced-motion by swapping instantly.
export function ScrambleSwapText({
  label,
  hoverLabel,
  className,
  duration = 0.4,
}: {
  label: string;
  hoverLabel: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const showing = useRef(label);

  useEffect(
    () => () => {
      tween.current?.kill();
    },
    [],
  );

  const swapTo = useCallback(
    (to: string) => {
      const el = ref.current;
      if (!el || showing.current === to) return;
      tween.current?.kill();
      const from = showing.current;
      showing.current = to;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = to;
        return;
      }
      tween.current = scrambleSwap(el, from, to, duration);
    },
    [duration],
  );

  const widest = hoverLabel.length > label.length ? hoverLabel : label;

  return (
    <span
      className={cn('relative inline-block', className)}
      onPointerEnter={() => swapTo(hoverLabel)}
      onPointerLeave={() => swapTo(label)}
      onFocus={() => swapTo(hoverLabel)}
      onBlur={() => swapTo(label)}
    >
      {/* Invisible spacer holds the width; the live text overlays it centred. */}
      <span aria-hidden className="invisible whitespace-pre">
        {widest}
      </span>
      <span
        ref={ref}
        aria-hidden
        className="absolute inset-0 flex items-center justify-center whitespace-pre"
      >
        {label}
      </span>
    </span>
  );
}
