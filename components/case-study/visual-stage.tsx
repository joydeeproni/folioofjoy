'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Expand, X } from 'lucide-react';
import type { Annotation, Focus, Visual } from './types';

// The right-hand preview: a fixed-size dark rounded panel (no stroke). The
// active visual crossfades inside it, object-contain, so the panel stays a
// consistent size across sections. Interactive `component` visuals render
// centered in the same panel. `zoom` visuals are a guided tour — one wide
// screenshot stays mounted and pans/zooms between sections (see ZoomStage).

const EASE = [0.22, 1, 0.36, 1] as const;
const OVERVIEW: Focus = { x: 0.5, y: 0.5, scale: 1 };

function VisualContent({ visual }: { visual: Visual }) {
  if (visual.kind === 'image') {
    return (
      <img
        src={visual.src}
        alt={visual.alt}
        draggable={false}
        className={`h-full w-full ${visual.fit === 'cover' ? 'object-cover' : 'object-contain'}`}
      />
    );
  }
  if (visual.kind === 'video') {
    return (
      <video
        src={visual.src}
        poster={visual.poster}
        aria-label={visual.alt}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-contain"
      />
    );
  }
  if (visual.kind === 'component') {
    return <div className="flex h-full w-full items-center justify-center">{visual.render()}</div>;
  }
  return null; // `zoom` is handled by ZoomStage, not this crossfade path.
}

function altOf(visual: Visual): string {
  if (visual.kind === 'image' || visual.kind === 'zoom') return visual.alt;
  if (visual.kind === 'video') return visual.alt ?? '';
  return '';
}

// Largest box of aspect ratio `ar` (w/h) that fits inside (cw, ch).
function fitFrame(cw: number, ch: number, ar: number) {
  if (cw <= 0 || ch <= 0) return { w: 0, h: 0 };
  let w = cw;
  let h = cw / ar;
  if (h > ch) {
    h = ch;
    w = ch * ar;
  }
  return { w, h };
}

// One annotation: a pinned dot whose label reveals on hover (always shown where
// hover is unavailable, e.g. touch). Counter-scaled so it stays a constant size
// as the underlying frame zooms.
function AnnotationDot({ a, scale }: { a: Annotation; scale: number }) {
  const side = a.side ?? 'top';
  const labelPos: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  return (
    <motion.div
      className="group/dot absolute z-10"
      style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {/* Counter-scale wrapper keeps the marker a constant on-screen size. */}
      <div className="-translate-x-1/2 -translate-y-1/2" style={{ transform: `translate(-50%,-50%) scale(${1 / scale})` }}>
        <div className="relative">
          <span className="block h-3 w-3 rounded-full ring-2 ring-white/90" style={{ backgroundColor: '#2CA152' }} />
          <span className="absolute inset-0 animate-ping rounded-full" style={{ backgroundColor: 'rgba(44,161,82,0.55)' }} />
          <span
            className={`pointer-events-none absolute ${labelPos[side]} whitespace-nowrap rounded-md px-2.5 py-1.5 font-sans text-[12px] leading-tight opacity-0 shadow-lg transition-opacity duration-200 group-hover/dot:opacity-100 [@media(hover:none)]:opacity-100`}
            style={{ backgroundColor: 'rgba(11,11,11,0.92)', color: '#EDEAE0', border: '1px solid rgba(237,234,224,0.14)' }}
          >
            {a.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// The guided-tour stage. The screenshot stays mounted while consecutive sections
// sharing its `src` pan/zoom it via an animated transform; changing `src`
// crossfades to a new screenshot. Annotations belong to the active section.
function ZoomStage({ visual }: { visual: Extract<Visual, { kind: 'zoom' }> }) {
  const reduce = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  // Aspect ratio of the actual screenshot (w/h), measured on load so real 3:2 /
  // 16:10 captures aren't cropped. Defaults to 16:9 until the image reports in.
  const [ar, setAr] = useState(16 / 9);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const frame = fitFrame(box.w, box.h, ar);
  const focus = visual.focus ?? OVERVIEW;
  const s = focus.scale;
  // Transform-origin top-left: map the focus point to the viewport centre.
  const tx = box.w / 2 - s * focus.x * frame.w;
  const ty = box.h / 2 - s * focus.y * frame.h;

  return (
    <div ref={viewportRef} className="relative h-full w-full overflow-hidden">
      {frame.w > 0 && (
        <AnimatePresence initial={false}>
          <motion.div
            key={visual.src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.4, ease: EASE }}
          >
            <motion.div
              className="absolute left-0 top-0 will-change-transform"
              style={{ width: frame.w, height: frame.h, transformOrigin: '0 0' }}
              initial={false}
              animate={{ x: tx, y: ty, scale: s }}
              transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
            >
              <img
                src={visual.src}
                alt={visual.alt}
                draggable={false}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  if (el.naturalWidth && el.naturalHeight) setAr(el.naturalWidth / el.naturalHeight);
                }}
                className="h-full w-full rounded-lg object-cover"
              />
              <AnimatePresence>
                {visual.annotations?.map((a) => <AnnotationDot key={a.id} a={a} scale={s} />)}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function Lightbox({ visual, onClose }: { visual: Visual; onClose: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  const src = visual.kind === 'image' || visual.kind === 'zoom' ? visual.src : undefined;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-6 md:p-12"
      style={{ backgroundColor: 'rgba(11,11,11,0.92)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.12 : 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={altOf(visual) || 'Expanded view'}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="fixed top-[calc(1.5rem+var(--sat))] right-[calc(1.5rem+var(--sar))] z-[121] inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-sans text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <X className="h-4 w-4" aria-hidden />
        Close
      </button>
      <motion.div
        className="flex max-h-full max-w-full items-center justify-center"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0.12 : 0.3, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        {src ? (
          <img src={src} alt={altOf(visual)} draggable={false} className="max-h-[86dvh] max-w-[92vw] rounded-xl object-contain" />
        ) : visual.kind === 'video' ? (
          <video
            src={visual.src}
            poster={visual.poster}
            aria-label={visual.alt}
            autoPlay
            muted
            loop
            playsInline
            className="max-h-[86dvh] max-w-[92vw] rounded-xl object-contain"
          />
        ) : (
          <div className="max-h-[86dvh] max-w-[92vw]">{visual.kind === 'component' && visual.render()}</div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function VisualStage({ visual, activeKey }: { visual: Visual; activeKey: string }) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const canExpand = visual.kind === 'image' || visual.kind === 'video' || visual.kind === 'zoom';

  useEffect(() => {
    setExpanded(false);
  }, [activeKey]);

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-xl bg-white/[0.04] p-4 md:p-6">
      <div className="relative h-full w-full">
        {visual.kind === 'zoom' ? (
          <ZoomStage visual={visual} />
        ) : (
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={activeKey}
              className="absolute inset-0"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.5, ease: EASE }}
            >
              <VisualContent visual={visual} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {canExpand && (
        <button
          onClick={() => setExpanded(true)}
          aria-label="Expand image"
          className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:text-white focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Expand className="h-4 w-4" aria-hidden />
        </button>
      )}

      <AnimatePresence>{expanded && <Lightbox visual={visual} onClose={() => setExpanded(false)} />}</AnimatePresence>
    </div>
  );
}
