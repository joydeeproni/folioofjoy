'use client';

import { forwardRef, useState, type ReactNode } from 'react';
import { NOTEBOOK_DEFAULTS, type NotebookDesign } from '@/lib/guestbook/design';

// An open notebook spread — two black dotted leaves meeting at a spine, with
// page-edge stacks and a shadow under the book.
//
// WHY THE SPREAD IS NOT `preserve-3d`
//
// The obvious build is a preserve-3d spread so the leaves are real planes in
// space. Don't: it silently eats the ink. Each leaf is rotated a few degrees
// about the fold, so at 3.5° its outer edge sits ~30px off the z=0 plane, and any
// sibling layer above it — the stamps, the hover affordance, the turning page —
// loses the 3D depth test wherever the paper is nearer the viewer than that
// layer. The stamps survived only within ~16px of the fold: measured as ink
// landing in just the two centre bands of ten sampled across the spread, then
// spreading across all ten the moment the context was flattened.
//
// Flattening costs nothing here. The leaves still render their rotation, they
// just can't interpenetrate their siblings, so ordinary paint order applies and
// the ink stays on top. The depth cue was never coming from real 3D anyway — it's
// the gutter gradient, the rounded outer corners, the page stack and the contact
// shadow doing that work.

function DotGrid({ design }: { design: NotebookDesign }) {
  const { dotPitch: p, dotRadius: r, dotOpacity: o } = design;
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full">
      <defs>
        <pattern id="nb-dots" width={p} height={p} patternUnits="userSpaceOnUse">
          <circle cx={r + 0.5} cy={r + 0.5} r={r} fill={`rgba(237,234,224,${o})`} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nb-dots)" />
    </svg>
  );
}

