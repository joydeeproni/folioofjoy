import { notFound } from 'next/navigation';
import { BackLink } from '@/components/back-link';
import { getWriting, getWritingSlugs } from '@/lib/sanity/queries';

export const revalidate = 60;

const BG = '#0B0B0B';
const FG = '#EDEAE0';
const RULE = 'rgba(237,234,224,0.15)';

export async function generateStaticParams() {
  const slugs = await getWritingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function WritingPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getWriting(slug);
  if (!post) notFound();

  return (
    <main className="relative min-h-dvh w-full px-6 md:px-16 pt-10 pb-[calc(2.5rem+var(--sab))]" style={{ backgroundColor: BG, color: FG }}>
      <BackLink href="/writings" />

      <div className="max-w-5xl mx-auto pt-24">
        {/* Big display title + pixel number */}
        <div className="flex items-start gap-4">
          <span className="font-pixel text-base mt-3" style={{ opacity: 0.5 }}>{post.number}</span>
          <h1 className="font-sans font-medium text-6xl md:text-8xl leading-[0.95] tracking-tight">{post.title}</h1>
        </div>

        {post.heroImage && (
          <img src={post.heroImage} alt="" className="w-full mt-12 rounded-lg" />
        )}

        <hr className="my-12 border-0 border-t" style={{ borderColor: RULE }} />

        {/* Three-column editorial grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2.4fr_1fr] gap-10 md:gap-12">
          {/* Left — meta */}
          <aside className="space-y-8">
            <div>
              <p className="font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>Titled</p>
              <p className="font-sans mt-2">{post.titled}</p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>
                {post.type ? 'Type' : 'Posted on'}
              </p>
              <p className="font-sans mt-2">{post.type || post.postedOn}</p>
            </div>
          </aside>

          {/* Center — body */}
          <article className="max-w-[66ch]">
            <h2 className="font-sans font-medium text-3xl mb-6 tracking-tight">{post.subhead}</h2>
            {post.body.map((para, i) => (
              <p
                key={i}
                className={`font-sans text-lg leading-relaxed mb-6 ${i === 0 ? 'first-letter:font-pixel first-letter:text-5xl first-letter:mr-2 first-letter:float-left first-letter:leading-none' : ''}`}
              >
                {para}
              </p>
            ))}
          </article>

          {/* Right — references */}
          <aside>
            <p className="font-mono uppercase tracking-widest text-[11px] mb-4" style={{ opacity: 0.5 }}>Reference</p>
            <ul className="space-y-3">
              {post.references.map((ref) => (
                <li key={ref.label}>
                  <a
                    href={ref.href}
                    className="font-sans underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
                    style={{ textDecorationColor: RULE }}
                  >
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
