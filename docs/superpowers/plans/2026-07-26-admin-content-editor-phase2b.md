# Admin Content Editor — Phase 2B (Inline case-study text editing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Edit a case study's text inline on its real page — header, each section's eyebrow/heading/body, and footer — reusing the production `CaseStudyLayout`, saving to `content/work/<slug>.json`. Proven on Deterge (which already has a JSON overlay).

**Architecture:** A client `CaseStudyEditor` renders the real `CaseStudyLayout`. It suppresses the layout's own heading render and injects an editable left-column (`SectionBody`: contentEditable eyebrow + heading + rich body) per section; the visual stage renders normally (visuals are NOT editable this phase). Rich body ↔ markdown via `marked`/`turndown` (as in Phase 1's article editor). Shared inline-editing helpers are extracted so the article and case-study editors don't duplicate.

**Tech Stack:** Next 16 RSC, React 19, TS, `marked` + `turndown` (present).

## Global Constraints

- **Reuse the real layout:** import and render `components/case-study/case-study-layout.tsx` — do not reimplement the two-column/scroll/stage.
- **Visuals unchanged this phase:** render each section's visual via the same `toVisual` mapping used by `CaseStudyRenderer`; no visual editing UI yet.
- **Markdown storage:** save `body` as markdown (turndown on the edited HTML); the JSON stays markdown, production renderer untouched.
- **Dev-only:** the editor route `notFound()`s in production.
- **DRY:** extract shared `exec`, `turndown` service, and the formatting toolbar into `components/admin/inline-editing.tsx`; the existing article editor must be refactored to use them and keep working.
- pnpm via `corepack pnpm`; gate on `tsc --noEmit` (ignore `lib/color.ts`) + curl. Commit only each task's files; never `git add -A`.

---

### Task 1: Extract shared inline-editing helpers; refactor the article editor

**Files:**
- Create: `components/admin/inline-editing.tsx`
- Modify: `components/admin/article-editor.tsx`

**Interfaces:**
- Produces: `exec(cmd: string, value?: string): void`; `td: TurndownService`; `InlineToolbar({ children }: { children?: ReactNode }): JSX.Element` (renders the format buttons + a right-aligned `children` slot for Save/status).

- [ ] **Step 1: Create the shared module**

```tsx
// components/admin/inline-editing.tsx
'use client';

import type { ReactNode } from 'react';
import TurndownService from 'turndown';

export const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '*', codeBlockStyle: 'fenced' });

export function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

function Btn({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
  return (
    <button title={title} onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="rounded px-2 py-1 font-sans text-sm text-[#EDEAE0]/80 hover:bg-white/10">{label}</button>
  );
}

// Global formatting toolbar — execCommand acts on whichever contentEditable region
// currently holds the selection, so one toolbar serves every editable body.
export function InlineToolbar({ children }: { children?: ReactNode }) {
  return (
    <div className="sticky top-0 z-30 -mx-6 md:-mx-16 mb-6 flex items-center gap-1 border-b border-white/10 bg-[#0B0B0B]/90 px-6 md:px-16 py-2 backdrop-blur">
      <a href="/admin" className="mr-2 font-mono text-[11px] uppercase tracking-widest opacity-50 hover:opacity-100">← index</a>
      <span className="mx-2 h-4 w-px bg-white/15" />
      <Btn label="B" title="Bold (⌘B)" onClick={() => exec('bold')} />
      <Btn label="i" title="Italic (⌘I)" onClick={() => exec('italic')} />
      <Btn label="H" title="Heading" onClick={() => exec('formatBlock', 'h2')} />
      <Btn label="•" title="Bulleted list" onClick={() => exec('insertUnorderedList')} />
      <Btn label="1." title="Numbered list" onClick={() => exec('insertOrderedList')} />
      <Btn label="❝" title="Quote" onClick={() => exec('formatBlock', 'blockquote')} />
      <Btn label="link" title="Add link" onClick={() => { const u = prompt('URL'); if (u) exec('createLink', u); }} />
      <Btn label="⌫fmt" title="Clear formatting" onClick={() => exec('removeFormat')} />
      <div className="ml-auto flex items-center gap-3">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Refactor the article editor to use the shared helpers**

In `components/admin/article-editor.tsx`: delete the local `td`, `exec`, `ToolBtn`, and the top-bar `<div className="sticky ...">…</div>` block; import `{ exec, td, InlineToolbar }` from `./inline-editing`; replace the old top bar with:

```tsx
      <InlineToolbar>
        {status && <span className="font-mono text-[11px] opacity-70">{status}</span>}
        <button onClick={save} className="rounded-full bg-[#2CA152] px-4 py-1.5 font-sans text-sm text-black">Save</button>
      </InlineToolbar>
