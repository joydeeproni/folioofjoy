'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { isVideo } from './media-card';

const FRAME = 'max-h-[90dvh] max-w-[94vw] rounded-xl object-contain';

// Click-to-open media overlay. Esc or a backdrop click closes it; body scroll is
// locked while open. Renders a player for video srcs and an image otherwise.
export function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-6 md:p-12"
          style={{ backgroundColor: 'rgba(11,11,11,0.93)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          {isVideo(src) ? (
            <motion.video
              src={src}
              controls
              autoPlay
              loop
              playsInline
              className={FRAME}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <motion.img
              src={src}
              alt=""
              draggable={false}
              className={FRAME}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
