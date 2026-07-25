'use client';

import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import type { EditableArticle } from '@/lib/content/editable';
import { exec, td, InlineToolbar } from './inline-editing';

// Inline WYSIWYG article editor. The page renders exactly like the real writings
// article; the text is edited in place (contentEditable). Rich body ↔ markdown is
// round-tripped with marked (md→html for the editable surface) and turndown
// (html→md on save), so `content/writings/<slug>.json` stays clean markdown and
// the production renderer (react-markdown) is untouched.

const RULE = 'rgba(237,234,224,0.15)';

// Prose styles for the editable body — mirror components/content/markdown.tsx so
// the editing surface looks identical to production.
const BODY_CSS = `
.ce-body:focus, .editable:focus { outline: none; }
.ce-body p { font-size: 1.125rem; line-height: 1.7; margin-bottom: 1.5rem; }
.ce-body h2 { font-size: 1.875rem; font-weight: 500; letter-spacing: -0.02em; margin: 2.5rem 0 1.5rem; }
.ce-body h3 { font-size: 1.5rem; font-weight: 500; margin: 2rem 0 1rem; }
.ce-body ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
.ce-body ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
.ce-body li { margin-bottom: 0.5rem; }
.ce-body a { text-decoration: underline; text-underline-offset: 4px; }
.ce-body strong { font-weight: 600; }
.ce-body em { font-style: italic; }
.ce-body blockquote { margin: 2rem 0; padding-left: 1.25rem; border-left: 2px solid #2CA152; font-size: 1.5rem; line-height: 1.3; letter-spacing: -0.01em; }
.editable { border-radius: 4px; transition: background 0.15s; }
.editable:hover { background: rgba(255,255,255,0.03); }
.editable:empty::before { content: attr(data-ph); opacity: 0.35; }
`;

export function ArticleEditor({ initial }: { initial: EditableArticle }) {
  const [heroImage, setHeroImage] = useState(initial.heroImage ?? '');
  const [status, setStatus] = useState('');

  const titleRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLHeadingElement>(null);
  const titledRef = useRef<HTMLParagraphElement>(null);
  const postedRef = useRef<HTMLParagraphElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Turn on contentEditable via the DOM (React 19 doesn't reliably SSR the bare
  // attribute) and initialise the rich body once, client-side, to avoid mismatch.
  useEffect(() => {
    for (const r of [titleRef, subheadRef, titledRef, postedRef, bodyRef]) {
      if (r.current) r.current.contentEditable = 'true';
    }
    if (bodyRef.current) bodyRef.current.innerHTML = marked.parse(initial.body ?? '', { async: false }) as string;
  }, [initial.body]);

  async function save() {
    setStatus('Saving…');
    const doc: EditableArticle = {
      ...initial,
      heroImage,
      title: titleRef.current?.textContent?.trim() || initial.title,
      subhead: subheadRef.current?.textContent?.trim() ?? '',
      titled: titledRef.current?.textContent?.trim() ?? '',
      postedOn: postedRef.current?.textContent?.trim() ?? '',
      body: td.turndown(bodyRef.current?.innerHTML ?? ''),
    };
    const res = await fetch(`/api/admin/content/writings/${initial.slug}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(doc),
    });
    setStatus(res.ok ? 'Saved ✓ — commit + deploy to publish' : `Error ${res.status}`);
  }

  async function uploadHero(file: File) {
    const fd = new FormData();
    fd.append('file', file); fd.append('slug', initial.slug);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) setHeroImage((await res.json()).path);
  }

  return (
    <main className="relative min-h-dvh w-full px-6 md:px-16 pt-10 pb-24 bg-[#0B0B0B] text-[#EDEAE0] font-sans">
      <style dangerouslySetInnerHTML={{ __html: BODY_CSS }} />

      <InlineToolbar>
        {status && <span className="font-mono text-[11px] opacity-70">{status}</span>}
        <button onClick={save} className="rounded-full bg-[#2CA152] px-4 py-1.5 font-sans text-sm text-black">Save</button>
      </InlineToolbar>

      {/* The real article layout — everything below is edited in place */}
      <div className="max-w-5xl mx-auto pt-8">
        <div className="flex items-start gap-4">
          {initial.number && <span className="font-pixel text-base mt-3" style={{ opacity: 0.5 }}>{initial.number}</span>}
          <h1
            ref={titleRef} contentEditable suppressContentEditableWarning data-ph="Title"
            className="editable font-sans font-medium text-6xl md:text-8xl leading-[0.95] tracking-tight"
          >{initial.title}</h1>
        </div>

        {/* Hero */}
        <div className="mt-12">
          {heroImage
            ? <img src={heroImage} alt="" className="w-full rounded-lg" />
            : <div className="rounded-lg border border-dashed border-white/15 py-10 text-center font-mono text-[11px] uppercase tracking-widest opacity-40">no hero image</div>}
          <label className="mt-2 inline-block cursor-pointer font-mono text-[11px] uppercase tracking-widest opacity-50 hover:opacity-100">
            {heroImage ? 'replace image' : 'add image'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0])} />
          </label>
        </div>

        <hr className="my-12 border-0 border-t" style={{ borderColor: RULE }} />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2.4fr_1fr] gap-10 md:gap-12">
          {/* Left — meta (editable) */}
          <aside className="space-y-8">
            <div>
              <p className="font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>Titled</p>
              <p ref={titledRef} contentEditable suppressContentEditableWarning data-ph="—" className="editable font-sans mt-2">{initial.titled}</p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>{initial.type ? 'Type' : 'Posted on'}</p>
              <p ref={postedRef} contentEditable suppressContentEditableWarning data-ph="—" className="editable font-sans mt-2">{initial.type || initial.postedOn}</p>
            </div>
          </aside>

          {/* Center — subhead + body (editable) */}
          <div>
            <h2 ref={subheadRef} contentEditable suppressContentEditableWarning data-ph="Subhead" className="editable font-sans font-medium text-3xl mb-6 tracking-tight">{initial.subhead}</h2>
            <div ref={bodyRef} contentEditable suppressContentEditableWarning className="ce-body max-w-[66ch]" />
          </div>

          {/* Right — references (read-only in this pass) */}
          <aside>
            <p className="font-mono uppercase tracking-widest text-[11px] mb-4" style={{ opacity: 0.5 }}>Reference</p>
            <ul className="space-y-3">
              {initial.references.map((ref) => (
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
