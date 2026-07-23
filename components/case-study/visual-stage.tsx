'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Expand, X } from 'lucide-react';
import type { Visual } from './types';

// Renders a single Visual, crossfading whenever `activeKey` changes. The stage
// is a fixed box; each visual is absolutely positioned and object-fit so images
// and video of any aspect ratio settle inside it without reflow. Image/video
// visuals get an expand affordance that opens them larger in a lightbox.

function VisualContent({ visual }: { visual: Visual }) {
  if (visual.kind === 'image') {
    return (
      <img
        src={visual.src}
        alt={visual.alt}
        className={
          visual.fit === 'cover'
            ? 'h-full w-full object-cover'
            : 'max-h-full max-w-full object-contain'
        }
        draggable={false}
      />
    );
  }
  if (visual.kind === 'video') {
    return (
      <video
        src={visual.src}
        poster={visual.poster}
        aria-label={visual.alt}
        className="max-h-full max-w-full object-contain"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  // kind === 'component' — render the node. Annotation overlay is intentionally
  // not drawn in this pass (reserved for the Lounge-panel showcase).
  return <div className="flex h-full w-full items-center justify-center">{visual.render()}</div>;
}

function altOf(visual: Visual): string {
  if (visual.kind === 'image') return visual.alt;
  if (visual.kind === 'video') return visual.alt ?? '';
  return '';
}

function Lightbox({ visual, onClose }: { visual: Visual; onClose: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    // Capture phase + stopImmediatePropagation so Escape closes the lightbox
    // and does NOT also fire BackLink's window-level Escape → navigate handler.
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
        transition={{ duration: reduce ? 0.12 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {visual.kind === 'image' ? (
          <img
            src={visual.src}
            alt={visual.alt}
            draggable={false}
            className="max-h-[86dvh] max-w-[92vw] rounded-xl border border-white/10 object-contain"
          />
        ) : visual.kind === 'video' ? (
          <video
            src={visual.src}
            poster={visual.poster}
            aria-label={visual.alt}
            autoPlay
            muted
            loop
            playsInline
            className="max-h-[86dvh] max-w-[92vw] rounded-xl border border-white/10 object-contain"
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
  const [expanded, setExpanded] = useState(false);
  const canExpand = visual.kind === 'image' || visual.kind === 'video';

  // Close the lightbox if the active section (and thus the visual) changes.
  useEffect(() => {
    setExpanded(false);
  }, [activeKey]);

  return (
    <div className="group relative flex h-full w-full items-center justify-center">
      {/* No frame/border: each visual sizes to its own aspect (max-h/max-w),
          so a portrait phone stays tall and a wide web view spreads wide.
          initial={false} — the first visual is already on screen when the page
          reveals; only subsequent scroll-driven swaps should crossfade. */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={activeKey}
          className="absolute inset-0 flex items-center justify-center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <VisualContent visual={visual} />
        </motion.div>
      </AnimatePresence>

      {canExpand && (
        <button
          onClick={() => setExpanded(true)}
          aria-label="Expand image"
          className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:text-white focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Expand className="h-4 w-4" aria-hidden />
        </button>
      )}

      <AnimatePresence>
        {expanded && <Lightbox visual={visual} onClose={() => setExpanded(false)} />}
      </AnimatePresence>
    </div>
  );
}
