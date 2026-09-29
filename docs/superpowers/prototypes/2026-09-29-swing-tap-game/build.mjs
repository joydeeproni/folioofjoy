// Throwaway prototype of the homepage swing tap game (fake, in-browser leaderboard).
// Build:  node docs/superpowers/prototypes/2026-09-29-swing-tap-game/build.mjs
// Serve:  python3 -m http.server -d docs/superpowers/prototypes/2026-09-29-swing-tap-game 4173
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = new URL('.', import.meta.url);
const path = (p) => fileURLToPath(new URL(p, dir));
const b64 = (p) => readFileSync(path(p)).toString('base64');

execFileSync('npx', ['-y', 'esbuild', path('entry.mjs'), '--bundle', '--format=iife', `--outfile=${path('scene.js')}`], { stdio: 'inherit' });

const html = readFileSync(path('template.html'), 'utf8')
  .replace('__FONT__', () => b64('../../../../public/fonts/GeistPixel-Regular.ttf'))
  .replace('__PRAKTIKAL_REG__', () => b64('../../../../public/fonts/APK-Praktikal-Regular.otf'))
  .replace('__PRAKTIKAL__', () => b64('../../../../public/fonts/APK-Praktikal-Bold.otf'))
  .replace('__SCENE__', () => readFileSync(path('scene.js'), 'utf8'));
writeFileSync(path('index.html'), html);
