'use client';

import Link from 'next/link';
import { useAudio } from '@/lib/audio-context';

export default function Work() {
  const { theme } = useAudio();

  return (
    <main
      className="relative min-h-screen overflow-hidden transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: theme.background }}
    >
      {/* Navigation */}
      <nav className="fixed top-7 left-8 z-50 hidden md:flex items-center gap-5">
        <Link
          href="/"
          className="text-sm font-sans text-white/40 hover:text-white transition-colors"
        >
          Back Home
        </Link>
        <span className="text-sm font-sans text-white/40 hover:text-white transition-colors cursor-default">
          Projects
        </span>
      </nav>

      {/* Mobile navigation */}
      <nav className="md:hidden fixed top-5 left-5 z-50 flex items-center gap-4">
        <Link
          href="/"
          className="text-sm font-sans text-white/40 hover:text-white transition-colors"
        >
          Back Home
        </Link>
      </nav>

      {/* Accent circle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: theme.accent, opacity: 0.85 }}
      />

      {/* Quote text */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 md:px-16 lg:px-24">
        <p className="font-heading font-light text-white text-3xl md:text-7xl lg:text-8xl tracking-wide lowercase text-justify max-w-[900px]" style={{ lineHeight: '1.15' }}>
          i awoke and saw that life was service. i acted and behold, service was joy.
        </p>
      </div>
    </main>
  );
}
