import Link from 'next/link';
import { BackLink } from '@/components/back-link';
import { getWritingsList } from '@/lib/sanity/queries';

export const revalidate = 60;

const BG = '#0B0B0B';
const FG = '#EDEAE0';

export default async function Writings() {
  const WRITINGS = await getWritingsList();
  return (
    <main className="relative min-h-screen w-full px-8 md:px-16 py-10" style={{ backgroundColor: BG, color: FG }}>
      <BackLink />

      <div className="max-w-4xl mx-auto pt-28">
        <p className="font-mono uppercase tracking-[0.25em] text-xs mb-16" style={{ color: FG, opacity: 0.5 }}>
          Writings
        </p>
        <ul className="divide-y" style={{ borderColor: 'rgba(237,234,224,0.15)' }}>
          {WRITINGS.map((post) => (
            <li key={post.slug}>
              <Link href={`/writings/${post.slug}`} className="group flex items-baseline gap-6 py-8">
                <span className="font-pixel text-sm" style={{ color: FG, opacity: 0.5 }}>{post.number}</span>
                <span className="font-sans text-4xl md:text-6xl tracking-tight transition-opacity group-hover:opacity-70">
                  {post.title}
                </span>
                <span className="ml-auto font-mono uppercase tracking-widest text-[11px] self-center" style={{ opacity: 0.4 }}>
                  {post.postedOn}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
