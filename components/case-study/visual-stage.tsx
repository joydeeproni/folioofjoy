'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Expand, X } from 'lucide-react';
import type { Visual } from './types';

// The right-hand preview. A single frame (dark surface, rounded, no stroke)
// sizes itself to the active visual's aspect ratio and ANIMATES that size as you
// scroll from one section to the next — so a tall phone morphs into a wide web
// view rather than hard-cutting. The media crossfades inside the frame.
// Interactive `component` visuals skip the frame (they size themselves).

const EASE = [0.22, 1, 0.36, 1] as const;

function altOf(visual: Visual): string {
  if (visual.kind === 'image') return visual.alt;
  if (visual.kind === 'video') return visual.alt ?? '';
  return '';
}

// Contain-fit a box of aspect `ar` inside cw × ch.
function fit(cw: number, ch: number, ar: number | null) {
  if (!cw || !ch || !ar) return null;
  let w = cw;
  let h = cw / ar;
  if (h > ch) {
    h = ch;
    w = ch * ar;
  }
  return { w, h };
}

function Media({ visual, onAr }: { visual: Visual; onAr: (src: string, ar: number) => void }) {
  if (visual.kind === 'image') {
    return (
      <img
        src={visual.src}
        alt={visual.alt}
        draggable={false}
        onLoad={(e) => {
          const el = e.currentTarget;
          if (el.naturalHeight) onAr(visual.src, el.naturalWidth / el.naturalHeight);
        }}
        className="h-full w-full object-contain"
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
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          if (el.videoHeight) onAr(visual.src, el.videoWidth / el.videoHeight);
        }}
        className="h-full w-full object-contain"
      />
    );
  }
  return null;
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
        {visual.kind === 'image' ? (
          <img src={visual.src} alt={visual.alt} draggable={false} className="max-h-[86dvh] max-w-[92vw] rounded-xl object-contain" />
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
          <div className="max-h-[86dvh] max-w-[92vw]">{visual.render()}</div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function VisualStage({ visual, activeKey }: { visual: Visual; activeKey: string }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ cw: 0, ch: 0 });
  const arCache = useRef<Map<string, number>>(new Map());
  const [ar, setAr] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const isComponent = visual.kind === 'component';
  const src = isComponent ? null : visual.src;
  const canExpand = !isComponent;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setBox({ cw: el.clientWidth, ch: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // On section change: adopt the cached aspect if we know it; otherwise keep the
  // current frame size until the new media reports its ratio (avoids a flash).
  useEffect(() => {
    setExpanded(false);
    if (!src) {
      setAr(null);
      return;
    }
    const cached = arCache.current.get(src);
    if (cached) setAr(cached);
  }, [activeKey, src]);

  const onAr = (s: string, a: number) => {
    arCache.current.set(s, a);
    if (s === src) setAr(a);
  };

  const sized = fit(box.cw, box.ch, ar);
  const frameW = sized ? sized.w : box.cw || '100%';
  const frameH = sized ? sized.h : box.ch || '100%';

  return (
    <div ref={rootRef} className="group relative flex h-full w-full items-center justify-center">
      {isComponent ? (
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={activeKey}
            className="absolute inset-0 flex items-center justify-center"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.5, ease: EASE }}
          >
            {visual.render()}
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={false}
          animate={{ width: frameW, height: frameH }}
          transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
          className="relative overflow-hidden rounded-xl bg-white/[0.04] p-4 md:p-6"
        >
          <div className="relative h-full w-full">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={activeKey}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.15 : 0.4, ease: EASE }}
              >
                <Media visual={visual} onAr={onAr} />
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={() => setExpanded(true)}
            aria-label="Expand image"
            className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:text-white focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <Expand className="h-4 w-4" aria-hidden />
          </button>
        </motion.div>
      )}

      {canExpand && (
        <AnimatePresence>{expanded && <Lightbox visual={visual} onClose={() => setExpanded(false)} />}</AnimatePresence>
      )}
    </div>
  );
}
