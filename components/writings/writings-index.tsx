'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { WritingListItem } from '@/lib/content/types';
import { SORTED_CASES } from '@/components/case-study/cases';

const FG = '#EDEAE0';
const RULE = 'rgba(237,234,224,0.15)';

// Folio of Joy lives in Thoughts (a personal, reflective piece), not Cases.
const FOLIO_THOUGHT = { title: 'Folio of Joy', number: '00', meta: 'Personal', href: '/work/folio-of-joy' };

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

  // Restore the tab + scroll from a prior visit (e.g. coming back from a case
  // study), so returning lands where you left off — on the Cases tab if that's
  // where you were.
  useEffect(() => {
    const savedTab = sessionStorage.getItem('writings-tab');
    if (savedTab === 'cases' || savedTab === 'thoughts') setTab(savedTab);
    const savedScroll = sessionStorage.getItem('writings-scroll');
    if (savedScroll) {
      const y = parseInt(savedScroll, 10);
      if (!Number.isNaN(y)) requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('writings-tab', tab);
  }, [tab]);

  useEffect(() => {
    const onScroll = () => sessionStorage.setItem('writings-scroll', String(window.scrollY));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="max-w-4xl mx-auto pt-28">
      <div className="mb-16 flex gap-7">
        <Tab label="Thoughts" active={tab === 'thoughts'} onClick={() => setTab('thoughts')} />
        <Tab label="Cases" active={tab === 'cases'} onClick={() => setTab('cases')} />
      </div>

      {tab === 'thoughts' ? (
        <ul className="divide-y" style={{ borderColor: RULE }}>
          <li key="folio-of-joy">
            <Row n={FOLIO_THOUGHT.number} title={FOLIO_THOUGHT.title} meta={FOLIO_THOUGHT.meta} href={FOLIO_THOUGHT.href} />
          </li>
          {writings.map((post) => (
            <li key={post.slug}>
              <Row n={post.number} title={post.title} meta={post.type || post.postedOn} href={`/writings/${post.slug}`} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y" style={{ borderColor: RULE }}>
          {SORTED_CASES.map((c) => (
            <li key={c.title}>
              <Row n={String(c.year)} title={c.title} meta={c.category} href={c.slug ? `/work/${c.slug}` : undefined} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
