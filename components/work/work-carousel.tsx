'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useDialKit } from 'dialkit'
import { ArrowUpRight } from 'lucide-react'
import type { WorkItem } from '@/lib/content/types'

const isVideo = (s: string) => s.endsWith('.mp4')

function Media({ item }: { item: WorkItem }) {
  const cls = 'h-full w-auto max-w-none object-contain rounded-xl border border-white/10 shadow-2xl pointer-events-none select-none'
  return isVideo(item.src) ? (
    <video src={item.src} autoPlay loop muted playsInline draggable={false} className={cls} />
  ) : (
    <img src={item.src} alt={item.caption} draggable={false} className={cls} />
  )
}

// A free-scrolling, inertial filmstrip. Fling (drag) or scroll to fly through
// the work; velocity carries with friction, and fast motion adds blur. Vertical
// wheel maps to horizontal travel (scroll up = left, down = right). All physics
// params are live-tunable via the dialkit panel (dev only).
export function WorkCarousel({ items }: { items: WorkItem[] }) {
  const dial = useDialKit('Work Carousel', {
    wheelSpeed: [0.9, 0.1, 4, 0.05],
    dragSpeed: [1.15, 0.3, 3, 0.05],
    friction: [0.93, 0.8, 0.99, 0.005],
  }) as unknown as { wheelSpeed: number; dragSpeed: number; friction: number }
  const dialRef = useRef(dial)
  dialRef.current = dial

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const pos = useRef(0)
  const vel = useRef(0)
  const max = useRef(0)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startPos = useRef(0)
  const lastX = useRef(0)
  const lastT = useRef(0)
  const dragVel = useRef(0)
  const raf = useRef(0)

  const clamp = (p: number) => Math.max(0, Math.min(max.current, p))

  // Measure the scrollable width (re-measure on resize and after media loads).
  useEffect(() => {
    const measure = () => {
      const vp = viewportRef.current
      const tr = trackRef.current
      if (!vp || !tr) return
      max.current = Math.max(0, tr.scrollWidth - vp.clientWidth)
      pos.current = clamp(pos.current)
    }
    measure()
    const t1 = setTimeout(measure, 300)
    const t2 = setTimeout(measure, 1200)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', measure)
    }
  }, [items])

  // Physics loop.
  useEffect(() => {
    const tick = () => {
      const { friction } = dialRef.current
      if (!dragging.current) {
        pos.current += vel.current
        vel.current *= friction
        if (pos.current < 0) {
          pos.current = 0
          vel.current = 0
        } else if (pos.current > max.current) {
          pos.current = max.current
          vel.current = 0
        }
        if (Math.abs(vel.current) < 0.05) vel.current = 0
      }
      const tr = trackRef.current
      if (tr) {
        tr.style.transform = `translate3d(${-pos.current}px,0,0)`
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  // Vertical wheel → horizontal velocity (up = left, down = right).
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      vel.current += d * dialRef.current.wheelSpeed * 0.35
      vel.current = Math.max(-130, Math.min(130, vel.current))
    }
    vp.addEventListener('wheel', onWheel, { passive: false })
    return () => vp.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    startX.current = e.clientX
    startPos.current = pos.current
    lastX.current = e.clientX
    lastT.current = performance.now()
    vel.current = 0
    dragVel.current = 0
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const speed = dialRef.current.dragSpeed
    pos.current = clamp(startPos.current - (e.clientX - startX.current) * speed)
    const now = performance.now()
    const dt = Math.max(1, now - lastT.current)
    dragVel.current = (-(e.clientX - lastX.current) * speed) / dt * 16
    lastX.current = e.clientX
    lastT.current = now
  }
  const onPointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    vel.current = Math.max(-150, Math.min(150, dragVel.current))
  }

  return (
    <div className="relative z-10 flex w-full flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
      <div
        ref={viewportRef}
        className="w-full cursor-grab overflow-hidden select-none active:cursor-grabbing"
        style={{ height: '68vh' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={trackRef} className="flex h-full items-center gap-8 px-[16vw] will-change-transform">
          {items.map((item, i) => (
            <figure key={i} className="flex h-full shrink-0 flex-col items-center justify-center gap-3">
              <div className="h-[58vh]">
                <Media item={item} />
              </div>
              <figcaption className="max-w-[26ch] truncate text-center font-sans text-xs text-white/50">
                {item.caption}
              </figcaption>
              {item.caseStudy && (
                <Link
                  href={`/work/${item.caseStudy}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-full border border-[#2CA152]/40 bg-[#2CA152]/10 px-3.5 py-1.5 text-sm font-sans text-[#2CA152] backdrop-blur-md transition-colors duration-200 hover:bg-[#2CA152]/20"
                >
                  Read the case study
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
              {item.links?.length > 0 && (
                <div className="flex gap-2">
                  {item.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-sm font-sans text-white/80 transition-colors duration-200 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-md hover:bg-white/20 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none md:hover:bg-transparent md:underline md:decoration-transparent md:underline-offset-4 md:hover:text-[#2CA152] md:hover:decoration-[#2CA152]"
                    >
                      {l.label}
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </a>
                  ))}
                </div>
              )}
            </figure>
          ))}
        </div>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/30">
        drag or scroll · fling to fly
      </p>
    </div>
  )
}
