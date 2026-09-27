// Fortna WES shell + cart component
function topbar({ task = 'Cart picking', sub = 'Wave 14 · Zone 306', pills = '' } = {}) {
  return `<header class="top"><span class="menu"><i data-lucide="menu"></i></span>
    <img class="logo" src="_logo.png" alt="Client logo (blurred)">
    <div class="task"><b>${task}</b><span>${sub}</span></div><span class="sp"></span>${pills}
    <span class="op"><span class="av">RM</span>R. Mehta</span></header>`;
}
// front-view tote (steel by default, lime when targeted)
function toteSVG(fill = '#5D87A1', dark = '#44718F') {
  return `<svg viewBox="0 0 120 84" preserveAspectRatio="none"><path d="M6 10 L114 10 L106 82 L14 82 Z" fill="${fill}"/>
    <path d="M2 4 H118 V14 H2 Z" rx="3" fill="${dark}"/><rect x="44" y="18" width="32" height="6" rx="3" fill="rgba(0,0,0,.22)"/>
    <path d="M14 82 L106 82 L107 74 L13 74 Z" fill="rgba(0,0,0,.08)"/><path d="M9 14 L20 14 L16 82 L14 82 Z" fill="rgba(255,255,255,.12)"/></svg>`;
}
// cells: array of {id, slot, state: empty|tote|target|done|removed|new, label}
function cart(cells, { cols = 4 } = {}) {
  const rows = [];
  for (let i = 0; i < cells.length; i += cols) rows.push(cells.slice(i, i + cols));
  const cell = c => {
    if (c.state === 'empty') return `<div class="slot empty"><div class="well">${c.label || 'Empty'}</div><span class="sid">${c.slot}</span></div>`;
    const tone = c.state === 'target' ? toteSVG('#B2B83A', '#979D2B') : toteSVG();
    return `<div class="slot ${c.state === 'tote' ? 'open' : c.state}">${c.state === 'target' ? `<span class="beam"></span>${c.put ? `<span class="put">${c.put}</span>` : ''}` : ''}
      <div class="tote">${tone}<span class="tid" style="${c.state === 'target' ? 'color:#1d1f08' : ''}">${c.id}</span></div>
      ${c.state === 'done' ? '<span class="ok"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d1f08" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' : ''}
      ${c.state === 'removed' ? '<span class="x"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span>' : ''}
      <span class="sid">${c.slot}</span></div>`;
  };
  return `<div class="cart"><span class="post" style="left:4px"></span><span class="post" style="right:4px"></span>${rows.map(r => `<div class="shelf">${r.map(cell).join('')}</div>`).join('')}</div>`;
}
const SLOTS = [...Array(12)].map((_, i) => 'Slot ' + String(i + 1).padStart(4, '0'));
const TOTES = ['T-9923', 'T-1512', 'T-9339', 'T-1676', 'T-2431', 'T-5186', 'T-4633', 'T-4737', 'T-3129', 'T-9567', 'T-4139', 'T-9416'];
function boot(o) {
  const WW = new URLSearchParams(location.search).get('w'); if (WW) document.body.style.width = WW + 'px';
  document.getElementById('top').outerHTML = topbar(o);
  document.querySelectorAll('[data-cart]').forEach(el => { el.outerHTML = cart(JSON.parse(el.dataset.cart)); });
  lucide.createIcons({ attrs: { 'stroke-width': 2 } });
}
