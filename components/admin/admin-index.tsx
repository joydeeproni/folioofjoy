import Link from 'next/link';
import { CASES } from '@/components/case-study/cases';
import { LOCAL_WRITINGS } from '@/lib/writings/local';

const CARD = 'block rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-[#2CA152]/60 transition-colors';

export function AdminIndex() {
  return (
    <main className="min-h-dvh bg-[#0B0B0B] text-[#EDEAE0] px-6 md:px-16 py-16">
      <h1 className="font-sans font-medium text-4xl tracking-tight mb-2">Content editor</h1>
      <p className="font-mono text-[11px] uppercase tracking-widest opacity-50 mb-10">dev only · edits save to the repo</p>

      <section className="mb-12">
        <h2 className="font-mono text-[11px] uppercase tracking-widest opacity-50 mb-4">Writings</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {LOCAL_WRITINGS.map((w) => (
            <Link key={w.slug} href={`/admin/edit/writings/${w.slug}`} className={CARD}>
              <span className="font-sans">{w.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-widest opacity-50 mb-4">Case studies</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {CASES.map((c) => (
            <Link key={c.slug} href={`/admin/edit/work/${c.slug}`} className={CARD}>
              <span className="font-sans">{c.title}</span>
              <span className="font-mono text-[11px] opacity-40 ml-2">· Phase 2</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
