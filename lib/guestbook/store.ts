import { list, put } from '@vercel/blob';
import type { Stamp } from './types';

// Storage layout: ONE BLOB PER STAMP, at guestbook/p{page}/{id}.json.
//
// The obvious alternative — a single aggregate JSON per page — is a
// read-modify-write, so two people stamping at the same moment would race and
// one press would be silently lost. Blob has no compare-and-swap to protect
// that. Giving every stamp its own key makes each press an independent create,
// so concurrent writers can't collide at all.
//
// The cost is that a read is one list() plus a fetch per stamp. That's bounded
// by PAGE_CAPACITY and the fetches run in parallel, which is a fair trade for
// never dropping someone's stamp.
const PREFIX = 'guestbook';

const pagePrefix = (page: number) => `${PREFIX}/p${page}/`;

export async function readPage(page: number): Promise<Stamp[]> {
  const { blobs } = await list({ prefix: pagePrefix(page) });
  if (!blobs.length) return [];

  const settled = await Promise.allSettled(
    blobs.map(async (b) => {
      const res = await fetch(b.url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`blob ${b.pathname}: ${res.status}`);
      return (await res.json()) as Stamp;
    }),
  );

  // A single unreadable blob shouldn't blank the whole page.
  const stamps = settled
    .filter((s): s is PromiseFulfilledResult<Stamp> => s.status === 'fulfilled')
    .map((s) => s.value);

  return stamps.sort((a, b) => a.at.localeCompare(b.at));
}

export async function writeStamp(stamp: Stamp): Promise<void> {
  await put(`${pagePrefix(stamp.page)}${stamp.id}.json`, JSON.stringify(stamp), {
    access: 'public',
    contentType: 'application/json',
    // The id is already unique; a random suffix would make the key
    // unpredictable and break any future direct lookup.
    addRandomSuffix: false,
  });
}

// Cheap page census — how many stamps sit on each page, without fetching any
// bodies. Used to find the first page with room.
export async function pageCounts(): Promise<Map<number, number>> {
  const { blobs } = await list({ prefix: `${PREFIX}/` });
  const counts = new Map<number, number>();
  for (const b of blobs) {
    const m = b.pathname.match(/^guestbook\/p(\d+)\//);
    if (!m) continue;
    const page = Number(m[1]);
    counts.set(page, (counts.get(page) ?? 0) + 1);
  }
  return counts;
}
