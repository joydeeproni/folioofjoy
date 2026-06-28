'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MobileGallery } from './mobile-gallery';
import { DitherSwipe, type DitherSwipeHandle } from './dither-swipe';

export interface WorkItem {
  src: string;
  caption: string;
}

export const WORK_ITEMS: WorkItem[] = [
  { src: '/work/project-01.png', caption: 'AI home-management app — made the welcome screen feel like arriving home, not signing up for one.' },
  { src: '/work/project-02.png', caption: 'Mobile loan application — turned six screens of underwriting into something you would actually finish on the bus.' },
  { src: '/work/project-03.png', caption: 'Home maintenance on mobile — a fix-it list that reads like a to-do, not a contract.' },
  { src: '/work/project-04.png', caption: 'The Figma file engineering lived in — every spec they never had to ask twice about.' },
  { src: '/work/carbondash-01.png', caption: 'Pitched the visual identity and shipped the marketing site in three weeks flat.' },
  { src: '/work/netflix-01.png', caption: 'Internal tool for content ops — made the upload queue something people stopped complaining about.' },
  { src: '/work/verizon-red.png', caption: 'Retail inventory scanner that warehouse staff actually wanted to use instead of the clipboard.' },
  { src: '/work/urbyn-banner.png', caption: 'Property analytics platform — a lot of data on a map without making anyone squint.' },
  { src: '/work/dribbble-08.jpg', caption: 'Scatter plots that tell you what a neighborhood is worth before the realtor does.' },
  { src: '/work/widgets.png', caption: 'Address search that autocompletes faster than you can second-guess your zip code.' },
  { src: '/work/dribbble-04.jpg', caption: 'Schema management for game events — backend config that feels like a product, not a spreadsheet.' },
  { src: '/work/dribbble-10.jpg', caption: 'Neighborhood stats dashboard — donut charts that actually earned their keep.' },
  { src: '/work/dribbble-01.jpg', caption: 'Release changelog — what broke and what got better, at a glance.' },
  { src: '/work/dribbble-06.jpg', caption: 'Feature flag cards — dark and light mode, because designers have opinions about both.' },
  { src: '/work/tactile-create-01.png', caption: 'Tactile Create home page — illustrated shortcut cards so starting a GDD or storyboard feels like picking from a shelf.' },
  { src: '/work/tactile-create-02.png', caption: 'Same page, light mode — everything untitled on purpose because scrappy docs come first, names come later.' },
  { src: '/work/verizon-red-02.png', caption: 'Verizon stock management app — scan, pick a rack off the store map, log it, back on the floor.' },
  { src: '/work/urbyn-banner-02.png', caption: 'Full property search — listings left, map right, filters that narrow things down instead of adding noise.' },
  { src: '/work/urbyn-value-drivers.png', caption: 'Value drivers — what pushes a property price up and what drags it down, no guessing required.' },
  { src: '/work/urbyn-historical.png', caption: 'Historical value prediction — current price, last year, next year, and a chart that outpaces the Zestimate.' },
  { src: '/work/email-illustration.png', caption: 'Marketing illustration for an email platform — clean enough to sit on a hero without stealing focus.' },
  { src: '/work/module-selector.png', caption: 'Module picker for a Danish manufacturing app — color-coded progress, zero ambiguity.' },
  { src: '/work/property-widgets.png', caption: 'Real estate analytics widgets — three chart types, one visual language, no infighting.' },
  { src: '/work/hotel-cards.jpg', caption: 'Hotel concierge widgets — room status and food ordering that feel native to the stay.' },
  { src: '/work/carbon-dashboard.jpg', caption: 'Carbon emissions dashboard — spend, footprint per head, and charts that make the CFO read the ESG report.' },
  { src: '/work/carbondash-brand.png', caption: 'Branding for an Australian carbon accounting firm — the green grid that shipped everywhere.' },
  { src: '/work/carbondash-logos.png', caption: 'CarbonDash logo system — five weights, one mark, the exploration that made the final pick obvious.' },
  { src: '/work/carbondash-marketing.png', caption: 'Framer site for the same carbon firm — dark theme, full scroll from hero to integrations footer.' },
  { src: '/work/battalion-map.png', caption: 'Property intelligence platform — the map view that made brokers close their spreadsheets.' },
  { src: '/work/battalion-hero.png', caption: 'Proptech hero — isometric buildings, a search bar, enough personality to not look like every other SaaS.' },
  { src: '/work/platform-illustration.png', caption: 'Platform illustration — abstract enough for a landing page, specific enough to hint at the product.' },
  { src: '/work/battalion-messages.png', caption: 'Lender-broker message centre — threaded by property, because that matters more than timestamps.' },
  { src: '/work/urbyn-development.png', caption: 'Zoning overlay — shows what is getting built nearby before the construction noise does.' },
  { src: '/work/data-dashboard-docs.png', caption: 'Onboarding cards for a datamarts tool — naming conventions and dimensions, illustrated so dry content lands.' },
];

