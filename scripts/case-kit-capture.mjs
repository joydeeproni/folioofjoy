import { chromium } from '/Users/jds-mac/.npm/_npx/db89d7302a373f10/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
const W = '/Users/jds-mac/Documents/GitHub/folioofjoy/public/work';
const b = await chromium.launch({ channel: 'chrome' });
const out = {};
async function open(slug, file, vw, vh, dpr) {
  const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: dpr, reducedMotion: 'reduce' });
  await p.goto(`file://${W}/${slug}/live/${file}`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  return p;
}
async function layers(p, slug, name, sel, pad, parts) {
  const bb = await (await p.$(sel)).boundingBox();
  const clip = { x: bb.x - pad, y: bb.y - pad, width: bb.width + pad * 2, height: bb.height + pad * 2 };
  const files = [];
  for (const [i, part] of parts.entries()) {
    await p.evaluate(({ css }) => {
      let s = document.getElementById('__iso'); if (!s) { s = document.createElement('style'); s.id = '__iso'; document.head.append(s); }
      s.textContent = `html,body{background:transparent!important} body{visibility:hidden!important} ${css}`;
    }, { css: part });
    const f = `kit/${name}-layer-${i}.png`;
    await p.screenshot({ path: `${W}/${slug}/${f}`, clip, omitBackground: true });
    files.push(f);
  }
  await p.evaluate(() => document.getElementById('__iso')?.remove());
  return files;
}
async function anatomy(p, slug, name, sel, pad, pins) {
  const el = await p.$(sel); const bb = await el.boundingBox();
  const clip = { x: bb.x - pad, y: bb.y - pad, width: bb.width + pad * 2, height: bb.height + pad * 2 };
  await p.screenshot({ path: `${W}/${slug}/kit/${name}.png`, clip });
  const res = [];
  for (const s of pins) {
    const e = await p.$(s); const r = await e.boundingBox();
    res.push({ sel: s, x: +(((r.x + r.width / 2) - clip.x) / clip.width * 100).toFixed(1), y: +(((r.y + r.height / 2) - clip.y) / clip.height * 100).toFixed(1) });
  }
  return { file: `kit/${name}.png`, w: clip.width, h: clip.height, pins: res };
}
// Convey
let p = await open('convey-health', '01-plans.html', 1440, 1024, 2);
out.receipt = await layers(p, 'convey-health', 'receipt', '.receipt', 28, [
  '.receipt{visibility:visible!important} .receipt *{visibility:hidden!important}',
  '.receipt .top, .receipt .top *{visibility:visible!important}',
  '.receipt .rows{visibility:visible!important;background:#fff;border-radius:14px;box-shadow:0 1px 0 rgba(0,0,0,.04)} .receipt .rows *{visibility:visible!important}',
  '.receipt .foot, .receipt .foot *{visibility:visible!important}',
]);
out.plan = await anatomy(p, 'convey-health', 'plan-card', '.plan.pick', 18, ['.plan.pick .ribbon', '.plan.pick .fig.hero .v', '.plan.pick .p-foot .chip.ok', '.plan.pick .cmp', '.plan.pick .p-foot .btn.primary']);
await p.close();
// SellCrowd
p = await open('sellcrowd', '01-dashboard.html', 390, 844, 3);
out.shift = await layers(p, 'sellcrowd', 'shift', '.shift', 18, [
  '.hdr{visibility:visible!important} .hdr *{visibility:hidden!important} .shift{visibility:visible!important} .shift *{visibility:hidden!important}',
  '.shift .ring, .shift .ring *{visibility:visible!important}',
  '.shift .t, .shift .t *, .shift .live, .shift .live *{visibility:visible!important}',
]);
await p.close();
p = await open('sellcrowd', '02-leads.html', 390, 844, 3);
out.lead = await anatomy(p, 'sellcrowd', 'lead-card', '.lead.sel', 10, ['.lead.sel .av', '.lead.sel .n b', '.lead.sel .heat', '.lead.sel .meta span:last-child', '.lead.sel .c']);
await p.close();
await b.close();
fs.writeFileSync('/private/tmp/claude-501/-Users-jds-mac/0e498478-b5e2-4464-b457-bfd8bd00bf27/scratchpad/kit-capture.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
