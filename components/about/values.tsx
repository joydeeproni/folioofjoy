'use client';

import { useEffect, useState } from 'react';
import { ScrollFade } from '@/components/scroll-fade';
import type { AboutValue } from '@/lib/content/types';
import { motion, useReducedMotion, type Variants } from 'motion/react';

const MUTED = 'rgba(237,234,224,0.5)';

const PIXEL_COUNT = 36;
const DOT_PIXELS = Array.from({ length: PIXEL_COUNT }, (_, i) => ({
  x: 2 + (i % 6) * 3,
  y: 2 + Math.floor(i / 6) * 3,
}));

function pixelShape(rows: string[]) {
  return rows.flatMap((row, y) =>
    [...row].flatMap((cell, x) => (cell === '#' ? [{ x: 1 + x * 3, y: 1 + y * 3 }] : [])),
  );
}

const VALUE_SHAPES: Record<string, { x: number; y: number }[]> = {
  'Fun & Joy': pixelShape([
    '.......',
    '..#.#..',
    '.......',
    '.#...#.',
    '..###..',
  ]),
  Care: pixelShape([
    '.##.##.',
    '#######',
    '#######',
    '.#####.',
    '..###..',
    '...#...',
  ]),
  Aesthetics: pixelShape([
    '...#...',
    '.#.#.#.',
    '..###..',
    '#######',
    '..###..',
    '.#.#.#.',
    '...#...',
  ]),
  Economics: pixelShape([
    '.#####.',
    '#.....#',
    '#.###.#',
    '#.#...#',
    '#.###.#',
    '#.....#',
    '.#####.',
  ]),
};

function PixelMark({ color, title, active }: { color: string; title: string; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const shape = VALUE_SHAPES[title] ?? VALUE_SHAPES.Aesthetics;
  const variants: Variants = {
    dot: (i: number) => ({
      ...DOT_PIXELS[i],
      opacity: 1,
      transition: { type: 'spring', stiffness: 460, damping: 24, delay: i * 0.004 },
    }),
    icon: (i: number) =>
      reduceMotion
        ? { ...DOT_PIXELS[i], opacity: 1 }
        : {
            ...(shape[i] ?? {
              x: 10 + Math.cos((i / PIXEL_COUNT) * Math.PI * 2) * 18,
              y: 10 + Math.sin((i / PIXEL_COUNT) * Math.PI * 2) * 18,
            }),
            opacity: i < shape.length ? 1 : 0,
            transition: {
              type: 'spring',
              stiffness: 420,
              damping: 20,
              delay: i * 0.012,
            },
          },
  };

  return (
    <span aria-hidden className="relative mt-1.5 size-6 shrink-0">
      {DOT_PIXELS.map((_, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={variants}
          initial="dot"
          animate={active ? 'icon' : 'dot'}
          className="absolute left-0 top-0"
          style={{ width: 3, height: 3, backgroundColor: color }}
        />
      ))}
    </span>
  );
}

// The four values as a 2×2 grid, each keyed by one of the brand colours
// (lib/brand.ts). Stacks to a single column on mobile.
export function Values({ values }: { values: AboutValue[] }) {
  const reduceMotion = useReducedMotion();
  const [activeValue, setActiveValue] = useState<number | null>(null);

  useEffect(() => {
    if (reduceMotion || values.length === 0) return;

    let timer: ReturnType<typeof setTimeout>;
    let lastValue = -1;
    let stopped = false;

    const scheduleNext = () => {
      const pause = 650 + Math.random() * 1000;
      timer = setTimeout(() => {
        if (stopped) return;

        let nextValue = Math.floor(Math.random() * values.length);
        if (values.length > 1 && nextValue === lastValue) {
          nextValue = (nextValue + 1 + Math.floor(Math.random() * (values.length - 1))) % values.length;
        }
        lastValue = nextValue;
        setActiveValue(nextValue);

        timer = setTimeout(() => {
          setActiveValue(null);
          scheduleNext();
        }, 950);
      }, pause);
    };

    scheduleNext();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reduceMotion, values.length]);

  return (
    <section className="mt-16 md:mt-24">
      <ScrollFade>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] pb-5">Values</h2>
      </ScrollFade>

      <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2 md:gap-x-12">
        {values.map((value, index) => (
          <ScrollFade key={value.title}>
            <div className="flex gap-5 py-6 md:py-8">
              <PixelMark
                color={value.color}
                title={value.title}
                active={activeValue === index}
              />
              <div>
                <h3 className="font-sans text-lg md:text-xl">{value.title}</h3>
                <p
                  className="mt-2 font-sans text-base md:text-lg leading-relaxed text-pretty"
                  style={{ color: MUTED }}
                >
                  {value.body}
                </p>
              </div>
            </div>
          </ScrollFade>
        ))}
      </div>
    </section>
  );
}
