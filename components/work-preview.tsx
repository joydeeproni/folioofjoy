'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { MobileGallery } from './mobile-gallery';
import { WorkCarousel } from './work/work-carousel';
import { useWork } from './content-provider';

// SVC = service for others, JOY = fun/experiments, BIZ = money work, DTY = duty/busywork.
export type { WorkCategory, WorkItem } from '@/lib/content/types';

// Some work items are short video loops rather than stills.
export const isVideo = (src: string) => src.endsWith('.mp4');

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

export function WorkLink() {
  const WORK_ITEMS = useWork();
  const PREVIEW_IMAGES = WORK_ITEMS.slice(0, 4);
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; speed: number; size: number }>>([]);

  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop carousel open/close (the carousel's own physics live in WorkCarousel).
  const [carouselMounted, setCarouselMounted] = useState(false);
  const [carouselVisible, setCarouselVisible] = useState(false);

  const openCarousel = useCallback(() => {
    setCarouselMounted(true);
    requestAnimationFrame(() => { requestAnimationFrame(() => setCarouselVisible(true)); });
  }, []);

  const closeCarousel = useCallback(() => {
    setCarouselVisible(false);
    setTimeout(() => setCarouselMounted(false), 400);
  }, []);

  useEffect(() => {
    if (!carouselMounted) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCarousel(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [carouselMounted, closeCarousel]);

  const handleClick = () => {
    if (isMobile) setMobileOpen(true);
    else openCarousel();
  };

  return (
    <>
      <span className="relative inline-block">
        <button
          onMouseEnter={() => {
            setShowPreview(true);
            const newParticles = Array.from({ length: 6 }, (_, i) => ({
              id: Date.now() + i, angle: (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.5,
              speed: 20 + Math.random() * 30, size: 2 + Math.random() * 3,
            }));
            setParticles(newParticles);
            setTimeout(() => setParticles([]), 1600);
          }}
          onMouseLeave={() => setShowPreview(false)}
          onClick={handleClick}
          className="underline text-white/80 hover:text-white underline-offset-2 cursor-pointer"
        >
          here
        </button>

        {particles.map((p) => (
          <span key={p.id} className="absolute pointer-events-none rounded-full bg-white"
            style={{ width: p.size, height: p.size, left: '50%', top: '50%', opacity: 0,
              animation: 'particle-burst 1400ms ease-out forwards',
              '--px': `${Math.cos(p.angle) * p.speed}px`, '--py': `${Math.sin(p.angle) * p.speed}px`,
            } as React.CSSProperties} />
        ))}

        <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none transition-all duration-400 ease-out block ${showPreview ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}>
          <span className="relative block w-52 h-40">
            {PREVIEW_IMAGES.map((item, i) => (
              <img key={item.src} src={item.src} alt=""
                className="absolute rounded-lg shadow-xl border border-white/10 object-cover w-36 h-26 transition-all duration-500 ease-out"
                style={{
                  left: showPreview ? `${i * 12}px` : '24px', top: showPreview ? `${i * -6}px` : '12px',
                  zIndex: PREVIEW_IMAGES.length - i,
                  transform: showPreview ? `rotate(${(i - 1.5) * 5}deg) scale(1)` : 'rotate(0deg) scale(0.85)',
                  opacity: showPreview ? 1 : 0, transitionDelay: showPreview ? `${i * 60}ms` : '0ms',
                }} />
            ))}
          </span>
        </span>
      </span>

      {/* Mobile: masonry gallery */}
      <MobileGallery items={WORK_ITEMS} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Desktop: free-scrolling carousel */}
      {carouselMounted && typeof document !== 'undefined' && createPortal((
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-400 ease-out ${carouselVisible ? 'opacity-100' : 'opacity-0'}`} onClick={closeCarousel}>
          <div className={`absolute inset-0 bg-black backdrop-blur-xl transition-all duration-400 ${carouselVisible ? 'opacity-100' : 'opacity-0'}`} />

          <button onClick={closeCarousel} className={`absolute top-6 left-6 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 ${carouselVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{ transitionDelay: carouselVisible ? '200ms' : '0ms' }}>
            <X className="w-5 h-5 text-white" />
          </button>

          <div className={`relative z-10 w-full transition-all duration-500 ${carouselVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <WorkCarousel items={WORK_ITEMS} />
          </div>

          {/* Pinned to the bottom of the screen, independent of the carousel. */}
          <p className={`pointer-events-none select-none absolute inset-x-0 bottom-[calc(1.5rem+var(--sab))] z-10 px-6 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/30 transition-opacity duration-500 ${carouselVisible ? 'opacity-100' : 'opacity-0'}`}>
            Snippets of my shipped work, WIP frames, prototypes, both messy &amp; polished. Scroll to go through
          </p>
        </div>
      ), document.body)}
    </>
  );
}
