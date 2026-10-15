'use client';

import { useEffect, useRef } from 'react';

// Keeps mobile Safari's status bar and bottom toolbar the colour of whatever
// the page shows against each viewport edge. Safari reads that colour from
// three places depending on version — <meta name="theme-color">, fixed
// elements touching the edge (iOS 26), and the html/body backgrounds — so all
// of them are fed from one palette, sampled once per change:
//
//   --edge-top-background     top strip, html background, theme-color
//   --edge-bottom-background  bottom strip, body background
//
// The palette is re-sampled whenever the surface under an edge can change:
// scrolling (window or nested scrollers), restored scroll positions, viewport
// and toolbar resizes, DOM swaps (route changes, modals), and background /
// opacity transitions, which are followed frame by frame while they run.
//
// Render as a direct child of <body>: a transformed ancestor would make the
// fixed strips scroll with it. Mark anything that shouldn't tint the chrome
// (e.g. a full-bleed image) with `data-edge-ignore`.

const TOP = '--edge-top-background';
const BOTTOM = '--edge-bottom-background';
const FALLBACK = '#000000';
// How long to keep sampling every frame after a transition or animation
// starts; transitionend / animationend always take one final sample.
const FOLLOW_MS = 1100;

type Rgba = [number, number, number, number];

// Computed colours come back as rgb()/rgba() for hex, rgb and named inputs;
// anything else (oklch, color()) returns null and is only used when opaque.
function parseRgb(color: string): Rgba | null {
  const m = color.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/,
  );
  if (!m) return null;
  const alpha = m[4] === undefined ? 1 : parseFloat(m[4]) / (m[5] ? 100 : 1);
  return [+m[1], +m[2], +m[3], alpha];
}

function hasAlpha(color: string): boolean {
  return color === 'transparent' || color.includes('/');
}

// Layers are top-most first; blend them bottom-up over the opaque base.
function composite(base: [number, number, number], layers: Rgba[]): string {
  let [r, g, b] = base;
  for (let i = layers.length - 1; i >= 0; i--) {
    const [lr, lg, lb, a] = layers[i];
    r = lr * a + r * (1 - a);
    g = lg * a + g * (1 - a);
    b = lb * a + b * (1 - a);
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// The colour actually painted at (centre, y): the stack of backgrounds under
// that point, each weighted by its element's effective opacity, down to the
// first opaque one. html/body are skipped — their backgrounds are ours.
function surfaceAt(y: number, fallback: string): string {
  const opacity = new Map<Element, number>();
  const effectiveOpacity = (el: Element): number => {
    if (el === document.body) return 1;
    const cached = opacity.get(el);
    if (cached !== undefined) return cached;
    const own = parseFloat(getComputedStyle(el).opacity);
    const value = own * (el.parentElement ? effectiveOpacity(el.parentElement) : 1);
    opacity.set(el, value);
    return value;
  };

  const layers: Rgba[] = [];
  for (const el of document.elementsFromPoint(window.innerWidth / 2, y)) {
    if (el === document.body || el === document.documentElement) break;
    if (el.closest('[data-edge-ignore]')) continue;
    const raw = getComputedStyle(el).backgroundColor;
    const alpha = effectiveOpacity(el);
    const rgb = parseRgb(raw);
    if (!rgb) {
      if (layers.length === 0 && alpha >= 1 && !hasAlpha(raw)) return raw;
      continue;
    }
    const a = rgb[3] * alpha;
    if (a <= 0) continue;
    if (a >= 1) return composite([rgb[0], rgb[1], rgb[2]], layers);
    layers.push([rgb[0], rgb[1], rgb[2], a]);
  }

  if (layers.length === 0) return fallback;
  const base = parseRgb(fallback);
  return base ? composite([base[0], base[1], base[2]], layers) : fallback;
}

export function ViewportEdges() {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!top || !bottom) return;
    const root = document.documentElement;

    // Shared document state we touch, so it can be put back on unmount.
    const prevTop = root.style.getPropertyValue(TOP);
    const prevBottom = root.style.getPropertyValue(BOTTOM);
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const createdMeta = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    const themeColor = meta;
    const prevMeta = themeColor.getAttribute('content');

    let applied = { top: '', bottom: '' };
    const update = () => {
      // With nothing painted at an edge, fall back to the live track theme.
      // The top strip's `color` resolves var(--theme-bg) to a concrete value.
      const fallback = getComputedStyle(top).color || FALLBACK;
      const topRect = top.getBoundingClientRect();
      const bottomRect = bottom.getBoundingClientRect();
      const next = {
        top: surfaceAt(Math.min(topRect.bottom, window.innerHeight - 1), fallback),
        bottom: surfaceAt(Math.max(bottomRect.top - 1, 0), fallback),
      };
      if (next.top === applied.top && next.bottom === applied.bottom) return;
      applied = next;
      root.style.setProperty(TOP, next.top);
      root.style.setProperty(BOTTOM, next.bottom);
      themeColor.setAttribute('content', next.top);
    };

    let frame = 0;
    let followUntil = 0;
    const tick = () => {
      frame = 0;
      update();
      if (performance.now() < followUntil) schedule();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const follow = (e: Event) => {
      if (e instanceof TransitionEvent && !/^(background|opacity)/.test(e.propertyName)) return;
      followUntil = performance.now() + FOLLOW_MS;
      schedule();
    };
    const settle = (e: Event) => {
      if (e instanceof TransitionEvent && !/^(background|opacity)/.test(e.propertyName)) return;
      schedule();
    };

    update();

    const passive = { passive: true, capture: true } as const;
    // Capture catches nested scrollers (modals, the Lounge picker) as well as the window.
    document.addEventListener('scroll', schedule, passive);
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule);
    window.addEventListener('popstate', schedule);
    window.addEventListener('load', schedule);
    // Safari's toolbar expanding/collapsing resizes the visual viewport only.
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('transitionrun', follow, true);
    document.addEventListener('animationstart', follow, true);
    document.addEventListener('transitionend', settle, true);
    document.addEventListener('transitioncancel', settle, true);
    document.addEventListener('animationend', settle, true);

    // Route changes and modals swap DOM; the track theme rewrites <html> style.
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true });
    mutations.observe(root, { attributes: true, attributeFilter: ['style', 'class'] });
    // Late-loading content can shift a different section under an edge.
    const resizes = new ResizeObserver(schedule);
    resizes.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', schedule, passive);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule);
      window.removeEventListener('popstate', schedule);
      window.removeEventListener('load', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('scroll', schedule);
      document.removeEventListener('transitionrun', follow, true);
      document.removeEventListener('animationstart', follow, true);
      document.removeEventListener('transitionend', settle, true);
      document.removeEventListener('transitioncancel', settle, true);
      document.removeEventListener('animationend', settle, true);
      mutations.disconnect();
      resizes.disconnect();

      if (prevTop) root.style.setProperty(TOP, prevTop);
      else root.style.removeProperty(TOP);
      if (prevBottom) root.style.setProperty(BOTTOM, prevBottom);
      else root.style.removeProperty(BOTTOM);
      if (createdMeta) themeColor.remove();
      else if (prevMeta === null) themeColor.removeAttribute('content');
      else themeColor.setAttribute('content', prevMeta);
    };
  }, []);

  return (
    <>
      <div ref={topRef} className="edge-top" aria-hidden />
      <div ref={bottomRef} className="edge-bottom" aria-hidden />
    </>
  );
}
