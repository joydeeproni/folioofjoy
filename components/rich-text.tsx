'use client';

import type { ReactNode } from 'react';
import { ScrollFade } from './scroll-fade';
import type { Para } from '@/lib/content/types';

// Renders the About essay paragraphs. A paragraph is plain text, or a run of
// segments where a segment can be an inline link. Each paragraph brightens as it
// scrolls up the viewport; font/size/leading are inherited from the container it
// sits in. Pass `reveal={false}` inside a container that animates its own height
// (the Thesis accordion), where a scroll reveal would fight the expand.
export function RichText({ paras, reveal = true }: { paras?: Para[]; reveal?: boolean }) {
  if (!paras?.length) return null;
  const Wrapper = reveal ? ScrollFade : Passthrough;
  return (
    <>
      {paras.map((para, i) => (
        <Wrapper key={i}>
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
        </Wrapper>
      ))}
    </>
  );
}

function Passthrough({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
