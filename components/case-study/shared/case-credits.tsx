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
      {people.length > 0 && (
        <div className="flex -space-x-2">
          {people.map((p) => (
            <img
              key={p.src}
              src={p.src}
              alt={p.name}
              className="h-6 w-6 rounded-full object-cover"
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
