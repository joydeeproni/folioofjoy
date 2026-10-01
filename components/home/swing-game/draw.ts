import { graphScale } from '@/lib/swing-game/energy';

// Drawn in 2px "pixels" so the graph matches the site's pixel art.
const P = 2;

export function drawEnergyGraph(ctx: CanvasRenderingContext2D, samples: readonly number[], cols: number, rows: number) {
  const px = (x: number, y: number, w = 1, h = 1) => ctx.fillRect(x * P, y * P, w * P, h * P);
  ctx.clearRect(0, 0, cols * P, rows * P);
  ctx.fillStyle = '#1f3a2c';
  px(0, rows - 1, cols, 1); // baseline
  if (!samples.length) return;

  const scale = graphScale(samples);
  const yOf = (v: number) => rows - 2 - Math.round(Math.min(1, v / scale) * (rows - 6));

  ctx.fillStyle = '#43c779';
  let prev = yOf(samples[0]);
  samples.forEach((v, x) => { // stepped line
    const y = yOf(v);
    px(x, Math.min(prev, y), 1, Math.abs(prev - y) + 1);
    prev = y;
  });

  const head = samples.length - 1;
  let peak = 0;
  samples.forEach((v, i) => { if (v > samples[peak]) peak = i; });
  const dashed = (x: number, color: string) => {
    ctx.fillStyle = color;
    for (let y = 0; y < rows - 1; y += 3) px(x, y);
  };
  const ring = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    px(x - 1, y - 3, 3, 1); px(x - 1, y + 3, 3, 1); px(x - 3, y - 1, 1, 3); px(x + 3, y - 1, 1, 3);
    px(x - 2, y - 2); px(x + 2, y - 2); px(x - 2, y + 2); px(x + 2, y + 2); px(x, y);
  };
  if (peak !== head && samples[peak] > 1) { dashed(peak, '#3b4a52'); ring(peak, yOf(samples[peak]), '#f7eedc'); }
  dashed(head, '#4a6470');
  ring(head, yOf(samples[head]), '#7b93ff');
}

// Live trace of the swing's angle; the newest samples glow green.
export function drawSparkline(ctx: CanvasRenderingContext2D, trace: readonly number[]) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  const mid = height / 2;
  trace.forEach((angle, i) => {
    ctx.fillStyle = i > trace.length - 18 ? '#43c779' : '#2f6b66';
    ctx.fillRect(i, Math.round(mid - angle * 11), 1, 2);
  });
}
