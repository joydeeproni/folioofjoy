'use client';

import { useState, type MouseEventHandler } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SpinningText } from '@/components/ui/spinning-text';

// Circular action button (back / view live / explore / read case study).
// Two states:
//   default — dark disc, short yellow label (Praktikal bold, left-aligned,
//             6 characters MAX — longer labels are truncated with a dev warning);
//   hover   — brand-yellow disc with the full text spinning around the centre.
// Touch devices never hover: Tailwind v4 gates hover: to hover-capable devices,
// so on mobile the spun-out state shows while the button is pressed (:active).

const DARK = '#2C2C2C';
const YELLOW = '#E9D80C';

export interface CircleButtonProps {
  label: string; // default-state text, max 6 chars
  arcText: string; // full text spun around the disc on hover/press
  href: string;
  external?: boolean; // render an <a target="_blank"> instead of a Next <Link>
  size?: number; // disc diameter in px — every button uses the default for a uniform size
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

// Maps a work link's label (lib/work/local.ts) to the disc's two texts.
export function circleTexts(label: string): { label: string; arcText: string } {
  const l = label.toLowerCase();
  if (l.includes('live')) return { label: 'LIVE', arcText: 'VIEW LIVE PROJECT' };
  if (l.includes('explore')) return { label: 'OPEN', arcText: 'EXPLORE PROJECT' };
  return { label: label.slice(0, 6), arcText: label };
}

export function CircleButton({
  label,
  arcText,
  href,
  external,
  size = 60,
  className = '',
  onClick,
}: CircleButtonProps) {
  // The spinning arc only mounts while the button could show it (hover, press,
  // or keyboard focus) so idle discs don't run a perpetual animation each.
  const [engaged, setEngaged] = useState(false);

  const short = label.toUpperCase().slice(0, 6);
  if (process.env.NODE_ENV !== 'production' && label.length > 6) {
    console.warn(`CircleButton: label "${label}" is over the 6-char max; showing "${short}"`);
  }

  // 12px caps the label; below ~48px discs it shrinks further so it still fits.
  // External discs carry a trailing ↗, which costs about 1.5 characters.
  const labelSize = Math.min(12, (size * 0.8) / ((short.length + (external ? 1.5 : 0)) * 0.62));
  const arcSize = Math.max(10, Math.round(size * 0.115));
  // A dev-tools-indicator-sized disc can't fit a legible arc, so tiny discs
  // grow out of their corner (top-left origin) while hovered/pressed.
  const tiny = size < 48;
  // SpinningText's radius is in ch of its own font — aim the ring of letters
  // at ~74% of the disc radius (Praktikal advance ≈ 0.6em).
  const arcRadius = (size * 0.37) / (arcSize * 0.6);

  const commonProps = {
    href,
    onClick,
    'aria-label': arcText,
    className: `group relative inline-flex shrink-0 items-center justify-center rounded-full select-none bg-[#2C2C2C] transition-[background-color,transform] duration-200 hover:bg-[#E9D80C] active:bg-[#E9D80C] focus-visible:bg-[#E9D80C] focus-visible:outline-none ${
      tiny ? 'origin-top-left hover:scale-[2.2] active:scale-[2.2] focus-visible:scale-[2.2]' : ''
    } ${className}`,
    style: { width: size, height: size },
    onPointerEnter: () => setEngaged(true),
    onPointerDown: () => setEngaged(true),
    onPointerLeave: () => setEngaged(false),
    onFocus: () => setEngaged(true),
    onBlur: () => setEngaged(false),
  };

  const body = (
    <>
      <span
        aria-hidden
        className="inline-flex items-center gap-px font-mono font-bold uppercase transition-opacity duration-150 group-hover:opacity-0 group-active:opacity-0 group-focus-visible:opacity-0"
        style={{ color: YELLOW, fontSize: labelSize }}
      >
        {short}
        {external && <ArrowUpRight strokeWidth={1} style={{ width: labelSize, height: labelSize }} />}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100"
      >
        {engaged && (
          <SpinningText
            duration={12}
            radius={arcRadius}
            className="font-mono font-bold uppercase"
            style={{ color: DARK, fontSize: arcSize }}
          >
            {arcText.toUpperCase()}
          </SpinningText>
        )}
      </span>
    </>
  );

  return external ? (
    <a {...commonProps} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <Link {...commonProps}>{body}</Link>
  );
}
