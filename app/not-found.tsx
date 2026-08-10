import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-[#0B0B0B] px-6 py-10 text-[#EDEAE0] md:px-16">
      <div className="mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-6xl items-center gap-8 md:grid-cols-[0.72fr_1.28fr] md:gap-12">
        <section className="relative z-10 pt-10 md:pt-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#2CA152]">
            404 · Wrong turn
          </p>
          <h1 className="mt-5 max-w-[9ch] font-sans text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl">
            Lost at the fair.
          </h1>
          <p className="mt-6 max-w-[34ch] font-sans text-lg leading-relaxed text-[#EDEAE0]/65">
            This path doesn&rsquo;t lead anywhere. Let&rsquo;s get you back somewhere familiar.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center rounded-full border border-[#EDEAE0]/20 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors hover:border-[#2CA152] hover:bg-[#2CA152] hover:text-white"
          >
            Back to the entrance
          </Link>
        </section>

        <figure className="relative mx-auto aspect-[3/2] w-full max-w-[760px] overflow-hidden rounded-xl">
          <Image
            src="/404/lost-at-the-fair.png"
            alt="A lost child standing in the middle of a busy pixel-art country fair beside a 404 Lost sign"
            fill
            priority
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        </figure>
      </div>
    </main>
  );
}
