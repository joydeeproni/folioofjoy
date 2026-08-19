'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { GuestbookStamp, StampDefs } from './guestbook-stamp';
import { Notebook } from './notebook';
import { NOTEBOOK_DEFAULTS, STAMP_DEFAULTS, type NotebookDesign, type StampDesign } from '@/lib/guestbook/design';
import { safeStampPosition } from '@/lib/guestbook/layout';
import { MAX_PAGES, PAGE_CAPACITY, type Stamp } from '@/lib/guestbook/types';
import type { Greeting } from '@/lib/guestbook/greetings';

const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.5)';
interface PageData {
  page: number;
  stamps: Stamp[];
  pagesInUse: number;
  full: boolean;
  totalStamps: number;
  firstOpenPage: number | null;
  /** Server-computed: has this visitor already signed this page? */
  mine: boolean;
  preview: Greeting & Pick<Stamp, 'country' | 'color' | 'style' | 'rot'>;
}

export function Guestbook({
  stampDesign = STAMP_DEFAULTS,
  notebookDesign = NOTEBOOK_DEFAULTS,
}: {
  stampDesign?: StampDesign;
  notebookDesign?: NotebookDesign;
} = {}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pressing, setPressing] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null);
  const [totalStamps, setTotalStamps] = useState<number | null>(null);
  const [pendingStamp, setPendingStamp] = useState<Stamp | null>(null);

  const paperRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setData(null);
    setPendingStamp(null);
    try {
      const res = await fetch(`/api/guestbook?page=${p}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as PageData;
      setData(json);
      setTotalStamps(json.totalStamps);
      setNote(null);
    } catch {
      setNote('Could not load the guestbook. Try again in a moment.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  // Straight from the server, so it can't disagree with what's actually stored.
  const mine = data?.mine ?? false;
  // Set optimistically right after a successful press, so the UI updates before
  // the next fetch confirms it.
  const [justPressed, setJustPressed] = useState<number | null>(null);
  const isFull = (data?.stamps.length ?? 0) >= PAGE_CAPACITY;
  const canStamp = !!data && !loading && !turning && !mine && justPressed !== page && !isFull && !pressing;

  const press = async (x: number, y: number) => {
    if (!canStamp || !data) return;
    const position = safeStampPosition(
      x,
      y,
      data.preview.rot,
      stampDesign,
      notebookDesign,
    );
    setPendingStamp({
      id: 'pending-stamp',
      page,
      ...position,
      rot: data.preview.rot,
      color: data.preview.color,
      style: data.preview.style,
      country: data.preview.country,
      hello: data.preview.hello,
      place: data.preview.place,
      line: data.preview.line,
      font: data.preview.font,
      at: new Date().toISOString(),
    });
    setPressing(true);
    setHover(null);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ page, x, y }),
      });
      const json = await res.json();

      if (res.status === 201) {
        setData((d) =>
          d
            ? {
                ...d,
                stamps: [...d.stamps, json.stamp],
                full: json.full,
                totalStamps: d.totalStamps + 1,
              }
            : d,
        );
        setTotalStamps((count) => (count ?? 0) + 1);
        setJustPressed(page);
        if (json.full && typeof json.nextPage === 'number') {
          setNote(`${json.stamp.line} — pressed. Turning to a fresh page.`);
          turnTo(json.nextPage, 'next');
        } else {
          setNote(`${json.stamp.line} — pressed.`);
        }
        return;
      }
      if (json.alreadyStamped) {
        setJustPressed(page);
        setNote('You’ve already signed — turning to a fresh page.');
        return;
      }
      if (json.full) {
        setNote('That page filled up — turning over.');
        if (typeof json.nextPage === 'number') turnTo(json.nextPage, 'next');
        return;
      }
      setNote(json.error ?? 'That didn’t press. Try again.');
    } catch {
      setNote('That didn’t press. Check your connection and try again.');
    } finally {
      setPressing(false);
      setPendingStamp(null);
    }
  };

  // The page swaps halfway through the animation, so the destination spread is
  // in place before the turning leaf clears it rather than sliding in behind.
  const turnTo = useCallback(
    (target: number, dir: 'next' | 'prev') => {
      if (turning) return;
      if (target === page || target < 1 || target > MAX_PAGES) return;
      setTurning(dir);
      window.setTimeout(
        () => setPage(target),
        notebookDesign.turnDuration * 500,
      );
      window.setTimeout(() => setTurning(null), notebookDesign.turnDuration * 1000);
    },
    [turning, page, notebookDesign.turnDuration],
  );

  const maxBrowsablePage = Math.min(
    MAX_PAGES,
    Math.max(data?.pagesInUse ?? 1, data?.firstOpenPage ?? 1, page),
  );
  const turn = useCallback(
    (dir: 'next' | 'prev') => {
      if (dir === 'next' && page < maxBrowsablePage) turnTo(page + 1, dir);
      if (dir === 'prev' && page > 1) turnTo(page - 1, dir);
    },
    [maxBrowsablePage, page, turnTo],
  );

  // Find a usable landing page on first arrival. Ownership now comes directly
  // from the stored stamps, so unlike the old localStorage check it cannot go
  // stale and falsely walk the book. Once a stampable page is found, browsing
  // back to an earlier signed page is left alone.
  const seekingLandingPage = useRef(true);
  const landingPagesSeen = useRef(new Set<number>());
  useEffect(() => {
    if (loading || !data || turning || !seekingLandingPage.current) return;

    if (!data.full && !data.mine) {
      seekingLandingPage.current = false;
      return;
    }

    landingPagesSeen.current.add(page);
    const target = data.full ? data.firstOpenPage : Math.min(MAX_PAGES, page + 1);
    if (!target || target === page || landingPagesSeen.current.has(target)) {
      seekingLandingPage.current = false;
      return;
    }

    turnTo(target, target > page ? 'next' : 'prev');
  }, [loading, data, turning, page, turnTo]);

  const previewRotation = data?.preview.rot ?? 0;
  const previewPosition = hover
    ? safeStampPosition(hover.x, hover.y, previewRotation, stampDesign, notebookDesign)
    : null;

  return (
    <section className="mt-14 md:mt-20">
      <StampDefs design={stampDesign} />

      <div className="flex items-baseline justify-between gap-4 pb-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em]">Guestbook</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
          {totalStamps === null
            ? 'Counting stamps…'
            : `${totalStamps} ${totalStamps === 1 ? 'stamp' : 'stamps'}`}
        </p>
      </div>

      {/* Only shown while there's something to invite — once you've signed, the
          spread speaks for itself. */}
      {!mine && (
        <p className="max-w-2xl pb-5 font-sans text-base md:text-lg" style={{ color: MUTED }}>
          {data
            ? `Press anywhere to leave your mark. Yours will read “${data.preview.line}”.`
            : 'Press anywhere to leave your mark.'}
        </p>
      )}

      {/* The notebook */}
      <Notebook
        ref={paperRef}
        design={notebookDesign}
        turning={turning}
        cursor={canStamp ? 'crosshair' : 'default'}
        onHover={(p) => canStamp && setHover(p)}
        onPress={(x, y) => void press(x, y)}
        onTurn={(dir) => turn(dir)}
        canTurnPrev={page > 1}
        canTurnNext={page < maxBrowsablePage}
        overlay={
          loading ? (
            <p
              className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: MUTED }}
            >
              Opening…
            </p>
          ) : null
        }
      >
        {/* Stored ink is static. Only the mark being actively pressed animates;
            replaying a spring on every old stamp when a page opens made the whole
            spread feel weightless. */}
        {(data?.stamps ?? []).map((s) => {
          const position = safeStampPosition(
            s.x,
            s.y,
            s.rot,
            stampDesign,
            notebookDesign,
          );
          return (
            <div
              key={s.id}
              className="pointer-events-none absolute"
              style={{
                left: `${position.x * 100}%`,
                top: `${position.y * 100}%`,
                width: `${stampDesign.sizePct}%`,
                aspectRatio: '1',
                transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
              }}
            >
              <GuestbookStamp stamp={s} design={stampDesign} />
            </div>
          );
        })}

        {/* Immediate contact mark. It uses the same server-owned visual identity
            as the eventual stored stamp and is replaced in-place on success. */}
        {pendingStamp && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${pendingStamp.x * 100}%`,
              top: `${pendingStamp.y * 100}%`,
              width: `${stampDesign.sizePct}%`,
              aspectRatio: '1',
              transform: `translate(-50%, -50%) rotate(${pendingStamp.rot}deg)`,
            }}
          >
            <motion.div
              className="h-full w-full"
              initial={reduce ? false : { opacity: 0, scale: 1.1, filter: 'blur(1.4px)' }}
              animate={
                reduce
                  ? { opacity: 1 }
                  : {
                      opacity: [0, 1, 1],
                      scale: [1.1, 0.985, 1],
                      filter: ['blur(1.4px)', 'blur(0px)', 'blur(0px)'],
                    }
              }
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.34, times: [0, 0.42, 1], ease: [0.2, 0.8, 0.2, 1] }
              }
            >
              <GuestbookStamp stamp={pendingStamp} design={stampDesign} />
            </motion.div>
          </div>
        )}

        {/* Ghost preview under the cursor */}
        {previewPosition && data && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${previewPosition.x * 100}%`,
              top: `${previewPosition.y * 100}%`,
              width: `${stampDesign.sizePct}%`,
              aspectRatio: '1',
              transform: `translate(-50%, -50%) rotate(${previewRotation}deg)`,
            }}
          >
            <GuestbookStamp
              preview
              design={stampDesign}
              stamp={{
                id: 'preview',
                page,
                x: previewPosition.x,
                y: previewPosition.y,
                rot: previewRotation,
                color: data.preview.color,
                style: data.preview.style,
                country: data.preview.country,
                hello: data.preview.hello,
                place: data.preview.place,
                line: data.preview.line,
                font: data.preview.font,
                at: new Date().toISOString(),
              }}
            />
          </div>
        )}

      </Notebook>

      <div
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-4 font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ color: MUTED }}
      >
        <span>
          Page {page} of {maxBrowsablePage}
        </span>
        <span>Tap or click the page edges to browse.</span>
      </div>

      {note && (
        <p aria-live="polite" className="mt-3 font-sans text-sm" style={{ color: FG }}>
          {note}
        </p>
      )}
    </section>
  );
}
