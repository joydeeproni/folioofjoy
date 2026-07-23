'use client'

import { useEffect, useRef, useState } from 'react'
import { slugify } from '@/lib/writings/slug'

export type TocSection = { label: string; level: 1 | 2 }

const INK = '#EDEAE0'
const FAINT = 'rgba(237,234,224,0.28)'
const DIM = 'rgba(237,234,224,0.45)'

// A minimalist right-rail index: a stack of short lines (one per heading) that
// fades in on scroll/hover and auto-hides when idle; hovering expands the lines
// into the labelled section list. Desktop only. Purely a visual scroll aid.
// Section labels must match the article's headings verbatim (ids are slugify).
// Generic sibling of DfllToc — takes its sections as a prop.
export function ArticleToc({ sections }: { sections: TocSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)
  const [awake, setAwake] = useState(false)
  const sleepTimer = useRef<number | null>(null)
  const leaveTimer = useRef<number | null>(null)

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(slugify(s.label)))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!els.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((e) => e.isIntersecting)
        if (shown.length) {
          shown.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          setActiveId(shown[0].target.id)
        }
      },
      { rootMargin: '-12% 0px -70% 0px', threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [sections])

  useEffect(() => {
    const onScroll = () => {
      setAwake(true)
      if (sleepTimer.current) window.clearTimeout(sleepTimer.current)
      sleepTimer.current = window.setTimeout(() => setAwake(false), 1600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (sleepTimer.current) window.clearTimeout(sleepTimer.current)
    }
  }, [])

  const enter = () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current)
    setHovered(true)
  }
  const leave = () => {
    leaveTimer.current = window.setTimeout(() => setHovered(false), 160)
  }
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const visible = hovered || awake

  return (
    <div aria-hidden>
      {/* Collapsed: stack of lines */}
      <div
        onMouseEnter={enter}
        onMouseLeave={leave}
        className="hidden lg:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 flex-col items-start gap-2.5 py-3 pr-10"
        style={{ opacity: visible && !hovered ? 1 : 0, transition: 'opacity 400ms ease' }}
      >
        {sections.map((s) => {
          const active = slugify(s.label) === activeId
          return (
            <span
              key={s.label}
              className="block rounded-full transition-all duration-300"
              style={{
                width: active ? 30 : s.level === 2 ? 14 : 24,
                height: 2,
                backgroundColor: active ? INK : FAINT,
              }}
            />
          )
        })}
      </div>

      {/* Expanded: labelled list */}
      <nav
        onMouseEnter={enter}
        onMouseLeave={leave}
        className="hidden lg:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 flex-col gap-0.5 max-w-[240px] rounded-lg px-4 py-3"
        style={{
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? 'auto' : 'none',
          transition: 'opacity 260ms ease',
          background: 'rgba(11,11,11,0.82)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 10px 44px rgba(0,0,0,0.55)',
        }}
      >
        {sections.map((s) => {
          const id = slugify(s.label)
          const active = id === activeId
          return (
            <button
              key={s.label}
              onClick={() => go(id)}
              className="font-sans text-[13px] leading-snug text-left rounded px-2 py-1 transition-colors hover:!text-[#2CA152]"
              style={{
                color: active ? INK : DIM,
                paddingLeft: s.level === 2 ? 18 : 8,
                background: active ? 'rgba(237,234,224,0.08)' : 'transparent',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
