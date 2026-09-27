// SXchange shell: nav with the buy/sell mode switch (the 2019 "switch flow")
const LOGO = 'assets/logo.png';
function nav({ mode = 'buy', active = 'Listings', auth = true, admin = false } = {}) {
  if (!auth) return `<header class="nav"><img class="logo" src="${LOGO}" alt="Client logo (blurred)"><nav class="links"><a class="${active === 'Listings' ? 'on' : ''}">Listings</a><a>How it works</a><a>For fund managers</a><a>About</a></nav><span class="sp"></span>
    <div class="srch"><i data-lucide="search" class="sm"></i>Search funds, managers, categories</div><a class="btn ghost sm">Log in</a><a class="btn primary sm">Register</a></header>`;
  if (admin) return `<header class="nav"><img class="logo" src="${LOGO}" alt="Client logo (blurred)"><span class="chip" style="background:var(--navy-700);color:#fff">Admin</span><nav class="links">${['Review queue', 'Listings', 'Users', 'Organisations'].map(l => `<a class="${l === active ? 'on' : ''}">${l}${l === 'Review queue' ? '<span class="ct" style="background:var(--amber-600)">4</span>' : ''}</a>`).join('')}</nav><span class="sp"></span>
    <div class="srch"><i data-lucide="search" class="sm"></i>Search listings, users, organisations</div><span class="ib dot"><i data-lucide="bell"></i></span><span class="av" style="background:#0F7A47">MS</span></header>`;
  const L = mode === 'buy' ? ['Listings', 'Compare', 'Wishlist', 'Dashboard'] : ['Listings', 'Dashboard', 'Prospects'];
  const cnt = { Wishlist: 4, Compare: 3, Prospects: 12 };
  const links = L.map(l => `<a class="${l === active ? 'on' : ''}">${l}${cnt[l] ? `<span class="ct">${cnt[l]}</span>` : ''}</a>`).join('');
  return `<header class="nav"><img class="logo" src="${LOGO}" alt="Client logo (blurred)"><nav class="links">${links}</nav><span class="sp"></span>
    <div class="srch"><i data-lucide="search" class="sm"></i>Search funds, managers, categories</div>
    <div class="mode"><span class="${mode === 'buy' ? 'on' : ''}">Buying</span><span class="${mode === 'sell' ? 'on' : ''}">Selling</span></div>
    <span class="ib dot"><i data-lucide="bell"></i></span><span class="av">JS</span></header>`;
}
function foot() {
  return `<footer class="foot"><div class="r1"><img class="logo" src="${LOGO}" alt="Client logo (blurred)"><span class="sp"></span><nav><a>How it works</a><a>For fund managers</a><a>Company</a><a>Help centre</a><a>Contact</a></nav></div>
  <p class="dis">Investments in Alternative Investment Funds are subject to market risks. Read all scheme-related documents carefully. Past performance is not an indicator of future returns. SXchange connects buyers and sellers of AIF units; transfers are approved and recorded by the fund's manager.</p>
  <div class="r3"><span>© 2019 SXchange. All rights reserved.</span><span>Privacy · Terms · Grievance redressal</span></div></footer>`;
}
// Indian digit grouping with 2 decimals (client feedback: commas + 2 decimal points everywhere)
function inr(n, dp = 2) {
  const [i, d] = Math.abs(n).toFixed(dp).split('.');
  const last3 = i.slice(-3), rest = i.slice(0, -3);
  return (n < 0 ? '-' : '') + '₹' + (rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + last3 + (dp ? '.' + d : '');
}
function lakh(n) { return n >= 1e7 ? '₹' + (n / 1e7).toFixed(2) + ' Cr' : '₹' + (n / 1e5).toFixed(2) + ' L'; }
function units(n) { return n.toLocaleString('en-IN'); }
// deal bar: nav per unit vs asking price per unit
function deal(navU, askU) {
  return `<div class="deal"><div class="bar"><span class="ask" style="width:${askU / navU * 100}%"></span><span class="gap" style="left:${askU / navU * 100}%;right:0"></span></div>
    <div class="lg"><span>Ask <b>${inr(askU, 4)}</b></span><span>NAV ${inr(navU, 4)}</span></div></div>`;
}
const FUNDS = [
  { id: 'MIO', name: 'Meridian Income Opportunities Fund', series: 'Series II · Special Situations', cat: 'AIF Cat II', mgr: 'Meridian Capital', color: '#1E3A5F', nav: 12.4981, ask: 8.7487, units: 100000, views: 243, prospects: 17, status: 'Active', vintage: 2017, strat: 'Special situations', isNew: false, sellers: 3 },
  { id: 'ASF', name: 'Aravali Special Situations Fund', series: 'Close-ended · 7-year term', cat: 'AIF Cat III', mgr: 'Aravali Asset Managers', color: '#B5541F', nav: 9.1243, ask: 6.8432, units: 64000, views: 134, prospects: 12, status: 'Active', vintage: 2018, strat: 'Special situations', isNew: false, sellers: 2 },
  { id: 'DVF', name: 'Deccan Venture Fund IV', series: 'Early stage · Tech', cat: 'AIF Cat I', mgr: 'Deccan Ventures', color: '#8A2E4F', nav: 15.6120, ask: 11.7090, units: 18000, views: 190, prospects: 9, status: 'Active', vintage: 2015, strat: 'Venture', isNew: true, sellers: 1 },
  { id: 'SGP', name: 'Sahyadri Growth Partners Fund', series: 'Series I · Growth equity', cat: 'AIF Cat II', mgr: 'Sahyadri Partners', color: '#2E6B4A', nav: 8.7343, ask: 6.9874, units: 42500, views: 88, prospects: 6, status: 'Processing', vintage: 2016, strat: 'Growth equity', isNew: false, sellers: 2 },
  { id: 'NRC', name: 'Narmada Real Estate Credit Fund', series: 'Series III · Structured credit', cat: 'AIF Cat II', mgr: 'Narmada Investment Advisors', color: '#6B5A1E', nav: 11.0815, ask: 8.9761, units: 55000, views: 102, prospects: 7, status: 'Active', vintage: 2018, strat: 'Private credit', isNew: true, sellers: 1 },
  { id: 'KCA', name: 'Konkan Credit Alpha Trust', series: 'Performing credit', cat: 'AIF Cat II', mgr: 'Konkan Advisors', color: '#5B3E8C', nav: 10.2210, ask: 9.1989, units: 25000, views: 61, prospects: 3, status: 'Active', vintage: 2019, strat: 'Private credit', isNew: false, sellers: 1 },
  { id: 'TLS', name: 'Thar Long–Short Fund', series: 'Open-ended · Long–short equity', cat: 'AIF Cat III', mgr: 'Thar Capital', color: '#1F5C6B', nav: 14.3302, ask: 13.1838, units: 12000, views: 47, prospects: 2, status: 'Active', vintage: 2019, strat: 'Long–short', isNew: false, sellers: 1 },
];
const fundById = id => FUNDS.find(f => f.id === id);
const offPct = f => Math.round((1 - f.ask / f.nav) * 100);
function fm(f, size = 44, fs = 14) { return `<span class="fm" style="background:${f.color};width:${size}px;height:${size}px;font-size:${fs}px;border-radius:${Math.round(size * .27)}px">${f.id}</span>`; }
function boot(o) {
  const n = document.getElementById('nav'); if (n) n.outerHTML = nav(o);
  const ft = document.getElementById('foot'); if (ft) ft.outerHTML = foot();
  document.querySelectorAll('[data-deal]').forEach(el => { const [a, b] = el.dataset.deal.split(',').map(Number); el.outerHTML = deal(a, b); });
  lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
}
const Q = new URLSearchParams(location.search);