```

Keep the article's own `BODY_CSS` `<style>` and everything else. (The `exec`/`td` imports are still used by `save` and the toolbar.)

- [ ] **Step 3: Verify the article editor still works**

Run: `corepack pnpm exec tsc --noEmit` (ignore `lib/color.ts`).
Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/edit/writings/the-invisible-interface` → expect `200`.
Run: `curl -s http://localhost:3000/admin/edit/writings/the-invisible-interface | grep -o "The Invisible Interface\|❝" | sort -u` → both present (editor + toolbar render).

- [ ] **Step 4: Commit**

```bash
git add components/admin/inline-editing.tsx components/admin/article-editor.tsx
git commit -m "refactor(admin): extract shared inline-editing toolbar/helpers"
```

---

### Task 2: CaseStudyEditor + editor route

**Files:**
- Create: `components/admin/case-study-editor.tsx`
- Create: `app/admin/edit/work/[slug]/page.tsx`

**Interfaces:**
- Consumes: `CaseStudyLayout`, `Bento`, `renderCoded`, `exec`/`td`/`InlineToolbar`, `readCaseStudyOverlay`, `EditableCaseStudy`/`EditableVisual`, `CaseStudySection`/`Visual`, `getCaseStudy` (registry, for the title when scaffolding).
- Produces: editor at `/admin/edit/work/<slug>`.

- [ ] **Step 1: Create the case-study editor**

