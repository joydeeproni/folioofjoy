import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { WRITINGS } from '@/lib/writings';

const BG = '#0B0B0B';
const FG = '#EDEAE0';

export default function Writings() {
  return (
    <main className="relative min-h-screen w-full px-8 md:px-16 py-10" style={{ backgroundColor: BG, color: FG }}>
      <Link
        href="/"
        aria-label="Back home"
        className="fixed top-6 left-6 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-black hover:bg-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

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
