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
    </main>
  )
}
