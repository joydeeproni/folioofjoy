// Ursula shell: Android status bar, app bar with the customer's logo, bottom nav (Notifications · Swipes · Me)
function statusBar(online = true, time = '08:47') {
  return `<div class="sb"><span class="num">${time}</span><span class="r">${online ? '<i data-lucide="wifi" class="sm"></i>' : '<i data-lucide="wifi-off" class="sm"></i>'}<i data-lucide="signal" class="sm"></i><i data-lucide="battery-medium" class="sm"></i></span></div>`;
}
function appBar(title, sub, bell = true) {
  return `<div class="ab"><span class="clogo">SC</span><div><b>${title}</b><span>${sub}</span></div><span class="sp"></span>
    ${bell ? '<span class="ib"><i data-lucide="languages" class="sm"></i></span>' : ''}</div>`;
}
function bottomNav(on, unread = 3) {
  const t = [['bell', 'Notifications'], ['fingerprint', 'Swipes'], ['circle-user-round', 'Me']];
  return `<nav class="bn">${t.map(([ic, n]) => `<a class="${n === on ? 'on' : ''}"><i data-lucide="${ic}"></i>${n}${n === 'Notifications' && unread ? `<span class="c">${unread}</span>` : ''}</a>`).join('')}</nav><span class="gest"></span>`;
}
// signature control: position 0..1 of the thumb
function swiper(label, pos = 0) {
  const W = 350, TH = 72, x = 8 + pos * (W - TH - 16);
  return `<div class="swiper"><span class="trail" style="width:${x + TH}px;opacity:${pos ? 1 : 0}"></span>
    <span class="txt" style="${pos > .45 ? 'color:#fff' : ''}">${label}<span class="ch"><i data-lucide="chevrons-right" class="sm"></i></span></span>
    <span class="thumb" style="left:${x}px"><i></i><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></div>`;
}
function boot() { lucide.createIcons({ attrs: { 'stroke-width': 2 } }); }
