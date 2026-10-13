'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, RotateCcw } from 'lucide-react';
import { BRAND, BRAND_ORDER, type BrandColor } from '@/lib/brand';
import { STAMP_CATALOG, countryName, type CountryStamp } from '@/lib/stamps/catalog';
import type { ReviewEntry, ReviewFile, ReviewStatus } from '@/lib/stamps/review';
import { SCRIPT_FONTS } from '@/components/about/stamp-fonts';
import { CountryStampArt } from '@/components/stamps/country-stamp';
import './stamp-review.css';

type Filter = 'all' | ReviewStatus;
type Paper = 'notebook' | 'paper';

const AT = '2026-10-13T00:00:00.000Z';
const STATUS_LABEL: Record<ReviewStatus, string> = { open: 'Open', changes: 'Needs changes', approved: 'Approved' };

function statusOf(review: ReviewFile, code: string): ReviewStatus {
  return review[code]?.status ?? 'open';
}

// Same hash the notebook would use, so the grid previews a stamp at a slight,
// believable angle rather than perfectly square.
function tilt(code: string, seed: number): number {
  let h = 0;
  const s = `${code}${seed}`;
  for (let i = 0; i < s.length; i++) h = (h * 41 + s.charCodeAt(i)) >>> 0;
  return Math.round(((h / 0xffffffff) * 2 - 1) * 7);
}

// Client-only: country names come from Intl, whose data differs between Node
// and the browser ("Turkey" vs "Türkiye"), and the stamps are client-only anyway.
export function StampReview() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <Review /> : null;
}

