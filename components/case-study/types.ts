import type { ReactNode } from 'react';

// A callout pinned over an interactive visual. Coordinates are 0–1 fractions of
// the stage box. Reserved for the future Lounge-panel showcase — the type ships
// now so the framework is ready; the overlay UI is not built in this pass.
export type Annotation = {
  id: string;
  x: number;
  y: number;
  label: string;
};

// What the right-hand stage shows while a section is active.
export type Visual =
  | { kind: 'image'; src: string; alt: string; fit?: 'contain' | 'cover' }
  | { kind: 'video'; src: string; poster?: string; alt?: string }
  | { kind: 'component'; render: () => ReactNode; annotations?: Annotation[] };

// One beat of the case study: prose on the left, a visual on the right.
export type CaseStudySection = {
  id: string;
  act?: string;
  eyebrow?: string;
  heading?: string;
  body: ReactNode;
  visual: Visual;
};
