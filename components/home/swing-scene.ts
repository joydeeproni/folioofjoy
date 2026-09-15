// A new articulated 3D scene, drawn with an orthographic pixel renderer.
// World axes: X along the beam, Y forward, Z up.
type V = [number, number, number];
type Face = { points: V[]; color: number };

const C = {
  red: '#e83c35', redDark: '#b32c30', purple: '#674198', purpleDark: '#40275f',
  yellow: '#f4c51b', cream: '#efe4ce', tan: '#c5b496', skin: '#ab5733', skinLight: '#be704a',
  hair: '#18151b', screen: '#101c1b', green: '#43c779', white: '#f7eedc', sole: '#302834',
};
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V): V => mul(a, 1 / (Math.hypot(...a) || 1));
const mix = (a: V, b: V, t: number): V => add(a, mul(sub(b, a), t));
const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));
const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };

// Orbit down toward the floor around the model's ground origin, retaining the
// original diagonal heading. An orthonormal camera preserves world proportions.
const ELEVATION = 16 * Math.PI / 180;
const VIEW: V = [Math.cos(ELEVATION) * Math.SQRT1_2, Math.cos(ELEVATION) * Math.SQRT1_2, Math.sin(ELEVATION)];
const RIGHT: V = [Math.SQRT1_2, -Math.SQRT1_2, 0];
const DOWN: V = [Math.sin(ELEVATION) * Math.SQRT1_2, Math.sin(ELEVATION) * Math.SQRT1_2, -Math.cos(ELEVATION)];
const project = (point: V): V => [
  160 + dot(point, RIGHT) * 1.14,
  199 + dot(point, DOWN) * 1.14,
  dot(point, VIEW),
];

export type PushEffect = { age: number; angle: number };

// Two fixed-length bones meet at a joint; the pole controls the bend direction.
function joint(start: V, target: V, upper: number, lower: number, pole: V) {
  const direction = unit(sub(target, start));
  const distance = clamp(Math.hypot(...sub(target, start)), Math.abs(upper - lower) + 0.01, upper + lower - 0.01);
  const end = add(start, mul(direction, distance));
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance);
  const bend = unit(sub(pole, mul(direction, dot(pole, direction))));
  const elbow = add(add(start, mul(direction, along)), mul(bend, Math.sqrt(Math.max(0, upper * upper - along * along))));
  return { elbow, end };
}

const shadeCache = new Map<string, number>();
function shade(color: string, light: number) {
  const level = Math.round(light * 24) / 24;
  const key = `${color}:${level}`;
  const cached = shadeCache.get(key);
  if (cached !== undefined) return cached;
  const value = parseInt(color.slice(1), 16);
  const rgb = [value >> 16, (value >> 8) & 255, value & 255]
    .map(c => Math.min(255, Math.round(c * level)));
  const result = (255 << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0];
  shadeCache.set(key, result);
  return result;
}

const renderBuffers = new WeakMap<CanvasRenderingContext2D, {
  image: ImageData; pixels: Uint32Array; depth: Float32Array;
}>();

class Scene {
  faces: Face[] = [];

  face(points: V[], color: string, unlit = false) {
    const n = unit(cross(sub(points[1], points[0]), sub(points[2], points[0])));
    if (dot(n, VIEW) <= 0.001) return;
    this.faces.push({ points, color: shade(color, unlit ? 1 : 0.83 + 0.19 * n[2] + 0.07 * n[1] - 0.12 * n[0]) });
  }

  solid(v: V[], color: string) {
    for (const indices of [[4, 5, 6, 7], [3, 7, 6, 2], [1, 2, 6, 5], [0, 4, 7, 3], [0, 1, 5, 4], [0, 3, 2, 1]]) {
      this.face(indices.map(i => v[i]), color);
    }
  }

