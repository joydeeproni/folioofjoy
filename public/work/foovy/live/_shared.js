// Foovy shared chrome + freshness ring
const F = n => `assets/food/${n}.png`;
function statusBar(dark = true) {
  return `<div class="status" style="color:${dark ? '#F4F3EE' : '#0C0D0B'}"><span class="num">9:41</span><span class="r"><i data-lucide="signal" class="sm"></i><i data-lucide="wifi" class="sm"></i><i data-lucide="battery-full"></i></span></div>`;
}
function tabBar(on = 'Fridge') {
  const t = [['sparkles', 'For You'], ['chef-hat', 'Recipes'], ['refrigerator', 'Fridge'], ['users', 'Friends']];
  return `<nav class="tabs">${t.map(([ic, n]) => `<a class="${n === on ? 'on' : ''}"><i data-lucide="${ic}"></i>${n}</a>`).join('')}<a class="add"><span class="plus"><i data-lucide="plus" class="sm"></i></span>Add Items</a></nav>`;
}
// days left of shelf life total -> ring
function stage(days) { return days <= 1 ? 'stale' : days <= 3 ? 'eatme' : 'fresh'; }
function ring(food, days, total = 14, size = 64, sel = false) {
  const st = stage(days), col = { fresh: '#34C759', eatme: '#FF9F2E', stale: '#FF5A4E' }[st];
  const r = size / 2 - 3, C = 2 * Math.PI * r, frac = Math.max(.06, Math.min(1, days / total));
  const lbl = days >= 7 && days % 7 === 0 ? `${days / 7}w` : `${days}d`;
  return `<div class="ring ${sel ? 'sel' : ''}" style="width:${size}px;height:${size}px">
    <svg class="r" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(128,128,128,.22)" stroke-width="4"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${C * frac} ${C}"/></svg>
    <img src="${F(food)}" alt="" style="inset:${size * .14}px;width:${size * .72}px;height:${size * .72}px">
    <span class="d" style="background:${col}">${lbl}</span>
    ${sel ? '<span class="tick"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#06260F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' : ''}</div>`;
}
function boot() {
  document.querySelectorAll('[data-status]').forEach(el => el.outerHTML = statusBar(el.dataset.status !== 'light'));
  document.querySelectorAll('[data-tabs]').forEach(el => el.outerHTML = tabBar(el.dataset.tabs));
  document.querySelectorAll('[data-ring]').forEach(el => { const [f, d, t, s, sel] = el.dataset.ring.split(','); el.outerHTML = ring(f, +d, +(t || 14), +(s || 64), sel === '1'); });
  document.body.insertAdjacentHTML('beforeend', '<div class="homebar"></div>');
  lucide.createIcons({ attrs: { 'stroke-width': 2 } });
}
