'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimationFrame, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/reveal';
import { ZoomableShot, type MediaItem } from './media-card';
import { FULL_BLEED } from './tokens';

// One auto-scrolling row. Speed is applied per frame rather than as a CSS
// animation so hover can ease it down smoothly instead of jumping.
function Marquee({
  items,
  reverse = false,
  durationMs,
  aspect,
  cardClass,
  onOpen,
}: {
  items: MediaItem[];
  reverse?: boolean;
  durationMs: number;
  aspect: string;
  cardClass: string;
  onOpen: (src: string) => void;
}) {
  const reduce = useReducedMotion();
  const pct = useMotionValue(reverse ? -50 : 0);
  const x = useTransform(pct, (v) => `${v}%`);
  const speed = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const step = (delta / durationMs) * 50 * speed.current;
    let v = pct.get() + (reverse ? step : -step);
    if (v <= -50) v += 50;
    if (v >= 0) v -= 50;
    pct.set(v);
  });

  // Duplicated so the loop is seamless — pct wraps over half the track.
  const loop = [...items, ...items];

  return (
    <div
      className="overflow-hidden pb-7"
      onMouseEnter={() => (speed.current = 0.3)}
      onMouseLeave={() => (speed.current = 1)}
    >
      <motion.div className="flex w-max gap-4" style={reduce ? undefined : { x }}>
        {loop.map((item, i) => (
          <ZoomableShot key={i} item={item} aspect={aspect} className={cardClass} onOpen={onOpen} />
        ))}
      </motion.div>
    </div>
  );
}

// Full-bleed stack of marquee rows, each scrolling opposite its neighbour.
export function MarqueeWall({
  rows,
  aspect,
  cardClass,
  durationsMs,
  onOpen,
  className = '',
}: {
  rows: MediaItem[][];
  aspect: string;
  cardClass: string;
  durationsMs: number[];
  onOpen: (src: string) => void;
  className?: string;
}) {
  return (
    <Reveal>
      <div className={`${FULL_BLEED} space-y-3 pb-16 ${className}`}>
        {rows.map((items, i) => (
          <Marquee
            key={i}
            items={items}
            reverse={i % 2 === 1}
            durationMs={durationsMs[i] ?? 48000}
            aspect={aspect}
            cardClass={cardClass}
            onOpen={onOpen}
          />
        ))}
      </div>
    </Reveal>
  );
}
