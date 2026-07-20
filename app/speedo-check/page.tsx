'use client'

// TEMPORARY — delete after picking a variant. Interactive speedometer jam:
// hold the pedal (or Space) to accelerate like a car; release to coast down.
// Physics are tunable live via the dialkit "Speedo" panel.
import { useEffect, useRef, useState } from 'react'
import { useDialKit } from 'dialkit'
import { Speedometer, type SpeedoVariant, type SpeedoFont } from '@/components/work/speedometer'

export default function SpeedoCheck() {
  const dial = useDialKit('Speedo', {
    accel: [5200, 500, 20000, 100], // px/s² while pedal held
    braking: [3800, 200, 20000, 100], // px/s² while released
    maxSpeed: [9000, 1000, 20000, 250],
  }) as unknown as { accel: number; braking: number; maxSpeed: number }
  const dialRef = useRef(dial)
  dialRef.current = dial

  // Idles at a preview speed until the first pedal press, then physics run.
  const [speed, setSpeed] = useState(6200)
  const pedal = useRef(false)
  const interacted = useRef(false)

  // Car physics: constant acceleration while the pedal is down, braking decel
  // when released, clamped to [0, maxSpeed].
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { accel, braking, maxSpeed } = dialRef.current
      if (interacted.current) {
        setSpeed((s) => Math.max(0, Math.min(maxSpeed, pedal.current ? s + accel * dt : s - braking * dt)))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Space bar works as the pedal too.
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); pedal.current = true; interacted.current = true } }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') pedal.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  const variants: SpeedoVariant[] = ['ticks', 'stroke', 'bar']
  const fonts: SpeedoFont[] = ['pixel', 'italic']

  return (
    <main className="min-h-dvh bg-black px-10 py-12 text-white">
      <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
        Speedometer jam — hold the pedal (or Space) · tune physics in the Speedo panel
      </p>
      <div className="grid max-w-5xl grid-cols-2 gap-x-16 gap-y-12">
        {variants.flatMap((v) =>
          fonts.map((f) => (
            <div key={`${v}-${f}`} className="flex flex-col items-center gap-3 rounded-xl border border-white/10 px-6 pb-6 pt-8">
              <Speedometer speed={speed} max={dial.maxSpeed} variant={v} font={f} />
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                {v} · {f === 'pixel' ? 'Geist Pixel' : 'Galeria Italic'}
              </p>
            </div>
          )),
        )}
      </div>

      {/* Gas pedal */}
      <div className="fixed bottom-[calc(2rem+var(--sab))] left-1/2 z-50 -translate-x-1/2">
        <button
          onPointerDown={() => { pedal.current = true; interacted.current = true }}
          onPointerUp={() => { pedal.current = false }}
          onPointerLeave={() => { pedal.current = false }}
          onPointerCancel={() => { pedal.current = false }}
          onContextMenu={(e) => e.preventDefault()}
          className="select-none rounded-full border border-white/20 bg-white/10 px-8 py-4 font-mono text-xs uppercase tracking-[0.25em] text-white backdrop-blur-md transition-all duration-150 hover:bg-white/15 active:scale-95 active:bg-[#2CA152] active:text-black"
        >
          Hold to accelerate
        </button>
      </div>
    </main>
  )
}
