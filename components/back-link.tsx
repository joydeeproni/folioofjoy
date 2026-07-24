'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircleButton } from '@/components/circle-button';

// Full text spun around the disc on hover, per destination.
const ARC_BY_DEST: Record<string, string> = {
  '/': 'BACK TO HOME',
  '/writings': 'BACK TO WRITINGS',
  '/preview': 'BACK TO WORK',
};

// Shared "Back" nav — the circular BACK disc, fixed top-left. Pressing Escape
// also navigates back, so every page with a BackLink can be closed from the
// keyboard.
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

  // Sized and placed like the Next.js dev-tools indicator: a small disc tucked
  // into the corner, growing out of it while hovered/pressed.
  return (
    <div className="fixed top-[calc(1.25rem+var(--sat))] left-[calc(1.25rem+var(--sal))] z-50">
      <CircleButton label="BACK" arcText={ARC_BY_DEST[href] ?? 'GO BACK'} href={href} />
    </div>
  );
}
