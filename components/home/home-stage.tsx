'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CenterStage, type HoverTarget } from './center-stage';

const INSTAGRAM = 'https://www.instagram.com/joyingntravelling/';

export function HomeStage() {
  const [hover, setHover] = useState<HoverTarget>(null);
  const [hoverOrigin, setHoverOrigin] = useState<{ x: number; y: number } | null>(null);
  const dim = (t: HoverTarget) => hover !== null && hover !== t;
  const cls = (t: HoverTarget) =>
    `transition-opacity duration-300 ${dim(t) ? 'opacity-40' : 'opacity-90 hover:opacity-100'}`;
  // On hover, record the link's centre so the dither can drift out from it.
  const enter = (t: HoverTarget) => (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHoverOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setHover(t);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Nav — hovering any item dither-transitions the whole page to its preview */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-8 text-sm font-sans">
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={enter('photography')}
          onMouseLeave={() => setHover(null)}
          className={cls('photography')}
        >
          Photography
        </a>
        <Link
          href="/about"
          onMouseEnter={enter('about')}
          onMouseLeave={() => setHover(null)}
          className={cls('about')}
        >
          Joy Sengupta
        </Link>
        <Link
          href="/writings"
          onMouseEnter={enter('writings')}
          onMouseLeave={() => setHover(null)}
          className={cls('writings')}
        >
          Writings
        </Link>
      </nav>

      {/* Rotated copyright strip on the left edge */}
      <p
        className="hidden md:block fixed top-1/2 left-3 z-50 text-[10px] font-mono uppercase tracking-[0.2em] whitespace-nowrap pointer-events-none"
        style={{ transform: 'rotate(-90deg) translateX(-50%)', transformOrigin: '0 0', color: 'rgba(255, 255, 255, 0.25)' }}
      >
        Folio of Joy — always work in progress
        <span className="inline-block mx-3 w-1 h-1 rounded-full bg-current align-middle" />
        Joydeep Sengupta &copy; 2077
        <span className="inline-block mx-3 w-1 h-1 rounded-full bg-current align-middle" />
        K&oslash;benhavn, Danmark
      </p>

      <CenterStage hoverTarget={hover} hoverOrigin={hoverOrigin} />
    </div>
  );
}
