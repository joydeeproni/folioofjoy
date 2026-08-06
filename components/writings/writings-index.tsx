'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { WritingListItem } from '@/lib/content/types';
import { SORTED_CASES } from '@/components/case-study/cases';
import { ConstructionSign } from '@/components/icons/construction-sign';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const FG = '#EDEAE0';
const RULE = 'rgba(237,234,224,0.15)';

// Hovering a barricaded case row says the quiet part out loud.
const WIP_CASE_NOTE = 'Trying to do some actual work instead of writing case studies';

// Folio of Joy lives in Thoughts (a personal, reflective piece), not Cases.
const FOLIO_THOUGHT = { title: 'Folio of Joy', number: '00', meta: 'Spring 2026', href: '/work/folio-of-joy', wip: true };

// Tools and resources I've made — some for sale, some free.
const RESOURCES: { title: string; desc: string; href?: string; wip?: boolean }[] = [
  {
    title: 'Lazy Notes',
    desc: 'Simple note-taking app for momentary jotting — and occasionally downloading a .txt of it.',
    href: 'https://notesforlazy.vercel.app/',
  },
  {
    title: 'LoopCraft',
    desc: 'Turn your Figma exports into interactable motion components',
    href: 'https://loopcraft-woad.vercel.app',
  },
  {
    title: 'GarageKit',
    desc: 'Speedometer component library for car UI.',
    href: 'https://garagekit.vercel.app',
  },
  {
    title: 'Control Panel OS',
    desc: 'Beautiful slides, knobs and inputs for your vibe coded SaaS app',
    wip: true,
  },
  {
    title: 'Cyberpunk PPT Template',
    desc: 'Pitch deck designed in Cyberpunk 2077 UI style, based on its art bible.',
    href: 'https://www.figma.com/community/file/1242587221411969492/cyberpunk-2077-ppt-template',
  },
];

// Display order: Cases leads, Tools trails. The `resources` key is deliberately
// left alone behind the "Tools" label — it's the sessionStorage value and the
// ?tab= value, so renaming it would strand anyone mid-visit and break existing
// ?tab=resources links for no visible gain.
type TabKey = 'resources' | 'cases' | 'thoughts';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'cases', label: 'Cases' },
  { key: 'thoughts', label: 'Thoughts' },
  { key: 'resources', label: 'Tools' },
];

const isTabKey = (v: string | null): v is TabKey =>
  v === 'resources' || v === 'cases' || v === 'thoughts';

function Row({
  n,
  title,
  meta,
  desc,
  href,
  external,
  wip,
  wipNote = 'Under construction',
}: {
  n: string;
  title: string;
  meta?: string;
  desc?: string;
  href?: string;
  external?: boolean;
  wip?: boolean;
  wipNote?: string;
}) {
  // Unfinished *and* unlinked — the row reads as disabled: light weight, text
  // knocked back to 20%. A WIP row that still links (Folio of Joy) keeps its
  // normal weight; only the sign says it's in progress.
  const disabled = wip && !href;
  // The whole row is the hover target, but the tooltip anchors to the title so
  // it sits above the first characters rather than floating over the row's
  // midpoint. Hence: controlled open, trigger on the title span alone.
  const [open, setOpen] = useState(false);

  const titleSpan = (
    <span
      className={`inline-flex items-center gap-2 font-sans text-4xl md:text-6xl tracking-tight ${disabled ? 'font-light opacity-20' : ''} ${href ? 'transition-opacity group-hover:opacity-70' : ''}`}
    >
      {title}
      {external && href && (
        <ArrowUpRight strokeWidth={1} className="h-[0.6em] w-[0.6em] shrink-0" style={{ opacity: 0.5 }} aria-hidden />
      )}
    </span>
  );

  const body = (
    <>
      <span className="shrink-0 font-pixel text-sm" style={{ color: FG, opacity: disabled ? 0.2 : 0.5 }}>
        {n}
      </span>
      <span className="flex min-w-0 flex-col items-start">
        {wip ? <TooltipTrigger asChild>{titleSpan}</TooltipTrigger> : titleSpan}
        {desc && (
          <span
            className={`mt-3 max-w-xl font-sans text-base md:text-lg ${disabled ? 'font-light' : ''}`}
            style={{ opacity: disabled ? 0.2 : 0.5 }}
          >
            {desc}
          </span>
        )}
      </span>
      {(meta || wip) && (
        <span className="ml-auto flex shrink-0 items-baseline gap-4 self-baseline">
          {meta && (
            <span className="font-mono uppercase tracking-widest text-sm" style={{ opacity: 0.4 }}>
              {meta}
            </span>
          )}
          {/* Roadworks sign for unfinished write-ups — just the marker; the
              hover message is handled by the row. */}
          {wip && (
            <span className="inline-block leading-none">
              <ConstructionSign className="h-6 w-auto opacity-70 transition-opacity group-hover:opacity-100 md:h-8" />
            </span>
          )}
        </span>
      )}
    </>
  );
  const cls = 'flex items-baseline gap-6 py-8';
  // Hovering (or focusing) anywhere on a WIP row opens the note; on the rest
  // these are no-ops.
  const hoverProps = wip
    ? {
        onPointerEnter: () => setOpen(true),
        onPointerLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
      }
    : {};
  const row = !href ? (
    // Unfinished rows aren't linked — the whole row is inert, and hovering it
    // explains why rather than making you hunt for the sign.
    <div className={`group ${cls} cursor-default`} aria-disabled tabIndex={wip ? 0 : undefined} {...hoverProps}>
      {body}
    </div>
  ) : external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`group ${cls}`} {...hoverProps}>
      {body}
    </a>
  ) : (
    <Link href={href} className={`group ${cls}`} {...hoverProps}>
      {body}
    </Link>
  );

  if (!wip) return row;
  return (
    // Controlled, so row hover drives it while the title stays the anchor. The
    // trigger lives inside `row` (see titleSpan above).
    <Tooltip open={open}>
      {row}
      {/* Top-start: above the first characters of the title, not centred over
          the full-width row. */}
      <TooltipContent side="top" align="start" sideOffset={4}>
        {wipNote}
      </TooltipContent>
    </Tooltip>
  );
}

