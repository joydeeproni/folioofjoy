'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { CaseStudyLayout } from '@/components/case-study/case-study-layout';
import { toVisual } from '@/components/case-study/to-visual';
import { CODED_REFS } from '@/components/case-study/coded-blocks';
import { td, InlineToolbar } from './inline-editing';
import type { CaseStudySection } from '@/components/case-study/types';
import type { EditableCaseStudy, EditableSection, EditableVisual } from '@/lib/content/editable';

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

const inputCls = 'bg-transparent border border-white/15 rounded px-2 py-1 text-xs text-[#EDEAE0]';

// Monotonic suffix so two adds in the same millisecond can't collide on id/key.
let _uid = 0;
const freshId = (prefix: string) => `${prefix}${Date.now()}-${_uid++}`;

type Patch = { heading?: string; bodyHtml?: string };
type SectionVisual = { visual: EditableVisual; caption?: string };

// Editable text for one section. Memoised so visual-panel edits (which re-render
// the parent) never reset the contentEditable text or move the cursor.
const SectionBody = memo(function SectionBody({ id, heading, body, onPatch }:
  { id: string; heading?: string; body: string; onPatch: (id: string, p: Patch) => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const inited = useRef(false);
  useEffect(() => {
    // Initialise the rich body exactly ONCE. Guarding on a ref (not just the memo)
    // means a future re-render can never re-run marked() and wipe unsaved edits.
    if (bodyRef.current && !inited.current) {
      inited.current = true;
      bodyRef.current.contentEditable = 'true';
      bodyRef.current.innerHTML = marked.parse(body ?? '', { async: false }) as string;
    }
  }, [body]);
  return (
    <div>
      {heading !== undefined && (
        <h2 contentEditable suppressContentEditableWarning
          onInput={(e) => onPatch(id, { heading: e.currentTarget.textContent ?? '' })}
          className="cs-edit font-sans font-medium text-2xl md:text-3xl tracking-tight mb-4" style={{ color: '#EDEAE0' }}>{heading}</h2>
      )}
      <div ref={bodyRef} className="cs-body max-w-none" style={{ color: '#EDEAE0' }}
        onInput={(e) => onPatch(id, { bodyHtml: e.currentTarget.innerHTML })} />
    </div>
  );
});

// Per-section visual control: pick the type, update the image, tweak crop /
// annotations / ascii / coded, and set the caption. Writes back to parent state
// so the sticky stage reflects the change live.
function VisualEditor({ value, onChange, slug }: { value: SectionVisual; onChange: (v: SectionVisual) => void; slug: string }) {
  const v = value.visual;
  const setVisual = (visual: EditableVisual) => onChange({ ...value, visual });
  const hasSrc = v.kind === 'image' || v.kind === 'video' || v.kind === 'zoom';
  const src = hasSrc ? v.src : '';
  const alt = v.kind === 'image' || v.kind === 'zoom' ? v.alt : v.kind === 'video' ? (v.alt ?? '') : '';
  const uiType = v.kind === 'zoom' ? (v.annotations ? 'annotation' : 'crop') : v.kind === 'video' ? 'image' : v.kind;

  async function upload(file: File) {
    const fd = new FormData(); fd.append('file', file); fd.append('slug', slug);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const { path } = await res.json();
      if (v.kind === 'image' || v.kind === 'video' || v.kind === 'zoom') setVisual({ ...v, src: path });
    }
  }

  function changeType(t: string) {
    if (t === 'image') setVisual({ kind: 'image', src, alt });
    else if (t === 'crop') setVisual({ kind: 'zoom', src, alt, focus: v.kind === 'zoom' && v.focus ? v.focus : { x: 0.5, y: 0.5, scale: 1.5 } });
    else if (t === 'annotation') setVisual({ kind: 'zoom', src, alt, focus: v.kind === 'zoom' ? v.focus : undefined, annotations: v.kind === 'zoom' && v.annotations ? v.annotations : [] });
    else if (t === 'ascii') setVisual({ kind: 'ascii', art: v.kind === 'ascii' ? v.art : '  edit this ascii art' });
    else if (t === 'coded') setVisual({ kind: 'coded', ref: v.kind === 'coded' ? v.ref : (CODED_REFS[0] ?? '') });
  }

  const focus = v.kind === 'zoom' ? (v.focus ?? { x: 0.5, y: 0.5, scale: 1 }) : { x: 0.5, y: 0.5, scale: 1 };

  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">Visual</span>
        <select value={uiType} onChange={(e) => changeType(e.target.value)} className={inputCls}>
          <option value="image">Image</option>
          <option value="crop">Crop (zoom)</option>
          <option value="annotation">Annotated</option>
          <option value="ascii">ASCII</option>
          <option value="coded">Coded</option>
        </select>
      </div>

      {hasSrc && (
        <div className="flex items-center gap-2 flex-wrap">
          <label className="cursor-pointer rounded bg-white/10 px-3 py-1 text-xs hover:bg-white/20">
            Update image
            <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
          <span className="font-mono text-[10px] opacity-40">{src ? src.split('/').pop() : 'no file'}</span>
        </div>
      )}

      {v.kind === 'zoom' && uiType === 'crop' && (
        <div className="flex items-center gap-2 text-xs">
          {(['x', 'y', 'scale'] as const).map((k) => (
            <label key={k} className="flex items-center gap-1">{k}
              <input type="number" step="0.05" value={focus[k]}
                onChange={(e) => setVisual({ ...v, focus: { ...focus, [k]: parseFloat(e.target.value) || 0 } })} className={`${inputCls} w-16`} />
            </label>
          ))}
        </div>
      )}

      {v.kind === 'zoom' && uiType === 'annotation' && (
        <div className="space-y-1">
          {(v.annotations ?? []).map((a, i) => (
            <div key={a.id} className="flex items-center gap-1 text-xs">
              <input value={a.label} placeholder="label" onChange={(e) => setVisual({ ...v, annotations: (v.annotations ?? []).map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} className={`${inputCls} flex-1`} />
              <input type="number" step="0.05" value={a.x} onChange={(e) => setVisual({ ...v, annotations: (v.annotations ?? []).map((x, j) => j === i ? { ...x, x: parseFloat(e.target.value) || 0 } : x) })} className={`${inputCls} w-14`} />
              <input type="number" step="0.05" value={a.y} onChange={(e) => setVisual({ ...v, annotations: (v.annotations ?? []).map((x, j) => j === i ? { ...x, y: parseFloat(e.target.value) || 0 } : x) })} className={`${inputCls} w-14`} />
              <button onClick={() => setVisual({ ...v, annotations: (v.annotations ?? []).filter((_, j) => j !== i) })} className="px-1 opacity-60 hover:opacity-100">✕</button>
            </div>
          ))}
          <button onClick={() => setVisual({ ...v, annotations: [...(v.annotations ?? []), { id: freshId('a'), x: 0.5, y: 0.5, label: 'new' }] })} className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20">+ annotation</button>
        </div>
      )}

      {v.kind === 'ascii' && (
        <textarea value={v.art} onChange={(e) => setVisual({ kind: 'ascii', art: e.target.value })} className="w-full h-32 font-mono text-xs bg-black/30 border border-white/10 rounded p-2 text-[#EDEAE0]" />
      )}

      {v.kind === 'coded' && (
        <select value={v.ref} onChange={(e) => setVisual({ kind: 'coded', ref: e.target.value })} className={inputCls}>
          {CODED_REFS.length === 0 && <option value="">(none registered)</option>}
          {CODED_REFS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      )}

      <input value={value.caption ?? ''} placeholder="Caption" onChange={(e) => onChange({ ...value, caption: e.target.value })} className={`${inputCls} w-full`} />
    </div>
  );
}

const ctrlBtn = 'rounded border border-white/15 px-2 py-0.5 text-xs text-[#EDEAE0]/70 hover:bg-white/10 disabled:opacity-25';

function newSection(): EditableSection {
  return { id: freshId('sec-'), eyebrow: '', heading: 'New section', body: 'Write here.', caption: '', visual: { kind: 'ascii', art: '  new visual' } };
}

export function CaseStudyEditor({ initial }: { initial: EditableCaseStudy }) {
  const [status, setStatus] = useState('');
  // Whole sections live in state so they can be added / removed / reordered. Text
  // edits still flow through the patches ref (keyed by id) — reordering keeps the
  // contentEditable content because React moves the keyed DOM node.
  const [secs, setSecs] = useState<EditableSection[]>(() => initial.sections);
  const patches = useRef<Record<string, Patch>>({});
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const footHeadRef = useRef<HTMLParagraphElement>(null);
  const footNoteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    for (const r of [titleRef, ledeRef, metaRef, footHeadRef, footNoteRef]) if (r.current) r.current.contentEditable = 'true';
  }, []);

  const onPatch = useCallback((id: string, p: Patch) => { patches.current[id] = { ...patches.current[id], ...p }; }, []);
  const setVisualAt = (i: number, nv: SectionVisual) => setSecs((xs) => xs.map((x, j) => (j === i ? { ...x, visual: nv.visual, caption: nv.caption } : x)));
  const move = (i: number, d: -1 | 1) => setSecs((xs) => {
    const j = i + d; if (j < 0 || j >= xs.length) return xs;
    const c = [...xs]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });
  const del = (i: number) => setSecs((xs) => xs.filter((_, j) => j !== i));
  const addBelow = (i: number) => setSecs((xs) => [...xs.slice(0, i + 1), newSection(), ...xs.slice(i + 1)]);

  const sections: CaseStudySection[] = secs.map((s, i) => ({
    id: s.id,
    act: s.act,
    caption: s.caption,
    body: (
      <>
        <div className="mb-3 flex items-center gap-1">
          <button className={ctrlBtn} onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</button>
          <button className={ctrlBtn} onClick={() => move(i, 1)} disabled={i === secs.length - 1} title="Move down">↓</button>
          <button className={ctrlBtn} onClick={() => del(i)} title="Delete section">✕</button>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-widest opacity-40">section {i + 1} / {secs.length}</span>
        </div>
        <SectionBody id={s.id} heading={s.heading} body={s.body} onPatch={onPatch} />
        <VisualEditor value={{ visual: s.visual, caption: s.caption }} onChange={(nv) => setVisualAt(i, nv)} slug={initial.slug} />
        <button className="mt-4 rounded-full border border-white/15 px-3 py-1 text-xs text-[#EDEAE0]/70 hover:bg-white/10" onClick={() => addBelow(i)}>+ add section below</button>
      </>
    ),
    visual: toVisual(s.visual),
  }));

  async function save() {
    setStatus('Saving…');
    const t = (r: React.RefObject<HTMLElement | null>) => r.current?.textContent?.trim() ?? '';
    const doc: EditableCaseStudy = {
      ...initial,
      header: { title: t(titleRef) || initial.header.title, lede: t(ledeRef), meta: t(metaRef) },
      sections: secs.map((s) => {
        const p = patches.current[s.id] ?? {};
        return {
          ...s,
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
