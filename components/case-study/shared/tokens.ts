// Shared palette + layout constants for the bespoke (non-CaseStudyLayout) case
// studies, so Cassi and Tactile Create cannot drift apart.

export const FG = '#EDEAE0';
export const BG = '#0B0B0B';
export const MUTED = 'rgba(237,234,224,0.55)';
export const FAINT = 'rgba(237,234,224,0.14)';
export const ACCENT = '#2CA152';

// Span the whole viewport regardless of the parent's max-width.
export const FULL_BLEED = 'w-screen ml-[calc(50%-50vw)]';

// A full-viewport-width scroll strip whose FIRST card is padded to line up with
// the content column — so a row "starts aligned with the text, then scrolls edge
// to edge". SHELF_PAD is that left inset (matches the max-w-5xl column).
export const SHELF = `${FULL_BLEED} overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`;
export const SHELF_PAD = 'pl-[max(1.5rem,calc(50vw-32rem))] pr-6 md:pl-[max(4rem,calc(50vw-32rem))]';
