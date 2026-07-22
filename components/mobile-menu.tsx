'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Music } from 'lucide-react';
interface MobileMenuProps {
  onExplore: () => void;
  toolbarColor?: string;
}

export function MobileMenu({ onExplore, toolbarColor }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Menu button — top left, mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-[calc(1.5rem+var(--sat))] left-[calc(1.5rem+var(--sal))] z-50 md:hidden text-white/50 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors"
      >
        MENU
      </button>

      {/* Fullscreen overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[150] md:hidden flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: toolbarColor || 'rgba(10, 10, 14, 0.98)' }}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-[calc(1.5rem+var(--sat))] right-[calc(1.5rem+var(--sar))] text-white/50 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors"
          >
            CLOSE
          </button>

          <nav className="flex flex-col items-center gap-6">
            <a
              href="https://www.instagram.com/joyingntravelling/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-sans text-white/70 hover:text-white transition-colors"
            >
              Photography
            </a>
            <a
              href="https://www.threads.com/@joydeep.roni"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-sans text-white/70 hover:text-white transition-colors"
            >
              Threads
            </a>
            <a
              href="https://www.linkedin.com/in/joydeeproni/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-sans text-white/70 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <Link
              href="/preview"
              className="text-2xl font-sans text-white/70 hover:text-white transition-colors"
            >
              Work
            </Link>

            <div className="w-12 h-px bg-white/10 my-2" />

            <button
              onClick={() => { setOpen(false); onExplore(); }}
              className="flex items-center gap-2 text-2xl font-sans text-white/70 hover:text-white transition-colors"
            >
              <Music className="w-5 h-5" />
              Lounge Mode
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
