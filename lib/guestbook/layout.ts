import {
  NOTEBOOK_DEFAULTS,
  STAMP_DEFAULTS,
  type NotebookDesign,
  type StampDesign,
} from './design';

// SVG filters can move the outermost ink by a small amount. This padding keeps
// that distressed edge on the paper too, rather than only keeping the stamp's
// unfiltered square inside it.
const INK_BLEED = 0.01;

const finiteOrCentre = (value: number) => (Number.isFinite(value) ? value : 0.5);

/**
 * Keep the complete rotated stamp footprint inside the notebook spread.
 *
 * Stamp size is expressed as a percentage of the spread width, while y is a
 * fraction of its height. Converting the vertical margin through the spread's
 * aspect ratio is the important part — a 19%-wide square occupies roughly 28%
 * of this comparatively shallow notebook's height.
 */
export function safeStampPosition(
  x: number,
  y: number,
  rotation: number,
  stampDesign: StampDesign = STAMP_DEFAULTS,
  notebookDesign: NotebookDesign = NOTEBOOK_DEFAULTS,
): { x: number; y: number } {
  const radians = (rotation * Math.PI) / 180;
  const rotatedSquare = Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians));
  const halfStampWidth = ((stampDesign.sizePct / 100) * rotatedSquare) / 2;
  const spreadAspect = notebookDesign.leafAspect * 2;

  const marginX = Math.min(0.49, halfStampWidth + INK_BLEED);
  const marginY = Math.min(0.49, halfStampWidth * spreadAspect + INK_BLEED);

  return {
    x: Math.min(1 - marginX, Math.max(marginX, finiteOrCentre(x))),
    y: Math.min(1 - marginY, Math.max(marginY, finiteOrCentre(y))),
  };
}
