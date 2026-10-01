'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { SwingSetHandle } from '../swing-set';
import type { BoardView } from '@/lib/swing-game/board';
import { fetchBoard, fetchTicket, submitScore } from '@/lib/swing-game/client';
import { decay, tapImpulse } from '@/lib/swing-game/energy';
import { RUN_MS, WARMUP_GAP_MS, WARMUP_TAPS, acceptsRunTap, arcCapFor, ticketSubmitDelay, warmupTap } from '@/lib/swing-game/rules';

export type GameMode = 'idle' | 'playing' | 'results';
export type RunStatus = 'saving' | 'saved' | 'unsaved' | 'unavailable';
export interface RunResult { score: number; board: BoardView | null; status: RunStatus }
export interface RunState { count: number; startedAt: number; energy: number; energyAt: number }
export interface SwingGame {
  mode: GameMode;
  warm: number;
  result: RunResult | null;
  run: RefObject<RunState>;
  onTap: () => void;
  retry: () => void;
  exit: () => void;
}

// idle → (5 quick taps) → playing → (10s) → results → retry | exit.
// Taps arrive far faster than React renders, so the live run lives in refs and
// only mode changes go through state.
export function useSwingGame(swing: RefObject<SwingSetHandle | null>): SwingGame {
  const [mode, setMode] = useState<GameMode>('idle');
  const modeRef = useRef<GameMode>('idle');
  const [warm, setWarm] = useState(0);
  const warmTimes = useRef<number[]>([]);
  const warmReset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const run = useRef<RunState>({ count: 0, startedAt: 0, energy: 0, energyAt: 0 });
  const ticketReq = useRef<Promise<{ ticket: string; arrivedAt: number } | null>>(Promise.resolve(null));
  const boardReq = useRef<Promise<BoardView | null>>(Promise.resolve(null));
  // Bumped on every start/exit so a slow submit from an abandoned run can't
  // overwrite the screen of a newer one.
  const runId = useRef(0);

  const go = useCallback((next: GameMode) => { modeRef.current = next; setMode(next); }, []);

  const clearWarm = useCallback(() => {
    if (warmReset.current) clearTimeout(warmReset.current);
    warmTimes.current = [];
    setWarm(0);
  }, []);

  const start = useCallback(() => {
    const now = performance.now();
    runId.current++;
    run.current = { count: 0, startedAt: now, energy: 0, energyAt: now };
    ticketReq.current = fetchTicket().then((ticket) => ({ ticket, arrivedAt: performance.now() }), () => null);
    boardReq.current = fetchBoard().catch(() => null);
    clearWarm();
    setResult(null);
    go('playing');
  }, [clearWarm, go]);

  const exit = useCallback(() => {
    runId.current++;
    swing.current?.setArcCap(null);
    clearWarm();
    setResult(null);
    go('idle');
  }, [clearWarm, go, swing]);

  const finish = useCallback(async () => {
    const id = runId.current;
    const score = run.current.count;
    swing.current?.setArcCap(null);
    setResult({ score, board: null, status: 'saving' });
    go('results');

    let board: BoardView | null = null;
    let status: RunStatus = 'unsaved';
    const ticket = await ticketReq.current;
    if (ticket) {
      const wait = ticketSubmitDelay(ticket.arrivedAt, performance.now());
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      if (id !== runId.current) return;
      try {
        board = await submitScore(ticket.ticket, score);
        status = 'saved';
      } catch {
        // 403 (e.g. the network changed mid-run) or 500 — fall back to the prefetched board.
      }
    }
    board ??= await boardReq.current;
    if (!board) status = 'unavailable';
    if (id === runId.current) setResult({ score, board, status });
  }, [go, swing]);

  const onTap = useCallback(() => {
    const now = performance.now();
    const current = modeRef.current;
    if (current === 'results') return;
    if (current === 'idle') {
      swing.current?.kick();
      warmTimes.current = warmupTap(warmTimes.current, now);
      if (warmTimes.current.length >= WARMUP_TAPS) return start();
      setWarm(warmTimes.current.length);
      if (warmReset.current) clearTimeout(warmReset.current);
      warmReset.current = setTimeout(clearWarm, WARMUP_GAP_MS);
      return;
    }
    const r = run.current;
    if (!acceptsRunTap(r.startedAt, now)) return;
    r.energy = tapImpulse(decay(r.energy, (now - r.energyAt) / 1000));
    r.energyAt = now;
    r.count++;
    swing.current?.setArcCap(arcCapFor(r.count));
    swing.current?.kick(1 + Math.min(r.count, 150) / 250);
  }, [clearWarm, start, swing]);

  // End the run on the first frame past RUN_MS.
  useEffect(() => {
    if (mode !== 'playing') return;
    let frame = requestAnimationFrame(function tick(t) {
      if (t - run.current.startedAt >= RUN_MS) void finish();
      else frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [mode, finish]);

  // Esc quits (or closes the results); a hidden tab abandons the run, because an
  // early submit would fail the ticket's minimum age anyway.
  useEffect(() => {
    if (mode === 'idle') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') exit(); };
    const onHide = () => { if (document.hidden && modeRef.current === 'playing') exit(); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [mode, exit]);

  useEffect(() => () => { if (warmReset.current) clearTimeout(warmReset.current); }, []);

  return { mode, warm, result, run, onTap, retry: start, exit };
}
