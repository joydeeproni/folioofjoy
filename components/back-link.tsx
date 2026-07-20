'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

// Shared "Back" nav. Mobile: a frosted pill (with chevron). Desktop: a quiet
// text link (green underline on hover). Pressing Escape also navigates back —
// every page with a BackLink can be closed from the keyboard.
export function BackLink({ href = '/' }: { href?: string }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      router.push(href);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [href, router]);

  return (
    <Link
      href={href}
      className="fixed top-[calc(1.5rem+var(--sat))] left-[calc(1.5rem+var(--sal))] z-50 transition-colors duration-200 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-sans backdrop-blur-md hover:bg-white/20 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none md:hover:bg-transparent md:underline md:decoration-transparent md:underline-offset-4 md:hover:text-[#2CA152] md:hover:decoration-[#2CA152]"
    >
      <ChevronLeft className="w-4 h-4 md:hidden" aria-hidden />
      Back
    </Link>
  );
}
