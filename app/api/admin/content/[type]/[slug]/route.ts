// app/api/admin/content/[type]/[slug]/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { editableArticleSchema } from '@/lib/content/editable';

export const runtime = 'nodejs';

const DEV = process.env.NODE_ENV === 'development';
const TYPES: Record<string, { dir: string; schema: import('zod').ZodTypeAny }> = {
  writings: { dir: 'writings', schema: editableArticleSchema },
};

function fileFor(type: string, slug: string) {
  const t = TYPES[type];
  if (!t) return null;
  const safe = slug.replace(/[^a-z0-9-]/gi, '');
  return path.join(process.cwd(), 'content', t.dir, `${safe}.json`);
}

export async function GET(_req: Request, { params }: { params: Promise<{ type: string; slug: string }> }) {
  if (!DEV) return NextResponse.json({ error: 'dev only' }, { status: 403 });
  const { type, slug } = await params;
  const file = fileFor(type, slug);
  if (!file) return NextResponse.json({ error: 'bad type' }, { status: 400 });
  try {
    const raw = await fs.readFile(file, 'utf8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ type: string; slug: string }> }) {
  if (!DEV) return NextResponse.json({ error: 'dev only' }, { status: 403 });
  const { type, slug } = await params;
  const t = TYPES[type];
  const file = fileFor(type, slug);
  if (!t || !file) return NextResponse.json({ error: 'bad type' }, { status: 400 });
  const parsed = t.schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'invalid', issues: parsed.error.issues }, { status: 422 });
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(parsed.data, null, 2) + '\n', 'utf8');
  return NextResponse.json({ ok: true });
}
