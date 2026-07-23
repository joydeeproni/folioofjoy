'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Visual } from './types';

// Renders a single Visual, crossfading whenever `activeKey` changes. The stage
// is a fixed box; each visual is absolutely positioned and object-fit so images
// and video of any aspect ratio settle inside it without reflow.

function VisualContent({ visual }: { visual: Visual }) {
  if (visual.kind === 'image') {
    return (
      <img
        src={visual.src}
        alt={visual.alt}
        className={`h-full w-full ${visual.fit === 'cover' ? 'object-cover' : 'object-contain'}`}
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
        className="h-full w-full object-contain"
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

export function VisualStage({ visual, activeKey }: { visual: Visual; activeKey: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <AnimatePresence mode="sync">
        <motion.div
          key={activeKey}
          className="absolute inset-0"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <VisualContent visual={visual} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
