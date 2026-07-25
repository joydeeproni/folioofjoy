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
