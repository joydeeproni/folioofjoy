'use client';

import { hexFor } from '@/lib/guestbook/types';
import type { Stamp } from '@/lib/guestbook/types';
import { STAMP_DEFAULTS, type StampDesign } from '@/lib/guestbook/design';
import { PIXEL, PIXEL_GAPS, SANS, SCRIPT_FONTS } from './stamp-fonts';
import { GlobeStamp, PassportStamp } from './stamp-styles';

// Arc paths for the two rings of text. Both run LEFT-TO-RIGHT (x=10 → x=90);
// what differs is the sweep flag, which picks the half of the circle travelled:
// sweep 1 goes over the top, sweep 0 under the bottom.
//
// Glyphs on a textPath stand perpendicular to the direction of travel, with
// their "up" to the left of it. Over the top that points away from the centre,
// so letters grow outward and the baseline sits at the band's inner edge (r=40).
// Under the bottom it points toward the centre, so letters grow inward and the
// baseline belongs at the band's outer edge (r=44). Hence the different radii —
// both text rings then land between the two circles rather than inside them.
const topArc = (r: number) => `M ${50 - r},50 A ${r},${r} 0 0 1 ${50 + r},50`;
const bottomArc = (r: number) => `M ${50 - r},50 A ${r},${r} 0 0 0 ${50 + r},50`;

// One shared set of defs for every stamp on the page: the ink filters and the
// two text arcs. Rendered once by the notebook rather than per stamp — 40-odd
// copies of an feTurbulence would be a real cost for an identical result, and
// duplicating the arc ids across stamps would be invalid HTML.
export function StampDefs({ design = STAMP_DEFAULTS }: { design?: StampDesign } = {}) {
  return (
    <svg aria-hidden width="0" height="0" className="absolute" style={{ position: 'absolute' }}>
      <defs>
        <path id="gb-top" d={topArc(design.topArcR)} />
        <path id="gb-bottom" d={bottomArc(design.bottomArcR)} />
        <filter id="gb-ink" x="-20%" y="-20%" width="140%" height="140%">
          {/* Coarse noise displaces the outline so rings and letters break up
              like ink pressed unevenly onto paper. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency={design.inkFreq}
            numOctaves={Math.round(design.inkOctaves)}
            seed="7"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={design.inkScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="gb-ink-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency={design.textInkFreq} numOctaves="3" seed="3" result="n2" />
          <feDisplacementMap in="SourceGraphic" in2="n2" scale={design.textInkScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Zeroes RGB, keeps alpha — turns the white-shape artwork black without
            touching its coverage. Needed because a luminance mask hides where it's
            black, and the exported SVGs are white so they'd otherwise reveal. Used
            to punch the landmass and lettering out of the globe. */}
        <filter id="gb-to-black" x="-20%" y="-20%" width="140%" height="140%">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}

function pressDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }).toUpperCase();
  return `${day} ${month} ${d.getUTCFullYear()}`;
}

// Long greetings have to shrink or they'd collide with themselves on the arc.
// Counted in grapheme clusters, not UTF-16 units: "नमस्ते" is 6 code units but
// reads as 3 clusters, and String.length would shrink it as if it were long.
function clusterCount(text: string): number {
  try {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return [...seg.segment(text)].length;
  } catch {
    return [...text].length;
  }
}

function arcSize(text: string, scale = 1, max = 10): number {
  const n = clusterCount(text);
  // Step down as the greeting lengthens, proportional to the design's base size.
  const base = n > 11 ? max * 0.74 : n > 8 ? max * 0.86 : max;
  return Math.round(base * scale * 10) / 10;
}

export function GuestbookStamp({
  stamp,
  preview = false,
  design = STAMP_DEFAULTS,
}: {
  stamp: Stamp;
  preview?: boolean;
  design?: StampDesign;
}) {
  const hex = hexFor(stamp.color);
  const script = SCRIPT_FONTS[stamp.font] ?? SCRIPT_FONTS.pixel;
  const style = stamp.style ?? 'postal';
  // Mask/clip ids inside the passport and globe styles have to be unique per
  // stamp, or 40 stamps on a spread would all resolve to the first one's mask.
  const uid = stamp.id.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full overflow-visible"
      style={{
        // `screen` — not `multiply`. Multiply is the right model for ink on white
        // paper, but this paper is near-black, and multiplying any colour into
        // black returns black: the purple and red stamps disappeared entirely.
        // Screen is its dark-ground equivalent, so overlaps accumulate light and
        // still read as layered ink.
        //
        // The globe is the exception: it's a solid disc, and screening a solid fill
        // against near-black paper washes it out. Postal and passport are both line
        // art on transparent, so they layer as ink.
        mixBlendMode:
          style === 'globe' ? 'normal' : (design.blend as React.CSSProperties['mixBlendMode']),
        opacity: preview ? design.opacity * 0.42 : design.opacity,
      }}
      role="img"
      aria-label={`${stamp.line}, ${pressDate(stamp.at)}`}
    >
      <title>{`${stamp.line} — ${pressDate(stamp.at)}`}</title>

      {style === 'passport' && <PassportStamp stamp={stamp} uid={uid} />}
      {style === 'globe' && <GlobeStamp stamp={stamp} uid={uid} />}

      {style === 'postal' && (
        <>
      <g filter="url(#gb-ink)" fill="none" stroke={hex} strokeWidth={design.outerW}>
        <circle cx="50" cy="50" r={design.outerR} />
        <circle cx="50" cy="50" r={design.innerR} strokeWidth={design.innerW} />
      </g>

      <g filter="url(#gb-ink-soft)" fill={hex}>
        {/* Greeting ring — original script, in whichever font can actually set
            it. `style` rather than the presentation attribute so the CSS
            variables in the stack resolve. */}
        <text
          fontSize={arcSize(stamp.hello, script.scale, design.arcSize)}
          fontWeight={700}
          direction={script.rtl ? 'rtl' : undefined}
          style={{ fontFamily: script.family, letterSpacing: `${script.tracking}px` }}
        >
          <textPath href="#gb-top" startOffset="50%" textAnchor="middle">
            {stamp.hello}
          </textPath>
        </text>
        {/* Place ring stays Latin, so it's always Geist Pixel — that keeps one
            constant piece of brand type on every stamp regardless of script. */}
        <text
          fontSize={arcSize(stamp.place, 1, design.placeSize)}
          fontWeight={700}
          style={{
            fontFamily: PIXEL_GAPS.test(stamp.place) ? SANS : PIXEL,
            letterSpacing: '1.1px',
          }}
        >
          <textPath href="#gb-bottom" startOffset="50%" textAnchor="middle">
            {stamp.place}
          </textPath>
        </text>

        {/* Middle block: two hairlines bracketing the press date, straight off
            the passport-stamp reference. */}
        <text
          x="50"
          y={design.dateY}
          textAnchor="middle"
          fontSize={design.dateSize}
          fontWeight={700}
          style={{ fontFamily: PIXEL, letterSpacing: '0.2px' }}
        >
          {pressDate(stamp.at)}
        </text>
      </g>

      <g filter="url(#gb-ink-soft)" stroke={hex} strokeWidth={design.ruleW}>
        <line x1={design.ruleInset} y1={50 - design.ruleGap} x2={100 - design.ruleInset} y2={50 - design.ruleGap} />
        <line x1={design.ruleInset} y1={50 + design.ruleGap} x2={100 - design.ruleInset} y2={50 + design.ruleGap} />
      </g>
        </>
      )}
    </svg>
  );
}
