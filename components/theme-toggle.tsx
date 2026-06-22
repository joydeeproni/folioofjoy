'use client';

import { Contrast } from 'lucide-react';
import { useAudio } from '@/lib/audio-context';

export function ThemeToggle() {
  const { accessibleMode, toggleAccessibleMode } = useAudio();

  return (
    <button
      onClick={toggleAccessibleMode}
      aria-pressed={accessibleMode}
      title={accessibleMode ? 'Switch to themed colors' : 'Switch to high-contrast accessible theme'}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:bg-white/5"
      style={{ backgroundColor: 'rgba(20, 20, 22, 0.9)' }}
    >
      <Contrast className={`w-4 h-4 ${accessibleMode ? 'text-white' : 'text-white/60'}`} />
      <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
        {accessibleMode ? 'A11y On' : 'A11y'}
      </span>
    </button>
  );
}