```tsx
// components/admin/case-study-editor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { CaseStudyLayout } from '@/components/case-study/case-study-layout';
import { Bento } from '@/components/case-study/controls/bento';
import { renderCoded } from '@/components/case-study/coded-blocks';
import { exec, td, InlineToolbar } from './inline-editing';
import type { CaseStudySection, Visual } from '@/components/case-study/types';
import type { EditableCaseStudy, EditableVisual } from '@/lib/content/editable';

const CS_BODY_CSS = `
.cs-body:focus, .cs-edit:focus { outline: none; }
.cs-body p { font-size: 17px; line-height: 1.65; margin-bottom: 1.25rem; }
.cs-body h2 { font-size: 1.5rem; font-weight: 500; letter-spacing: -0.01em; margin: 1.5rem 0 1rem; }
.cs-body ul { list-style: disc; padding-left: 1.25rem; margin-bottom: 1.5rem; }
.cs-body ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
.cs-body li { margin-bottom: 0.5rem; }
.cs-body strong { font-weight: 600; } .cs-body em { font-style: italic; }
.cs-body a { text-decoration: underline; text-underline-offset: 4px; }
.cs-body blockquote { margin: 2rem 0; padding-left: 1.25rem; border-left: 2px solid #2CA152; font-size: 1.25rem; line-height: 1.35; }
.cs-edit { border-radius: 4px; transition: background 0.15s; }
.cs-edit:hover { background: rgba(255,255,255,0.03); }
`;

function toVisual(v: EditableVisual): Visual {
  switch (v.kind) {
    case 'image': return { kind: 'image', src: v.src, alt: v.alt, fit: v.fit };
    case 'video': return { kind: 'video', src: v.src, poster: v.poster, alt: v.alt };
    case 'zoom': return { kind: 'zoom', src: v.src, alt: v.alt, focus: v.focus, annotations: v.annotations };
    case 'bento': return { kind: 'component', render: () => <Bento columns={v.columns} images={v.images} /> };
    case 'coded': return { kind: 'component', render: () => renderCoded(v.ref) };
  }
}

type Patch = { eyebrow?: string; heading?: string; bodyHtml?: string };

function SectionBody({ id, eyebrow, heading, body, onPatch }:
  { id: string; eyebrow?: string; heading?: string; body: string; onPatch: (id: string, p: Patch) => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.contentEditable = 'true';
      bodyRef.current.innerHTML = marked.parse(body ?? '', { async: false }) as string;
    }
  }, [body]);
  return (
    <div>
      {eyebrow !== undefined && (
        <p contentEditable suppressContentEditableWarning data-id={id}
          onInput={(e) => onPatch(id, { eyebrow: e.currentTarget.textContent ?? '' })}
          className="cs-edit font-sans font-medium text-sm mb-3 tracking-[-0.02em] lowercase" style={{ color: '#2CA152' }}>{eyebrow}</p>
      )}
      {heading !== undefined && (
        <h2 contentEditable suppressContentEditableWarning
          onInput={(e) => onPatch(id, { heading: e.currentTarget.textContent ?? '' })}
          className="cs-edit font-sans font-medium text-2xl md:text-3xl tracking-tight mb-4" style={{ color: '#EDEAE0' }}>{heading}</h2>
      )}
      <div ref={bodyRef} className="cs-body max-w-none" style={{ color: '#EDEAE0' }}
        onInput={(e) => onPatch(id, { bodyHtml: e.currentTarget.innerHTML })} />
    </div>
  );
}

export function CaseStudyEditor({ initial }: { initial: EditableCaseStudy }) {
  const [status, setStatus] = useState('');
  const patches = useRef<Record<string, Patch>>({});
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const footHeadRef = useRef<HTMLParagraphElement>(null);
  const footNoteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    for (const r of [titleRef, ledeRef, metaRef, footHeadRef, footNoteRef]) if (r.current) r.current.contentEditable = 'true';
  }, []);

  const onPatch = (id: string, p: Patch) => { patches.current[id] = { ...patches.current[id], ...p }; };

  const sections: CaseStudySection[] = initial.sections.map((s) => ({
    id: s.id,
    act: s.act,
    caption: s.caption,
    // heading omitted so the layout doesn't render it — SectionBody owns the left column
    body: <SectionBody id={s.id} eyebrow={s.eyebrow} heading={s.heading} body={s.body} onPatch={onPatch} />,
    visual: toVisual(s.visual),
  }));

  async function save() {
    setStatus('Saving…');
    const t = (r: React.RefObject<HTMLElement | null>) => r.current?.textContent?.trim() ?? '';
    const doc: EditableCaseStudy = {
      ...initial,
      header: { title: t(titleRef) || initial.header.title, lede: t(ledeRef), meta: t(metaRef) },
      sections: initial.sections.map((s) => {
        const p = patches.current[s.id] ?? {};
        return {
          ...s,
          eyebrow: p.eyebrow ?? s.eyebrow,
          heading: p.heading ?? s.heading,
          body: p.bodyHtml != null ? td.turndown(p.bodyHtml) : s.body,
        };
      }),
      footer: initial.footer ? { headline: t(footHeadRef), note: t(footNoteRef) } : undefined,
    };
    const res = await fetch(`/api/admin/content/work/${initial.slug}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(doc),
    });
    setStatus(res.ok ? 'Saved ✓ — commit + deploy to publish' : `Error ${res.status}`);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CS_BODY_CSS }} />
      <InlineToolbar>
        {status && <span className="font-mono text-[11px] opacity-70">{status}</span>}
        <button onClick={save} className="rounded-full bg-[#2CA152] px-4 py-1.5 font-sans text-sm text-black">Save</button>
      </InlineToolbar>
      <CaseStudyLayout
        sections={sections}
        title={initial.title}
        header={
          <header className="pt-8 pb-4 md:pt-8">
            <h1 ref={titleRef} suppressContentEditableWarning className="cs-edit font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: '#EDEAE0' }}>{initial.header.title}</h1>
            <p ref={ledeRef} suppressContentEditableWarning className="cs-edit mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: '#EDEAE0' }}>{initial.header.lede}</p>
            <p ref={metaRef} suppressContentEditableWarning className="cs-edit mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>{initial.header.meta}</p>
          </header>
        }
        footer={initial.footer && (
          <footer className="py-16 md:py-24">
            <p ref={footHeadRef} suppressContentEditableWarning className="cs-edit font-sans text-2xl md:text-3xl tracking-tight text-balance" style={{ color: '#EDEAE0' }}>{initial.footer.headline}</p>
            <p ref={footNoteRef} suppressContentEditableWarning className="cs-edit mt-4 max-w-[52ch] font-sans text-[15px] leading-relaxed" style={{ color: 'rgba(237,234,224,0.5)' }}>{initial.footer.note}</p>
          </footer>
        )}
      />
    </>
  );
}
```

- [ ] **Step 2: Create the editor route (server wrapper)**

```tsx
// app/admin/edit/work/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { readCaseStudyOverlay } from '@/lib/content/editable';
import { getCaseStudy } from '@/components/case-study/registry';
import { CaseStudyEditor } from '@/components/admin/case-study-editor';

