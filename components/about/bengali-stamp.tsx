'use client';

import { useMemo } from 'react';
import { stampFor, stampSVG } from '@/vendor/bengali-pixel-stamps/bengali-pixel-stamps';
import { hexFor } from '@/lib/guestbook/types';
import type { Stamp } from '@/lib/guestbook/types';

// The pack has 197 countries. A visitor we couldn't place, or one from a
// territory outside that list, still gets a stamp: the Bangladesh symbol with
// the country code hidden, so it doesn't claim a country they're not from.
const FALLBACK = 'BD';

// Height of the stamp inside the 0–100 slot. The pixel stamp is portrait (36×43)
// and solid-framed, so it reads heavier than the ring stamps at full height.
const HEIGHT = 90;

interface Art {
  w: number;
  h: number;
  paths: { d: string; transform?: string }[];
}

// stampSVG returns a markup string. Pull out the viewBox and the two paths
// (frame + text, then the symbol) so they render as React SVG inside the shared
// 0–100 slot instead of through innerHTML.
function artFor(stamp: Stamp): Art {
  const known = stampFor(stamp.country) !== null;
  const svg = stampSVG(known ? stamp.country : FALLBACK, {
    frame: 'perforated',
    tag: known,
    // Season and year of the press, not of today.
    date: new Date(stamp.at),
    title: '',
  });
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/) ?? ['', '36', '43'];
  const paths = [...svg.matchAll(/<path(?: transform="([^"]*)")? d="([^"]*)"\/>/g)].map((m) => ({
    transform: m[1],
    d: m[2],
  }));
  return { w: Number(w), h: Number(h), paths };
}

export function BengaliStamp({ stamp }: { stamp: Stamp }) {
  const art = useMemo(() => artFor(stamp), [stamp]);
  const width = (HEIGHT * art.w) / art.h;

  return (
    <svg
      x={(100 - width) / 2}
      y={(100 - HEIGHT) / 2}
      width={width}
      height={HEIGHT}
      viewBox={`0 0 ${art.w} ${art.h}`}
      fill={hexFor(stamp.color)}
      shapeRendering="crispEdges"
    >
      {art.paths.map((p, i) => (
        <path key={i} d={p.d} transform={p.transform} />
      ))}
    </svg>
  );
}
