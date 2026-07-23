import { notFound } from 'next/navigation';
import { BackLink } from '@/components/back-link';
import { getCaseStudy, getCaseStudySlugs } from '@/components/case-study/registry';
import { CaseNav } from '@/components/case-study/case-nav';

const BG = '#0B0B0B';
const FG = '#EDEAE0';

// Full-bleed dark shell for scroll-driven case studies. Distinct from the padded
// writings shell — the two-column stage layout manages its own width.
const SHELL = 'relative min-h-dvh w-full px-6 md:px-16 pb-[calc(2.5rem+var(--sab))]';

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const { Component } = study;

  return (
    <main className={SHELL} style={{ backgroundColor: BG, color: FG }}>
      <BackLink href="/writings" />
      <Component />
      <CaseNav slug={slug} />
    </main>
  );
}
