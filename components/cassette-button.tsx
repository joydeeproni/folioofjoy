'use client';

import Link from 'next/link';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// Global bottom-right control: a cassette that opens the Lounge. Replaces the
// floating music pill site-wide. Hidden wherever the player is hidden (e.g. the
// Lounge itself) via AudioUI's playerVisible gate.
export function CassetteButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/zen"
          aria-label="Enter the Lounge"
          className="fixed bottom-[calc(1.5rem+var(--sab))] right-[calc(1.5rem+var(--sar))] z-50 block transition-transform hover:scale-105"
        >
          <img src="/cassette.svg" alt="" className="w-20 md:w-24 h-auto" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="left">Lounge</TooltipContent>
    </Tooltip>
  );
}
