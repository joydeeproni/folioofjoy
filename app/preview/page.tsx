import { BackLink } from '@/components/back-link'
import { WorkMarquee } from '@/components/home/work-marquee'

// Full-screen work-preview reel: a rainbow-ordered filmstrip you can fling,
// scroll, and drag. Its own page (no page scroll) so vertical wheel only ever
// moves the carousel horizontally.
export default function PreviewPage() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black text-white">
      <BackLink />
      <WorkMarquee />
      {/* Pinned to the bottom of the screen, independent of the reel. */}
      <p className="pointer-events-none select-none fixed inset-x-0 bottom-[calc(1.5rem+var(--sab))] z-30 px-6 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/30">
        Snippets of my shipped work, WIP frames, prototypes, both messy &amp; polished. Scroll to go through
      </p>
    </main>
  )
}