const SHELL = 'relative min-h-dvh w-full px-6 md:px-16 pb-24 bg-[#0B0B0B] text-[#EDEAE0]';

export default async function EditCaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { slug } = await params;

  const overlay = await readCaseStudyOverlay(slug);
  if (!overlay) {
    // No JSON overlay yet — coded studies can't be auto-extracted (Phase 2C: assisted migration).
    const coded = getCaseStudy(slug);
    return (
      <main className={SHELL + ' flex items-center justify-center'}>
        <div className="max-w-md text-center">
          <p className="font-sans text-xl">{coded ? `“${coded.title}” has no editable JSON yet.` : 'Unknown case study.'}</p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-widest opacity-50">Migrate it to content/work/{slug}.json to edit here.</p>
          <a href="/admin" className="mt-6 inline-block font-mono text-[11px] uppercase tracking-widest opacity-70 hover:opacity-100">← index</a>
        </div>
      </main>
    );
  }
  return <main className={SHELL}><CaseStudyEditor initial={overlay} /></main>;
}
```

- [ ] **Step 3: Typecheck**

Run: `corepack pnpm exec tsc --noEmit` (ignore `lib/color.ts`). Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/admin/case-study-editor.tsx "app/admin/edit/work/[slug]/page.tsx"
git commit -m "feat(admin): inline case-study text editor on the real layout"
```

---

### Task 3: Verify the Deterge editing loop

- [ ] **Step 1: Editor renders on the real layout**

Run:
```bash
curl -s http://localhost:3000/admin/edit/work/deterge -o /tmp/cse.html -w "http %{http_code}\n"
grep -o "It started as a complaint\|Skip the login\|❝\|cs-body\|Saved ✓\|Deterge" /tmp/cse.html | sort | uniq -c
```
Expected: `200`; the headings and "Deterge", the toolbar quote glyph, and `cs-body` present — i.e. the real case study renders inside the editor.

- [ ] **Step 2: Save loop end-to-end (browser-less)**

Simulate a save by PUTting an edited overlay through the content API, then confirm the live case study shows it:
```bash
python3 - <<'PY'
import json,urllib.request
d=json.load(open('content/work/deterge.json'))
d['sections'][1]['heading']='It started as a complaint — EDIT-OK'
req=urllib.request.Request('http://localhost:3000/api/admin/content/work/deterge',
  data=json.dumps(d).encode(),headers={'content-type':'application/json'},method='PUT')
print(urllib.request.urlopen(req).read().decode())
PY
curl -s http://localhost:3000/work/deterge | grep -o "EDIT-OK" | head -1
```
Expected: `{"ok":true}` then `EDIT-OK` (the live case study reflects the saved change).

- [ ] **Step 3: Restore Deterge to its original overlay**

```bash
git checkout -- content/work/deterge.json
curl -s http://localhost:3000/work/deterge | grep -c "EDIT-OK"   # expect 0
```

- [ ] **Step 4: (no code) — mark complete**

No commit for this task (verification only; the restore leaves the tree clean).

---

## Self-Review

**Spec coverage (Phase 2B scope):**
- Inline editing on the real case-study layout → Task 2 (`CaseStudyEditor` reuses `CaseStudyLayout`) ✓
- Editable header/section-text/footer, markdown-preserved save → Task 2 ✓
- Dev-only route, scaffold message for un-migrated studies → Task 2 ✓
- Shared toolbar (no duplication with the article editor) → Task 1 ✓
- Proven on Deterge → Task 3 ✓

**Placeholder scan:** none — full code for both components; verification uses concrete commands.

**Type consistency:** `EditableCaseStudy`/`EditableVisual` consumed by `CaseStudyEditor` match Phase 1 Task 1; `toVisual` mirrors `CaseStudyRenderer` (Phase 2A); the content API path `/api/admin/content/work/<slug>` matches the Phase 1 route's `work` type mapping; `exec`/`td`/`InlineToolbar` (Task 1) are consumed by Task 2.

**Deferred to 2C (not gaps):** editing visuals (image/video swap+upload, zoom focus/annotations, bento lists), section add/remove/reorder, caption editing, and assisted migration of the interactive coded studies (Tactile Core) into JSON.
