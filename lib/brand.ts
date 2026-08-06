// The site's brand palette — the four colours of the home-page swing set, and
// the only accent colours the site should reach for.
//
// Mirrored in app/globals.css as `--brand-*` on :root (usable anywhere as
// `var(--brand-green)`) and as Tailwind utilities via @theme, so
// `text-brand-green` / `bg-brand-yellow` resolve to these same values. Use the
// CSS side for class names, this module when a colour has to be a JS value
// (inline styles, canvas, SVG fills, config objects).
//
// Changing a colour means changing it in BOTH places — there's no build step
// wiring them together.
export const BRAND = {
  purple: '#705292',
  red: '#DD3430',
  green: '#2CA152',
  yellow: '#E9D80C',
} as const;

export type BrandColor = keyof typeof BRAND;

// Green is the site's primary accent — link hovers, the dither wash, the pixel
// hero quote. The other three are used for categorical fills (values, zen).
export const ACCENT = BRAND.green;

// Fixed order for anything that needs to cycle the palette, so runs of coloured
// items land in the same sequence everywhere.
export const BRAND_ORDER: BrandColor[] = ['green', 'yellow', 'red', 'purple'];
