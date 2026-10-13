import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { reviewEntrySchema, reviewFileSchema, type ReviewFile } from '@/lib/stamps/review';

export const runtime = 'nodejs';

const DEV = process.env.NODE_ENV === 'development';
const FILE = path.join(process.cwd(), 'content', 'stamp-review.json');

async function read(): Promise<ReviewFile> {
  try {
    return reviewFileSchema.parse(JSON.parse(await fs.readFile(FILE, 'utf8')));
  } catch {
    return {};
  }
}

export async function GET() {
  if (!DEV) return NextResponse.json({ error: 'dev only' }, { status: 403 });
  return NextResponse.json(await read());
}

// Writes are queued so two quick edits can't read the same snapshot and lose one.
let queue: Promise<unknown> = Promise.resolve();

// One country at a time, merged into the file.
export async function PUT(req: Request) {
  if (!DEV) return NextResponse.json({ error: 'dev only' }, { status: 403 });
  const body = (await req.json()) as { code?: unknown; entry?: unknown };
  const code = typeof body.code === 'string' ? body.code.toUpperCase() : '';
  const entry = reviewEntrySchema.safeParse(body.entry);
  if (!/^[A-Z]{2}$/.test(code) || !entry.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 422 });
  }
  const write = queue.then(async () => {
    const all = await read();
    if (entry.data.status === 'open' && !entry.data.comment.trim()) delete all[code];
    else all[code] = entry.data;
    const sorted = Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)));
    await fs.writeFile(FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
    return sorted;
  });
  queue = write.catch(() => undefined);
  return NextResponse.json(await write);
}
