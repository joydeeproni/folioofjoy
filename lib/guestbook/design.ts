// Every tunable number in the stamp and the notebook, in one place.
//
// Production renders STAMP_DEFAULTS / NOTEBOOK_DEFAULTS. The dev-only stamp lab
// (/admin/stamp-lab) feeds overrides in from dialkit, so the design can be tuned
// live without forking the SVG — whatever looks right in the lab gets pasted back
// into these defaults.

export interface StampDesign {
  /** Outer ring radius in the 0–100 viewBox. */
  outerR: number;
  outerW: number;
  /** Inner ring radius; the text band sits between the two. */
  innerR: number;
  innerW: number;
  /** Baseline radii for the two text arcs. Top grows outward, bottom inward. */
  topArcR: number;
  bottomArcR: number;
  /** Base font size for a short greeting, before per-script scaling. */
  arcSize: number;
  placeSize: number;
  dateSize: number;
  /** Vertical position of the date line. */
  dateY: number;
  /** The two hairlines bracketing the date. */
  ruleGap: number;
  ruleInset: number;
  ruleW: number;
  /** Ink distress: ring filter and text filter. */
  inkFreq: number;
  inkOctaves: number;
  inkScale: number;
  textInkFreq: number;
  textInkScale: number;
  opacity: number;
  blend: string;
  /** Stamp footprint as a fraction of the page width. */
  sizePct: number;
  /** Max absolute rotation applied when a stamp is pressed. */
  rotJitter: number;
}

export const STAMP_DEFAULTS: StampDesign = {
  outerR: 47,
  outerW: 1.6,
  innerR: 31.5,
  innerW: 1.1,
  topArcR: 36,
  bottomArcR: 42.5,
  arcSize: 10,
  placeSize: 10,
  dateSize: 7.6,
  dateY: 52.2,
  ruleGap: 7,
  ruleInset: 26,
  ruleW: 0.8,
  inkFreq: 0.62,
  inkOctaves: 4,
  inkScale: 1.6,
  textInkFreq: 0.9,
  textInkScale: 0.9,
  opacity: 0.95,
  blend: 'screen',
  sizePct: 19,
  rotJitter: 16,
};

export interface NotebookDesign {
  /** Page aspect (width / height) for one leaf. */
  leafAspect: number;
  /** Perspective depth in px; lower = stronger 3D. */
  perspective: number;
  /** Whole-spread tilt back, in degrees. */
  tiltX: number;
  /** How far each leaf rotates toward the viewer at the spine. */
  leafRotY: number;
  /** Outer corner rounding, px. */
  cornerRadius: number;
  /** Dot grid pitch and dot radius, px. */
  dotPitch: number;
  dotRadius: number;
  dotOpacity: number;
  /** Page surface colour and the gutter shadow that fakes page curvature. */
  pageColor: string;
  gutterWidth: number;
  gutterDark: number;
  /** Bright line right at the fold. */
  spineHighlight: number;
  /** Stacked page edges visible past the outer margins. */
  stackCount: number;
  stackOffset: number;
  /** Drop shadow under the book. */
  shadowBlur: number;
  shadowOpacity: number;
  shadowY: number;
  /** Page-turn duration, seconds. */
  turnDuration: number;
}

export const NOTEBOOK_DEFAULTS: NotebookDesign = {
  leafAspect: 0.74,
  perspective: 2200,
  tiltX: 6,
  leafRotY: 3.5,
  cornerRadius: 10,
  dotPitch: 22,
  dotRadius: 1.15,
  dotOpacity: 0.17,
  pageColor: '#0E0E0E',
  gutterWidth: 13,
  gutterDark: 0.72,
  spineHighlight: 0.06,
  stackCount: 3,
  stackOffset: 4,
  shadowBlur: 60,
  shadowOpacity: 0.62,
  shadowY: 26,
  turnDuration: 0.75,
};
