'use client';

import { CaseStudyLayout } from './case-study-layout';
import { toVisual } from './to-visual';
import { CaseStudyMarkdown } from '@/components/content/markdown';
import type { CaseStudySection } from './types';
import type { EditableCaseStudy } from '@/lib/content/editable';

export function CaseStudyRenderer({ data }: { data: EditableCaseStudy }) {
  const sections: CaseStudySection[] = data.sections.map((s) => ({
    id: s.id,
    act: s.act,
    eyebrow: s.eyebrow,
    heading: s.heading,
    caption: s.caption,
    body: <CaseStudyMarkdown source={s.body} />,
    visual: toVisual(s.visual),
  }));

  return (
    <CaseStudyLayout
      sections={sections}
      title={data.title}
      header={
        <header className="pt-24 pb-4 md:pt-16">
          <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight" style={{ color: '#EDEAE0' }}>{data.header.title}</h1>
          <p className="mt-6 max-w-[34ch] font-sans text-xl md:text-2xl leading-snug text-balance" style={{ color: '#EDEAE0' }}>{data.header.lede}</p>
          <p className="mt-6 font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>{data.header.meta}</p>
        </header>
      }
      footer={data.footer && (
        <footer className="py-16 md:py-24">
          <p className="font-sans text-2xl md:text-3xl tracking-tight text-balance" style={{ color: '#EDEAE0' }}>{data.footer.headline}</p>
          <p className="mt-4 max-w-[52ch] font-sans text-[15px] leading-relaxed" style={{ color: 'rgba(237,234,224,0.5)' }}>{data.footer.note}</p>
        </footer>
      )}
    />
  );
}
