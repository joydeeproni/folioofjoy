# Admin Content Editor — Phase 1 (Articles) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A dev-only `/admin` editor that edits **articles** end-to-end — title, meta, references, and markdown body — rendered in the real writings design, saving JSON into the repo that the live site renders from.

**Architecture:** Non-destructive JSON overlay. Production reads `content/writings/<slug>.json` if present (markdown body via `react-markdown` mapped to the site's prose styles), else the existing coded/`LOCAL_WRITING_DOCS` path. A dev-only API writes the JSON + uploads. This phase proves the whole pattern on the easiest content; case studies (Phase 2) reuse the same schema, API, and renderer.

**Tech Stack:** Next 16 (App Router, RSC), React 19, TypeScript, `zod` (already present), `react-markdown@^9` (new).

## Global Constraints

- **Dev-only writes:** every route that writes to disk MUST early-return `403` unless `process.env.NODE_ENV === 'development'`. Copy this guard verbatim into each write handler.
- **Node runtime:** every route handler that touches `fs` MUST set `export const runtime = 'nodejs'`.
- **Non-destructive:** never modify or delete existing `LOCAL_WRITING_DOCS` / `LOCAL_ARTICLES` content. Overlay only.
- **Design fidelity:** overlaid articles MUST render through the existing `app/writings/[slug]/page.tsx` template markup and fonts — same classes, same colors (`BG #0B0B0B`, `FG #EDEAE0`, `RULE rgba(237,234,224,0.15)`).
- **Content location:** article overlays live at `content/writings/<slug>.json`; uploads at `public/work/<slug>/<filename>`.
- **No test runner exists.** Each task's gate is `corepack pnpm exec tsc --noEmit`, `corepack pnpm exec eslint .`, and a concrete run-the-app verification (curl / browser). `pnpm` is invoked via `corepack pnpm`.

---

### Task 1: Editable content schema + overlay reader

**Files:**
- Create: `lib/content/editable.ts`
- Create: `content/.gitkeep` (empty — ensures the dir exists)

**Interfaces:**
- Produces:
  - `EditableVisual`, `EditableSection`, `EditableCaseStudy`, `EditableArticle` (types)
  - `editableArticleSchema: z.ZodType<EditableArticle>`
  - `readArticleOverlay(slug: string): Promise<EditableArticle | null>` — reads `content/writings/<slug>.json`, validates, returns `null` if missing/invalid.

- [ ] **Step 1: Create the schema module**

```ts
// lib/content/editable.ts
import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { Annotation, Focus } from '@/components/case-study/types';

// ---- Visuals (case studies use all of these; articles only use image/video) ----
const focusSchema: z.ZodType<Focus> = z.object({ x: z.number(), y: z.number(), scale: z.number() });
const annotationSchema: z.ZodType<Annotation> = z.object({
  id: z.string(), x: z.number(), y: z.number(), label: z.string(),
  side: z.enum(['top', 'bottom', 'left', 'right']).optional(),
});

export const editableVisualSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('image'), src: z.string(), alt: z.string(), fit: z.enum(['contain', 'cover']).optional() }),
  z.object({ kind: z.literal('video'), src: z.string(), poster: z.string().optional(), alt: z.string().optional() }),
  z.object({ kind: z.literal('zoom'), src: z.string(), alt: z.string(), focus: focusSchema.optional(), annotations: z.array(annotationSchema).optional() }),
  z.object({ kind: z.literal('bento'), columns: z.union([z.literal(2), z.literal(3)]).optional(), images: z.array(z.object({ file: z.string(), alt: z.string().optional() })) }),
  z.object({ kind: z.literal('coded'), ref: z.string() }),
]);
export type EditableVisual = z.infer<typeof editableVisualSchema>;

export const editableSectionSchema = z.object({
  id: z.string(),
  act: z.string().optional(),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  caption: z.string().optional(),
  body: z.string(), // markdown
  visual: editableVisualSchema,
});
export type EditableSection = z.infer<typeof editableSectionSchema>;

export const editableCaseStudySchema = z.object({
  slug: z.string(),
  title: z.string(),
  header: z.object({ title: z.string(), lede: z.string(), meta: z.string() }),
  sections: z.array(editableSectionSchema),
  footer: z.object({ headline: z.string(), note: z.string() }).optional(),
});
export type EditableCaseStudy = z.infer<typeof editableCaseStudySchema>;

export const editableArticleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  titled: z.string().optional(),
  subhead: z.string().optional(),
  postedOn: z.string().optional(),
  type: z.string().optional(),
  number: z.string().optional(),
  heroImage: z.string().optional(),
  body: z.string(), // markdown
  references: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
});
export type EditableArticle = z.infer<typeof editableArticleSchema>;

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function readArticleOverlay(slug: string): Promise<EditableArticle | null> {
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, 'writings', `${slug}.json`), 'utf8');
    return editableArticleSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Create the content dir marker**

Create an empty file `content/.gitkeep`.

- [ ] **Step 3: Typecheck**

Run: `corepack pnpm exec tsc --noEmit`
Expected: no errors in `lib/content/editable.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/content/editable.ts content/.gitkeep
git commit -m "feat(admin): editable content schema + article overlay reader"
```

---

### Task 2: Markdown renderer + article overlay rendering

**Files:**
- Create: `components/content/markdown.tsx`
- Modify: `app/writings/[slug]/page.tsx`
- Create: `content/writings/_sample-overlay.json` (temporary fixture, deleted in Step 6)
- Modify: `package.json` (add `react-markdown`)

**Interfaces:**
- Consumes: `readArticleOverlay` (Task 1).
- Produces: `ArticleMarkdown({ source }: { source: string }): JSX.Element` — renders basic markdown with the writings article prose styles.

- [ ] **Step 1: Add react-markdown**

Run: `corepack pnpm add react-markdown@^9`
Expected: added to `dependencies`.

- [ ] **Step 2: Create the markdown renderer**

```tsx
// components/content/markdown.tsx
import ReactMarkdown from 'react-markdown';

const RULE = 'rgba(237,234,224,0.15)';

// Basic markdown mapped to the writings article prose styles (matches the center
// column of app/writings/[slug]/page.tsx). Blockquote becomes the accent pull style.
export function ArticleMarkdown({ source }: { source: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="font-sans text-lg leading-relaxed mb-6">{children}</p>,
        h2: ({ children }) => <h2 className="font-sans font-medium text-3xl mb-6 mt-10 tracking-tight">{children}</h2>,
        h3: ({ children }) => <h3 className="font-sans font-medium text-2xl mb-4 mt-8 tracking-tight">{children}</h3>,
        ul: ({ children }) => <ul className="font-sans text-lg leading-relaxed mb-6 list-disc pl-6 space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="font-sans text-lg leading-relaxed mb-6 list-decimal pl-6 space-y-2">{children}</ol>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ href, children }) => (
          <a href={href} className="underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity" style={{ textDecorationColor: RULE }}>
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-8 pl-5 font-sans text-xl md:text-2xl leading-snug tracking-tight" style={{ borderLeft: '2px solid #2CA152' }}>
            {children}
          </blockquote>
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
```

- [ ] **Step 3: Render the overlay in the writings page**

In `app/writings/[slug]/page.tsx`, add the import and an overlay branch. Insert after the `LocalArticle` block and before `const post = getWriting(slug);`:

```tsx
import { readArticleOverlay } from '@/lib/content/editable';
import { ArticleMarkdown } from '@/components/content/markdown';
```

```tsx
  // JSON overlay (edited via /admin) wins over the coded doc, if present.
  const overlay = await readArticleOverlay(slug);
  if (overlay) {
    return (
      <main className={SHELL} style={{ backgroundColor: BG, color: FG }}>
        <BackLink href="/writings" />
        <div className="max-w-5xl mx-auto pt-24">
          <div className="flex items-start gap-4">
            {overlay.number && <span className="font-pixel text-base mt-3" style={{ opacity: 0.5 }}>{overlay.number}</span>}
            <h1 className="font-sans font-medium text-6xl md:text-8xl leading-[0.95] tracking-tight">{overlay.title}</h1>
          </div>
          {overlay.heroImage && <img src={overlay.heroImage} alt="" className="w-full mt-12 rounded-lg" />}
          <hr className="my-12 border-0 border-t" style={{ borderColor: RULE }} />
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2.4fr_1fr] gap-10 md:gap-12">
            <aside className="space-y-8">
              <div>
                <p className="font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>Titled</p>
                <p className="font-sans mt-2">{overlay.titled}</p>
              </div>
              <div>
                <p className="font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>{overlay.type ? 'Type' : 'Posted on'}</p>
                <p className="font-sans mt-2">{overlay.type || overlay.postedOn}</p>
              </div>
            </aside>
            <article className="max-w-[66ch]">
              {overlay.subhead && <h2 className="font-sans font-medium text-3xl mb-6 tracking-tight">{overlay.subhead}</h2>}
              <ArticleMarkdown source={overlay.body} />
            </article>
            <aside>
              <p className="font-mono uppercase tracking-widest text-[11px] mb-4" style={{ opacity: 0.5 }}>Reference</p>
              <ul className="space-y-3">
                {overlay.references.map((ref) => (
                  <li key={ref.label}>
                    <a href={ref.href} className="font-sans underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity" style={{ textDecorationColor: RULE }}>{ref.label}</a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </main>
    );
  }
```

- [ ] **Step 4: Create a temporary fixture to verify rendering**

Create `content/writings/the-invisible-interface.json`:

```json
{
  "slug": "the-invisible-interface",
  "title": "The Invisible Interface",
  "number": "01",
  "titled": "On CLIs, agents, and the vanishing UI",
  "subhead": "The best interface disappears",
  "postedOn": "July 13th, 2026",
  "heroImage": "",
  "body": "This is an **overlay** test. The best interface *disappears*.\n\n> A pull quote, rendered from markdown.\n\n- one\n- two\n\nBack to a [link](https://joydeeproni.com).",
  "references": [{ "label": "Overlay works", "href": "#" }]
}
```

- [ ] **Step 5: Verify in the browser**

Ensure dev server is running (`http://localhost:3000`). Open `http://localhost:3000/writings/the-invisible-interface`.
Expected: the article renders in the real 3-column design; bold/italic/list/blockquote/link all styled; the accent pull-quote uses the green left border.

- [ ] **Step 6: Remove the fixture (overlay proven; keep repo clean)**

```bash
rm content/writings/the-invisible-interface.json
```

- [ ] **Step 7: Typecheck + lint + commit**

Run: `corepack pnpm exec tsc --noEmit && corepack pnpm exec eslint app/writings components/content lib/content`
Expected: clean.

```bash
git add package.json pnpm-lock.yaml components/content/markdown.tsx app/writings/[slug]/page.tsx
git commit -m "feat(admin): render article JSON overlays as markdown in the real design"
```

---

### Task 3: Dev-only content read/write API

**Files:**
- Create: `app/api/admin/content/[type]/[slug]/route.ts`

**Interfaces:**
- Consumes: `editableArticleSchema` (Task 1).
- Produces: HTTP `GET` (returns overlay JSON or `404`) and `PUT` (validates + writes `content/<type>/<slug>.json`) at `/api/admin/content/writings/<slug>`.

- [ ] **Step 1: Create the route handler**

```ts
// app/api/admin/content/[type]/[slug]/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { editableArticleSchema, editableCaseStudySchema } from '@/lib/content/editable';

export const runtime = 'nodejs';

const DEV = process.env.NODE_ENV === 'development';
const TYPES: Record<string, { dir: string; schema: import('zod').ZodTypeAny }> = {
  writings: { dir: 'writings', schema: editableArticleSchema },
  work: { dir: 'work', schema: editableCaseStudySchema },
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
```

- [ ] **Step 2: Verify PUT then GET round-trips (dev)**

Run:
```bash
curl -s -X PUT http://localhost:3000/api/admin/content/writings/api-smoke \
  -H 'content-type: application/json' \
  -d '{"slug":"api-smoke","title":"Smoke","body":"hello **world**","references":[]}'
curl -s http://localhost:3000/api/admin/content/writings/api-smoke
ls content/writings/api-smoke.json
```
Expected: PUT → `{"ok":true}`; GET → the JSON; file exists.

- [ ] **Step 3: Verify invalid payload is rejected**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X PUT http://localhost:3000/api/admin/content/writings/api-smoke \
  -H 'content-type: application/json' -d '{"title":123}'
```
Expected: `422`.

- [ ] **Step 4: Clean up + commit**

```bash
rm content/writings/api-smoke.json
git add "app/api/admin/content/[type]/[slug]/route.ts"
git commit -m "feat(admin): dev-only content read/write API with zod validation"
```

---

### Task 4: Dev-only media upload API

**Files:**
- Create: `app/api/admin/upload/route.ts`

**Interfaces:**
- Produces: HTTP `POST` (multipart form: `file`, `slug`) → writes `public/work/<slug>/<sanitized-filename>`, returns `{ path: "/work/<slug>/<filename>" }`.

- [ ] **Step 1: Create the upload handler**

```ts
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
```

- [ ] **Step 2: Verify upload (dev)**

Run:
```bash
printf 'x' > /tmp/up.png
curl -s -F file=@/tmp/up.png -F slug=upload-smoke http://localhost:3000/api/admin/upload
ls public/work/upload-smoke/up.png
```
Expected: `{"path":"/work/upload-smoke/up.png"}`; file exists.

- [ ] **Step 3: Clean up + commit**

```bash
rm -rf public/work/upload-smoke
git add app/api/admin/upload/route.ts
git commit -m "feat(admin): dev-only media upload API"
```

---

### Task 5: Admin index page

**Files:**
- Modify: `app/admin/page.tsx`
- Create: `components/admin/admin-index.tsx`

**Interfaces:**
- Consumes: `CASES` (`components/case-study/cases`), `LOCAL_WRITINGS` (`lib/writings/local`).
- Produces: dev-only index listing every case + writing, each linking to its editor route.

- [ ] **Step 1: Keep the production placeholder, add a dev index switch**

Replace `app/admin/page.tsx` with:

```tsx
import { AdminIndex } from '@/components/admin/admin-index';
import { AdminPlaceholder } from '@/components/admin/admin-placeholder';

export default function AdminPage() {
  if (process.env.NODE_ENV !== 'development') return <AdminPlaceholder />;
  return <AdminIndex />;
}
```

- [ ] **Step 2: Extract the existing placeholder unchanged**

Create `components/admin/admin-placeholder.tsx` with the current placeholder body (the `VISIT JOYDEEPRONI.COM` scramble client component moved verbatim from the old `app/admin/page.tsx`, keeping `'use client'` and the `scrambleReveal` import).

- [ ] **Step 3: Create the dev index**

```tsx
// components/admin/admin-index.tsx
import Link from 'next/link';
import { CASES } from '@/components/case-study/cases';
import { LOCAL_WRITINGS } from '@/lib/writings/local';

const CARD = 'block rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-[#2CA152]/60 transition-colors';

export function AdminIndex() {
  return (
    <main className="min-h-dvh bg-[#0B0B0B] text-[#EDEAE0] px-6 md:px-16 py-16">
      <h1 className="font-sans font-medium text-4xl tracking-tight mb-2">Content editor</h1>
      <p className="font-mono text-[11px] uppercase tracking-widest opacity-50 mb-10">dev only · edits save to the repo</p>

      <section className="mb-12">
        <h2 className="font-mono text-[11px] uppercase tracking-widest opacity-50 mb-4">Writings</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {LOCAL_WRITINGS.map((w) => (
            <Link key={w.slug} href={`/admin/edit/writings/${w.slug}`} className={CARD}>
              <span className="font-sans">{w.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-widest opacity-50 mb-4">Case studies</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {CASES.map((c) => (
            <Link key={c.slug} href={`/admin/edit/work/${c.slug}`} className={CARD}>
              <span className="font-sans">{c.title}</span>
              <span className="font-mono text-[11px] opacity-40 ml-2">· Phase 2</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Verify**

Open `http://localhost:3000/admin`. Expected: dev index lists all writings + cases; writing links point to `/admin/edit/writings/<slug>`.
Confirm the production branch still typechecks (placeholder intact).

- [ ] **Step 5: Typecheck + commit**

Run: `corepack pnpm exec tsc --noEmit`

```bash
git add app/admin/page.tsx components/admin/admin-index.tsx components/admin/admin-placeholder.tsx
git commit -m "feat(admin): dev-only content editor index"
```

---

### Task 6: Article editor (edit → live preview → save)

**Files:**
- Create: `app/admin/edit/writings/[slug]/page.tsx` (server: loads overlay-or-scaffold, passes to client editor)
- Create: `components/admin/article-editor.tsx` (client: form + live preview + save)

**Interfaces:**
- Consumes: `readArticleOverlay` (Task 1), `ArticleMarkdown` (Task 2), the content API (Task 3), the upload API (Task 4), `LOCAL_WRITING_DOCS`/`getWriting` for scaffolding.
- Produces: a working editor at `/admin/edit/writings/<slug>`.

- [ ] **Step 1: Server wrapper that builds the initial value**

```tsx
// app/admin/edit/writings/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { readArticleOverlay, type EditableArticle } from '@/lib/content/editable';
import { getWriting } from '@/lib/content';
import { ArticleEditor } from '@/components/admin/article-editor';

export default async function EditArticle({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { slug } = await params;

  const overlay = await readArticleOverlay(slug);
  let initial: EditableArticle;
  if (overlay) {
    initial = overlay;
  } else {
    const doc = getWriting(slug); // existing coded doc, if any
    initial = {
      slug,
      title: doc?.title ?? slug,
      titled: doc?.titled ?? '',
      subhead: doc?.subhead ?? '',
      postedOn: doc?.postedOn ?? '',
      type: doc?.type,
      number: doc?.number,
      heroImage: doc?.heroImage ?? '',
      body: Array.isArray(doc?.body) ? doc!.body.join('\n\n') : '',
      references: doc?.references ?? [],
    };
  }
  return <ArticleEditor initial={initial} />;
}
```

> Note: `getWriting` returns the `Writing` shape (body: string[]); if its type doesn't expose all fields above, read them defensively with optional chaining as written. If `getWriting` is unavailable for a slug, the scaffold still works from `slug`.

- [ ] **Step 2: Client editor with live preview + save**

```tsx
// components/admin/article-editor.tsx
'use client';

import { useState } from 'react';
import type { EditableArticle } from '@/lib/content/editable';
import { ArticleMarkdown } from '@/components/content/markdown';

const RULE = 'rgba(237,234,224,0.15)';
const field = 'w-full bg-white/[0.04] border border-white/10 rounded px-3 py-2 font-sans text-[#EDEAE0] outline-none focus:border-[#2CA152]/60';

export function ArticleEditor({ initial }: { initial: EditableArticle }) {
  const [doc, setDoc] = useState<EditableArticle>(initial);
  const [status, setStatus] = useState('');

  function set<K extends keyof EditableArticle>(k: K, v: EditableArticle[K]) {
    setDoc((d) => ({ ...d, [k]: v }));
  }

  async function save() {
    setStatus('Saving…');
    const res = await fetch(`/api/admin/content/writings/${doc.slug}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(doc),
    });
    setStatus(res.ok ? 'Saved ✓ (commit + deploy to publish)' : `Error: ${res.status}`);
  }

  async function uploadHero(file: File) {
    const fd = new FormData();
    fd.append('file', file); fd.append('slug', doc.slug);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) set('heroImage', (await res.json()).path);
  }

  return (
    <div className="min-h-dvh bg-[#0B0B0B] text-[#EDEAE0] grid md:grid-cols-2">
      {/* EDIT */}
      <div className="p-6 md:p-10 space-y-4 border-r border-white/10 overflow-y-auto">
        <div className="flex items-center justify-between">
          <a href="/admin" className="font-mono text-[11px] uppercase tracking-widest opacity-50 hover:opacity-100">← index</a>
          <button onClick={save} className="rounded-full bg-[#2CA152] px-4 py-1.5 font-sans text-sm text-black">Save</button>
        </div>
        {status && <p className="font-mono text-[11px] opacity-70">{status}</p>}

        <label className="block"><span className="font-mono text-[11px] uppercase tracking-widest opacity-50">Title</span>
          <input className={field} value={doc.title} onChange={(e) => set('title', e.target.value)} /></label>
        <label className="block"><span className="font-mono text-[11px] uppercase tracking-widest opacity-50">Subhead</span>
          <input className={field} value={doc.subhead ?? ''} onChange={(e) => set('subhead', e.target.value)} /></label>
        <label className="block"><span className="font-mono text-[11px] uppercase tracking-widest opacity-50">Titled</span>
          <input className={field} value={doc.titled ?? ''} onChange={(e) => set('titled', e.target.value)} /></label>
        <label className="block"><span className="font-mono text-[11px] uppercase tracking-widest opacity-50">Posted on</span>
          <input className={field} value={doc.postedOn ?? ''} onChange={(e) => set('postedOn', e.target.value)} /></label>
        <label className="block"><span className="font-mono text-[11px] uppercase tracking-widest opacity-50">Hero image</span>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0])} className="block mt-1 text-sm" /></label>
        <label className="block"><span className="font-mono text-[11px] uppercase tracking-widest opacity-50">Body (markdown)</span>
          <textarea className={`${field} min-h-[40vh] font-mono text-sm`} value={doc.body} onChange={(e) => set('body', e.target.value)} /></label>
      </div>

      {/* PREVIEW — the real article prose styles */}
      <div className="p-6 md:p-10 overflow-y-auto">
        <p className="font-mono text-[11px] uppercase tracking-widest opacity-40 mb-6">Live preview</p>
        <h1 className="font-sans font-medium text-5xl leading-[0.95] tracking-tight mb-6">{doc.title}</h1>
        {doc.heroImage && <img src={doc.heroImage} alt="" className="w-full mb-8 rounded-lg" />}
        <hr className="my-8 border-0 border-t" style={{ borderColor: RULE }} />
        {doc.subhead && <h2 className="font-sans font-medium text-3xl mb-6 tracking-tight">{doc.subhead}</h2>}
        <article className="max-w-[66ch]"><ArticleMarkdown source={doc.body} /></article>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify the full loop**

1. Open `http://localhost:3000/admin/edit/writings/the-invisible-interface`.
2. Confirm the form pre-fills from the coded doc and the right pane previews in the real prose styles.
3. Edit the body (add `**bold**` and a `> quote`); confirm the preview updates live.
4. Click **Save**; confirm `Saved ✓`; confirm `content/writings/the-invisible-interface.json` now exists.
5. Open `http://localhost:3000/writings/the-invisible-interface`; confirm the live article now shows the edit (overlay wins).

- [ ] **Step 4: Decide whether to keep the overlay**

If keeping the edit, leave the JSON. If it was only a test, `rm content/writings/the-invisible-interface.json` to restore the coded version.

- [ ] **Step 5: Typecheck + lint + commit**

Run: `corepack pnpm exec tsc --noEmit && corepack pnpm exec eslint app/admin components/admin`

```bash
git add "app/admin/edit/writings/[slug]/page.tsx" components/admin/article-editor.tsx
git commit -m "feat(admin): article editor with live preview and save"
```

---

## Self-Review

**Spec coverage (Phase 1 rows):**
- Editor shell (dev-only, prod placeholder preserved) → Task 5 ✓
- Persistence (JSON overlay in repo, dev-guarded API) → Tasks 1, 3 ✓
- Media upload to `public/` → Task 4 ✓
- Articles editable end-to-end, real design, markdown → Tasks 2, 6 ✓
- Non-destructive overlay (production prefers JSON else coded) → Task 2 ✓
- Case studies → **Phase 2** (out of scope here; index links stubbed as "Phase 2" in Task 5).

**Placeholder scan:** none — every step has concrete code or an exact command.

**Type consistency:** `EditableArticle` (Task 1) is consumed unchanged by Tasks 2, 3, 6; `readArticleOverlay`, `ArticleMarkdown({source})`, and the API path `/api/admin/content/writings/<slug>` match across tasks.

**Known follow-ups (Phase 2, not gaps):** `EditableCaseStudy`/`editableCaseStudySchema` are defined in Task 1 and wired into the API in Task 3, but the case-study renderer, `CODED_BLOCKS` registry, zoom/bento forms, and section reorder are Phase 2.
