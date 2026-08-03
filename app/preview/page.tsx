import Link from 'next/link'
import { BackLink } from '@/components/back-link'
import { WorkMarquee } from '@/components/home/work-marquee'

// Full-screen work-preview reel: a rainbow-ordered filmstrip you can fling,
// scroll, and drag. Its own page (no page scroll) so vertical wheel only ever
// moves the carousel horizontally.
export default function PreviewPage() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black text-white">
      <BackLink />
      {/* Cases sits opposite BackLink, on the same inset the disc uses so the
          two corners line up. Homepage nav link styling. */}
      <Link
        href="/writings?tab=cases"
        className="fixed top-[calc(1.25rem+var(--sat))] right-[calc(1.25rem+var(--sar))] z-50 font-sans text-sm text-white/90 transition-colors hover:text-[#2CA152]"
      >
        Cases
      </Link>
      <WorkMarquee />
      {/* Pinned to the bottom of the screen, independent of the reel. Stays
          pointer-events-none so it never eats a drag meant for the reel. */}
      <p className="pointer-events-none select-none fixed inset-x-0 bottom-[calc(1.5rem+var(--sab))] z-30 px-6 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/30">
        Preview of both messy &amp; polished frames
      </p>
    </main>
  )
}
