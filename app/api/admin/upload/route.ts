// app/api/admin/upload/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';

const DEV = process.env.NODE_ENV === 'development';

export async function POST(req: Request) {
  if (!DEV) return NextResponse.json({ error: 'dev only' }, { status: 403 });
  const form = await req.formData();
  const file = form.get('file');
  const slug = String(form.get('slug') || '').replace(/[^a-z0-9-]/gi, '');
  if (!(file instanceof File) || !slug) return NextResponse.json({ error: 'file and slug required' }, { status: 400 });
  const name = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '');
  const dir = path.join(process.cwd(), 'public', 'work', slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ path: `/work/${slug}/${name}` });
}