  box(center: V, size: V, color: string) {
    const [x, y, z] = size.map(n => n / 2);
    this.solid([
      [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
      [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
    ].map(v => add(center, v as V)), color);
  }

  bar(start: V, end: V, width: number, depth: number, color: string) {
    const axis = unit(sub(end, start));
    const guide: V = Math.abs(axis[0]) < 0.85 ? [1, 0, 0] : [0, 1, 0];
    const u = mul(unit(sub(guide, mul(axis, dot(guide, axis)))), width / 2);
    const v = mul(cross(axis, unit(u)), depth / 2);
    this.solid([start, end].flatMap(p => [
      sub(sub(p, u), v), sub(add(p, u), v), add(add(p, u), v), add(sub(p, u), v),
    ]), color);
  }

  profile(center: V, outline: [number, number][], depth: number, color: string) {
    const back = outline.map(([x, z]): V => add(center, [x, -depth / 2, z]));
    const front = outline.map(([x, z]): V => add(center, [x, depth / 2, z]));
    this.face(front, color);
    this.face([...back].reverse(), color);
    for (let i = 0; i < front.length; i++) {
      const j = (i + 1) % front.length;
      this.face([back[j], front[j], front[i], back[i]], color);
    }
  }

  front(center: V, width: number, height: number, color: string) {
    const [x, y, z] = center;
    this.face([[x - width / 2, y, z - height / 2], [x - width / 2, y, z + height / 2],
      [x + width / 2, y, z + height / 2], [x + width / 2, y, z - height / 2]], color, true);
  }

  paint(ctx: CanvasRenderingContext2D) {
    let buffers = renderBuffers.get(ctx);
    if (!buffers) {
      const image = ctx.createImageData(320, 260);
      buffers = { image, pixels: new Uint32Array(image.data.buffer), depth: new Float32Array(320 * 260) };
      renderBuffers.set(ctx, buffers);
    }
    const { image, pixels, depth } = buffers;
    pixels.fill(0);
    depth.fill(-Infinity);
    // Per-pixel depth resolves the hands, ropes and facial details correctly.
    // No scaling of flat artwork, antialiasing, or face-order approximations.
    for (const face of this.faces) {
      const p = face.points.map(project);
      for (let i = 1; i < p.length - 1; i++) {
        const [a, b, c] = [p[0], p[i], p[i + 1]];
        const area = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
        if (Math.abs(area) < 0.0001) continue;
        const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
        const maxX = Math.min(319, Math.ceil(Math.max(a[0], b[0], c[0])));
        const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
        const maxY = Math.min(259, Math.ceil(Math.max(a[1], b[1], c[1])));
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            const wa = ((b[1] - c[1]) * (x + 0.5 - c[0]) + (c[0] - b[0]) * (y + 0.5 - c[1])) / area;
            const wb = ((c[1] - a[1]) * (x + 0.5 - c[0]) + (a[0] - c[0]) * (y + 0.5 - c[1])) / area;
            const wc = 1 - wa - wb;
            if (wa < -1e-7 || wb < -1e-7 || wc < -1e-7) continue;
            const d = wa * a[2] + wb * b[2] + wc * c[2];
            const index = y * 320 + x;
            // Shared clothing/limb surfaces can be coplanar. Allow for the
            // Float32 depth rounding so those ties resolve consistently in
            // drawing order instead of flickering between individual pixels.
            if (d >= depth[index] - 0.0001) {
              depth[index] = d;
              pixels[index] = face.color;
            }
          }
        }
      }
    }
    ctx.putImageData(image, 0, 0);
  }

}

const clipped = (w: number, h: number, c: number): [number, number][] => [
  [-w / 2 + c, -h / 2], [-w / 2, -h / 2 + c], [-w / 2, h / 2 - c], [-w / 2 + c, h / 2],
  [w / 2 - c, h / 2], [w / 2, h / 2 - c], [w / 2, -h / 2 + c], [w / 2 - c, -h / 2],
];

function frame(s: Scene) {
  for (const x of [-126, 126]) {
    for (const y of [-48, 48]) {
      s.bar([x, y, 3], [x, 0, 130], 7, 7, C.purple);
      s.box([x, y, 2], [11, 11, 4], C.purpleDark);
    }
    s.bar([x, -29, 49], [x, 29, 49], 4, 4, C.purpleDark);
    s.box([x, 0, 130], [13, 13, 11], C.yellow);
  }
  s.box([0, 0, 132], [259, 10, 9], C.red);
  for (const x of [-130, 130]) s.box([x, 0, 132], [8, 12, 11], C.yellow);
  for (const x of [-27, 27]) s.box([x, 0, 127], [5, 7, 5], C.tan);
}

