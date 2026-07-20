'use client';

import { useEffect, useRef, useState } from 'react';
import { useDialKit } from 'dialkit';
import { isVideo } from '@/components/work-preview';
import { useWork } from '@/components/content-provider';
import { PhoneFrame } from '@/components/work/phone-frame';

// Auto-scrolling filmstrip of every project. Drifts right→left, and can be
// flung (drag with momentum) or scrolled (vertical wheel → horizontal travel):
// fling fast and it flies with motion blur, then eases back to the drift.
// Physics are live-tunable via the dialkit panel (dev only).
export function WorkMarquee() {
  const WORK_ITEMS = useWork();

  const dial = useDialKit('Work Preview', {
    driftSpeed: [0.5, 0, 3, 0.05],
    wheelSpeed: [0.8, 0.1, 4, 0.05],
    dragSpeed: [1.1, 0.3, 3, 0.05],
    friction: [0.94, 0.8, 0.99, 0.005],
    maxBlur: [16, 0, 40, 1],
    blurAt: [55, 10, 160, 1],
  }) as unknown as { driftSpeed: number; wheelSpeed: number; dragSpeed: number; friction: number; maxBlur: number; blurAt: number };
  const dialRef = useRef(dial);
  dialRef.current = dial;

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offsetRef = useRef(0);
  const velRef = useRef(0); // fling / wheel velocity, on top of the drift
  const halfRef = useRef(1); // width of one (un-duplicated) set
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const dragVelRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const [centeredIdx, setCenteredIdx] = useState(0);

  // Two copies so translating by one set-width wraps seamlessly.
  const items = [...WORK_ITEMS, ...WORK_ITEMS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => { halfRef.current = track.scrollWidth / 2 || 1; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    let frame = 0;
    const step = () => {
      const { driftSpeed, friction, maxBlur, blurAt } = dialRef.current;
      if (!draggingRef.current) {
        offsetRef.current += velRef.current - driftSpeed;
        velRef.current *= friction;
        if (Math.abs(velRef.current) < 0.03) velRef.current = 0;
      }
      const half = halfRef.current;
      if (offsetRef.current <= -half) offsetRef.current += half;
      if (offsetRef.current > 0) offsetRef.current -= half;
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;

      const speed = draggingRef.current ? Math.abs(dragVelRef.current) : Math.abs(velRef.current);
      const blur = Math.min(maxBlur, (speed / blurAt) * maxBlur);
      track.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : 'none';

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
  }, [WORK_ITEMS.length]);

  // Vertical wheel → horizontal velocity (scroll up = left, down = right).
  useEffect(() => {
    const surface = trackRef.current?.parentElement;
    if (!surface) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      velRef.current += d * dialRef.current.wheelSpeed * 0.3;
      velRef.current = Math.max(-130, Math.min(130, velRef.current));
    };
    surface.addEventListener('wheel', onWheel, { passive: false });
    return () => surface.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    dragVelRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = (e.clientX - lastXRef.current) * dialRef.current.dragSpeed;
    offsetRef.current += dx;
    dragVelRef.current = dx;
    lastXRef.current = e.clientX;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    velRef.current = Math.max(-150, Math.min(150, dragVelRef.current));
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
            <div key={i} ref={(el) => { itemRefs.current[i] = el; }} className="shrink-0 h-[44vh] md:h-[60vh]">
              {item.frame === 'phone' ? (
                <PhoneFrame>
                  {isVideo(item.src) ? (
                    <video src={item.src} autoPlay loop muted playsInline className="h-full w-full object-cover pointer-events-none select-none" />
                  ) : (
                    <img src={item.src} alt="" draggable={false} className="h-full w-full object-cover pointer-events-none select-none" />
                  )}
                </PhoneFrame>
              ) : isVideo(item.src) ? (
                <video src={item.src} autoPlay loop muted playsInline
                  className="h-full w-auto rounded-lg shadow-2xl pointer-events-none select-none" />
              ) : (
                <img src={item.src} alt="" draggable={false}
                  className="h-full w-auto rounded-lg shadow-2xl pointer-events-none select-none" />
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