// File-folder tabs. The strip carries the baseline rule; a tab sits ON that
// line and punches a gap in it, which is what reads as "this folder is open".
//
// Three things make that work, and none of them are obvious:
//   · Only top/left/right get a border WIDTH. The colour is then set with a
//     single `border-*` utility that can only reach those three sides, so there
//     is no shorthand-vs-longhand fight with a bottom edge.
//   · `-mb-px` drops the tab one pixel past the strip's border-bottom, and the
//     tab's own opaque background paints over that pixel — that's the gap. No
//     background means no gap, which is exactly what the resting inactive tabs
//     want, since the baseline has to run straight under them.
//   · The colours stay in classes, never inline: an inline `border-color` would
//     outrank the hover rule and the outline would never appear.
// `border-[#EDEAE0]/15` is RULE, spelled as a class so hover can reach it.
function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      // Hovering an inactive tab raises a SHORTER folder than the active one —
      // the extra pt on the active tab is the whole height difference.
      className={`-mb-px cursor-pointer border-t border-x px-5 pb-3 font-sans text-sm transition-colors ${
        active
          ? 'pt-4 border-[#EDEAE0]/15 bg-[#0B0B0B] text-[#EDEAE0]'
          : 'pt-2 border-transparent text-[#EDEAE0]/40 hover:border-[#EDEAE0]/15 hover:bg-[#0B0B0B] hover:text-[#EDEAE0]/70'
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

// Rows stagger in whenever the visible tab changes; keying the list by tab
// remounts it so the CSS animation replays.
const rowAnim = (i: number) => ({ className: 'animate-row-in', style: { animationDelay: `${i * 45}ms` } });

export function WritingsIndex({ writings }: { writings: WritingListItem[] }) {
  const [tab, setTab] = useState<TabKey>('cases');

  // Restore the tab + scroll from a prior visit (e.g. coming back from a case
  // study), so returning lands where you left off — on the Cases tab if that's
  // where you were.
  //
  // A ?tab= link outranks the restored visit and skips the scroll restore: an
  // inbound "read cases here" has to land on Cases at the top, not on whatever
  // tab and offset the visitor happened to leave behind. Read off `location`
  // rather than useSearchParams so this stays a plain mount effect and the page
  // needs no Suspense boundary.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('tab');
    if (isTabKey(wanted)) {
      setTab(wanted);
      return;
    }
    const savedTab = sessionStorage.getItem('writings-tab');
    if (isTabKey(savedTab)) setTab(savedTab);
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
      {/* The strip owns the baseline the tabs sit on, so it spans the same
          max-w-4xl as the rows below and their divide-y lines up under it. No
          gap between tabs — they're adjacent folder cells. `items-end` keeps
          them standing on the line while their heights differ, and pl-8 is the
          short run of rule that leads in before the first tab. */}
      <div className="mb-16 flex items-end border-b border-[#EDEAE0]/15 pl-8">
        {TABS.map((t) => (
          <Tab key={t.key} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)} />
        ))}
      </div>

      {tab === 'resources' && (
        <ul key="resources" className="divide-y" style={{ borderColor: RULE }}>
          {RESOURCES.map((r, i) => (
            <li key={r.title} {...rowAnim(i)}>
              <Row n={String(i + 1).padStart(2, '0')} title={r.title} desc={r.desc} href={r.href} external wip={r.wip} />
            </li>
          ))}
        </ul>
      )}

      {tab === 'cases' && (
        <ul key="cases" className="divide-y" style={{ borderColor: RULE }}>
          {SORTED_CASES.map((c, i) => (
            <li key={c.title} {...rowAnim(i)}>
              <Row
                n={String(c.year)}
                title={c.title}
                // The sign stands in for the category on unfinished cases.
                meta={c.wip ? undefined : c.category}
                // Unfinished cases aren't linked at all — barricaded, not just marked.
                href={c.wip ? undefined : `/work/${c.slug}`}
                wip={c.wip}
                wipNote={WIP_CASE_NOTE}
              />
            </li>
          ))}
        </ul>
      )}

      {tab === 'thoughts' && (
        <ul key="thoughts" className="divide-y" style={{ borderColor: RULE }}>
          <li key="folio-of-joy" {...rowAnim(0)}>
            <Row
              n={FOLIO_THOUGHT.number}
              title={FOLIO_THOUGHT.title}
              meta={FOLIO_THOUGHT.meta}
              href={FOLIO_THOUGHT.href}
              wip={FOLIO_THOUGHT.wip}
            />
          </li>
          {writings.map((post, i) => (
            <li key={post.slug} {...rowAnim(i + 1)}>
              <Row n={post.number} title={post.title} meta={post.season || post.postedOn} href={`/writings/${post.slug}`} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
