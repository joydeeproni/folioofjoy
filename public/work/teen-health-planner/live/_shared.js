// Teen Health Planner shell: status bar + tab bar
function statusBar(light) {
  return `<div class="status ${light ? 'light' : ''}"><span class="num">9:41</span><span class="r"><i data-lucide="signal" class="sm"></i><i data-lucide="wifi" class="sm"></i><i data-lucide="battery-full"></i></span></div>`;
}
function tabBar(on = 'Home') {
  const t = [['settings', 'Settings'], ['message-circle', 'Chat'], ['house', 'Home'], ['search', 'Search']];
  return `<nav class="tabs">${t.map(([ic, n]) => `<a class="${n === on ? 'on' : ''}"><i data-lucide="${ic}"></i>${n}</a>`).join('')}<a class="add"><span><i data-lucide="plus" class="lg"></i></span></a></nav>`;
}
function boot({ light = false, tab = 'Home', tabs = true } = {}) {
  document.body.insertAdjacentHTML('afterbegin', statusBar(light));
  if (tabs) document.body.insertAdjacentHTML('beforeend', tabBar(tab));
  lucide.createIcons({ attrs: { 'stroke-width': 2 } });
}
