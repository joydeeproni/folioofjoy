// Fido shell — status bar, v6 tab bar, illustrations, and a tiny motion clock.
const Q = new URLSearchParams(location.search);
const STATIC = Q.has('static') || matchMedia('(prefers-reduced-motion: reduce)').matches;
if (STATIC) document.documentElement.classList.add('static');

function statusBar() {
  return `<div class="status"><span class="num">9:41</span><span class="r"><i data-lucide="signal" class="sm"></i><i data-lucide="wifi" class="sm"></i><i data-lucide="battery-full"></i></span></div>`;
}
// v6 tabs: Quests (grid) · Library (inbox) · Talk (chat) · Me (person)
function tabBar(on = 'Quests', badge = 0) {
  const T = [['layout-grid', 'Quests'], ['inbox', 'Library'], ['messages-square', 'Talk'], ['user-round', 'Me']];
  return `<nav class="tabbar">${T.map(([ic, n]) => `<a class="tab press ${n === on ? 'on' : ''}" aria-label="${n}"><i data-lucide="${ic}"></i>${n === 'Talk' && badge ? `<span class="b">${badge}</span>` : ''}</a>`).join('')}</nav>`;
}
function onbBar(step, total = 3) {
  return `<div style="display:flex;align-items:center;gap:14px;padding:8px 24px 0"><span class="sq o"><i data-lucide="chevron-left"></i></span><div class="prog" style="flex:1">${Array.from({ length: total }, (_, i) => `<i class="${i < step ? 'on' : ''}"></i>`).join('')}</div><span style="font-size:13px;font-weight:600;opacity:.6;white-space:nowrap;text-align:right">Step ${step} of ${total}</span></div>`;
}

// ---- motion clock: CSS animations + JS tweens share one timeline so reels can seek it ----
const TW = [];                       // fn(tMs) → updates DOM for time t
function tween(fn) { TW.push(fn); }
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo = (x) => 1 - Math.pow(1 - x, 3);
function countUp(el, to, start = 300, dur = 1100, fmt = (v) => Math.round(v)) {
  if (STATIC) { el.textContent = fmt(to); return; }
  tween((t) => { el.textContent = fmt(to * eo(clamp((t - start) / dur))); });
}
function stagger(sel, base = 120, step = 80, cls = 'a-rise') {
  document.querySelectorAll(sel).forEach((el, i) => { el.classList.add(cls); el.style.animationDelay = `${base + i * step}ms`; });
}
let T0 = performance.now(), SEEK = false;
function frame() { if (SEEK) return; const t = performance.now() - T0; TW.forEach((f) => f(t)); requestAnimationFrame(frame); }
window.__seek = (ms) => {             // used by the reel recorder: deterministic frame at t=ms
  SEEK = true;
  document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; });
  TW.forEach((f) => f(ms));
};

function boot({ tab, badge = 0, statusClass = '' } = {}) {
  document.body.insertAdjacentHTML('afterbegin', statusBar());
  if (tab) document.body.insertAdjacentHTML('beforeend', tabBar(tab, badge));
  lucide.createIcons({ attrs: { 'stroke-width': 2 } });
  if (STATIC) { TW.forEach((f) => f(1e6)); return; }
  T0 = performance.now(); requestAnimationFrame(frame);
}