function Review() {
  const [review, setReview] = useState<ReviewFile>({});
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [paper, setPaper] = useState<Paper>('notebook');
  const [inked, setInked] = useState(true);
  const [selected, setSelected] = useState(STAMP_CATALOG[0].code);
  const [color, setColor] = useState<Record<string, BrandColor>>({});
  const [seed, setSeed] = useState<Record<string, number>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetch('/api/admin/stamp-review')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: ReviewFile) => setReview(data))
      .catch(() => setSaveState('error'))
      .finally(() => setLoaded(true));
  }, []);

  const save = useCallback(async (code: string, entry: ReviewEntry) => {
    setSaveState('saving');
    try {
      const res = await fetch('/api/admin/stamp-review', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, entry }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, []);

  // Comment typing is debounced per country; status changes save immediately.
  const timers = useRef<Record<string, number>>({});
  const reviewRef = useRef(review);
  reviewRef.current = review;
  const update = useCallback(
    (code: string, patch: Partial<Pick<ReviewEntry, 'status' | 'comment'>>, immediate = false) => {
      const prev = reviewRef.current[code];
      const entry: ReviewEntry = {
        status: prev?.status ?? 'open',
        comment: prev?.comment ?? '',
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      reviewRef.current = { ...reviewRef.current, [code]: entry };
      setReview(reviewRef.current);
      window.clearTimeout(timers.current[code]);
      if (immediate) void save(code, entry);
      else timers.current[code] = window.setTimeout(() => void save(code, entry), 600);
    },
    [save],
  );

  const counts = useMemo(() => {
    const c = { open: 0, changes: 0, approved: 0 };
    for (const s of STAMP_CATALOG) c[statusOf(review, s.code)]++;
    return c;
  }, [review]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STAMP_CATALOG.filter((s) => {
      if (filter !== 'all' && statusOf(review, s.code) !== filter) return false;
      if (!q) return true;
      return [s.code, countryName(s.code), s.place, s.hello, s.motif, s.layout, s.shape]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [filter, query, review]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const list = visible.length ? visible : STAMP_CATALOG;
      const i = list.findIndex((s) => s.code === selected);
      const next = list[(i + dir + list.length) % list.length];
      setSelected(next.code);
      document.getElementById(`card-${next.code}`)?.scrollIntoView({ block: 'nearest' });
    },
    [visible, selected],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea')) return;
      if (e.key === 'ArrowRight' || e.key === 'j') step(1);
      else if (e.key === 'ArrowLeft' || e.key === 'k') step(-1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const spec = STAMP_CATALOG.find((s) => s.code === selected) ?? STAMP_CATALOG[0];

  return (
    <div className="jds">
      <header className="sr-head">
        <h1 className="sr-title">Country stamps</h1>
        <span className="sr-meta">
          {counts.approved} approved · {counts.changes} need changes · {counts.open} open
        </span>
        <span className="sr-spacer" />
        <div className="sr-seg" role="group" aria-label="Filter by status">
          {(['all', 'open', 'changes', 'approved'] as Filter[]).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? `All ${STAMP_CATALOG.length}` : `${STATUS_LABEL[f]} ${counts[f]}`}
            </button>
          ))}
        </div>
        <input
          className="sr-input"
          type="search"
          placeholder="Search country, motif, layout"
          aria-label="Search stamps"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="sr-seg" role="group" aria-label="Paper">
          {(['notebook', 'paper'] as Paper[]).map((p) => (
            <button key={p} type="button" aria-pressed={paper === p} onClick={() => setPaper(p)}>
              {p === 'notebook' ? 'Notebook' : 'Paper'}
            </button>
          ))}
        </div>
        <div className="sr-seg" role="group" aria-label="Ink">
          <button type="button" aria-pressed={inked} onClick={() => setInked(true)}>
            Inked
          </button>
          <button type="button" aria-pressed={!inked} onClick={() => setInked(false)}>
            Clean
          </button>
        </div>
      </header>

      <div className="sr-body">
        <main>
          {visible.length === 0 ? (
            <p className="sr-empty">{loaded ? 'No stamps match.' : 'Loading…'}</p>
          ) : (
            <div className="sr-grid">
              {visible.map((s) => (
                <button
                  key={s.code}
                  id={`card-${s.code}`}
                  type="button"
                  className="sr-card"
                  aria-current={s.code === selected}
                  onClick={() => setSelected(s.code)}
                >
                  <StampOnPaper
                    spec={s}
                    paper={paper}
                    inked={inked}
                    color={color[s.code]}
                    seed={seed[s.code] ?? 0}
                  />
                  <span className="sr-cap">
                    <span className="sr-cap-rank">{String(s.rank).padStart(2, '0')}</span>
                    <span className="sr-cap-name">{countryName(s.code)}</span>
                    {review[s.code]?.comment ? <MessageSquare aria-label="Has comment" /> : null}
                    <span
                      className="sr-dot"
                      data-status={statusOf(review, s.code)}
                      aria-label={STATUS_LABEL[statusOf(review, s.code)]}
                    />
                  </span>
                </button>
              ))}
            </div>
          )}
        </main>

        <Inspector
          key={`${spec.code}-${loaded}`}
          spec={spec}
          paper={paper}
          inked={inked}
          color={color[spec.code]}
          seed={seed[spec.code] ?? 0}
          entry={review[spec.code]}
          saveState={saveState}
          onColor={(c) => setColor((prev) => ({ ...prev, [spec.code]: c }))}
          onRepress={() => setSeed((prev) => ({ ...prev, [spec.code]: (prev[spec.code] ?? 0) + 1 }))}
          onStatus={(status) => update(spec.code, { status }, true)}
          onComment={(comment) => update(spec.code, { comment })}
          onStep={step}
        />
      </div>
    </div>
  );
}

function StampOnPaper({
  spec,
  paper,
  inked,
  color,
  seed,
}: {
  spec: CountryStamp;
  paper: Paper;
  inked: boolean;
  color?: BrandColor;
  seed: number;
}) {
  // Only draw what's on screen: 100 live ink filters at once is several seconds
  // of turbulence on the CPU.
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="sr-paper" data-paper={paper}>
      {seen && <CountryStampArt
        spec={spec}
        color={color}
        at={AT}
        seed={seed}
        inked={inked}
        className="sr-stamp"
        style={{ transform: inked ? `rotate(${tilt(spec.code, seed)}deg)` : undefined }}
      />}
    </div>
  );
}

function Inspector({
  spec,
  paper,
  inked,
  color,
  seed,
  entry,
  saveState,
  onColor,
  onRepress,
  onStatus,
  onComment,
  onStep,
}: {
  spec: CountryStamp;
  paper: Paper;
  inked: boolean;
  color?: BrandColor;
  seed: number;
  entry?: ReviewEntry;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  onColor: (c: BrandColor) => void;
  onRepress: () => void;
  onStatus: (s: ReviewStatus) => void;
  onComment: (c: string) => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const status = entry?.status ?? 'open';
  const active = color ?? spec.ink;
  const script = spec.font === 'pixel' ? 'Latin (stamp face)' : spec.font;
  const scriptFamily = SCRIPT_FONTS[spec.font]?.family.split(',')[0].replace(/'/g, '');

  return (
    <aside className="sr-inspector" aria-label={`${countryName(spec.code)} stamp`}>
      <div className="sr-row">
        <h2 className="sr-h2">{countryName(spec.code)}</h2>
        <span className="sr-meta">#{spec.rank}</span>
        <span className="sr-spacer" />
        <button type="button" className="sr-btn sr-btn--ghost" aria-label="Previous stamp" onClick={() => onStep(-1)}>
          <ChevronLeft />
        </button>
        <button type="button" className="sr-btn sr-btn--ghost" aria-label="Next stamp" onClick={() => onStep(1)}>
          <ChevronRight />
        </button>
      </div>

      <StampOnPaper spec={spec} paper={paper} inked={inked} color={color} seed={seed} />

      <div className="sr-row">
        {BRAND_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            className="sr-swatch"
            aria-label={`${c} ink${c === spec.ink ? ' (default)' : ''}`}
            aria-pressed={active === c}
            style={{ background: BRAND[c] }}
            onClick={() => onColor(c)}
          />
        ))}
        <span className="sr-spacer" />
        <button type="button" className="sr-btn" onClick={onRepress} disabled={!inked}>
          <RotateCcw />
          Press again
        </button>
      </div>

      <dl className="sr-specs">
        <dt>Greeting</dt>
        <dd>
          {spec.hello} · {spec.line}
        </dd>
        <dt>Script</dt>
        <dd>
          {script}
          {spec.font !== 'pixel' && scriptFamily ? ` · ${scriptFamily}` : ''}
        </dd>
        <dt>Place</dt>
        <dd>
          {spec.place} · {spec.port}
        </dd>
        <dt>Design</dt>
        <dd>
          {spec.shape} · {spec.border} border · {spec.layout} layout
        </dd>
        <dt>Motif</dt>
        <dd>{spec.motif}</dd>
        <dt>Typeface</dt>
        <dd>{spec.face}</dd>
        <dt>Default ink</dt>
        <dd>{spec.ink}</dd>
      </dl>

      <div className="sr-field">
        <span className="sr-label" id="sr-status-label">
          Status
        </span>
        <div className="sr-seg" role="group" aria-labelledby="sr-status-label">
          {(['open', 'changes', 'approved'] as ReviewStatus[]).map((s) => (
            <button key={s} type="button" aria-pressed={status === s} onClick={() => onStatus(s)}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="sr-field">
        <label className="sr-label" htmlFor="sr-comment">
          Comment
        </label>
        <textarea
          id="sr-comment"
          className="sr-textarea"
          placeholder="What should change?"
          defaultValue={entry?.comment ?? ''}
          onChange={(e) => onComment(e.target.value)}
        />
        <span className="sr-hint" data-tone={saveState === 'error' ? 'error' : undefined} aria-live="polite">
          {saveState === 'saving'
            ? 'Saving…'
            : saveState === 'error'
              ? 'Couldn’t save — is the dev server running?'
              : saveState === 'saved'
                ? 'Saved to content/stamp-review.json'
                : ''}
        </span>
      </div>

      <span className="sr-hint">
        <kbd className="sr-kbd">←</kbd> <kbd className="sr-kbd">→</kbd> to move between stamps
      </span>
    </aside>
  );
}
