'use client';

import { useEffect, useRef } from 'react';

export type VisualizerMode = 'terrain' | 'dither' | 'waveform' | 'rings' | 'bloom';

interface VisualizerProps {
  analyserRef: React.RefObject<AnalyserNode | null>;
  mode: VisualizerMode;
  hue: number;
  saturation: number;
  isPlaying: boolean;
}

interface TerrainState {
  rows: Float32Array[];      // rolling buffer of waveform snapshots
  age: number[];             // age of each row (frame counter)
  size: number;              // ring buffer capacity
  head: number;              // next write index
  pushTimer: number;         // ms accumulator for push cadence
  noiseSeed: number[];       // per-column noise offsets so idle still looks alive
}

// 8x8 Bayer matrix for ordered dithering
const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

interface BeatState {
  bassEnergy: number;
  bassEnergyEMA: number;
  beatAt: number;
  beatPhase: number;
}

const TERRAIN_ROWS = 56;
const TERRAIN_COLS = 96;

function initTerrain(): TerrainState {
  const rows: Float32Array[] = [];
  for (let i = 0; i < TERRAIN_ROWS; i++) rows.push(new Float32Array(TERRAIN_COLS));
  const noiseSeed: number[] = [];
  for (let i = 0; i < TERRAIN_COLS; i++) noiseSeed.push(Math.random() * 1000);
  return { rows, age: new Array(TERRAIN_ROWS).fill(0), size: TERRAIN_ROWS, head: 0, pushTimer: 0, noiseSeed };
}

