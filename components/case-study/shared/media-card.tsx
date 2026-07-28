'use client';

import { Expand } from 'lucide-react';
import { FG, MUTED } from './tokens';

// Which srcs are video. Query strings tolerated so Blob URLs with params work.
export const isVideo = (src: string) => /\.(mp4|webm)(\?|$)/i.test(src);

export type MediaItem = { src: string; caption?: string; alt?: string };

// A bare media element — no frame. The caller owns the shell, which is what lets
// ZoomableShot put its own button/overlay around the same renderer.
export function Media({
  src,
  className = '',
  alt = '',
}: {
  src: string;
  className?: string;
  alt?: string;
}) {
  return isVideo(src) ? (
    <video src={src} autoPlay muted loop playsInline preload="metadata" className={className} />
  ) : (
    <img src={src} alt={alt} loading="lazy" draggable={false} className={className} />
  );
}

const SHELL = 'rounded-xl border border-white/10 shadow-2xl';

// Framed media. `aspect` is a Tailwind aspect class — the single knob that lets one
// component serve 16:10 desktop shots and 9:19.5 phone screens.
export function MediaCard({
  src,
  aspect,
  className = '',
  alt = '',
  objectPosition = 'object-center',
}: {
  src: string;
  aspect: string;
  className?: string;
  alt?: string;
  /** Which edge survives the crop. Defaults to centre, matching the video cards
   *  this replaced — pass `object-top` for UI screenshots, where the top matters. */
  objectPosition?: string;
}) {
  return (
    <Media src={src} alt={alt} className={`${aspect} ${SHELL} object-cover ${objectPosition} ${className}`} />
  );
}

// Framed media that opens in the lightbox, with a hover dim + expand affordance
// and a caption that fades in beneath.
export function ZoomableShot({
  item,
  aspect,
  className = '',
  onOpen,
}: {
  item: MediaItem;
  aspect: string;
  className?: string;
  onOpen: (src: string) => void;
}) {
  return (
    <div className={`group relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => onOpen(item.src)}
        className={`relative block w-full cursor-zoom-in overflow-hidden ${aspect} ${SHELL}`}
      >
        <Media src={item.src} alt={item.alt ?? ''} className="h-full w-full object-cover object-top" />
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ backgroundColor: 'rgba(11,11,11,0.28)' }}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(11,11,11,0.55)', border: '1px solid rgba(237,234,224,0.35)' }}
          >
            <Expand className="h-5 w-5" style={{ color: FG }} aria-hidden />
          </span>
        </span>
      </button>
      {item.caption && (
        <span
          className="pointer-events-none absolute inset-x-0 top-full mt-2 truncate text-center font-sans text-[13px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ color: MUTED }}
        >
          {item.caption}
        </span>
      )}
    </div>
  );
}