// One leaf. `side` decides which edge is the fold, which drives the corner
// rounding and the direction of the gutter gradient.
function Leaf({ side, design }: { side: 'left' | 'right'; design: NotebookDesign }) {
  const { cornerRadius: cr, pageColor, gutterWidth, gutterDark, spineHighlight, leafRotY } = design;
  const isLeft = side === 'left';

  return (
    <div
      className="relative h-full flex-1 overflow-hidden"
      style={{
        backgroundColor: pageColor,
        borderTopLeftRadius: isLeft ? cr : 0,
        borderBottomLeftRadius: isLeft ? cr : 0,
        borderTopRightRadius: isLeft ? 0 : cr,
        borderBottomRightRadius: isLeft ? 0 : cr,
        // Outer edges tip away from the reader, the way an open book settles on a
        // desk. Origin on the fold so the halves stay joined as they rotate.
        transform: `rotateY(${isLeft ? -leafRotY : leafRotY}deg)`,
        transformOrigin: isLeft ? 'right center' : 'left center',
      }}
    >
      <DotGrid design={design} />

      {/* Paper curving down into the gutter — the main depth cue. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0"
        style={{
          [isLeft ? 'right' : 'left']: 0,
          width: `${gutterWidth}%`,
          background: `linear-gradient(to ${isLeft ? 'right' : 'left'},
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,${gutterDark * 0.35}) 55%,
            rgba(0,0,0,${gutterDark}) 100%)`,
        }}
      />

      {/* A thin lift of light along the outer edge, where a real page catches the
          room. Without it the leaf dissolves into the background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0"
        style={{
          [isLeft ? 'left' : 'right']: 0,
          width: '1px',
          background: `rgba(237,234,224,${spineHighlight * 2.2})`,
        }}
      />
    </div>
  );
}

export const Notebook = forwardRef<
  HTMLDivElement,
  {
    design?: NotebookDesign;
    /** The ink layer, positioned in one 0–1 space across the whole spread. */
    children?: ReactNode;
    /** Chrome that sits above everything — status text and the like. */
    overlay?: ReactNode;
    onPress?: (x: number, y: number) => void;
    onHover?: (p: { x: number; y: number } | null) => void;
    cursor?: string;
    turning?: 'next' | 'prev' | null;
    /** Clicking the outer edge of a leaf turns the book. */
    onTurn?: (dir: 'next' | 'prev') => void;
    canTurnPrev?: boolean;
    canTurnNext?: boolean;
    /** Width of each turn band, as a fraction of the whole spread. */
    edgeZone?: number;
  }
>(function Notebook(
  {
    design = NOTEBOOK_DEFAULTS,
    children,
    overlay,
    onPress,
    onHover,
    cursor = 'default',
    turning = null,
    onTurn,
    canTurnPrev = true,
    canTurnNext = true,
    edgeZone = 0.11,
  },
  ref,
) {
  const [edge, setEdge] = useState<'next' | 'prev' | null>(null);

  const {
    leafAspect,
    perspective,
    tiltX,
    cornerRadius,
    stackCount,
    stackOffset,
    shadowBlur,
    shadowOpacity,
    shadowY,
    pageColor,
    spineHighlight,
    turnDuration,
  } = design;

  // The outer edge of each leaf turns the book; the interior is left to the page
  // so "press anywhere to leave your mark" stays true of the paper you can
  // actually write on.
  const edgeAt = (x: number): 'next' | 'prev' | null => {
    if (!onTurn) return null;
    if (canTurnNext && x >= 1 - edgeZone) return 'next';
    if (canTurnPrev && x <= edgeZone) return 'prev';
    return null;
  };

  // Takes anything with client coords, so the pointer-move and click handlers can
  // share it (React's MouseEvent and PointerEvent are separate types).
  const toFraction = (e: { clientX: number; clientY: number }, el: HTMLElement) => {
    const box = el.getBoundingClientRect();
    return { x: (e.clientX - box.left) / box.width, y: (e.clientY - box.top) / box.height };
  };

  return (
    <div className="relative w-full" style={{ perspective: `${perspective}px` }}>
      {/* Contact shadow on the desk. Behind the spread and inset, so it reads as
          contact rather than a halo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: '6%',
          right: '6%',
          bottom: -shadowY,
          height: shadowBlur,
          background: `radial-gradient(ellipse at center, rgba(0,0,0,${shadowOpacity}) 0%, rgba(0,0,0,0) 70%)`,
          filter: `blur(${shadowBlur / 3}px)`,
        }}
      />

      <div
        className="relative"
        style={{ transform: `rotateX(${tiltX}deg)`, aspectRatio: `${leafAspect * 2}` }}
      >
        {/* Page stack: slivers peeking past each outer edge. Edges only — never
            pointer targets. */}
        {Array.from({ length: Math.round(stackCount) }, (_, i) => {
          const d = (i + 1) * stackOffset;
          return (
            <div
              key={i}
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                inset: `${d * 0.5}px -${d}px -${d * 0.5}px -${d}px`,
                backgroundColor: pageColor,
                borderRadius: cornerRadius,
                opacity: 1 - i * 0.22,
                boxShadow: `0 0 0 1px rgba(237,234,224,${spineHighlight * 0.7})`,
              }}
            />
          );
        })}

        {/* The live spread. Deliberately flat — see the note at the top. */}
        <div
          ref={ref}
          onPointerMove={(e) => {
            if (e.pointerType === 'touch') return;
            const f = toFraction(e, e.currentTarget);
            const z = edgeAt(f.x);
            setEdge(z);
            // Suppress the stamp ghost over a turn band so the two affordances are
            // never both armed.
            onHover?.(z ? null : f);
          }}
          onPointerLeave={() => {
            setEdge(null);
            onHover?.(null);
          }}
          onClick={(e) => {
            const f = toFraction(e, e.currentTarget);
            const z = edgeAt(f.x);
            if (z) {
              onTurn?.(z);
              return;
            }
            onPress?.(f.x, f.y);
          }}
          // Focusable with no visible control of its own — a keyboard can't supply
          // a pointer position, and there's no "stamp here" button any more.
          role={onPress ? 'button' : undefined}
          tabIndex={onPress ? 0 : undefined}
          aria-label={onPress ? 'Press a stamp into the guestbook' : undefined}
          onKeyDown={(e) => {
            if (!onPress || (e.key !== 'Enter' && e.key !== ' ')) return;
            e.preventDefault();
            onPress(0.25 + Math.random() * 0.5, 0.25 + Math.random() * 0.5);
          }}
          className="absolute inset-0 flex overflow-hidden select-none outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          style={{ cursor: edge ? 'pointer' : cursor, borderRadius: cornerRadius }}
        >
          <Leaf side="left" design={design} />
          <Leaf side="right" design={design} />

          {/* Ink. One layer over both leaves, in the spread's own 0–1 space, so a
              stamp can straddle the gutter the way real ink does. */}
          <div className="pointer-events-none absolute inset-0">{children}</div>

          {/* Hover affordance on whichever outer edge is armed. */}
          {onTurn &&
            (['prev', 'next'] as const).filter((dir) =>
              dir === 'prev' ? canTurnPrev : canTurnNext,
            ).map((dir) => (
              <div
                key={dir}
                aria-hidden
                className="pointer-events-none absolute inset-y-0 transition-opacity duration-200"
                style={{
                  [dir === 'prev' ? 'left' : 'right']: 0,
                  width: `${edgeZone * 100}%`,
                  opacity: edge === dir ? 1 : 0.32,
                  background: `linear-gradient(to ${dir === 'prev' ? 'right' : 'left'},
                    rgba(237,234,224,${edge === dir ? 0.09 : 0.035}) 0%, rgba(237,234,224,0) 100%)`,
                  borderRadius: cornerRadius,
                }}
              >
                <span
                  className="absolute top-1/2 -translate-y-1/2 font-sans text-xl"
                  style={{
                    [dir === 'prev' ? 'left' : 'right']: '22%',
                    color: 'rgba(237,234,224,0.65)',
                  }}
                >
                  {dir === 'prev' ? '‹' : '›'}
                </span>
              </div>
            ))}

          {/* The fold, over the ink — ink doesn't survive the crease of a real
              book either. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2"
            style={{
              width: 3,
              background: `linear-gradient(to right,
                rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 45%,
                rgba(237,234,224,${spineHighlight}) 50%,
                rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.85) 100%)`,
            }}
          />

          {/* Page-turn leaf, mounted only mid-turn. Its rotateY needs a 3D
              context, scoped to this wrapper rather than the whole spread. */}
          {turning && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                aria-hidden
                className="absolute inset-y-0"
                style={{
                  [turning === 'next' ? 'right' : 'left']: 0,
                  width: '50%',
                  backgroundColor: pageColor,
                  transformOrigin: turning === 'next' ? 'left center' : 'right center',
                  animation: `nb-turn-${turning} ${turnDuration}s cubic-bezier(0.42, 0, 0.35, 1) forwards`,
                  boxShadow: '0 0 40px rgba(0,0,0,0.8)',
                  borderRadius: cornerRadius,
                }}
              />
            </div>
          )}

          {overlay}
        </div>
      </div>
    </div>
  );
});
