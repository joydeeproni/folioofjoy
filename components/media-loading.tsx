'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { DotLoader } from './dot-loader';

// Wraps a media element so a dot-matrix loader sits over it until the bytes land.
//
// LAYOUT. The media element stays the sized thing — call sites put the aspect
// class, object-fit and hover transforms on it, and moving those would mean
// rewriting every caller. So the wrapper is `display: grid` with both children in
// the same cell (1/1): it takes its size from the media, and the loader lands
// exactly on top without a `position: relative` on anything or a second source of
// truth for dimensions.
//
// Both wrapper spans carry `height: 100%`, and that is load-bearing. Two sizing
// conventions exist in the call sites:
//
//   ZoomableShot   the aspect ratio is on the BUTTON and the media is `h-full`
//   bento/MediaCard  the aspect ratio is on the MEDIA itself
//
// Inserting an auto-height wrapper breaks the first: `h-full` resolved against a
// wrapper that was itself sizing to its content, so the image collapsed to 22px.
// `height: 100%` satisfies both — against a definite-height parent it fills, and
// against an auto-height parent it computes to auto and lets the media's own
// aspect ratio decide. Width is deliberately left alone: the marquee media is
// `w-auto`, and forcing 100% there would stretch it.
//
// The row is `minmax(0, 1fr)`, not `1fr`, and the `0` is the whole point. A grid
// item's `height: 100%` resolves against its grid AREA, and a bare `1fr` track
// carries an automatic content-based minimum — so an image that hasn't loaded
// floors the row at its natural height and bursts out of the container. The
// marquee's uniform 540px rows became 716px, 1440px, 1964px, one per file. A zero
// minimum lets the track honour the container instead, and stays harmless where
// the container height is auto.
//
// A cached image can be complete before React attaches onLoad, which would leave
// the loader up forever. The ref check on mount covers that.

export function MediaLoading({
  children,
  className = '',
  loaderSize = 22,
  placeholderAspect,
}: {
  children: ReactNode;
  className?: string;
  loaderSize?: number;
  /**
   * Reserves a box while loading, for call sites where one axis is auto — the
   * marquee is `h-full w-auto`, so before the bytes arrive the item has zero width
   * and there is nowhere to draw. Dropped the moment the media loads, so the real
   * ratio governs and nothing shifts afterwards.
   */
  placeholderAspect?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  // Off-screen loaders hold a static frame. A case study can carry thirty lazy
  // images, and animating all of them meant thirty components re-rendering eight
  // times a second for pixels nobody was looking at.
  const [onScreen, setOnScreen] = useState(false);
  const hostRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || loaded) return;
    const io = new IntersectionObserver(
      ([e]) => setOnScreen(e.isIntersecting),
      // Start a little before it scrolls in, so the loader is already moving by the
      // time it's visible rather than snapping to life.
      { rootMargin: '200px' },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [loaded]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const el = host.querySelector('img, video') as HTMLImageElement | HTMLVideoElement | null;
    if (!el) {
      setLoaded(true);
      return;
    }

    // Already there? A cached image is `complete` before any listener can fire,
    // and a cached video reports readyState >= 1 immediately.
    const done = () => setLoaded(true);
    if (el instanceof HTMLImageElement) {
      if (el.complete && el.naturalWidth > 0) return done();
    } else if (el.readyState >= 1) {
      return done();
    }

    // `error` also clears the loader: a broken src should show the media
    // element's own failure, not spin forever.
    const events = el instanceof HTMLImageElement ? ['load', 'error'] : ['loadeddata', 'error'];
    events.forEach((e) => el.addEventListener(e, done));
    return () => events.forEach((e) => el.removeEventListener(e, done));
  }, [children]);

  // Once loaded the wrapper becomes `display: contents` and stops generating a box
  // at all, so the media is laid out exactly as if this component were not here.
  // That is the point: inserting a box into a height chain broke two call sites in
  // ways that were invisible until measured — ZoomableShot puts the aspect ratio on
  // the button and the media at `h-full`, which collapsed to 22px, and the
  // marquee's `1fr` row was floored by the unloaded image's natural height, so
  // uniform 540px slots became 716/1440/1964px and the images burst their frames.
  // Rather than keep tuning grid tracks to imitate the old layout, the steady state
  // now *is* the old layout, and the grid only exists while the loader is up.
  return (
    <span
      ref={hostRef}
      className={loaded ? className : `grid ${className}`}
      style={
        loaded
          ? { display: 'contents' }
          : {
              gridTemplateAreas: '"m"',
              // minmax(0, ...) so an unloaded image's natural size can't floor the
              // track and push the box past its container.
              gridTemplateRows: 'minmax(0, 1fr)',
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
              aspectRatio: placeholderAspect,
            }
      }
    >
      <span
        style={
          loaded
            ? { display: 'contents' }
            : { gridArea: 'm', display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', height: '100%', minHeight: 0, overflow: 'hidden' }
        }
      >
        {children}
      </span>
      {!loaded && (
        <span
          aria-hidden
          className="pointer-events-none grid place-items-center"
          style={{
            gridArea: 'm',
            // Sits just above the page, not a bright panel — the media fades in
            // over it rather than replacing a flash of light.
            backgroundColor: 'rgba(237,234,224,0.035)',
          }}
        >
          <DotLoader size={loaderSize} animate={onScreen && !reduce} />
        </span>
      )}
    </span>
  );
}
