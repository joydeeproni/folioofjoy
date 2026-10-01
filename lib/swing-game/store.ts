import { del, list, put } from '@vercel/blob';
import { blobEnv, boardPrefix, parseScorePath, rankBests, scorePath, shouldReplace, visitorPrefix, type ScoreBlob } from './board';

// Fluid Compute reuses instances, so a short in-memory cache means most board
// reads skip list(). A successful write on this instance clears it.
const CACHE_MS = 10_000;
let cache: { at: number; ranked: ScoreBlob[] } | null = null;

async function listScores(prefix: string): Promise<ScoreBlob[]> {
  const out: ScoreBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const b of page.blobs) {
      const s = parseScorePath(b.pathname, new Date(b.uploadedAt));
      if (s) out.push(s);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

export async function readRanked(now = Date.now()): Promise<ScoreBlob[]> {
  if (cache && now - cache.at < CACHE_MS) return cache.ranked;
  const ranked = rankBests(await listScores(boardPrefix(blobEnv())));
  cache = { at: now, ranked };
  return ranked;
}

export async function writeBest(visitor: string, score: number, country: string): Promise<{ best: number; improved: boolean }> {
  const env = blobEnv();
  const mine = await listScores(visitorPrefix(env, visitor));
  if (!shouldReplace(mine, score)) {
    return { best: Math.max(0, ...mine.map((b) => b.score)), improved: false };
  }
  await put(scorePath(env, visitor, score, country), JSON.stringify({ at: new Date().toISOString() }), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  // New best first, old ones second: if the delete fails, rankBests still keeps the max.
  if (mine.length) await del(mine.map((b) => b.pathname));
  cache = null;
  return { best: score, improved: true };
}
