'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { SwingSetHandle } from '../swing-set';
import type { RunState } from './use-swing-game';
import { drawEnergyGraph, drawSparkline } from './draw';
import { decay } from '@/lib/swing-game/energy';
import { RUN_MS } from '@/lib/swing-game/rules';

const GRAPH_W = 380;
const GRAPH_H = 96;
const COLS = GRAPH_W / 2;
const ROWS = GRAPH_H / 2;
const SPARK_W = 120;

function ClockIcon() {
  return (
    <svg viewBox="0 0 9 9" fill="currentColor" aria-hidden="true" shapeRendering="crispEdges" className="h-[18px] w-[18px]">
      <path d="M3 0h3v1H3zM1 1h2v1H1zM6 1h2v1H6zM0 3h1v3H0zM8 3h1v3H8zM1 2h1v1H1zM7 2h1v1H7zM1 6h1v1H1zM7 6h1v1H7zM1 7h2v1H1zM6 7h2v1H6zM3 8h3v1H3zM4 2h1v3H4zM5 4h2v1H5z" />
    </svg>
  );
}

// The synth-style readout: count · ♩+taps/s · swing trace · countdown, over an
// energy graph whose x-axis is the 10s timer. Everything updates from one rAF
// loop writing straight to the DOM — no React renders per tap.
export function GameHud({ run, swing }: { run: RefObject<RunState>; swing: RefObject<SwingSetHandle | null> }) {
  const countRef = useRef<HTMLSpanElement>(null);
  const rateRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);
  const sparkRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const graph = graphRef.current?.getContext('2d');
    const spark = sparkRef.current?.getContext('2d');
    if (!graph || !spark) return;
    const samples: number[] = [];
    const trace: number[] = [];
    let frame = requestAnimationFrame(function tick(t) {
      const r = run.current;
      const progress = Math.min(1, (t - r.startedAt) / RUN_MS);
      const energy = decay(r.energy, (t - r.energyAt) / 1000);
      const head = Math.min(COLS - 1, Math.floor(progress * COLS));
      while (samples.length <= head) samples.push(energy);
      samples[head] = Math.max(samples[head], energy);
      trace.push(swing.current?.angle ?? 0);
      if (trace.length > SPARK_W) trace.shift();

      drawEnergyGraph(graph, samples, COLS, ROWS);
      drawSparkline(spark, trace);
      if (countRef.current) countRef.current.textContent = String(r.count);
      if (rateRef.current) rateRef.current.textContent = `♩+${Math.round(energy)}`;
      if (timeRef.current) timeRef.current.textContent = ((1 - progress) * RUN_MS / 1000).toFixed(1);
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [run, swing]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-1/2 top-[calc(3.75rem+var(--sat))] z-[55] w-[min(86vw,380px)] -translate-x-1/2 min-[561px]:top-[calc(1.25rem+var(--sat))]"
    >
      <div className="flex items-center gap-3 whitespace-nowrap font-mono text-[18px] leading-none tabular-nums">
        <span ref={countRef} className="min-w-[2.2ch] text-[#efe4ce]">0</span>
        <span ref={rateRef} className="min-w-[4.2ch] text-[#43c779]">♩+0</span>
        <canvas ref={sparkRef} width={SPARK_W} height={18} className="h-[18px] min-w-0 flex-1 [image-rendering:pixelated]" />
        <span className="inline-flex items-center gap-[7px] text-[#e83c35]">
          <span ref={timeRef}>10.0</span>
          <ClockIcon />
        </span>
      </div>
      <canvas ref={graphRef} width={GRAPH_W} height={GRAPH_H} className="mt-2.5 block h-24 w-full [image-rendering:pixelated]" />
    </div>
  );
}
