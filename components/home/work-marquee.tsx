'use client';

import { useEffect, useRef, useState } from 'react';
import { isVideo } from '@/components/work-preview';
import { useWork } from '@/components/content-provider';

const SPEED = 0.5; // px per frame — slow right→left drift

// Auto-scrolling filmstrip of every project. Drifts right→left, can be dragged
// to pan, and surfaces the caption of whichever item sits nearest screen centre.
export function WorkMarquee() {
  const WORK_ITEMS = useWork();
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offsetRef = useRef(0);
  const halfRef = useRef(1); // width of one (un-duplicated) set
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const [centeredIdx, setCenteredIdx] = useState(0);

  // Two copies so translating by one set-width wraps seamlessly.
  const items = [...WORK_ITEMS, ...WORK_ITEMS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => { halfRef.current = track.scrollWidth / 2 || 1; };
    measure();
    const ro = new ResizeObserver(measure); // remeasure as images load / on resize
    ro.observe(track);

    let frame = 0;
    const step = () => {
      if (!draggingRef.current) offsetRef.current -= SPEED;
      const half = halfRef.current;
      if (offsetRef.current <= -half) offsetRef.current += half;
      if (offsetRef.current > 0) offsetRef.current -= half;
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;

      if (++frame % 6 === 0) {
        const centerX = window.innerWidth / 2;
        let best = 0, bestDist = Infinity;
        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - centerX);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        setCenteredIdx((prev) => (prev === best % WORK_ITEMS.length ? prev : best % WORK_ITEMS.length));
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    offsetRef.current += e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden">
      <div
        className="w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={trackRef} className="flex items-center gap-6 will-change-transform" style={{ width: 'max-content' }}>
          {items.map((item, i) => (
            <div key={i} ref={(el) => { itemRefs.current[i] = el; }} className="shrink-0">
              {isVideo(item.src) ? (
                <video src={item.src} autoPlay loop muted playsInline
                  className="h-[44vh] md:h-[60vh] w-auto rounded-lg shadow-2xl pointer-events-none select-none" />
              ) : (
                <img src={item.src} alt="" draggable={false}
                  className="h-[44vh] md:h-[60vh] w-auto rounded-lg shadow-2xl pointer-events-none select-none" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Description of whichever project is centred */}
      <p
        key={centeredIdx}
        className="mt-8 px-6 max-w-xl text-center text-base md:text-lg font-sans text-white/80 animate-caption-fade"
        style={{ textWrap: 'balance' } as React.CSSProperties}
      >
        {WORK_ITEMS[centeredIdx]?.caption}
      </p>
    </div>
  );
}