function computer(s: Scene, center: V) {
  s.profile(center, clipped(38, 33, 3), 28, C.cream);
  const front = center[1] + 14.15;
  s.profile([center[0], front, center[2] + 2], clipped(29, 23, 2), 0.2, C.screen);
  for (const x of [-7, 7]) {
    s.front([center[0] + x, front + 0.2, center[2] + 6], 3, 5, C.green);
    s.front([center[0] + x, front + 0.22, center[2] + 7.5], 1, 1, '#93e6a3');
  }
  for (const [x, z, w, h] of [[-8, -2, 2, 4], [-6, -5, 3, 2], [0, -6, 10, 2], [6, -5, 3, 2], [8, -2, 2, 4]]) {
    s.front([center[0] + x, front + 0.2, center[2] + z], w, h, C.green);
  }
  for (const x of [-11, -5]) s.front([center[0] + x, front + 0.2, center[2] - 12], 3, 3, C.tan);
  s.front([center[0] + 11, front + 0.2, center[2] - 12], 2, 2, C.green);
  for (let i = 0; i < 4; i++) {
    const x = center[0] + 19.05, y = center[1] - 7 + i * 3;
    s.face([[x, y, center[2] - 5], [x, y + 1.3, center[2] - 5],
      [x, y + 1.3, center[2] + 6], [x, y, center[2] + 6]], C.tan, true);
  }
}

function rider(s: Scene, angle: number, velocity: number) {
  const length = 102;
  const y = length * Math.sin(angle);
  const z = 127 - length * Math.cos(angle);
  s.box([0, y, z - 2.5], [60, 21, 5], C.red);
  s.box([0, y, z - 5], [56, 18, 2], C.redDark);
  s.box([0, y, z + 5], [29, 19, 9], C.purpleDark);
  s.profile([0, y, z + 19], clipped(29, 29, 3), 17, C.red);
  computer(s, [0, y, z + 49]);

  for (const side of [-1, 1]) {
    const anchor: V = [side * 27, 0, 127];
    const attachment: V = [side * 27, y, z];
    const hand = mix(anchor, attachment, 0.67);
    s.bar(anchor, attachment, 2.2, 2.2, C.yellow);
    const shoulder: V = [side * 14, y, z + 28];
    const { elbow } = joint(shoulder, hand, 12, 12, [0, 0, -1]);
    s.bar(shoulder, elbow, 8, 8, C.red);
    s.bar(elbow, hand, 6, 6, C.red);
    s.box(hand, [7, 7, 7], C.red);
    s.box(add(hand, [0, 2.5, -1]), [6, 2, 2], C.redDark);

    const hip: V = [side * 9, y + 3, z + 3];
    const extension = clamp(velocity * 2, -2.5, 2.5);
    const { elbow: knee, end: ankle } = joint(hip, [side * 11, y + 36 + extension, z - 14], 20, 22, [0, 1, 0]);
    s.bar(hip, knee, 12, 12, C.purple);
    s.box(knee, [12, 12, 11], C.purple);
    s.bar(knee, ankle, 10, 10, C.purple);
    s.box(add(ankle, [0, 3, -2]), [12, 17, 8], C.white);
    s.box(add(ankle, [0, 4, -5]), [12, 18, 3], C.sole);
    s.box(add(ankle, [0, -1, 1.5]), [9, 7, 2], C.sole);
  }
  return { y, z };
}

