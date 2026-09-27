// Shared chrome for Convey screens: logo, utility bar, nav, flow stepper, icons.
// Real client logo, blurred on purpose (NDA allows a suggestive, unreadable mark)
const LOGO = `<img class="blogo" src="_logo.png" alt="Convey (logo blurred)">`;

const STEPS = ['Location', 'Drug cabinet', 'Pharmacy', 'Doctors', 'Plans', 'Enroll'];

function chrome({ step = 4, nav = 'Plans' } = {}) {
  const flow = STEPS.map((s, i) => {
    const st = i < step ? 'done' : i === step ? 'on' : '';
    const dot = i < step ? '<i data-lucide="check" class="sm"></i>' : i + 1;
    return (i ? `<span class="bar ${i <= step ? 'done' : ''}"></span>` : '') +
      `<span class="step ${st}"><span class="dot">${dot}</span>${s}</span>`;
  }).join('');
  const links = ['Plans', 'Member', 'Provider', 'Tools & resources', 'Contact us']
    .map(l => `<a class="${l === nav ? 'on' : ''}">${l}</a>`).join('');
  return `
  <div class="util"><div class="wrap">
    <span>Call us 24/7 <b class="num">1-800-234-5678</b></span><span>TTY <b>711</b></span>
    <span class="sp"></span>
    <span>Licensed agents available 8am–8pm ET</span>
    <span class="lang"><span class="on">English</span><span>Español</span></span>
  </div></div>
  <header class="nav"><div class="wrap">
    <a class="logo">${LOGO}</a>
    <nav class="links">${links}</nav>
    <span class="sp"></span>
    <span class="me"><span class="avatar">JD</span><span>John Doe<small>Saved 2 plans</small></span></span>
  </div></header>
  ${step >= 0 ? `<div class="flow"><div class="wrap">${flow}<span class="sp"></span>
    <span class="loc"><i data-lucide="map-pin" class="sm"></i><b>Brooklyn, NY 11212</b> · Kings County<button>Change</button></span>
  </div></div>` : ''}`;
}

const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>';
function stars(n) {
  return `<span class="stars" aria-label="${n} out of 5 stars">` +
    [1, 2, 3, 4, 5].map(i => i <= Math.round(n) ? STAR : STAR.replace('<svg', '<svg class="off"')).join('') + '</span>';
}

function boot(opts) {
  document.getElementById('chrome').innerHTML = chrome(opts);
  document.querySelectorAll('[data-stars]').forEach(el => el.outerHTML = stars(+el.dataset.stars));
  lucide.createIcons({ attrs: { 'stroke-width': 1.75 } });
}
