import { NextResponse } from 'next/server';
import { boardView } from '@/lib/swing-game/board';
import { isValidScore } from '@/lib/swing-game/rules';
import { readRanked, writeBest } from '@/lib/swing-game/store';
import { verifyTicket } from '@/lib/swing-game/ticket';
import { countryOf, visitorHash } from '@/lib/visitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'cache-control': 'no-store' };

export async function GET(req: Request) {
  try {
    const view = boardView(await readRanked(), visitorHash(req), countryOf(req));
    return NextResponse.json(view, { headers: NO_STORE });
  } catch (err) {
    console.error('[swing] GET failed', err);
    return NextResponse.json({ error: 'could not read the leaderboard' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { ticket, score } = (body ?? {}) as Record<string, unknown>;
  if (!isValidScore(score)) return NextResponse.json({ error: 'invalid score' }, { status: 400 });

  const visitor = visitorHash(req);
  const check = verifyTicket(ticket, visitor);
  if (check !== 'ok') return NextResponse.json({ error: `ticket ${check}` }, { status: 403 });

  try {
    const country = countryOf(req);
    const { improved } = score > 0 ? await writeBest(visitor, score, country) : { improved: false };
    const view = boardView(await readRanked(), visitor, country);
    return NextResponse.json({ ...view, improved }, { headers: NO_STORE });
  } catch (err) {
    console.error('[swing] POST failed', err);
    return NextResponse.json({ error: 'could not save your score' }, { status: 500 });
  }
}
