import type { ReactNode } from 'react';

// Editorial prose primitives for case studies. Mirror the look of the writings
// articles (dark theme, pixel/sans/mono, green accent) so a case study reads as
// part of the same family. Server-safe — no client hooks.

const FG = '#EDEAE0';
const ACCENT = '#2CA152';

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-sans font-medium text-sm mb-3 tracking-[-0.02em]" style={{ color: ACCENT }}>
      {children}
    </p>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-sans font-medium text-2xl md:text-3xl tracking-tight mb-4 text-balance" style={{ color: FG }}>
      {children}
    </h2>
  );
}

export function P({ children, lead }: { children: ReactNode; lead?: boolean }) {
  return (
    <p
      className={`font-sans text-[17px] md:text-lg leading-relaxed mb-5 text-pretty ${
        lead
          ? 'first-letter:font-pixel first-letter:text-5xl first-letter:mr-2 first-letter:float-left first-letter:leading-none'
          : ''
      }`}
      style={{ color: FG }}
    >
      {children}
    </p>
  );
}

export function Pull({ children }: { children: ReactNode }) {
  return (
    <p
      className="my-8 pl-5 font-sans text-xl md:text-2xl leading-snug tracking-tight"
      style={{ color: FG, borderLeft: `2px solid ${ACCENT}` }}
    >
      {children}
    </p>
  );
}

export function List({ items, ordered }: { items: ReactNode[]; ordered?: boolean }) {
  const cls = 'font-sans text-[17px] md:text-lg leading-relaxed marker:text-[rgba(237,234,224,0.4)]';
  const inner = items.map((it, i) => (
    <li key={i} className={cls}>
      {it}
    </li>
  ));
  return ordered ? (
    <ol className="mb-6 space-y-2 pl-6 list-decimal" style={{ color: FG }}>
      {inner}
    </ol>
  ) : (
    <ul className="mb-6 space-y-2 pl-5 list-disc" style={{ color: FG }}>
      {inner}
    </ul>
  );
}
