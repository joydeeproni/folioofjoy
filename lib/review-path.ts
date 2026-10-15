// The review-only copy of the portfolio (Dive Club) mirrors the public routes
// under /dive. Shared components keep writing public hrefs ('/about',
// '/work/cassi'); these helpers re-root them while the visitor is inside the
// copy, so its internal links never leak back out to the public site.
export const REVIEW_BASE = '/dive';

function inside(path: string, base: string) {
  return path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`);
}

// '/dive' while browsing the review copy, '' everywhere else.
export function reviewBase(pathname: string | null | undefined): string {
  return pathname && inside(pathname, REVIEW_BASE) ? REVIEW_BASE : '';
}

// Re-roots an internal href under `base`. External, protocol-relative and
// hash-only links pass through untouched.
export function withBase(href: string, base: string): string {
  if (!base || !href.startsWith('/') || href.startsWith('//') || inside(href, base)) return href;
  return href === '/' ? base : `${base}${href}`;
}

// The public path a review path mirrors — for code that keys off the route.
export function stripBase(pathname: string): string {
  if (!inside(pathname, REVIEW_BASE)) return pathname;
  return pathname.slice(REVIEW_BASE.length) || '/';
}
