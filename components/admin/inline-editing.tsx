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
