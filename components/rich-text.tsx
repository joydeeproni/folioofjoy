'use client';

import { Reveal } from './reveal';
import type { Para } from '@/lib/content/types';

// Renders the About essay paragraphs. A paragraph is plain text, or a run of
// segments where a segment can be an inline link. Each paragraph reveals on
// scroll; font/size/leading are inherited from the container it sits in.
export function RichText({ paras }: { paras?: Para[] }) {
  if (!paras?.length) return null;
  return (
    <>
      {paras.map((para, i) => (
        <Reveal key={i}>
          <p>
            {typeof para === 'string'
              ? para
              : para.map((seg, j) =>
                  typeof seg === 'string' ? (
                    seg
                  ) : (
                    <a
                      key={j}
                      href={seg.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
                    >
                      {seg.text}
                    </a>
                  ),
                )}
          </p>
        </Reveal>
      ))}
    </>
  );
}
