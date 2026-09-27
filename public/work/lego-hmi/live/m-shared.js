// Moulding companion (phone): iOS status bar, Carbon app bar, tab bar.
const MQ = new URLSearchParams(location.search);
function sbar(time = '14:24') {
  return `<div class="sb"><span class="mono" style="font-family:'IBM Plex Sans';font-weight:600">${time}</span><span class="r">
  <svg width="18" height="12" viewBox="0 0 18 12" fill="#f4f4f4"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
  <svg width="16" height="12" viewBox="0 0 16 12" fill="#f4f4f4"><path d="M8 2.6c2.1 0 4 .8 5.5 2.1l1.1-1.2A9.6 9.6 0 0 0 8 .9 9.6 9.6 0 0 0 1.4 3.5l1.1 1.2C4 3.4 5.9 2.6 8 2.6Zm0 3.4c1.2 0 2.3.4 3.2 1.2l1.1-1.2A6.4 6.4 0 0 0 8 4.3a6.4 6.4 0 0 0-4.3 1.7l1.1 1.2C5.7 6.4 6.8 6 8 6Zm0 3.3c-.5 0-1 .2-1.3.5L8 11.3l1.3-1.5c-.3-.3-.8-.5-1.3-.5Z"/></svg>
  <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#f4f4f4" opacity=".4"/><rect x="2" y="2" width="17" height="9" rx="2" fill="#f4f4f4"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="#f4f4f4" opacity=".5"/></svg></span></div>`;
}
function abar({ title, sub, back = false, alarms = 0, right = '' } = {}) {
  const lead = back ? `<span class="ib">${ci('arrow--left', 20)}</span>` : `<img class="logo" src="assets/lego.png" alt="Client logo (blurred)">`;
  const rt = right || `<span class="ib">${ci('search', 20)}</span><span class="ib">${ci('notification', 20)}${alarms ? `<span class="dot">${alarms}</span>` : ''}</span>`;
  return `<div class="ab${back ? ' back' : ''}">${lead}<h1>${title}${sub ? `<small>${sub}</small>` : ''}</h1><span class="sp"></span>${rt}</div>`;
}
function tbar(on = 'Machines', alarms = 1) {
  const it = [['industry', 'Machines'], ['warning--alt', 'Alarms'], ['notebook', 'eLog'], ['list--checked', 'Shift']];
  return `<nav class="tb">${it.map(([ic, n]) => `<a class="${n === on ? 'on' : ''}">${ci(ic, 24)}${n}${n === 'Alarms' && alarms ? `<span class="n">${alarms}</span>` : ''}</a>`).join('')}</nav><div class="hi"></div>`;
}
function mboot(o = {}) {
  document.body.classList.add('cds--g100');
  document.body.insertAdjacentHTML('afterbegin', sbar(o.time) + abar(o));
  if (o.tab !== false) document.body.insertAdjacentHTML('beforeend', tbar(o.tab || 'Machines', o.alarms ?? 1));
  else document.body.insertAdjacentHTML('beforeend', '<div class="hi"></div>');
  hydrateIcons();
}
