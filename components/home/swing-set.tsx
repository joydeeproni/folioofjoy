'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, useSyncExternalStore } from 'react';
import { useAnimationFrame } from 'motion/react';
import { paintSwingScene, type PushEffect } from './swing-scene';

export interface SwingSetHandle {
  readonly element: HTMLCanvasElement | null;
  energize: (active: boolean) => void;
  kick: () => void;
}

const IDLE = 12 * Math.PI / 180;
const HOVER = 18 * Math.PI / 180;
const PUSH = 26 * Math.PI / 180;
const FREQUENCY = 2 * Math.PI / 3.6;
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia(MOTION_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}
const reducedMotion = () => window.matchMedia(MOTION_QUERY).matches;
const serverMotion = () => true;

export const SwingSet = forwardRef<SwingSetHandle, { className?: string; interactive?: boolean }>(
  function SwingSet({ className, interactive = false }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const audioRef = useRef<AudioContext | null>(null);
    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastPush = useRef(-Infinity);
    const effect = useRef<PushEffect | undefined>(undefined);
    const energized = useRef(false);
    const state = useRef({ angle: 0, velocity: FREQUENCY * IDLE, boost: 0, speed: 1 });
    const [pushed, setPushed] = useState(false);
    const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, serverMotion);

    const playPush = useCallback(() => {
      // Only create/resume audio in a user gesture; no autoplay or downloaded asset.
      try {
        const audio = audioRef.current ??= new AudioContext();
        if (audio.state === 'suspended') void audio.resume().catch(() => {});
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const now = audio.currentTime;
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(390, now);
        oscillator.frequency.exponentialRampToValueAtTime(780, now + 0.07);
        oscillator.frequency.exponentialRampToValueAtTime(590, now + 0.17);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.055, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
        gain.gain.linearRampToValueAtTime(0, now + 0.21);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.22);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      } catch {
        // The push still works when audio is unavailable.
      }
    }, []);

    const energize = useCallback((active: boolean) => { energized.current = active; }, []);
    const kick = useCallback(() => {
      const now = performance.now();
      if (now - lastPush.current < 120) return;
      lastPush.current = now;
      if (!reduce) {
        const s = state.current;
        s.boost = Math.min(1, s.boost + 0.75);
        // Add momentum in the current direction, capped at the maximum arc.
        // Position never jumps, even when clicking at a turning point.
        const limit = FREQUENCY * Math.sqrt(Math.max(0, 2 * (Math.cos(s.angle) - Math.cos(PUSH))));
        const direction = Math.sign(s.velocity) || -Math.sign(s.angle) || 1;
        s.velocity = direction * Math.min(limit, Math.abs(s.velocity) + 0.16);
        effect.current = { age: 0, angle: s.angle };
      }
      playPush();
      setPushed(true);
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setPushed(false), 650);
    }, [reduce, playPush]);
    useImperativeHandle(ref, () => ({
      get element() { return canvasRef.current; }, energize, kick,
    }), [energize, kick]);

    useEffect(() => {
      contextRef.current = canvasRef.current?.getContext('2d') ?? null;
      if (contextRef.current) paintSwingScene(contextRef.current, 0, 0);
      return () => {
        contextRef.current = null;
        if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
        if (audioRef.current) void audioRef.current.close().catch(() => {});
        audioRef.current = null;
      };
    }, []);

    useAnimationFrame((_time, delta) => {
      const context = contextRef.current;
      if (!context) return;
      const s = state.current;
      if (reduce) {
        if (s.angle !== 0 || s.boost !== 0 || effect.current) paintSwingScene(context, 0, 0);
        s.angle = 0;
        s.velocity = FREQUENCY * IDLE;
        s.boost = 0;
        s.speed = 1;
        effect.current = undefined;
        return;
      }
      const elapsed = Math.min(delta / 1000, 0.05);
      const steps = Math.max(1, Math.ceil(elapsed * 240));
      const dt = elapsed / steps;
      for (let step = 0; step < steps; step++) {
        s.boost *= Math.exp(-dt / 3);
        s.speed += (1 + 0.75 * s.boost - s.speed) * (1 - Math.exp(-dt / 0.18));
        const base = energized.current ? HOVER : IDLE;
        const target = base + (PUSH - base) * s.boost;
        const targetEnergy = FREQUENCY ** 2 * (1 - Math.cos(target));
        const energy = s.velocity ** 2 / 2 + FREQUENCY ** 2 * (1 - Math.cos(s.angle));
        const drive = 1.5 * Math.max(-2, 1 - energy / targetEnergy);
        s.velocity += (-(FREQUENCY ** 2) * Math.sin(s.angle) + drive * s.velocity) * dt * s.speed;
        s.angle += s.velocity * dt * s.speed;
      }
      if (effect.current) {
        effect.current.age += elapsed;
        if (effect.current.age >= 0.6) effect.current = undefined;
      }
      if (canvasRef.current?.getClientRects().length) paintSwingScene(context, s.angle, s.velocity, effect.current);
    });

    const canvas = <canvas
      ref={canvasRef}
      width={320}
      height={260}
      aria-hidden="true"
      data-swing-scene="pixel-3d"
      className="block w-full h-auto select-none pointer-events-none"
      style={{ imageRendering: 'pixelated' }}
    />;

    if (!interactive) return <div className={className} aria-hidden="true">{canvas}</div>;
    return <button
      type="button"
      aria-label="Push the swing — plays a short sound"
      onClick={kick}
      onPointerEnter={() => energize(true)}
      onPointerLeave={() => energize(false)}
      onFocus={() => energize(true)}
      onBlur={() => energize(false)}
      className={`group pointer-events-none cursor-pointer touch-manipulation select-none border-0 bg-transparent p-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4c51b] ${className ?? ''}`}
    >
      {canvas}
      {/* Keep the empty corners transparent to the quote links behind the art. */}
      <span aria-hidden="true" className="absolute inset-0 pointer-events-auto"
        style={{ clipPath: 'polygon(15% 6%, 85% 28%, 97% 84%, 71% 95%, 4% 73%, 3% 65%)' }} />
      <span aria-hidden="true" className={`absolute bottom-[4%] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] md:text-xs ${pushed ? 'text-[#f4c51b] opacity-100' : 'text-white/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
        {pushed ? 'one more?' : 'click to push ♪'}
      </span>
    </button>;
  },
);
