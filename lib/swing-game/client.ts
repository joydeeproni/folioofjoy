import type { BoardView } from './board';

export type SubmitResult = BoardView & { improved: boolean };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`swing api ${res.status}`);
  return (await res.json()) as T;
}

export const fetchTicket = async () =>
  (await json<{ ticket: string }>(await fetch('/api/swing/start', { method: 'POST' }))).ticket;

export const fetchBoard = async () => json<BoardView>(await fetch('/api/swing', { cache: 'no-store' }));

export const submitScore = async (ticket: string, score: number) =>
  json<SubmitResult>(
    await fetch('/api/swing', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ticket, score }),
    }),
  );
