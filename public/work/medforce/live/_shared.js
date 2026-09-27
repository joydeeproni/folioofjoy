// MedForce shell (rep + speaker portals)
function shell({ portal = 'rep', nav = 'Dashboard' } = {}) {
  const rep = [['layout-dashboard', 'Dashboard'], ['calendar-days', 'Programs', '12'], ['mic', 'Speakers'], ['bar-chart-3', 'Reports'], ['folder-open', 'Resources'], ['radio-tower', 'Hub events', '3']];
  const spk = [['layout-dashboard', 'Dashboard'], ['calendar-days', 'Programs', '4'], ['presentation', 'Presentations'], ['graduation-cap', 'Training', '2'], ['file-signature', 'Contracts'], ['landmark', 'Direct deposit'], ['wallet', 'Payments'], ['folder-open', 'Resources']];
  const items = (portal === 'rep' ? rep : spk).map(([ic, n, c]) => `<a class="nv ${n === nav ? 'on' : ''}"><i data-lucide="${ic}"></i>${n}${c ? `<span class="c">${c}</span>` : ''}</a>`).join('');
  const brand = portal === 'rep'
    ? `<div class="brand"><div><img class="blogo" src="_logo.png" alt="Client logo (blurred)"><small>Rep portal · MedForce</small></div></div>`
    : `<div class="brand"><div><img class="blogo" src="_logo-speaker.png" alt="Client logo (blurred)" style="height:22px;filter:blur(4.2px)"><small>Speaker portal · MedForce</small></div></div>`;
  const foot = portal === 'rep'
    ? `<div class="terr"><span>Territory</span><b>EC160098 · Northeast</b><span>Budget year 2027</span></div>`
    : `<div class="terr"><span>Contract status</span><b style="color:var(--green-700)">Active through Dec 2027</b><span>W-9 on file</span></div>`;
  const side = `<aside class="side">${brand}${items}<span class="sp"></span>${foot}</aside>`;
  const top = `<header class="top"><div class="search"><i data-lucide="search" class="sm"></i>Search programs, speakers, venues<kbd>⌘K</kbd></div><span class="sp"></span>
    ${portal === 'rep' ? '<a class="btn primary"><i data-lucide="plus" class="sm"></i>Request program</a>' : ''}
    <span class="ib"><i data-lucide="bell"></i></span><span class="ib"><i data-lucide="circle-help"></i></span>
    <span class="user"><span class="av">${portal === 'rep' ? 'CE' : 'JD'}</span>${portal === 'rep' ? 'Cameron Evans' : 'Dr. John Doe'}</span></header>`;
  return { side, top };
}
function life(step, kind = '') { // step 0..4: Requested, Approved, Confirmed, Occurred, Closed
  const names = ['Requested', 'Approved', 'Confirmed', 'Occurred', 'Closed'];
  const bars = names.map((_, i) => `<i class="${i < step ? 'd' : i === step ? 'cur' : ''}"></i>`).join('');
  const col = kind === 'warn' ? 'var(--amber-600)' : kind === 'ok' ? 'var(--green-700)' : 'var(--navy-700)';
  return `<span style="display:inline-flex;align-items:center"><span class="life ${kind}" title="${names[step]}">${bars}</span><span class="life-l" style="color:${col}">${names[step]}</span></span>`;
}
function boot(o) {
  const { side, top } = shell(o);
  document.body.insertAdjacentHTML('afterbegin', '');
  const app = document.querySelector('.app');
  app.insertAdjacentHTML('afterbegin', side);
  app.querySelector('.col').insertAdjacentHTML('afterbegin', top);
  document.querySelectorAll('[data-life]').forEach(el => { const [s, k] = el.dataset.life.split(','); el.outerHTML = life(+s, k || ''); });
  lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
}
