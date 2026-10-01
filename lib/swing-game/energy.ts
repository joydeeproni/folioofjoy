// The HUD's "energy": each tap adds 1/τ and the total decays with time
// constant τ, so the value tracks taps per second and draws the jagged
// saw-tooth of real tapping without any smoothing tricks.
export const ENERGY_TAU_S = 0.3;
const MIN_GRAPH_SCALE = 14;

export const decay = (energy: number, dtSeconds: number) =>
  energy * Math.exp(-Math.max(0, dtSeconds) / ENERGY_TAU_S);

export const tapImpulse = (energy: number) => energy + 1 / ENERGY_TAU_S;

// Y-axis ceiling: a floor so slow runs don't look huge, headroom so fast runs never clip.
export const graphScale = (samples: readonly number[]) =>
  Math.max(MIN_GRAPH_SCALE, Math.max(0, ...samples) * 1.12);
