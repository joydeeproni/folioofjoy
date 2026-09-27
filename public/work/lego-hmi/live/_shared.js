// Moulding HMI shell: Carbon UI-shell header + touch side nav
function hmiShell({ nav = 'Overview', alarms = 0, status = 'Running' } = {}) {
  const items = [['dashboard', 'Overview'], ['activity', 'Process'], ['notebook', 'eLog'], ['warning--alt', 'Alarms'], ['renew', 'Changeover'], ['stop--filled', 'Stop code'], ['document', 'Documents']];
  const navHtml = items.map(([ic, n]) => `<a class="${n === nav ? 'on' : ''}">${ci(ic, 20)}${n}${n === 'Alarms' && alarms ? `<span class="n">${alarms}</span>` : ''}</a>`).join('');
  const st = { Running: ['green', 'Running'], Alarm: ['red', 'Stopped · alarm'], Stopped: ['warm-gray', 'Stopped · breakdown'], Setup: ['blue', 'Run-in'] }[status];
  return `
  <header class="cds--header cds--g100" aria-label="Moulding HMI" style="background:#161616">
    <img class="hdr-logo" src="assets/lego.png" alt="Client logo (blurred)">
    <a class="cds--header__name" style="color:#f4f4f4"><span class="cds--header__name--prefix">Moulding</span>&nbsp;HMI</a>
    <div class="mach-id">${ci('industry', 16)}<b>Machine 152662</b>Module 9 · R1/P12</div>
    <span class="hdr-sp"></span>
    <div class="hdr-item"><span class="cds--tag cds--tag--${st[0]} cds--tag--md"><span class="cds--tag__label">${st[1]}</span></span></div>
    <div class="hdr-item">${ci('notification', 20)}${alarms ? `<span class="badge">${alarms}</span>` : ''}</div>
    <div class="hdr-item">Shift B</div>
    <div class="hdr-item op"><span class="av">MH</span>M. Hansen</div>
    <div class="hdr-item clock">14:32</div>
  </header>`;
}
function hmiNav(nav, alarms) {
  const items = [['dashboard', 'Overview'], ['activity', 'Process'], ['notebook', 'eLog'], ['warning--alt', 'Alarms'], ['renew', 'Changeover'], ['stop--filled', 'Stop code'], ['document', 'Documents']];
  return `<nav class="nav">${items.map(([ic, n]) => `<a class="${n === nav ? 'on' : ''}">${ci(ic, 20)}${n}${n === 'Alarms' && alarms ? `<span class="n">${alarms}</span>` : ''}</a>`).join('')}
    <span class="sp"></span><div class="conn"><b><i></i>MES connected</b>Last sync 14:32:08</div></nav>`;
}
function boot(o = {}) {
  document.body.insertAdjacentHTML('afterbegin', hmiShell(o));
  document.querySelector('.shell').insertAdjacentHTML('afterbegin', hmiNav(o.nav || 'Overview', o.alarms || 0));
  hydrateIcons();
}
