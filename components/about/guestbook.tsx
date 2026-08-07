'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { GuestbookStamp, StampDefs } from './guestbook-stamp';
import { Notebook } from './notebook';
import { NOTEBOOK_DEFAULTS, STAMP_DEFAULTS, type NotebookDesign, type StampDesign } from '@/lib/guestbook/design';
import { MAX_PAGES, PAGE_CAPACITY, type Stamp } from '@/lib/guestbook/types';
import type { Greeting } from '@/lib/guestbook/greetings';

const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.5)';
const RULE = 'rgba(237,234,224,0.14)';

// Stamp footprint as a fraction of the paper's width, so it scales with the box.
const STAMP_W = 0.19;

interface PageData {
  page: number;
  stamps: Stamp[];
  pagesInUse: number;
  full: boolean;
  /** Server-computed: has this visitor already signed this page? */
  mine: boolean;
  preview: Greeting & { country: string };
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

  const paperRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guestbook?page=${p}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
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
  const canStamp = !!data && !mine && justPressed !== page && !isFull && !pressing;

  const press = async (x: number, y: number) => {
    if (!canStamp) return;
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
        setData((d) => (d ? { ...d, stamps: [...d.stamps, json.stamp] } : d));
        setJustPressed(page);
        setNote(`${json.stamp.line} — pressed.`);
        return;
      }
      if (json.alreadyStamped) {
        setJustPressed(page);
        setNote('You’ve already signed — turning to a fresh page.');
        return;
      }
      if (json.full) {
        setNote('That page filled up — turning over.');
        turnForward();
        return;
      }
      setNote(json.error ?? 'That didn’t press. Try again.');
    } catch {
      setNote('That didn’t press. Check your connection and try again.');
    } finally {
      setPressing(false);
    }
  };

  // With the prev/next buttons gone the book has to turn itself: flip forward
  // whenever the spread you're on is full or already carries your stamp. The page
  // swaps halfway through the animation, so the new spread is in place before the
  // leaf clears it rather than sliding in behind.
  const turn = useCallback(
    (dir: 'next' | 'prev') => {
      if (turning) return;
      if (dir === 'next' && page >= MAX_PAGES) return;
      if (dir === 'prev' && page <= 1) return;
      setTurning(dir);
      window.setTimeout(
        () => setPage((p) => (dir === 'next' ? Math.min(MAX_PAGES, p + 1) : Math.max(1, p - 1))),
        notebookDesign.turnDuration * 500,
      );
      window.setTimeout(() => setTurning(null), notebookDesign.turnDuration * 1000);
    },
    [turning, page, notebookDesign.turnDuration],
  );
  const turnForward = useCallback(() => turn('next'), [turn]);

  // Advance only when the spread is genuinely FULL — never merely because this
  // visitor already signed it. Turning away from your own stamp is the wrong
  // behaviour (you came back to see it), and it was also a loop: localStorage
  // remembers pages you signed even after those stamps are gone from the store, so
  // "already signed" walked the book end to end, flipping the whole way.
  //
  // The ref makes it at most one hop per mount, so a bad page count can't drive it
  // either.
  const autoTurned = useRef(false);
  useEffect(() => {
    if (loading || !data || turning || autoTurned.current) return;
    if (data.stamps.length >= PAGE_CAPACITY) {
      autoTurned.current = true;
      turnForward();
    }
  }, [loading, data, turning, turnForward]);

  return (
    <section className="mt-14 md:mt-20">
      <StampDefs design={stampDesign} />

      <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] pb-4">Guestbook</h2>

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
        {/* Existing stamps. Keyed by id so a page turn doesn't reuse DOM nodes
            and inherit the previous page's press animation. */}
        <AnimatePresence mode="popLayout">
          {(data?.stamps ?? []).map((s) => (
            <motion.div
              key={s.id}
              initial={reduce ? false : { scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 700, damping: 26 }}
              className="pointer-events-none absolute"
              style={{
                left: `${s.x * 100}%`,
                top: `${s.y * 100}%`,
                width: `${stampDesign.sizePct}%`,
                aspectRatio: '1',
                transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
              }}
            >
              <GuestbookStamp stamp={s} design={stampDesign} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Ghost preview under the cursor */}
        {hover && data && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${hover.x * 100}%`,
              top: `${hover.y * 100}%`,
              width: `${stampDesign.sizePct}%`,
              aspectRatio: '1',
              transform: 'translate(-50%, -50%) rotate(-7deg)',
            }}
          >
            <GuestbookStamp
              preview
              design={stampDesign}
              stamp={{
                id: 'preview',
                page,
                x: hover.x,
                y: hover.y,
                rot: -7,
                color: 'green',
                style: 'postal',
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

      {note && (
        <p aria-live="polite" className="mt-3 font-sans text-sm" style={{ color: FG }}>
          {note}
        </p>
      )}
    </section>
  );
}