const PREVIEW_IMAGES = WORK_ITEMS.slice(0, 4);

// Auto-cycle advances every AUTO_MS; any visitor interaction pauses it and it
// resumes after RESUME_MS of inactivity.
const AUTO_MS = 4200;
const RESUME_MS = 10000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; speed: number; size: number }>>([]);

  // Mobile gallery state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselMounted, setCarouselMounted] = useState(false);
  const [carouselVisible, setCarouselVisible] = useState(false);
  const [captionKey, setCaptionKey] = useState(0);
  const [zoomedIdx, setZoomedIdx] = useState<number | null>(null);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Contact-me state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactValue, setContactValue] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const contactOpenRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Imperative handles / timers / gesture bookkeeping.
  const ditherRef = useRef<DitherSwipeHandle>(null);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartX = useRef<number | null>(null);
  const draggedRef = useRef(false);
  const wheelLock = useRef(false);

  // Swap the active preview, looping at either end. The dither plays the swap
  // at peak coverage so the change reads as a dither-into-particles transition.
  const advance = useCallback((dir: number) => {
    setZoomedIdx(null);
    setCurrentIndex((i) => (i + dir + WORK_ITEMS.length) % WORK_ITEMS.length);
    setCaptionKey((k) => k + 1);
  }, []);

  const transition = useCallback((dir: number) => {
    if (ditherRef.current) ditherRef.current.play(() => advance(dir));
    else advance(dir);
  }, [advance]);

  const clearAuto = useCallback(() => {
    if (autoTimer.current) { clearInterval(autoTimer.current); autoTimer.current = null; }
  }, []);

  const startAuto = useCallback(() => {
    clearAuto();
    autoTimer.current = setInterval(() => {
      if (contactOpenRef.current) return; // don't shuffle while someone's typing
      transition(1);
    }, AUTO_MS);
  }, [clearAuto, transition]);

  // Called on every visitor interaction: pause the auto-cycle, hide the tooltip,
  // and schedule a resume after RESUME_MS of inactivity.
  const registerInteraction = useCallback(() => {
    setShowTooltip(false);
    clearAuto();
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { startAuto(); }, RESUME_MS);
  }, [clearAuto, startAuto]);

  const goNext = useCallback(() => { registerInteraction(); transition(1); }, [registerInteraction, transition]);
  const goPrev = useCallback(() => { registerInteraction(); transition(-1); }, [registerInteraction, transition]);

  const openCarousel = useCallback(() => {
    setCurrentIndex(0);
    setZoomedIdx(null);
    setContactOpen(false);
    contactOpenRef.current = false;
    setContactValue('');
    setShowTooltip(false);
    setCarouselMounted(true);
    requestAnimationFrame(() => { requestAnimationFrame(() => setCarouselVisible(true)); });
  }, []);

  const closeCarousel = useCallback(() => {
    setCarouselVisible(false);
    clearAuto();
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setShowTooltip(false);
    setContactOpen(false);
    contactOpenRef.current = false;
    setTimeout(() => setCarouselMounted(false), 400);
  }, [clearAuto]);

  // Start the auto-cycle and reveal the tooltip once the carousel is open.
  useEffect(() => {
    if (!carouselMounted) return;
    startAuto();
    tooltipTimer.current = setTimeout(() => setShowTooltip(true), 900);
    return () => {
      clearAuto();
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    };
  }, [carouselMounted, startAuto, clearAuto]);

  useEffect(() => {
    if (!carouselMounted) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (contactOpenRef.current) { setContactOpen(false); contactOpenRef.current = false; }
        else closeCarousel();
        return;
      }
      if (contactOpenRef.current) return; // arrows shouldn't navigate while typing
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [carouselMounted, goNext, goPrev, closeCarousel]);

  const handleClick = () => {
    if (isMobile) setMobileOpen(true);
    else openCarousel();
  };

  // --- Contact me ---------------------------------------------------------
  const openContact = () => {
    setContactOpen(true);
    contactOpenRef.current = true;
    registerInteraction();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = contactValue.trim();
    if (!EMAIL_RE.test(email)) {
      toast.error('Please enter a valid email.');
      inputRef.current?.focus();
      return;
    }
    setContactSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'failed');
      toast.success('Sent ✓', { description: 'Joydeep will be in touch.' });
      setContactValue('');
      setContactOpen(false);
      contactOpenRef.current = false;
    } catch (err) {
      const msg = err instanceof Error && err.message !== 'failed' ? err.message : 'Could not send — try again.';
      toast.error(msg);
    } finally {
      setContactSending(false);
    }
  };

  // --- Swipe gestures -----------------------------------------------------
  const onStagePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    draggedRef.current = false;
  };
  const onStagePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) > 60) {
      // Suppress the click that follows the drag so it doesn't toggle zoom.
      draggedRef.current = true;
      setTimeout(() => { draggedRef.current = false; }, 0);
      if (dx < 0) goNext();
      else goPrev();
    }
  };
  const onStageWheel = (e: React.WheelEvent) => {
    // Trackpad two-finger horizontal swipe.
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 24) return;
    if (wheelLock.current) return;
    wheelLock.current = true;
    setTimeout(() => { wheelLock.current = false; }, 700);
    if (e.deltaX > 0) goNext();
    else goPrev();
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

      {/* Desktop: carousel */}
      {carouselMounted && typeof document !== 'undefined' && createPortal((
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-400 ease-out ${carouselVisible ? 'opacity-100' : 'opacity-0'}`} onClick={closeCarousel}>
          <div className={`absolute inset-0 bg-black backdrop-blur-xl transition-all duration-400 ${carouselVisible ? 'opacity-100' : 'opacity-0'}`} />

          <button onClick={closeCarousel} className={`absolute top-6 left-6 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 ${carouselVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{ transitionDelay: carouselVisible ? '200ms' : '0ms' }}>
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Contact me — expands into an email input; Enter sends. */}
          <div
            className={`absolute top-6 right-6 z-20 transition-all duration-300 ${carouselVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            style={{ transitionDelay: carouselVisible ? '200ms' : '0ms' }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={submitContact} className="flex items-center rounded-full bg-white/10 hover:bg-white/15 backdrop-blur transition-colors duration-300">
              {!contactOpen ? (
                <button type="button" onClick={openContact} className="flex items-center gap-2 px-4 py-2 text-sm text-white/90 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Contact me
                </button>
              ) : (
                <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5">
                  <Mail className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    ref={inputRef}
                    type="email"
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setContactOpen(false); contactOpenRef.current = false; } }}
                    placeholder="your@email.com — press ↵"
                    disabled={contactSending}
                    className="w-56 bg-transparent text-sm text-white placeholder-white/40 outline-none"
                  />
                  <button type="submit" disabled={contactSending} className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white shrink-0 transition-colors disabled:opacity-50 cursor-pointer">
                    {contactSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Fade-in tooltip above the previews. */}
          <div className={`absolute left-1/2 -translate-x-1/2 top-24 z-10 pointer-events-none transition-all duration-700 ease-out ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-white/70 text-xs font-sans whitespace-nowrap">
              Swipe ← or → to see them again.
            </span>
          </div>

          <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className={`absolute left-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 ${carouselVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: carouselVisible ? '150ms' : '0ms' }}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); goNext(); }} className={`absolute right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 ${carouselVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: carouselVisible ? '150ms' : '0ms' }}>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-5xl w-full px-20" onClick={(e) => e.stopPropagation()}>
            <div
              className="relative w-full flex items-center justify-center"
              style={{ height: '65vh', touchAction: 'pan-y' }}
              onPointerDown={onStagePointerDown}
              onPointerUp={onStagePointerUp}
              onPointerLeave={() => { dragStartX.current = null; }}
              onWheel={onStageWheel}
            >
              {WORK_ITEMS.map((item, idx) => {
                let offset = idx - currentIndex;
                if (offset > WORK_ITEMS.length / 2) offset -= WORK_ITEMS.length;
                if (offset < -WORK_ITEMS.length / 2) offset += WORK_ITEMS.length;
                const isCenter = offset === 0;
                const isVisible = offset >= -1 && offset <= 1;

                return (
                  <div key={idx} className="absolute cursor-pointer overflow-hidden rounded-2xl"
                    style={{
                      transform: carouselVisible ? `translateX(${offset * 70}%) scale(${isCenter ? 1 : 0.8})` : `translateX(${offset * 30}%) scale(0.7)`,
                      zIndex: isCenter ? (zoomedIdx === idx ? 20 : 10) : isVisible ? 5 : 1,
                      opacity: carouselVisible ? (isCenter ? 1 : isVisible ? 0.4 : 0) : 0,
                      filter: isCenter ? 'none' : 'blur(2px)',
                      transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                      pointerEvents: isVisible ? 'auto' : 'none',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (draggedRef.current) return; // ignore the click that ends a swipe
                      if (offset === -1) goPrev();
                      else if (offset === 1) goNext();
                      else setZoomedIdx(zoomedIdx === idx ? null : idx);
                    }}
                    onMouseEnter={(e) => {
                      if (!isCenter) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setZoomOrigin({
                        x: ((e.clientX - rect.left) / rect.width) * 100,
                        y: ((e.clientY - rect.top) / rect.height) * 100,
                      });
                      setZoomedIdx(idx);
                    }}
                    onMouseMove={(e) => {
                      if (!isCenter || zoomedIdx !== idx) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setZoomOrigin({
                        x: ((e.clientX - rect.left) / rect.width) * 100,
                        y: ((e.clientY - rect.top) / rect.height) * 100,
                      });
                    }}
                    onMouseLeave={() => { if (zoomedIdx === idx) setZoomedIdx(null); }}
                  >
                    <img src={item.src} alt={item.caption}
                      className="shadow-2xl border border-white/10 object-contain max-h-[60vh] max-w-full transition-transform duration-500 ease-out"
                      draggable={false}
                      style={{
                        transform: zoomedIdx === idx ? 'scale(1.8)' : 'scale(1)',
                        transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                      }} />
                  </div>
                );
              })}
            </div>

            <p key={captionKey} className="text-base font-sans text-white/70 text-center max-w-lg animate-caption-fade">
              {WORK_ITEMS[currentIndex].caption}
            </p>
          </div>

          {/* Dither-into-particles transition overlay (6px cells, Bayer 8x8). */}
          <DitherSwipe ref={ditherRef} />
        </div>
      ), document.body)}
    </>
  );
}
