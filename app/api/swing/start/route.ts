import { NextResponse } from 'next/server';
import { issueTicket } from '@/lib/swing-game/ticket';
import { visitorHash } from '@/lib/visitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Called on the 5th warm-up tap: stamps when this visitor's run began.
export async function POST(req: Request) {
  return NextResponse.json({ ticket: issueTicket(visitorHash(req)) }, { headers: { 'cache-control': 'no-store' } });
}
