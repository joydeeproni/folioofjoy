'use client';

import { useCallback, type ComponentProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { reviewBase, stripBase, withBase } from '@/lib/review-path';

// Maps a public href to the one to use on the current page: unchanged on the
// public site, re-rooted under /dive inside the review copy.
export function useSiteHref() {
  const base = reviewBase(usePathname());
  return useCallback((href: string) => withBase(href, base), [base]);
}

// The current route as its public path ('/dive/preview' → '/preview').
export function useSitePathname() {
  return stripBase(usePathname() ?? '/');
}

// Drop-in for next/link for internal navigation (string hrefs only).
export function SiteLink({ href, ...props }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const siteHref = useSiteHref();
  return <Link href={siteHref(href)} {...props} />;
}