// ---- illustrations, redrawn from the v6 art (flat, rounded, no outlines) ----
const ILL = {
  // yellow pup, three-quarter side view, happy closed eyes
  pup: (cls = '') => `<svg class="${cls}" viewBox="0 0 220 170" fill="none">
    <path class="wag" d="M58 64c-10-4-18-16-10-26 5-6 14-3 12 4" stroke="#F0A93B" stroke-width="10" stroke-linecap="round"/>
    <rect x="52" y="56" width="98" height="78" rx="30" fill="#F8C954"/>
    <path d="M70 128v24M92 132v22M124 132v22M140 126v22" stroke="#F0A93B" stroke-width="11" stroke-linecap="round"/>
    <path d="M92 132v22M140 126v22" stroke="#F8C954" stroke-width="11" stroke-linecap="round"/>
    <g class="bob" style="transform-box:fill-box;transform-origin:center"><rect x="112" y="30" width="96" height="44" rx="22" transform="rotate(-18 112 30)" fill="#F8C954"/>
    <circle cx="196" cy="22" r="14" fill="#8E7A3F"/>
    <path d="M130 30c-10-12-4-24 8-20" stroke="#F0A93B" stroke-width="11" stroke-linecap="round"/>
    <path d="M152 50q6 6 12 0M168 45q6 6 12 0" stroke="#323641" stroke-width="3" stroke-linecap="round"/>
    <path d="M140 74c10 4 22 2 30-4" stroke="#E8616B" stroke-width="12" stroke-linecap="round"/></g>
  </svg>`,
  lock: (cls = '') => `<svg class="${cls}" viewBox="0 0 90 96" fill="none"><path d="M26 44V30a19 19 0 0 1 38 0v14" stroke="#E8616B" stroke-width="11" stroke-linecap="round" transform="rotate(-12 45 50)"/><rect x="10" y="40" width="70" height="50" rx="12" fill="#E8616B" transform="rotate(-12 45 65)"/><path d="M28 50a28 28 0 0 0 40 34l8-2-6-40z" fill="#CF4F5B" transform="rotate(-12 45 65)"/></svg>`,
  check: (cls = '') => `<svg class="${cls}" viewBox="0 0 160 170" fill="none"><circle cx="80" cy="92" r="70" fill="#A2A4AA"/><circle cx="80" cy="84" r="70" fill="#7ECBC5"/><path d="M40 60c20 50 60 70 90 70a70 70 0 0 0 20-46A70 70 0 0 0 44 30c-6 10-8 20-4 30z" fill="#6CB8B2"/><path class="a-draw" style="--len:150;animation-delay:.35s" d="M46 82l26 26 58-66" stroke="#fff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  // profile scene: blue pup and a long yellow pup chasing a teal ball on a cream planet
  planet: (cls = '') => `<svg class="${cls}" viewBox="0 0 375 240" fill="none">
    <ellipse cx="200" cy="330" rx="300" ry="178" fill="#FEFAEE"/>
    <circle cx="109" cy="22" r="5" fill="#FFACAE"/><path d="M190 46l14-10 1 17z" fill="#F8C954"/>
    <g style="animation:bounceBall 2.8s ease-in-out infinite"><circle cx="145" cy="62" r="30" fill="#8DD0CC"/><path d="M116 70a30 30 0 0 0 58 4 34 34 0 0 1-58-4z" fill="#6CB8B2"/></g>
    <g class="bob">
      <path d="M-6 168q46-26 120-20 14 36-12 56-46 22-108 18z" fill="#639FD7"/>
      <path d="M16 212q30-14 60-4" stroke="#4F86BF" stroke-width="9" stroke-linecap="round"/>
      <path d="M18 212l-6 20M64 204l-14 22" stroke="#8BB9E6" stroke-width="9" stroke-linecap="round"/><path d="M88 188l10 20" stroke="#4F86BF" stroke-width="9" stroke-linecap="round"/>
      <path d="M46 146l46-30" stroke="#639FD7" stroke-width="36" stroke-linecap="round"/>
      <circle cx="98" cy="110" r="12" fill="#4A4B55"/><path d="M92 102a12 12 0 0 1 14 14" stroke="#639FD7" stroke-width="6"/>
      <path class="wag" d="M34 124q-8-12 2-18M48 116q-6-12 4-16" stroke="#8BB9E6" stroke-width="8" stroke-linecap="round"/>
      <circle cx="60" cy="134" r="9" fill="#fff"/><circle cx="62" cy="134" r="5" fill="#333"/><circle cx="77" cy="123" r="9" fill="#fff"/><circle cx="79" cy="123" r="5" fill="#333"/>
      <path d="M30 154q22 12 44-2" stroke="#D0544C" stroke-width="11" stroke-linecap="round"/>
    </g>
    <g class="bob" style="animation-delay:-1.2s">
      <path d="M232 128L380 150V234L226 162Z" fill="#F2C06E" stroke="#F2C06E" stroke-width="10" stroke-linejoin="round"/>
      <path d="M204 106l44 18" stroke="#F2C06E" stroke-width="30" stroke-linecap="round"/>
      <circle cx="196" cy="103" r="11" fill="#5A5B63"/>
      <rect x="258" y="116" width="10" height="22" rx="5" fill="#F8DDA8" transform="rotate(18 263 127)"/>
      <circle cx="228" cy="107" r="5.5" fill="#fff"/><circle cx="229" cy="107" r="3" fill="#444"/><circle cx="240" cy="112" r="5.5" fill="#fff"/><circle cx="241" cy="112" r="3" fill="#444"/>
      <path d="M226 132q-14-6-12 8" stroke="#D0544C" stroke-width="7" stroke-linecap="round"/>
      <path d="M258 172q-10 6-6 22M342 206q-10 6-7 20" stroke="#C99A4F" stroke-width="8" stroke-linecap="round"/><path d="M272 178l2 12M356 210l2 12" stroke="#F8DDA8" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>`,
  confetti: () => `<span class="cf" style="left:44px;top:40px;width:22px;height:22px;border-radius:50%;background:#C9CACE"></span><span class="cf" style="left:318px;top:230px;width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-top:24px solid #FFD6A5;border-radius:4px"></span><span class="cf" style="left:300px;top:60px;width:12px;height:12px;border-radius:3px;background:#639FD7;transform:rotate(20deg)"></span><span class="cf" style="left:70px;top:250px;width:10px;height:10px;border-radius:50%;background:#FFACAE"></span>`,
};
