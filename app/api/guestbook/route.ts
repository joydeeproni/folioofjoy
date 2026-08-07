import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { greetingFor } from '@/lib/guestbook/greetings';
import { pageCounts, readPage, writeStamp } from '@/lib/guestbook/store';
import { MAX_PAGES, PAGE_CAPACITY, stampColor, stampStyleFor, type Stamp } from '@/lib/guestbook/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Where the visitor is. On Vercel this is the edge's own geo header; locally
// there is no such header, so we fall back to the region subtag of
// Accept-Language (da-DK -> DK), which is the closest honest guess a dev box
// can make. Returns '' rather than a fake country when we truly can't tell.
function countryOf(req: Request): string {
  const vercel = req.headers.get('x-vercel-ip-country');
  if (vercel) return vercel.toUpperCase();

  const langs = req.headers.get('accept-language') ?? '';
  const region = langs.match(/[a-z]{2,3}-([A-Z]{2})/);
  return region ? region[1].toUpperCase() : '';
}

// Stable per-visitor key that isn't a stored IP. Salted with the blob token so
// the hash isn't reversible via a rainbow table of the v4 space.
function visitorHash(req: Request): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const salt = process.env.BLOB_READ_WRITE_TOKEN ?? 'folioofjoy';
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 16);
}

function clamp01(n: unknown): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0.5;
  // Keep the stamp's centre inside the paper so it can never be half-lost off
  // an edge, however the client was tampered with.
  return Math.min(0.94, Math.max(0.06, v));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Math.min(MAX_PAGES, Number(url.searchParams.get('page')) || 1));

  try {
    const [stamps, counts] = await Promise.all([readPage(page), pageCounts()]);
    const pagesInUse = Math.max(1, ...[...counts.keys()]);
    return NextResponse.json(
      {
        page,
        stamps,
        pagesInUse,
        full: stamps.length >= PAGE_CAPACITY,
        capacity: PAGE_CAPACITY,
        // Whether THIS visitor already signed this page. The server owns this — it
        // holds the stamps and the visitor hash. The client used to track it in
        // localStorage, which went stale the moment stamps were removed from the
        // store and then locked the visitor out of a page they hadn't signed.
        mine: stamps.some((s) => s.id.endsWith(`-${visitorHash(req)}`)),
        // What this visitor's stamp will say, so the UI can show a true preview
        // before they commit to pressing it.
        preview: { country: countryOf(req), ...greetingFor(countryOf(req)) },
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (err) {
    console.error('[guestbook] GET failed', err);
    return NextResponse.json({ error: 'could not read the guestbook' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { page: rawPage, x, y } = (body ?? {}) as Record<string, unknown>;
  const page = Math.max(1, Math.min(MAX_PAGES, Number(rawPage) || 1));

  try {
    const existing = await readPage(page);

    if (existing.length >= PAGE_CAPACITY) {
      return NextResponse.json(
        { error: 'page full', full: true, nextPage: Math.min(MAX_PAGES, page + 1) },
        { status: 409 },
      );
    }

    // One stamp per visitor per page. Overlapping is the whole point, but a
    // single visitor shouldn't be able to bury the page on their own.
    const visitor = visitorHash(req);
    if (existing.some((s) => s.id.endsWith(`-${visitor}`))) {
      return NextResponse.json(
        { error: 'already stamped this page', alreadyStamped: true },
        { status: 409 },
      );
    }

    const country = countryOf(req);
    const g = greetingFor(country);
    // Visitor hash is the id's suffix so the per-page check above needs no
    // second index and no stored IP.
    const id = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}-${visitor}`;

    const stamp: Stamp = {
      id,
      page,
      x: clamp01(x),
      y: clamp01(y),
      rot: Math.round((Math.random() * 2 - 1) * 16),
      color: stampColor(id),
      style: stampStyleFor(id),
      country,
      hello: g.hello,
      place: g.place,
      line: g.line,
      font: g.font,
      at: new Date().toISOString(),
    };

    await writeStamp(stamp);
    return NextResponse.json({ stamp }, { status: 201 });
  } catch (err) {
    console.error('[guestbook] POST failed', err);
    return NextResponse.json({ error: 'could not save your stamp' }, { status: 500 });
  }
}
