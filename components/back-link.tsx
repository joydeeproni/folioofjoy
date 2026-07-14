import Link from 'next/link';

// Text "Back" nav shared across content pages. Inherits the page's text colour
// (so it contrasts on both dark and coloured backgrounds), matches the Zen
// page's text-link style, and sits top-left like the writings page.
export function BackLink({ href = '/' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="fixed top-6 left-6 z-50 text-sm font-sans underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-[#2CA152] hover:decoration-[#2CA152]"
    >
      Back
    </Link>
  );
}
