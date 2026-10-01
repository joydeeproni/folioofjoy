import { WARMUP_TAPS } from '@/lib/swing-game/rules';

// Five squares under the swing that fill yellow per warm-up tap.
export function WarmupDots({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span aria-hidden="true" className="pointer-events-none absolute bottom-[4%] left-1/2 flex -translate-x-1/2 gap-1">
      {Array.from({ length: WARMUP_TAPS }, (_, i) => (
        <i key={i} className={`block h-1.5 w-1.5 ${i < count ? 'bg-[#f4c51b]' : 'bg-white/20'}`} />
      ))}
    </span>
  );
}
