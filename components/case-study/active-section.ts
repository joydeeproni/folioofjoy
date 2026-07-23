// Pure decision logic for the scroll-driven case study layout: given where each
// section currently sits relative to the viewport, decide which one is "active"
// (and therefore which visual the right-hand stage should show). No DOM, no
// React — deterministic and unit-testable.

export type SectionTop = {
  /** The section's index in the ordered list. */
  index: number;
  /** The section's top edge, in px from the top of the viewport (getBoundingClientRect().top). */
  top: number;
};

/**
 * Pick the active section index.
 *
 * A section becomes active once its top edge has scrolled up past the
 * activation line (a fraction of the viewport height). Among all sections that
 * have crossed the line, the furthest-scrolled one (highest index) wins. Before
 * any section has crossed — i.e. we're still above the first one — the earliest
 * section is active.
 */
export function pickActiveSection(
  sections: SectionTop[],
  viewportHeight: number,
  activationLine = 0.4,
): number {
  if (sections.length === 0) return 0;
  const line = viewportHeight * activationLine;
  const crossed = sections.filter((s) => s.top <= line);
  if (crossed.length > 0) {
    return crossed.reduce((max, s) => (s.index > max ? s.index : max), crossed[0].index);
  }
  return sections.reduce((min, s) => (s.index < min ? s.index : min), sections[0].index);
}
