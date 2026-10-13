// What makes a vector stamp read as a rubber stamp pressed by hand. Real
// impressions have four tells, and the filter adds each one:
//
//   1. Rough edges — the rubber and the paper fibres break every line up a little.
//   2. Uneven pressure — one side of the stamp lands harder, so the ink fades in
//      broad, soft patches rather than uniformly.
//   3. Starved speckle — small voids where the pad didn't wet the rubber.
//   4. Bleed — ink wicks a fraction into the paper around every stroke.
//
// Every press gets its own seed, so no two impressions of one design match. All
// work happens in the stamp's 0–100 user space, so the texture scales with the
// stamp instead of staying fixed in screen pixels.

export interface InkSettings {
  /** Edge roughness, in viewBox units of displacement. */
  rough: number;
  /** 0 = even pressure everywhere, 1 = whole regions can drop to almost nothing. */
  pressure: number;
  /** 0 = solid ink, 1 = heavily starved. */
  speckle: number;
  /** Strength of the soft halo around strokes. */
  bleed: number;
}

export const INK_DEFAULTS: InkSettings = { rough: 1.1, pressure: 0.5, speckle: 0.45, bleed: 0.35 };

const PRESSURE_FLOOR = 0.4;

export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function InkFilter({ id, seed, ink = INK_DEFAULTS }: { id: string; seed: number; ink?: InkSettings }) {
  const s = seed % 997;
  // Pressure: low-frequency noise mapped to alpha. The fractal noise channel
  // sits around 0.5, so scaling it up hard and offsetting yields big soft
  // patches from full strength down to faint.
  // alpha = 1 + gain × (noise − threshold), so noise below the threshold fades.
  const pGain = 2 + ink.pressure * 5;
  const pOffset = 1 - pGain * (0.36 + 0.12 * ink.pressure);
  // Speckle: higher-frequency noise; only its peaks drop out, as voids.
  // alpha = 1 + gain × (threshold − noise).
  const sGain = 4 + ink.speckle * 14;
  const sOffset = 1 + sGain * (0.72 - 0.14 * ink.speckle);
  // Pressure varies in a direction per seed, so the "heavy" side moves around.
  const freqX = 0.012 + (s % 7) * 0.003;
  const freqY = 0.012 + (s % 5) * 0.003;

  return (
    <filter
      id={id}
      x="-5"
      y="-5"
      width="110"
      height="110"
      filterUnits="userSpaceOnUse"
      primitiveUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={s} result="edgeNoise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="edgeNoise"
        scale={ink.rough}
        xChannelSelector="R"
        yChannelSelector="G"
        result="rough"
      />

      <feTurbulence type="fractalNoise" baseFrequency={`${freqX} ${freqY}`} numOctaves="2" seed={s + 11} result="press" />
      <feColorMatrix
        in="press"
        type="matrix"
        values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${pGain} 0 0 0 ${pOffset}`}
        result="pressRaw"
      />
      {/* Never let pressure take a region below ~40% — a real stamp fades, it
          doesn't lose whole words. */}
      <feComponentTransfer in="pressRaw" result="pressA">
        <feFuncA type="linear" slope={1 - PRESSURE_FLOOR} intercept={PRESSURE_FLOOR} />
      </feComponentTransfer>

      <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves="2" seed={s + 23} result="grain" />
      <feColorMatrix
        in="grain"
        type="matrix"
        values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-sGain} 0 0 0 ${sOffset}`}
        result="grainA"
      />

      {/* mask alpha = pressure × speckle */}
      <feComposite in="pressA" in2="grainA" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="mask" />
      <feComposite in="rough" in2="mask" operator="in" result="inked" />

      <feMorphology in="inked" operator="dilate" radius="0.18" result="fat" />
      <feGaussianBlur in="fat" stdDeviation="0.35" result="halo" />
      <feComponentTransfer in="halo" result="bleed">
        <feFuncA type="linear" slope={ink.bleed} />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="bleed" />
        <feMergeNode in="inked" />
      </feMerge>
    </filter>
  );
}
