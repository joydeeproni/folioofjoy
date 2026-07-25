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
