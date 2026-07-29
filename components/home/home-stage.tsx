'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CenterStage } from './center-stage';

const INSTAGRAM = 'https://www.instagram.com/joyingntravelling/';

export function HomeStage() {
  const linkCls = 'text-white/90 hover:text-[#2CA152] transition-colors';
  // While the swing is being played, fade the page chrome so the toy is the focus.
  const [swinging, setSwinging] = useState(false);
  const chrome = `transition-opacity duration-500 ${swinging ? 'opacity-0 pointer-events-none' : 'opacity-100'}`;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black text-white">
      {/* Nav — plain links; no hover preview */}
      <nav className={`fixed top-[calc(1.5rem+var(--sat))] left-0 right-0 z-50 flex items-center justify-between pl-[calc(2rem+var(--sal))] pr-[calc(2rem+var(--sar))] text-sm font-sans ${chrome}`}>
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className={linkCls}
        >
          Photography
        </a>
        <Link href="/about" className={linkCls} aria-label="Joy Sengupta">
          {/* Logo on mobile, name on desktop */}
          <img src="/icon.svg" alt="Joy Sengupta" className="w-7 h-7 md:hidden" />
          <span className="hidden md:inline">Joy Sengupta</span>
        </Link>
        <Link href="/writings" className={linkCls}>
          Writings
        </Link>
      </nav>

      {/* Rotated copyright strip on the left edge */}
      <p
        className={`hidden md:block fixed top-1/2 left-3 z-50 text-[10px] font-mono uppercase tracking-[0.2em] whitespace-nowrap pointer-events-none ${chrome}`}
        style={{ transform: 'rotate(-90deg) translateX(-50%)', transformOrigin: '0 0', color: 'rgba(255, 255, 255, 0.25)' }}
      >
        Folio of Joy — always work in progress
        <span className="inline-block mx-3 w-1 h-1 rounded-full bg-current align-middle" />
        Joydeep Sengupta &copy; 2077
        <span className="inline-block mx-3 w-1 h-1 rounded-full bg-current align-middle" />
        K&oslash;benhavn, Danmark
      </p>

      <CenterStage hoverTarget={null} onSwingingChange={setSwinging} />
    </div>
  );
}
