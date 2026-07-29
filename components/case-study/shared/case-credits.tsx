import { BG, MUTED } from './tokens';

// Shared credit line for case-study headers — an overlapping avatar stack
// (real, named people; square source images clipped to circles) followed by
// a mono meta line. No project-specific paths or names live here; everything
// arrives through props so this can be reused by every case study.

export type CreditPerson = { src: string; name: string };

export function CaseCredits({
  people,
  meta,
  className,
}: {
  people: CreditPerson[];
  meta: string;
  className?: string;
}) {
  return (
    <div className={`mt-8 flex items-center gap-4${className ? ` ${className}` : ''}`}>
      {/* shrink-0 on both the stack and each avatar is load-bearing: flex items
          shrink by default, so a long meta line competing for width squeezed the
          avatars horizontally and turned 24px circles into narrow ovals at
          smaller viewports. aspect-square pins the ratio regardless. */}
      {people.length > 0 && (
        <div className="flex shrink-0 -space-x-2">
          {people.map((p) => (
            <img
              key={p.src}
              src={p.src}
              alt={p.name}
              className="h-6 w-6 shrink-0 aspect-square rounded-full object-cover"
              style={{ border: `2px solid ${BG}` }}
            />
          ))}
        </div>
      )}
      <p className="font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
        {meta}
      </p>
    </div>
  );
}
