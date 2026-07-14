'use client';

import { PortableText, type PortableTextComponents, type PortableTextBlock } from '@portabletext/react';
import { Reveal } from './reveal';

// Each paragraph reveals on scroll, matching the hand-built essay. Font/size/
// leading are inherited from the container the <Prose> sits in.
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <Reveal>
        <p>{children}</p>
      </Reveal>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={(value as { href?: string })?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
      >
        {children}
      </a>
    ),
    em: ({ children }) => <em>{children}</em>,
    strong: ({ children }) => <strong>{children}</strong>,
  },
};

export function Prose({ value }: { value?: PortableTextBlock[] }) {
  if (!value?.length) return null;
  return <PortableText value={value} components={components} />;
}
