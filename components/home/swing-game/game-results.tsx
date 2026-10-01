'use client';

import { useEffect, useRef } from 'react';
import { CircleButton } from '@/components/circle-button';
import type { BoardEntry } from '@/lib/swing-game/board';
import { flagEmoji } from '@/lib/swing-game/flag';
import type { RunResult } from './use-swing-game';

const NOTE: Record<RunResult['status'], string> = {
  saving: 'saving…',
  saved: '',
  unsaved: 'couldn’t save',
  unavailable: 'leaderboard unavailable',
};

function Row({ e }: { e: BoardEntry }) {
  return (
    <li className={`grid h-10 grid-cols-[2.4em_1.8em_1fr_auto] items-center gap-1 border-b border-white/[.07] px-1 text-[15px] ${e.you ? 'bg-[#1c1a08] text-[#e8d84a]' : ''}`}>
      <span className="font-mono text-[11px] text-white/35">{e.rank}</span>
      <span className="text-xs">{flagEmoji(e.country)}</span>
      <span className="truncate">{e.name}</span>
      {/* Praktikal sits high on its line box; nudge it onto the names' baseline. */}
      <span className="translate-y-[3px] font-mono text-base leading-none tabular-nums">{e.score}</span>
    </li>
  );
}

export function GameResults({ result, onRetry, onBack }: { result: RunResult; onRetry: () => void; onBack: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => { rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus(); }, []);

  const { score, board, status } = result;
  const me = board?.me ?? null;
  const player = board?.player;
  const note = NOTE[status];

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Your score"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-y-auto bg-black px-5 py-8 text-white animate-in fade-in duration-300"
    >
      <p className="sr-only" aria-live="polite">You scored {score} taps.</p>
      <div className="w-[min(100%,400px)]">
        <div className="text-center">
          <div className="font-mono text-[72px] leading-none tabular-nums text-[#f4c51b]">{score}</div>
          <div className="mt-3.5 text-[15px]">your score</div>
          {player && (
            <div className="mt-2.5 text-base">
              {flagEmoji(player.country)} {player.name}
              {me && ` · #${me.rank} of ${board!.total}`}
            </div>
          )}
          {note && <div className="mt-2 font-mono text-[11px] text-white/40">{note}</div>}
        </div>

        {board && (
          <ol className="mt-10">
            {board.top.map((e) => <Row key={e.rank} e={e} />)}
            {me && me.rank > board.top.length && (
              <>
                <li aria-hidden="true" className="h-[22px] text-center text-xs leading-4 text-white/25">⋯</li>
                <Row e={me} />
              </>
            )}
          </ol>
        )}

        <div className="mt-[52px] flex justify-between">
          <CircleButton label="RETRY" arcText="PLAY AGAIN" tone="yellow" size={72} onClick={onRetry} />
          <CircleButton label="BACK" arcText="BACK TO HOME" size={72} onClick={onBack} />
        </div>
      </div>
    </div>
  );
}
