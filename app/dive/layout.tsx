import type { Metadata } from 'next'

// Review-only copy of the portfolio for Dive Club's live reviews. Each page
// under /dive renders the public page as-is; shared links re-root themselves
// under /dive (see lib/review-path.ts) so reviewers stay inside the copy.
// Kept out of search and off the public nav — reach it only by its link.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Inflight review widget, scoped by data-path to /dive and its subpages.
          React hoists async scripts into <head>, so the tag ships in the
          server-rendered HTML rather than being injected after hydration. */}
      <script src="https://inflight.co/widget.js" data-org="aius9qpt" data-path="/dive" async></script>
      {children}
    </>
  )
}
