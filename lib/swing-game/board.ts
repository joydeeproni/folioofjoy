import { animalName } from './names';
import { BOARD_SIZE, MAX_SCORE } from './rules';

// Storage layout: swing/<env>/<visitorHash>/<score>-<CC>.json — one blob per
// visitor holding their best. Everything the board needs is in the pathname,
// so building it is one list() with no blob fetches.
//
// <env> keeps local and preview play off the real board: .env.local points at
// the same Blob store as production.
export type BlobEnv = 'production' | 'preview' | 'dev';

export function blobEnv(vercelEnv = process.env.VERCEL_ENV): BlobEnv {
  return vercelEnv === 'production' || vercelEnv === 'preview' ? vercelEnv : 'dev';
}

export const boardPrefix = (env: BlobEnv) => `swing/${env}/`;
export const visitorPrefix = (env: BlobEnv, visitor: string) => `${boardPrefix(env)}${visitor}/`;

export function scorePath(env: BlobEnv, visitor: string, score: number, country: string): string {
  const cc = /^[A-Z]{2}$/.test(country) ? country : 'XX';
  return `${visitorPrefix(env, visitor)}${score}-${cc}.json`;
}

export interface ScoreBlob {
  visitor: string;
  score: number;
  country: string;
  uploadedAt: Date;
  pathname: string;
}

const PATH = /^swing\/(?:production|preview|dev)\/([0-9a-f]{16})\/(\d{1,3})-([A-Z]{2})\.json$/;

export function parseScorePath(pathname: string, uploadedAt: Date): ScoreBlob | null {
  const m = PATH.exec(pathname);
  if (!m) return null;
  const score = Number(m[2]);
  if (score > MAX_SCORE) return null;
  return { visitor: m[1], score, country: m[3] === 'XX' ? '' : m[3], uploadedAt, pathname };
}

// One row per visitor — their best. A write race can leave two blobs for one
// visitor for a moment; keeping the max here makes that harmless.
export function rankBests(blobs: readonly ScoreBlob[]): ScoreBlob[] {
  const best = new Map<string, ScoreBlob>();
  for (const b of blobs) {
    const cur = best.get(b.visitor);
    if (!cur || b.score > cur.score || (b.score === cur.score && b.uploadedAt < cur.uploadedAt)) best.set(b.visitor, b);
  }
  return [...best.values()].sort((a, b) => b.score - a.score || a.uploadedAt.getTime() - b.uploadedAt.getTime());
}

export function shouldReplace(mine: readonly ScoreBlob[], score: number): boolean {
  return score > 0 && mine.every((b) => b.score < score);
}

export interface BoardEntry {
  rank: number;
  name: string;
  country: string;
  score: number;
  you: boolean;
}

export interface BoardView {
  top: BoardEntry[];
  me: BoardEntry | null;
  total: number;
  /** Who's looking — so the results can name them even before they rank. */
  player: { name: string; country: string };
}

export function boardView(ranked: readonly ScoreBlob[], visitor: string, country: string): BoardView {
  const entry = (b: ScoreBlob, i: number): BoardEntry => ({
    rank: i + 1,
    name: animalName(b.visitor),
    country: b.country,
    score: b.score,
    you: b.visitor === visitor,
  });
  const mine = ranked.findIndex((b) => b.visitor === visitor);
  return {
    top: ranked.slice(0, BOARD_SIZE).map(entry),
    me: mine === -1 ? null : entry(ranked[mine], mine),
    total: ranked.length,
    player: { name: animalName(visitor), country },
  };
}