export function Visualizer({ analyserRef, mode, hue, saturation, isPlaying }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const beatRef = useRef<BeatState>({ bassEnergy: 0, bassEnergyEMA: 0, beatAt: 0, beatPhase: 0 });
  const ditherTRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; hue: number }[]>([]);
  const terrainRef = useRef<TerrainState>(initTerrain());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let dpr = 1;
    const setupCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    const freq = new Uint8Array(1024);
    const time = new Uint8Array(2048);

    let prevTs = 0;

    const draw = (ts: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dt = prevTs ? Math.min(0.05, (ts - prevTs) / 1000) : 0.016;
      prevTs = ts;

      const analyser = analyserRef.current;
      const hasAudio = !!analyser && isPlaying;
      if (analyser) {
        analyser.getByteFrequencyData(freq);
        analyser.getByteTimeDomainData(time);
      } else {
        // Idle decay
        for (let i = 0; i < freq.length; i++) freq[i] = 0;
        for (let i = 0; i < time.length; i++) time[i] = 128;
      }

      // Bass / mid / treble averages
      let bass = 0, mid = 0, treb = 0;
      for (let i = 1; i < 16; i++) bass += freq[i];
      bass /= 15;
      for (let i = 16; i < 128; i++) mid += freq[i];
      mid /= 112;
      for (let i = 128; i < 512; i++) treb += freq[i];
      treb /= 384;

      // Beat detection — EMA of bass
      const bs = beatRef.current;
      bs.bassEnergyEMA = bs.bassEnergyEMA * 0.92 + bass * 0.08;
      const isBeat = bass > bs.bassEnergyEMA * 1.45 && bass > 60 && ts - bs.beatAt > 220;
      if (isBeat) {
        bs.beatAt = ts;
        bs.beatPhase = 1;
      }
      bs.beatPhase = Math.max(0, bs.beatPhase - dt * 2.2);
      bs.bassEnergy = bass;

      ctx.fillStyle = `hsl(${hue}, ${Math.min(saturation, 40)}%, 4%)`;
      ctx.fillRect(0, 0, w, h);

      if (mode === 'terrain') {
        drawTerrain(ctx, w, h, freq, time, bass, treb, hue, saturation, ts, dt, terrainRef, hasAudio);
      } else if (mode === 'dither') {
        drawDither(ctx, w, h, freq, bass, treb, hue, saturation, ditherTRef, dt, hasAudio);
      } else if (mode === 'waveform') {
        drawWaveform(ctx, w, h, time, freq, bass, hue, saturation, ts, hasAudio);
      } else if (mode === 'rings') {
        drawRings(ctx, w, h, freq, bass, mid, treb, hue, saturation, ts, hasAudio);
      } else {
        drawBloom(ctx, w, h, freq, time, bass, treb, hue, saturation, ts, dt, particlesRef, isBeat, hasAudio);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', setupCanvas);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyserRef, mode, hue, saturation, isPlaying]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
}

function drawDither(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  freq: Uint8Array,
  bass: number,
  treb: number,
  hue: number,
  sat: number,
  tRef: React.RefObject<number>,
  dt: number,
  hasAudio: boolean
) {
  // Animate threshold field with bass-driven motion
  tRef.current += dt * (0.4 + bass / 200);
  const t = tRef.current;
  const cell = 6; // dither cell size in px
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const cx = cols / 2;
  const cy = rows / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  // Build offscreen image for speed
  const baseLight = 18 + (bass / 255) * 22;
  const lightTop = baseLight + 32 + (treb / 255) * 25;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dx = c - cx;
      const dy = r - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Multi-wave field
      const wave =
        Math.sin(dist * 0.08 - t * 1.6) * 0.5 +
        Math.cos((dx + dy) * 0.05 + t * 0.9) * 0.3 +
        Math.sin(Math.atan2(dy, dx) * 4 + t * 0.7) * 0.2;
      // Bind to spectrum: pick a freq bucket from radial pos
      const bucket = Math.min(255, Math.floor((dist / maxR) * 256));
      const energy = hasAudio ? freq[bucket * 2] / 255 : 0;
      const v = (wave * 0.5 + 0.5) * (0.55 + energy * 0.6);
      const threshold = BAYER_8[r % 8][c % 8] / 64;
      if (v > threshold) {
        const intensity = Math.min(1, v + energy * 0.3);
        const l = baseLight + intensity * (lightTop - baseLight);
        ctx.fillStyle = `hsl(${hue + (intensity * 30 - 15)}, ${sat + 20}%, ${l}%)`;
        ctx.fillRect(c * cell, r * cell, cell, cell);
      }
    }
  }

  // Vignette
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.4);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: Uint8Array,
  freq: Uint8Array,
  bass: number,
  hue: number,
  sat: number,
  ts: number,
  hasAudio: boolean
) {
  const cx = w / 2;
  const cy = h / 2;
  const baseR = Math.min(w, h) * 0.18 + (bass / 255) * 60;

  // Soft halo
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 2.6);
  halo.addColorStop(0, `hsla(${hue}, ${sat + 30}%, 45%, ${0.15 + (bass / 255) * 0.18})`);
  halo.addColorStop(1, 'transparent');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  // Multiple radial waveform rings, layered
  const rings = 3;
  for (let ring = 0; ring < rings; ring++) {
    const ringPhase = (ts / 1000) * (0.15 + ring * 0.05);
    const sampleStep = 4;
    const samples = Math.floor(time.length / sampleStep);
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const idx = (i * sampleStep) % time.length;
      const v = (time[idx] - 128) / 128;
      const angle = (i / samples) * Math.PI * 2 + ringPhase;
      const amp = (hasAudio ? v : Math.sin(angle * 6 + ts * 0.001) * 0.06) * (60 + ring * 18);
      const r = baseR + ring * 28 + amp;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const alpha = 0.65 - ring * 0.18;
    ctx.strokeStyle = `hsla(${hue + ring * 18}, ${sat + 30}%, ${55 + ring * 8}%, ${alpha})`;
    ctx.lineWidth = ring === 0 ? 2 : 1;
    ctx.shadowBlur = ring === 0 ? 18 : 8;
    ctx.shadowColor = `hsla(${hue}, ${sat + 30}%, 60%, 0.6)`;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Frequency spokes
  const spokes = 96;
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2;
    const bin = Math.floor((i / spokes) * 256);
    const v = hasAudio ? freq[bin] / 255 : 0;
    if (v < 0.04) continue;
    const r1 = baseR * 1.6;
    const r2 = r1 + v * 120;
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;
    ctx.strokeStyle = `hsla(${hue + v * 60}, ${sat + 30}%, ${50 + v * 30}%, ${0.3 + v * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Center dot
  ctx.fillStyle = `hsla(${hue}, ${sat + 40}%, 70%, 0.9)`;
  ctx.beginPath();
  ctx.arc(cx, cy, 3 + (bass / 255) * 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawRings(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  freq: Uint8Array,
  bass: number,
  mid: number,
  treb: number,
  hue: number,
  sat: number,
  ts: number,
  hasAudio: boolean
) {
  const cx = w / 2;
  const cy = h / 2;
  const t = ts / 1000;

  // Three concentric frequency rings: bass, mid, treble
  const rings = [
    { r: Math.min(w, h) * 0.12, bins: [1, 16], rot: t * 0.3, hue: hue, energy: bass },
    { r: Math.min(w, h) * 0.22, bins: [16, 96], rot: -t * 0.18, hue: hue + 25, energy: mid },
    { r: Math.min(w, h) * 0.34, bins: [96, 384], rot: t * 0.1, hue: hue + 50, energy: treb },
  ];

  for (const ring of rings) {
    const segs = ring.bins[1] - ring.bins[0];
    for (let i = 0; i < segs; i++) {
      const v = hasAudio ? freq[ring.bins[0] + i] / 255 : 0;
      const angle = (i / segs) * Math.PI * 2 + ring.rot;
      const len = 6 + v * 80;
      const x1 = cx + Math.cos(angle) * ring.r;
      const y1 = cy + Math.sin(angle) * ring.r;
      const x2 = cx + Math.cos(angle) * (ring.r + len);
      const y2 = cy + Math.sin(angle) * (ring.r + len);
      const alpha = 0.18 + v * 0.7;
      ctx.strokeStyle = `hsla(${ring.hue + v * 30}, ${sat + 30}%, ${50 + v * 25}%, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Inner ring outline
    ctx.strokeStyle = `hsla(${ring.hue}, ${sat + 20}%, 40%, ${0.18 + (ring.energy / 255) * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Pulse core
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 + (bass / 255) * 60);
  core.addColorStop(0, `hsla(${hue}, ${sat + 40}%, 65%, ${0.45 + (bass / 255) * 0.4})`);
  core.addColorStop(1, 'transparent');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, w, h);
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
}

function drawBloom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  freq: Uint8Array,
  _time: Uint8Array,
  bass: number,
  treb: number,
  hue: number,
  sat: number,
  ts: number,
  dt: number,
  particlesRef: React.RefObject<Particle[]>,
  isBeat: boolean,
  hasAudio: boolean
) {
  const cx = w / 2;
  const cy = h / 2;

  // Trail effect by darkening with low alpha
  ctx.fillStyle = `hsla(${hue}, ${Math.min(sat, 35)}%, 4%, 0.18)`;
  ctx.fillRect(0, 0, w, h);

  const ps = particlesRef.current;

  // Spawn particles continuously based on energy
  const spawn = hasAudio ? Math.floor((bass + treb) / 60) : 0;
  for (let i = 0; i < spawn; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 220 + (bass / 255) * 200;
    ps.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      hue: hue + (Math.random() - 0.5) * 80,
    });
  }
  if (isBeat) {
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 220 + Math.random() * 380;
      ps.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.2,
        hue: hue + (Math.random() - 0.5) * 100,
      });
    }
  }

  // Cap particle count
  if (ps.length > 1500) ps.splice(0, ps.length - 1500);

  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.life -= dt * 0.55;
    if (p.life <= 0) {
      ps.splice(i, 1);
      continue;
    }
    const alpha = Math.max(0, p.life);
    const size = 1 + alpha * 2.4;
    ctx.fillStyle = `hsla(${p.hue}, ${sat + 30}%, ${55 + alpha * 30}%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center glow
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 + (bass / 255) * 80);
  core.addColorStop(0, `hsla(${hue}, ${sat + 30}%, 65%, ${0.4 + (bass / 255) * 0.3})`);
  core.addColorStop(1, 'transparent');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, w, h);

  // Faint ring at base radius
  ctx.strokeStyle = `hsla(${hue}, ${sat + 20}%, 60%, 0.18)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 40 + (bass / 255) * 40, 0, Math.PI * 2);
  ctx.stroke();
  // suppress unused
  void ts;
}

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  freq: Uint8Array,
  time: Uint8Array,
  bass: number,
  treb: number,
  hue: number,
  sat: number,
  ts: number,
  dt: number,
  terrainRef: React.RefObject<TerrainState>,
  hasAudio: boolean
) {
  const ter = terrainRef.current;

  // Push a new row periodically — faster cadence on stronger audio
  ter.pushTimer += dt * 1000;
  const pushIntervalMs = Math.max(34, 80 - (bass / 255) * 50);
  while (ter.pushTimer >= pushIntervalMs) {
    ter.pushTimer -= pushIntervalMs;
    // Build a new row from the spectrum: low bins on the left, high bins on the right.
    // Idle: low-amplitude perlin-ish sine field so something always breathes.
    const row = ter.rows[ter.head];
    for (let c = 0; c < TERRAIN_COLS; c++) {
      const f = c / (TERRAIN_COLS - 1);            // 0..1
      const binF = Math.pow(f, 1.65) * 384;        // emphasize low/mid
      const bin = Math.floor(binF);
      const audioV = hasAudio ? freq[bin] / 255 : 0;
      // Add a touch of waveform shape to give micro-detail
      const wv = hasAudio ? (time[(bin * 2) % time.length] - 128) / 256 : 0;
      // Idle motion
      const seed = ter.noiseSeed[c];
      const idle =
        Math.sin(ts * 0.0006 + seed * 0.31) * 0.07 +
        Math.sin(ts * 0.0011 + seed * 0.17 + c * 0.18) * 0.05;
      row[c] = audioV * 1.0 + wv * 0.25 + (hasAudio ? 0 : idle + 0.08);
    }
    ter.age[ter.head] = 0;
    ter.head = (ter.head + 1) % ter.size;
    // Age all rows
    for (let i = 0; i < ter.size; i++) ter.age[i] += 1;
  }

  // Perspective parameters
  const cx = w / 2;
  // Horizon a bit above center; rows fan out below it toward the viewer.
  const horizonY = h * 0.32;
  const nearY = h * 1.05;
  // Lateral perspective: rows narrow toward the horizon.
  const nearHalfW = w * 0.62;
  const farHalfW = w * 0.06;

  // Background gradient (deep dark at top → still dark, just slightly warmer below)
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, `hsl(${hue}, ${Math.min(sat, 40)}%, 5%)`);
  bg.addColorStop(1, `hsl(${hue + 10}, ${Math.min(sat, 40)}%, 3%)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Sparse particle/grain field in the upper portion (matches the reference's stipple texture)
  const grainCount = 280;
  for (let i = 0; i < grainCount; i++) {
    const s = (i * 9301 + 49297) % 233280;
    const rand1 = (s / 233280);
    const rand2 = ((i * 7853 + 9277) % 1009) / 1009;
    const gx = rand1 * w;
    const gy = rand2 * horizonY * 0.95;
    const tw = Math.sin(ts * 0.001 + i * 0.7) * 0.5 + 0.5;
    ctx.fillStyle = `hsla(${hue + 200}, ${sat + 30}%, 70%, ${0.08 + tw * 0.18})`;
    ctx.fillRect(gx, gy, 1.2, 1.2);
  }

  // Draw rows back-to-front so closer ones overlap older ones.
  // Iterate from oldest (largest age) to youngest.
  const sortedIndices: number[] = [];
  for (let i = 0; i < ter.size; i++) sortedIndices.push(i);
  sortedIndices.sort((a, b) => ter.age[b] - ter.age[a]);

  for (const i of sortedIndices) {
    const age = ter.age[i];
    // depth: 0 = at horizon (oldest), 1 = closest (youngest)
    const depth = 1 - Math.min(1, age / ter.size);
    // Smooth easing so rows bunch near the horizon (perspective)
    const persp = Math.pow(depth, 1.6);

    const rowY = horizonY + (nearY - horizonY) * persp;
    const halfW = farHalfW + (nearHalfW - farHalfW) * persp;
    const ampScale = 14 + persp * 90;                    // vertical wave height in px
    const xLeft = cx - halfW;
    const xRight = cx + halfW;
    const rowW = xRight - xLeft;

    const row = ter.rows[i];

    // Aberration offset grows with audio energy + depth
    const aber = (1.2 + (bass / 255) * 4.5 + (treb / 255) * 2.5) * (0.4 + persp * 1.4);

    const buildPath = (xOffset: number) => {
      ctx.beginPath();
      for (let c = 0; c < TERRAIN_COLS; c++) {
        const t01 = c / (TERRAIN_COLS - 1);
        const x = xLeft + t01 * rowW + xOffset;
        const v = row[c];
        const y = rowY - v * ampScale;
        if (c === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    };

    // Alpha fades out near the horizon
    const lineAlpha = 0.18 + persp * 0.65;
    const lineWidth = 0.6 + persp * 1.1;

    ctx.globalCompositeOperation = 'screen';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Red channel — left offset
    ctx.strokeStyle = `hsla(${(hue + 340) % 360}, 90%, 60%, ${lineAlpha * 0.85})`;
    buildPath(-aber);
    ctx.stroke();

    // Blue channel — right offset
    ctx.strokeStyle = `hsla(${(hue + 200) % 360}, 90%, 60%, ${lineAlpha * 0.9})`;
    buildPath(aber);
    ctx.stroke();

    // Green/Cyan center — primary
    ctx.strokeStyle = `hsla(${(hue + 170) % 360}, 95%, 70%, ${lineAlpha})`;
    buildPath(0);
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
  }

  // Subtle scanline-like vignette on top to ground the scene
  const vg = ctx.createLinearGradient(0, 0, 0, h);
  vg.addColorStop(0, 'rgba(0,0,0,0.55)');
  vg.addColorStop(0.4, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

