import type { ReactNode } from 'react';

// A callout pinned over a visual. Coordinates are 0–1 fractions of the visual's
// own box (the 16:9 frame for a zoom visual, the stage box otherwise). A dot
// sits at (x, y); its label reveals on hover (and is always shown on touch).
export type Annotation = {
  id: string;
  x: number;
  y: number;
  label: string;
  /** Which side of the dot the label sits on. Default 'top'. */
  side?: 'top' | 'bottom' | 'left' | 'right';
};

// A region of a zoom visual to frame. (x, y) is the 0–1 point that stays
// centered; scale is the zoom factor (1 = whole screen, 2 = twice as close).
export type Focus = { x: number; y: number; scale: number };

// What the right-hand stage shows while a section is active.
//
// `zoom` is the guided-tour visual: one wide screenshot stays mounted while
// consecutive sections that share its `src` pan/zoom it to different `focus`
// regions — an Apple-product-page walkthrough. Annotations pin to UI regions.
export type Visual =
  | { kind: 'image'; src: string; alt: string; fit?: 'contain' | 'cover' }
  | { kind: 'video'; src: string; poster?: string; alt?: string }
  | { kind: 'component'; render: () => ReactNode; annotations?: Annotation[]; bleed?: boolean }
  | { kind: 'zoom'; src: string; alt: string; focus?: Focus; annotations?: Annotation[] };

// One beat of the case study: prose on the left, a visual on the right.
export type CaseStudySection = {
  id: string;
  act?: string;
  eyebrow?: string;
  heading?: string;
  body: ReactNode;
  visual: Visual;
  /** Short label shown under the stage, tying the visual to this beat. */
  caption?: string;
};
