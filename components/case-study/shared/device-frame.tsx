'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { isVideo } from './media-card';

// A screen shown inside a device. `src` is an image or video (also the poster
// for a live screen). `live` points at the real HTML screen under
// /work/<slug>/live/, rendered in a scaled iframe at its native width.
export type FrameScreen = {
  src: string;
  alt?: string;
  /** URL of the real HTML screen. Mounted only near the viewport. */
  live?: string;
  /** Native CSS width of the screen (390 phone, 1440 web, 1280 tablet). */
  width?: number;
};

export type DeviceKind = 'phone' | 'browser' | 'tablet' | 'bare';

// Viewport ratio (w / h) of the visible screen area, per device. A caller can
// override it, e.g. a 1024×768 tablet screen or an 1440×900 browser.
export const DEVICE_RATIO: Record<DeviceKind, number> = {
  phone: 390 / 844,
  browser: 1440 / 900,
  tablet: 4 / 3,
  bare: 16 / 10,
};

const NATIVE_WIDTH: Record<DeviceKind, number> = { phone: 390, browser: 1440, tablet: 1024, bare: 1440 };

// ── Media query hook (md breakpoint by default) ──────────────────────────────
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => true,
  );
}
export const useIsMd = () => useMediaQuery('(min-width: 768px)');

// ── The pixels inside the frame ──────────────────────────────────────────────
// Fills its (positioned) parent. Images/videos crop from the top, which is what
// matters in UI. Live screens scale the iframe to the frame's width.
export function ScreenContent({
  screen,
  kind = 'bare',
  interactive = false,
  className = '',
}: {
  screen: FrameScreen;
  kind?: DeviceKind;
  interactive?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(0);
  const native = screen.width ?? NATIVE_WIDTH[kind];

  useEffect(() => {
    const el = ref.current;
    if (!el || !screen.live) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '800px 0px' });
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / native));
    io.observe(el);
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, [screen.live, native]);

  const poster = isVideo(screen.src) ? (
    <video src={screen.src} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover object-top" />
  ) : (
    <img src={screen.src} alt={screen.alt ?? ''} loading="lazy" draggable={false} className="h-full w-full object-cover object-top" />
  );

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      {poster}
      {screen.live && near && scale > 0 && (
        <iframe
          src={screen.live}
          title={screen.alt ?? 'Live screen'}
          tabIndex={interactive ? 0 : -1}
          aria-hidden={!interactive}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="absolute left-0 top-0 origin-top-left border-0 bg-transparent transition-opacity duration-500"
          style={{
            width: native,
            height: `${100 / scale}%`,
            transform: `scale(${scale})`,
            opacity: loaded ? 1 : 0,
            pointerEvents: interactive ? 'auto' : 'none',
          }}
        />
      )}
    </div>
  );
}

// ── The device ───────────────────────────────────────────────────────────────
// Sizes by width (the caller sets it with className); height follows `ratio`.
// Everything inside scales with the frame via container units, so a phone
// looks right at 180px and at 480px.
export function DeviceFrame({
  kind,
  screen,
  children,
  ratio,
  url,
  interactive,
  className = '',
}: {
  kind: DeviceKind;
  screen?: FrameScreen;
  /** Custom content instead of `screen` — e.g. a stack of crossfading screens. */
  children?: ReactNode;
  ratio?: number;
  /** Browser only: the text in the address pill. */
  url?: string;
  interactive?: boolean;
  className?: string;
}) {
  const r = ratio ?? DEVICE_RATIO[kind];
  const body = children ?? (screen ? <ScreenContent screen={screen} kind={kind} interactive={interactive} /> : null);

  if (kind === 'phone') {
    return (
      <div className={`@container ${className}`}>
        <div
          className="relative rounded-[15cqw] p-[2.6cqw] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)]"
          style={{ background: 'linear-gradient(145deg,#2a2a2d,#141416)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }}
        >
          <div className="relative overflow-hidden rounded-[12.6cqw] bg-black" style={{ aspectRatio: r }}>
            {body}
            <span className="pointer-events-none absolute left-1/2 top-[2.8cqw] h-[7.6cqw] w-[27cqw] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'tablet') {
    return (
      <div className={`@container ${className}`}>
        <div
          className="relative rounded-[4.2cqw] p-[2cqw] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.85)]"
          style={{ background: 'linear-gradient(145deg,#2a2a2d,#141416)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }}
        >
          <div className="relative overflow-hidden rounded-[2.3cqw] bg-black" style={{ aspectRatio: r }}>
            {body}
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'browser') {
    return (
      <div className={`@container ${className}`}>
        <div className="overflow-hidden rounded-[1.1cqw] border border-white/10 bg-[#1a1a1c] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.85)]">
          <div className="flex h-[max(22px,2.6cqw)] items-center gap-[0.55cqw] px-[1.1cqw]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-[max(6px,0.75cqw)] w-[max(6px,0.75cqw)] rounded-full bg-white/15" />
            ))}
            {url && (
              <span className="mx-auto flex h-[64%] min-w-[28%] items-center justify-center rounded-[0.5cqw] bg-white/[0.06] px-[1.2cqw] font-sans text-[max(8px,0.9cqw)] text-white/45">
                {url}
              </span>
            )}
          </div>
          <div className="relative overflow-hidden bg-white" style={{ aspectRatio: r }}>
            {body}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 shadow-2xl ${className}`} style={{ aspectRatio: r }}>
      {body}
    </div>
  );
}
