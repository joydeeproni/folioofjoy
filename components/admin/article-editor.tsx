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