function kid(s: Scene, seat: { y: number; z: number }) {
  const reach = smooth((-seat.y - 6) / 15);
  // Stand behind the swing's path. Yield with the upper body on deep returns,
  // keeping both feet planted and the head clear of the computer casing.
  const lean = reach * 3 - smooth((-seat.y - 24) / 21) * 15;
  const x = -6, y = -64;
  for (const side of [-1, 1]) {
    const hip: V = [x + side * 7, y, 31];
    const knee: V = [x + side * 8, y + side * 3, 18];
    const ankle: V = [x + side * 9, y + side * 4, 6];
    s.bar(hip, knee, 9, 10, C.skin);
    s.bar(knee, ankle, 7, 8, C.skin);
    s.box(add(ankle, [0, 3, -2]), [12, 18, 7], C.white);
    s.box(add(ankle, [0, 4, -5]), [12, 18, 2.5], C.sole);
    s.box(add(ankle, [0, -2, 2]), [9, 7, 3], C.sole);
    s.box(add(hip, [0, 0, 0]), [12, 16, 12], C.purple);
  }
  s.bar([x, y, 33], [x, y + lean, 56], 26, 17, C.yellow);
  const head: V = [x, y + lean, 72];
  s.profile(head, clipped(25, 27, 4), 19, C.skin);
  for (const side of [-1, 1]) s.box(add(head, [side * 13, 0, -1]), [5, 6, 8], C.skin);
  s.box(add(head, [0, -1, 12]), [28, 22, 7], C.hair);
  for (const [hx, hy, hz, size] of [[-11, 0, 13, 8], [-5, -3, 16, 9], [4, -3, 16, 9], [11, -1, 13, 8], [-9, 8, 9, 7], [-2, 9, 10, 6], [9, 8, 10, 5]]) {
    s.box(add(head, [hx, hy, hz]), [size, size, size], C.hair);
  }
  const front = head[1] + 9.65;
  for (const side of [-1, 1]) {
    s.front([head[0] + side * 6, front, head[2] + 2], 3, 4, C.hair);
    s.front([head[0] + side * 6 - 0.5, front + 0.02, head[2] + 3], 1, 1, C.white);
    s.front([head[0] + side * 6, front, head[2] + 7], 5, 2, C.hair);
    // Open rectangular frames leave the eyes visible inside each lens.
    const lensX = head[0] + side * 6;
    for (const dz of [-2, 6]) s.front([lensX, front + 0.3, head[2] + dz], 11, 2, C.hair);
    for (const dx of [-4.5, 4.5]) s.front([lensX + dx, front + 0.3, head[2] + 2], 2, 8, C.hair);
    s.front([lensX - 2, front + 0.32, head[2] + 4], 2, 1, C.cream);
    s.bar([head[0] + side * 11, front, head[2] + 3],
      [head[0] + side * 13, head[1] - 1, head[2] + 2], 1.8, 1.8, C.hair);
  }
  s.front([head[0], front + 0.35, head[2] + 3], 4, 2, C.hair);
  s.box([head[0], front + 0.5, head[2] - 1], [3, 2, 3], C.skin);
  s.profile([head[0], front + 0.2, head[2] - 7], clipped(11, 6, 2), 0.2, '#542522');
  s.front([head[0], front + 0.4, head[2] - 5.5], 9, 2, C.white);

  for (const side of [-1, 1]) {
    const shoulder: V = [x + side * 13, y + lean, 55];
    const rest: V = [x + side * 20, y + 22, 43];
    // Palms meet the rear side edges below the rider's shoulders, away from
    // the rope grips. Separate outward elbow poles keep the arms uncrossed.
    const contact: V = [side * 17.5, seat.y - 6, seat.z + 22];
    const { elbow, end: hand } = joint(shoulder, mix(rest, contact, reach), 19, 19, [side, 0, -0.35]);
    const sleeve = mix(shoulder, elbow, 0.43);
    s.bar(shoulder, sleeve, 10, 10, C.yellow);
    s.bar(sleeve, elbow, 7, 7, C.skin);
    s.box(elbow, [7, 7, 7], C.skin);
    s.bar(elbow, hand, 6, 6, C.skin);
    s.box(hand, [7, 7, 7], C.skin);
    s.box(add(hand, [side * 2.5, 1, 1]), [2, 4, 4], C.skinLight);
  }
}

export function paintSwingScene(ctx: CanvasRenderingContext2D, angle: number, velocity: number, effect?: PushEffect) {
  const scene = new Scene();
  frame(scene);
  const seat = rider(scene, angle, velocity);
  kid(scene, seat);
  scene.paint(ctx);
  if (effect && effect.age < 0.6) {
    const t = effect.age / 0.6;
    const [x, y] = project([0, 102 * Math.sin(effect.angle), 137 - 102 * Math.cos(effect.angle)]);
    for (let i = 0; i < 8; i++) {
      const direction = i * Math.PI / 4;
      const radius = 19 + 35 * (1 - (1 - t) ** 2);
      const size = t < 0.55 ? 3 : 2;
      ctx.fillStyle = [C.yellow, C.cream, C.green][i % 3];
      const px = Math.round(x + Math.cos(direction) * radius);
      const py = Math.round(y + Math.sin(direction) * radius * 0.65 - t * 9);
      ctx.fillRect(px, py, size, size);
      if (i % 2 === 0 && t < 0.4) {
        ctx.fillRect(px - 2, py + 1, size + 4, 1);
        ctx.fillRect(px + 1, py - 2, 1, size + 4);
      }
    }
  }
}
