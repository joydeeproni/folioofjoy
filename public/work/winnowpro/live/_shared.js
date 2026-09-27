// WinnowPro shells: onboarding (top stepper) and app (sidebar), plus the launch rail.
const LOGO = '<img class="blogo" src="_logo.png" alt="Client logo (blurred)">';
const ONB = ['Plan', 'Payment', 'Share access', 'Team', 'Showroom chat', 'Launch'];
function onbTop(step) {
  const s = ONB.map((n, i) => (i ? '<span class="st-bar"></span>' : '') + `<span class="st ${i < step ? 'done' : i === step ? 'on' : ''}"><i>${i < step ? '✓' : i + 1}</i>${n}</span>`).join('');
  return `<header class="otop">${LOGO}<nav class="steps">${s}</nav><span class="sp"></span><span class="help"><i data-lucide="headset"></i>Robin, your account manager<span class="av">RK</span></span></header>`;
}
function appSide(nav) {
  const items = [['layout-dashboard', 'Dashboard'], ['megaphone', 'Campaigns'], ['radar', 'Competitive intel', 'Pro'], ['message-circle', 'Showroom chat', '12'], ['bar-chart-3', 'Reports']];
  const admin = [['users', 'Access control'], ['building-2', 'Franchises'], ['credit-card', 'Billing']];
  const nv = ([ic, n, c]) => `<a class="nv ${n === nav ? 'on' : ''}"><i data-lucide="${ic}"></i>${n}${c ? `<span class="c">${c}</span>` : ''}</a>`;
  return `<aside class="side"><div class="brand">${LOGO}</div>${items.map(nv).join('')}<div class="grp">ADMIN</div>${admin.map(nv).join('')}<span class="sp"></span>
    <div class="dealer"><span class="av" style="background:var(--red-100);color:var(--red-600)">SC</span><div><b>Stevens Creek Hyundai</b><span>San Jose, CA · 3 franchises</span></div><i data-lucide="chevrons-up-down" class="sm" style="margin-left:auto;color:var(--ink-3)"></i></div></aside>`;
}
function appTop() {
  return `<header class="atop"><div class="search"><i data-lucide="search" class="sm"></i>Search campaigns, keywords, users</div><span class="sp"></span>
    <span class="chip green"><i data-lucide="circle-dot" class="sm"></i>Campaigns live</span><i data-lucide="bell" style="color:var(--ink-2)"></i><span class="av">JS</span></header>`;
}
// done: number of finished launch items (of 6)
function launchRail(done = 3, waiting = 1) {
  const items = [['Plan & payment', 'Ad Services'], ['Google Ads access', 'Connected'], ['Google Analytics', 'Connected'], ['Facebook Ads access', 'Needs retry'], ['CRM for attribution', 'Data 360'], ['Kick-off call with Robin', 'Thu 10:00']];
  const rows = items.map(([n, s], i) => {
    const st = i < done ? 'd' : i < done + waiting ? 'w' : 't';
    const ic = st === 'd' ? '<i data-lucide="check"></i>' : st === 'w' ? '<i data-lucide="alert-triangle"></i>' : '';
    return `<div class="lr"><span class="o ${st}">${ic}</span><b>${n}</b><span class="s">${s}</span></div>`;
  }).join('');
  const bars = items.map((_, i) => `<i class="${i < done ? 'd' : i < done + waiting ? 'w' : ''}"></i>`).join('');
  return `<section class="card launch"><span class="kick"><i data-lucide="rocket" class="sm"></i>Launch readiness</span>
    <h3>Your campaigns go live when these are done</h3>
    <div class="date"><b>Apr 12</b><span>target go-live · ${6 - done} to go</span></div>
    <div class="track">${bars}</div><div style="margin-top:12px">${rows}</div>
    <div class="am"><span class="av">RK</span><div><b>Robin Kaur</b><span>Your account manager · replies in ~1 hr</span></div><i data-lucide="message-circle" style="margin-left:auto;color:var(--red-600)"></i></div></section>`;
}
function boot() {
  document.querySelectorAll('[data-onb]').forEach(el => el.outerHTML = onbTop(+el.dataset.onb));
  document.querySelectorAll('[data-side]').forEach(el => el.outerHTML = appSide(el.dataset.side));
  document.querySelectorAll('[data-atop]').forEach(el => el.outerHTML = appTop());
  document.querySelectorAll('[data-launch]').forEach(el => { const [d, w] = el.dataset.launch.split(','); el.outerHTML = launchRail(+d, +w); });
  lucide.createIcons({ attrs: { 'stroke-width': 1.9 } });
}
