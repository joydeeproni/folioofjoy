// Shared, framework-neutral slug so the article's server-rendered heading ids
// and the client-side TOC stay in lockstep. Kept out of any 'use client' module
// so a Server Component can import and call it (client-module exports become
// non-callable client references when imported server-side).
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
