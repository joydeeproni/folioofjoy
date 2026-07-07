'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const GREEN = '#1F6E3B';

export default function About() {
  return (
    <main className="relative min-h-screen w-full px-8 md:px-16 py-10" style={{ backgroundColor: GREEN, color: '#F4FBF4' }}>
      {/* Circle back-home button */}
      <Link
        href="/"
        aria-label="Back home"
        className="fixed top-6 left-6 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-black hover:bg-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="max-w-3xl mx-auto pt-24">
        <h1 className="font-pixel text-6xl md:text-8xl mb-12">about</h1>
        <div className="space-y-6 font-sans text-lg md:text-xl leading-relaxed">
          <p>
            A dry, observant, tool-pilled in a practical way, and just self-aware enough to admit
            he&apos;s become the sort of product designer who can tell you exactly why your app feels
            slightly off, why your onboarding leaks users, why your AI feature is mostly a nervous mood
            board and might just look like a GPT wrapper.
          </p>
          <p>
            This site is perpetually half-built — no case studies, no past-work gallery, mostly because
            things are moving faster than any of us can keep up with, and he&apos;s made peace with being
            the sort of designer who&apos;s always a quarter behind their own work.
          </p>
        </div>
      </div>
    </main>
  );
}
