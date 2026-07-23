'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { WritingListItem } from '@/lib/content/types';

const FG = '#EDEAE0';
const RULE = 'rgba(237,234,224,0.15)';

// Case study index. `slug` is set once a study is live at /work/<slug>; the rest
// render as (non-clickable) placeholders until built. Order + labels are the
// canonical Cases list.
type CaseItem = { title: string; category: string; slug?: string };
const CASES: CaseItem[] = [
  { title: 'Cassi Home', category: 'Mobile', slug: 'cassi' },
  { title: 'Knobs, Sliders & Dials', category: 'Components', slug: 'knobs' },
  { title: 'Create Canvas', category: 'Web', slug: 'canvas' },
  { title: 'Insider', category: 'Web', slug: 'insider' },
  { title: 'MeraBills', category: 'Mobile', slug: 'merabills' },
  { title: 'Folio of Joy', category: 'Web', slug: 'folio-of-joy' },
  { title: 'Pitzsa', category: 'Web', slug: 'pitzsa' },
  { title: 'Deterge', category: 'Mobile', slug: 'deterge' },
  { title: 'Verizon', category: 'Mobile', slug: 'verizon' },
];

const twoDigit = (i: number) => String(i + 1).padStart(2, '0');

function Row({ n, title, meta, href }: { n: string; title: string; meta: string; href?: string }) {
  const body = (
    <>
      <span className="shrink-0 font-pixel text-sm" style={{ color: FG, opacity: 0.5 }}>
        {n}
      </span>
      <span
        className={`font-sans text-4xl md:text-6xl tracking-tight ${href ? 'transition-opacity group-hover:opacity-70' : ''}`}
      >
        {title}
      </span>
      <span className="ml-auto self-baseline font-mono uppercase tracking-widest text-sm" style={{ opacity: 0.4 }}>
        {meta}
      </span>
    </>
  );
  const cls = 'flex items-baseline gap-6 py-8';
  return href ? (
    <Link href={href} className={`group ${cls}`}>
      {body}
    </Link>
  ) : (
    <div className={`${cls} cursor-default`} aria-disabled>
      {body}
    </div>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-mono uppercase tracking-[0.25em] text-xs transition-opacity"
      style={{ color: FG, opacity: active ? 1 : 0.4 }}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export function WritingsIndex({ writings }: { writings: WritingListItem[] }) {
  const [tab, setTab] = useState<'thoughts' | 'cases'>('thoughts');

  return (
    <div className="max-w-4xl mx-auto pt-28">
      <div className="mb-16 flex gap-7">
        <Tab label="Thoughts" active={tab === 'thoughts'} onClick={() => setTab('thoughts')} />
        <Tab label="Cases" active={tab === 'cases'} onClick={() => setTab('cases')} />
      </div>

      {tab === 'thoughts' ? (
        <ul className="divide-y" style={{ borderColor: RULE }}>
          {writings.map((post) => (
            <li key={post.slug}>
              <Row n={post.number} title={post.title} meta={post.type || post.postedOn} href={`/writings/${post.slug}`} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y" style={{ borderColor: RULE }}>
          {CASES.map((c, i) => (
            <li key={c.title}>
              <Row n={twoDigit(i)} title={c.title} meta={c.category} href={c.slug ? `/work/${c.slug}` : undefined} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
