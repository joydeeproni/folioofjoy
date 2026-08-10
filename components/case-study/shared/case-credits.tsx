import type { ReactNode } from 'react';
import { BG, MUTED } from './tokens';

// Shared credit line for case-study headers — an overlapping avatar stack
// (real, named people; square source images clipped to circles) followed by
// a mono meta line. No project-specific paths or names live here; everything
// arrives through props so this can be reused by every case study.

export type CreditPerson = { src: string; name: string };

// The separator between credit segments. Non-breaking spaces so a segment never
// wraps away from its slashes — named rather than inlined because literal U+00A0
// bytes are invisible in an editor and get silently lost when a line is retyped.
export const SEP = '  //  ';

export function CaseCredits({
  people,
  meta,
  className,
}: {
  people: CreditPerson[];
  /** ReactNode, not string, so a segment can carry a link. */
  meta: ReactNode;
  className?: string;
}) {
  return (
    // items-start, not items-center: the meta line wraps to several lines at
    // narrow widths, and centring the whole row left the avatar floating in the
    // middle of the block. The avatar is instead nudged up to sit centred on the
    // FIRST line (see the negative margin below), which reads as centred on one
    // line and still hugs the top when the text wraps.
    <div className={`mt-8 flex items-start gap-4${className ? ` ${className}` : ''}`}>
      {/* shrink-0 on both the stack and each avatar is load-bearing: flex items
          shrink by default, so a long meta line competing for width squeezed the
          avatars horizontally and turned 24px circles into narrow ovals at
          smaller viewports. aspect-square pins the ratio regardless. */}
      {people.length > 0 && (
        <div
          className="flex shrink-0 -space-x-2"
          // Centres the 24px avatar on the meta line rather than top-aligning it,
          // which left it sitting 3.8px low. The meta is text-[11px] at the default
          // 1.5 line-height, so the line box is 16.5px and the correction is
          // (16.5 - 24) / 2. Recompute if that type size changes.
          style={{ marginTop: 'calc((16.5px - 1.5rem) / 2)' }}
        >
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
