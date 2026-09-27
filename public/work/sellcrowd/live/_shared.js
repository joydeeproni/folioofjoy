// SellCrowd shared chrome: status bar, gradient app bar, bottom tab bar (the v10 structure)
const Q = new URLSearchParams(location.search);
function statusBar(light) {
  return `<div class="status" style="${light ? 'color:#fff' : ''}"><span class="num">9:41</span><span class="r"><i data-lucide="signal" class="sm"></i><i data-lucide="wifi" class="sm"></i><i data-lucide="battery-full"></i></span></div>`;
}
// left: 'menu' | 'back' | 'back:Label'; right: list of icon names, 'bell' = bell with pip
function appBar(title, left = 'menu', right = ['bell']) {
  const L = left === 'menu' ? `<span class="ic"><i data-lucide="menu"></i></span>`
    : left === 'back:' ? `<span class="back"><i data-lucide="arrow-left" class="lg"></i></span>` : left.startsWith('back') ? `<span class="back"><i data-lucide="chevron-left" class="lg"></i>${left.split(':')[1] ?? 'Back'}</span>` : '';
  const R = right.map(n => `<span class="ic"><i data-lucide="${n.replace('*', '')}"></i>${n.endsWith('*') ? '<b class="pip"></b>' : ''}</span>`).join('');
  return `<div class="bar"><div class="l">${L}</div><h1>${title}</h1><div class="rt">${R}</div></div>`;
}
function tabBar(on = 'Home', badges = {}) {
  const T = [['house', 'Home'], ['filter', 'Leads'], ['smartphone', 'Reminders'], ['message-circle', 'Chats'], ['trophy', 'Leaderboards']];
  return `<nav class="tb">${T.map(([ic, n]) => `<a class="${n === on ? 'on' : ''}"><i data-lucide="${ic}"></i>${n}${badges[n] ? `<span class="dot num">${badges[n]}</span>` : ''}</a>`).join('')}</nav><i class="home-ind"></i>`;
}
// ---- motion: count-ups, bar fills, staggers. Plays on load and again whenever the screen scrolls back into view
// (an iframe's IntersectionObserver with no root measures against the top-level viewport). ?static=1 = final state.
const STATIC = Q.has('static') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const onPlay = [];
function fmtLike(tpl, k) {
  return tpl.replace(/\d[\d,]*(\.\d+)?/g, m => {
    const dec = (m.split('.')[1] || '').length, v = parseFloat(m.replace(/,/g, '')) * k;
    const t = v.toFixed(dec); return m.includes(',') ? Number(t).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : t;
  });
}
function countUp(el, dur = 1100, delay = 0) {
  const nodes = [...el.childNodes].filter(n => n.nodeType === 3 && /\d/.test(n.data));
  const tpl = nodes.map(n => n.__tpl ??= n.data);
  const t0 = performance.now() + delay;
  const step = now => {
    const u = Math.min(1, Math.max(0, (now - t0) / dur)), k = 1 - Math.pow(1 - u, 3);
    nodes.forEach((n, i) => n.data = fmtLike(tpl[i], k));
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function play() {
  if (STATIC) return;
  document.body.classList.remove('play'); void document.body.offsetWidth; document.body.classList.add('play');
  document.querySelectorAll('[data-count]').forEach(el => countUp(el, +el.dataset.dur || 1100, +el.dataset.count || 0));
  document.querySelectorAll('[data-w]').forEach(el => {
    const p = el.dataset.prop || 'width';
    el.style.transition = 'none'; el.style[p] = el.dataset.from || '0%'; void el.offsetWidth;
    el.style.transition = `${p} 1.3s cubic-bezier(.2,.7,.2,1) ${el.dataset.delay || 200}ms`; el.style[p] = el.dataset.w;
  });
  onPlay.forEach(f => f());
}
function motion() {
  document.querySelectorAll('[data-stagger]').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
  if (STATIC) return;
  document.body.classList.add('pre');
  let away = true;
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && away) { away = false; play(); }
    if (!e.isIntersecting) away = true;
  }), { threshold: .35 }).observe(document.body);
}
function boot() {
  document.querySelectorAll('[data-status]').forEach(el => el.outerHTML = statusBar(el.dataset.status === 'light'));
  document.querySelectorAll('[data-bar]').forEach(el => el.outerHTML = appBar(el.dataset.bar, el.dataset.left || 'menu', JSON.parse(el.dataset.right || '["bell"]')));
  document.querySelectorAll('[data-tabs]').forEach(el => el.outerHTML = tabBar(el.dataset.tabs, JSON.parse(el.dataset.badges || '{"Chats":3}')));
  lucide.createIcons({ attrs: { 'stroke-width': 2 } });
  motion();
}
