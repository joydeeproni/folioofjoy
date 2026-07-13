'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CenterStage } from './center-stage';
import { useAudio } from '@/lib/audio-context';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const INSTAGRAM = 'https://www.instagram.com/joyingntravelling/';

export function HomeStage() {
  const linkCls = 'opacity-90';
  const { setPlayerVisible } = useAudio();

  // The homepage swaps the global music pill for a cassette that opens the Lounge.
  useEffect(() => {
    setPlayerVisible(false);
    return () => setPlayerVisible(true);
  }, [setPlayerVisible]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Nav — plain links; no hover preview */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-8 text-sm font-sans">
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className={linkCls}
        >
          Photography
        </a>
        <Link href="/about" className={linkCls}>
          Joy Sengupta
        </Link>
        <Link href="/writings" className={linkCls}>
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

      {/* Cassette — bottom-right; opens the Lounge (replaces the music pill here) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/zen"
            aria-label="Enter the Lounge"
            className="fixed bottom-6 right-6 z-50 block transition-transform hover:scale-105"
          >
            <img src="/cassette.svg" alt="" className="w-20 md:w-24 h-auto" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left">Lounge</TooltipContent>
      </Tooltip>

      <CenterStage hoverTarget={null} />
    </div>
  );
}
