'use client';

import { useEffect } from 'react';
import { useDialKit } from 'dialkit';

// Dev-only dials for every `font-pixel` element outside the hero quote (the
// about / snap! / writings previews, post numbers, drop caps, the About h1).
// Writes CSS vars onto <html>; the matching rules live in app/globals.css.
export function DisplayFontDials() {
  const d = useDialKit('Display font · everywhere', {
    tracking: [0, -0.15, 0.3, 0.005], // em
    wordSpacing: [0, -0.4, 1, 0.01], // em
    kerning: { type: 'select' as const, options: ['auto', 'normal', 'none'], default: 'auto' },
    overrideLeading: false,
    leading: [1, 0.6, 2, 0.01],
  }) as unknown as {
    tracking: number;
    wordSpacing: number;
    kerning: string;
    overrideLeading: boolean;
    leading: number;
  };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--pixel-tracking', `${d.tracking}em`);
    root.style.setProperty('--pixel-word-spacing', `${d.wordSpacing}em`);
    root.style.setProperty('--pixel-kerning', d.kerning);
    root.style.setProperty('--pixel-leading', String(d.leading));
    root.toggleAttribute('data-pixel-leading', d.overrideLeading);
  }, [d.tracking, d.wordSpacing, d.kerning, d.overrideLeading, d.leading]);

  return null;
}
