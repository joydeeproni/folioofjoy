'use client';

import { hexFor } from '@/lib/guestbook/types';
import type { Stamp } from '@/lib/guestbook/types';
import { SCRIPT_FONTS } from './stamp-fonts';

// The two Google Sans Flex stamp designs from Tactile Create V3 (Figma node
// 451:6770): a square "passport" page with a world map, and a solid "globe"
// disc. Both are SVG on a 0–100 viewBox so they drop into the same slot as the
// original postal stamp.
//
// Geometry is transposed from the 715px Figma artboard — every offset below is
// that design's pixel value over 715, which is why the numbers look arbitrary.
//
// TYPE. Google Sans Flex is variable, and these designs lean on its `wdth` axis
// rather than on weight: the big greeting runs wide (112) while the meta rows run
// condensed (50 on the square, 39 on the disc). Those aren't decorative — they're
// what makes a long date and a country name fit one line. GRAD/ROND are pinned to
// 0 to match the design.
const FLEX = "var(--font-google-sans-flex), 'Google Sans Flex', system-ui, sans-serif";
const flex = (wdth: number) => ({
  fontFamily: FLEX,
  fontVariationSettings: `"GRAD" 0, "ROND" 0, "wdth" ${wdth}`,
  fontWeight: 500,
});

// Both bits of Figma artwork are reduced to white-on-transparent so they work as
// SVG luminance masks and can be painted any colour — the alternative would be
// inlining ~60KB of paths per stamp just to recolour them.
function ArtMask({
  id,
  href,
  x,
  y,
  width,
  height,
  align = 'xMidYMid meet',
}: {
  id: string;
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align?: string;
}) {
  return (
    <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
      <image href={href} x={x} y={y} width={width} height={height} preserveAspectRatio={align} />
    </mask>
  );
}

// The greeting can be any script, so it still routes through the same font tiers
// as the postal stamp — Google Sans Flex has no Devanagari or CJK either.
function greetingStyle(stamp: Stamp, wdth: number) {
  const tier = SCRIPT_FONTS[stamp.font] ?? SCRIPT_FONTS.pixel;
  const latin = stamp.font === 'pixel' || stamp.font === 'sans';
  return latin
    ? flex(wdth)
    : { fontFamily: tier.family, fontWeight: 600, letterSpacing: `${tier.tracking}px` };
}

function pressDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${d
    .toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })
    .toUpperCase()} ${d.getUTCFullYear()}`;
}

// Place names vary from 'UK' to 'MAGYARORSZÁG'. Measured across all 64 countries,
// only Hungary collided with the date on the globe (by 1.8 units at 5.4), so the
// long tail steps down rather than every stamp paying for the worst case.
function metaSize(text: string, base: number): number {
  const n = text.length;
  if (n > 11) return base * 0.82;
  if (n > 9) return base * 0.9;
  return base;
}

// Long greetings would run past the edge at the design's size, so the big line
// steps down. Measured against the box, not the string's byte length.
function helloSize(text: string, base: number): number {
  const n = [...text].length;
  if (n > 9) return base * 0.52;
  if (n > 6) return base * 0.7;
  return base;
}

export function PassportStamp({ stamp, uid }: { stamp: Stamp; uid: string }) {
  const hex = hexFor(stamp.color);
  return (
    <>
      <defs>
        <ArtMask id={`c-${uid}`} href="/guestbook/continents.svg" x={0} y={0} width={100} height={61.7} />
        <ArtMask
          id={`j-${uid}`}
          href="/guestbook/joy-mark.svg"
          x={5.6}
          y={65.6}
          width={12.7}
          height={9.8}
          align="xMinYMid meet"
        />
      </defs>

      {/* No page fill — the notebook shows through. The Figma artboard is white, so
          the design carries an off-white sheet; on black paper that read as a
          sticker stuck over the page instead of ink pressed into it. Only the
          keyline, the map, the type and the mark are drawn. */}
      {/* Keyline and map take the coarse ink filter, the type the softer one — the
          same split the postal stamp uses, so all three designs distress alike.
          The filter sits on a parent group because SVG applies filters before
          masks: filtering the masked map directly would displace nothing. */}
      <g filter="url(#gb-ink)">
        <rect x="0.56" y="0.56" width="98.88" height="98.88" fill="none" stroke={hex} strokeWidth="1.12" />
        <g mask={`url(#c-${uid})`}>
          <rect x="0" y="0" width="100" height="61.7" fill={hex} />
        </g>
        {/* Joy's pixel mark, bottom left — masked rather than drawn directly, so it
            takes the stamp's colour like everything else. */}
        <g mask={`url(#j-${uid})`}>
          <rect x="5.6" y="65.6" width="12.7" height="9.8" fill={hex} />
        </g>
      </g>

      <g fill={hex} filter="url(#gb-ink-soft)">
        {/* The greeting, right-aligned and wide. */}
        <text x="94" y="74.5" textAnchor="end" fontSize={helloSize(stamp.hello, 11.3)} style={greetingStyle(stamp, 112)}>
          {stamp.hello}
        </text>
        {/* Meta rows, condensed so a full date fits one line. */}
        <text x="4.6" y="82.5" fontSize="6" style={flex(50)}>
          {pressDate(stamp.at)}
        </text>
        <text x="95.4" y="82.5" textAnchor="end" fontSize={metaSize(stamp.place, 6)} style={flex(50)}>
          {stamp.place}
        </text>
        {/* Bottom row is three items across the full width, so it's sized to the
            measured run lengths rather than the design's: FOLIOOFJOY alone is 32.8
            units at size 6, which left no room for GUEST BOOK beside it. At 5.2 it
            runs to ~33, clearing the 38 where GUEST BOOK starts. */}
        <text x="4.6" y="90.9" fontSize="5.2" style={flex(50)}>
          FOLIOOFJOY
        </text>
        <text x="38" y="90.9" fontSize="5.2" style={flex(50)}>
          GUEST BOOK
        </text>
        {/* Bengali brand mark from the design — Joy's own line, not the visitor's
            greeting, so it's fixed and needs the Bengali stack. */}
        <text
          x="95.4"
          y="90.9"
          textAnchor="end"
          fontSize="5.2"
          style={{ fontFamily: SCRIPT_FONTS.bengali.family, fontWeight: 600 }}
        >
          জয় কোরো
        </text>
      </g>
    </>
  );
}

export function GlobeStamp({ stamp, uid }: { stamp: Stamp; uid: string }) {
  const hex = hexFor(stamp.color);
  const meta = { fontSize: 5.4, y: 82.5 };
  // The land and the lettering are knocked clean out of the disc rather than
  // painted the design's off-white: the notebook is dark, so an off-white fill read
  // as a sticker laid on the page. Holes let the paper — or whatever stamp is
  // underneath — show through, which is what ink does.
  //
  // One mask does it: white shows the disc, black hides. Everything that should be
  // a hole is drawn black into the mask, so it all has to live here rather than
  // being painted on top.
  const knock = (
    <mask id={`k-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
      <rect x="0" y="0" width="100" height="100" fill="#fff" />
      <g filter="url(#gb-to-black)">
        <image
          href="/guestbook/continents.svg"
          x="0"
          y="0"
          width="100"
          height="61.7"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
      <g fill="#000">
        <text
          x="50"
          y="74.5"
          textAnchor="middle"
          fontSize={helloSize(stamp.hello, 11.3)}
          style={greetingStyle(stamp, 112)}
        >
          {stamp.hello}
        </text>
        {/* The design sets these as one justified row inside a fixed width; at
            stamp scale two anchored texts hold the same rhythm more reliably. */}
        <text x="18" y={meta.y} fontSize={meta.fontSize} style={flex(39)}>
          {pressDate(stamp.at)}
        </text>
        <text
          x="82"
          y={meta.y}
          textAnchor="end"
          fontSize={metaSize(stamp.place, meta.fontSize)}
          style={flex(39)}
        >
          {stamp.place}
        </text>
        <text x="50" y="90.9" textAnchor="middle" fontSize="6" style={flex(39)}>
          FOLIOOFJOY
        </text>
      </g>
    </mask>
  );

  return (
    <>
      <defs>{knock}</defs>
      {/* Filter on the parent, not the circle: SVG applies a filter before the
          mask, so distressing the circle directly would leave crisp holes in a
          wobbly disc. Filtering the already-masked group breaks up the edge and the
          knockouts together. */}
      <g filter="url(#gb-ink-soft)">
        <circle cx="50" cy="50" r="50" fill={hex} mask={`url(#k-${uid})`} />
      </g>
    </>
  );
}
