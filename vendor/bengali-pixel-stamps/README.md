# bengali-pixel-stamps

197 pixel postage stamps, one for every country (UN members plus Vatican City, Palestine, Kosovo
and Taiwan). Each stamp's symbol is built from a letter of the country's Bengali name, and the stamp carries the
season, year and country code drawn in the same dots. No fonts, images or network requests: one 150 KB script (about 30 KB gzipped).
Colour comes from CSS `color`. Open `index.html` (through any web server) to browse them all.

## Quick start

Copy this folder into your site, then:

```html
<script type="module" src="/bengali-pixel-stamps/bengali-pixel-stamps.js"></script>

<bp-stamp country="DK"></bp-stamp>                              <!-- this season + year -->
<bp-stamp country="JP" season="winter" year="2023"></bp-stamp>
<bp-stamp country="auto" fallback="BD" label="bn" size="128" style="color:#c4553a"></bp-stamp>
```

No build step or modules? Use the classic script instead (same element, plus `window.BPStamps`):

```html
<script src="/bengali-pixel-stamps/bengali-pixel-stamps.global.js"></script>
```

With a bundler (React, Vue, Svelte, Astro…), install the folder (`npm i ./bengali-pixel-stamps`) and:

```js
import { stampSVG, stampFor, countries } from 'bengali-pixel-stamps';
el.innerHTML = stampSVG('DK', { season: 'fall', year: 2026, size: 120 });
```

In React, `import 'bengali-pixel-stamps'` once and render `<bp-stamp country="DK" />`, or use
`<span dangerouslySetInnerHTML={{ __html: stampSVG('DK') }} />`.

## `<bp-stamp>` attributes

| Attribute | Values | Default |
| --- | --- | --- |
| `country` | ISO 3166 alpha-2 code (`XK` for Kosovo), or `auto` | `auto` |
| `fallback` | code used when `auto` can't tell | none |
| `season` | `spring` `summer` `fall` `autumn` `winter` `auto` `none` | `auto` (today's season, flipped for southern-hemisphere countries) |
| `year` | a year, `auto`, `none` | `auto` (this year) |
| `tag` | `false` hides the country code | shown |
| `label` | text under the stamp: `en` `bn` `code` `none` | `en` |
| `frame` | `perforated` `line` `none` | `perforated` |
| `size` | width in px | `96` |

Attributes can change at any time and the stamp redraws.

## Visitor's country

`country="auto"` only reads the region in the browser language (`da-DK` → Denmark; plain `en` has none, so
`fallback` is used). For the real location pass it from your server, e.g.:

- Vercel: `request.headers.get('x-vercel-ip-country')`
- Cloudflare: `request.headers.get('CF-IPCountry')`
- Netlify: `context.geo.country.code`

```html
<bp-stamp country="{{ visitorCountry }}" fallback="BD"></bp-stamp>
```

## JavaScript API

| Export | What |
| --- | --- |
| `countries` | `[{ code, name, bn, symbol, letter }]`, sorted by English name |
| `stampFor(code)` | one country, or `null` |
| `stampSVG(code, options)` | SVG markup; options `size`, `frame`, `season`, `year`, `tag`, `title`, `date` |
| `stampBits(code, options)` | the stamp as dots `{ w, h, bits }`, e.g. for canvas |
| `seasonFor(code, date)` | the season used by `auto` |
| `detectCountry()` | code from the browser language, or `null` |

## Files

| File | What |
| --- | --- |
| `bengali-pixel-stamps.js` | ES module: data, API and the `<bp-stamp>` element |
| `bengali-pixel-stamps.global.js` | same as a classic script, sets `window.BPStamps` |
| `bengali-pixel-stamps.d.ts` | TypeScript types |
| `svg/dk.svg` … | ready-made stamps (frame + country code, no date), `currentColor` |
| `countries.json` | country list with each stamp's symbol and the shared letter |
| `index.html` | browse and configure all stamps; click one to copy its tag |

Symbols are rendered from Noto Sans Bengali (SIL Open Font License 1.1).
