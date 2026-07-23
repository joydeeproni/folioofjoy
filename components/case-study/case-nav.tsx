import Link from 'next/link';
import { getPrevNext } from './cases';

const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.4)';

// Previous / next case study, from the shared Cases order. Rendered at the
// bottom of each case study; shows only the arms that exist.
export function CaseNav({ slug }: { slug: string }) {
  const { prev, next } = getPrevNext(slug);
  if (!prev && !next) return null;

  return (
    <nav className="mx-auto flex w-full max-w-6xl items-start justify-between gap-8 border-t py-12 md:py-16" style={{ borderColor: 'rgba(237,234,224,0.1)' }}>
      {prev ? (
        <Link href={`/work/${prev.slug}`} className="group max-w-[45%]">
          <span className="font-mono uppercase tracking-widest text-[11px]" style={{ color: MUTED }}>
            ← Previous
          </span>
          <div className="mt-2 font-sans text-2xl md:text-3xl tracking-tight transition-opacity group-hover:opacity-70" style={{ color: FG }}>
            {prev.title}
          </div>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/work/${next.slug}`} className="group ml-auto max-w-[45%] text-right">
          <span className="font-mono uppercase tracking-widest text-[11px]" style={{ color: MUTED }}>
            Next →
          </span>
          <div className="mt-2 font-sans text-2xl md:text-3xl tracking-tight transition-opacity group-hover:opacity-70" style={{ color: FG }}>
            {next.title}
          </div>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
