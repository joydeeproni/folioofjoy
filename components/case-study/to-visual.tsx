'use client';

// Maps an editable (data) visual to the runtime `Visual` the stage renders.
// Shared by the production CaseStudyRenderer and the admin CaseStudyEditor so the
// two never drift. `bento` / `coded` / `ascii` become interactive `component`s.

import { Bento } from './controls/bento';
import { AsciiPanel } from './controls/ascii-panel';
import { renderCoded } from './coded-blocks';
import type { Visual } from './types';
import type { EditableVisual } from '@/lib/content/editable';

export function toVisual(v: EditableVisual): Visual {
  switch (v.kind) {
    case 'image': return { kind: 'image', src: v.src, alt: v.alt, fit: v.fit };
    case 'video': return { kind: 'video', src: v.src, poster: v.poster, alt: v.alt };
    case 'zoom': return { kind: 'zoom', src: v.src, alt: v.alt, focus: v.focus, annotations: v.annotations };
    case 'bento': return { kind: 'component', render: () => <Bento columns={v.columns} images={v.images} /> };
    case 'coded': return { kind: 'component', render: () => renderCoded(v.ref) };
    case 'ascii': return { kind: 'component', render: () => <AsciiPanel art={v.art} /> };
  }
}
