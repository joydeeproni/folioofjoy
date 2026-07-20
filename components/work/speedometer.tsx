'use client'

// Minimalist horizontal speedometer for the work-preview fling. Three visual
// variants (segmented tick arc · thin stroke arc · segmented bar), all built on
// a shallow, wide arc so the whole thing reads horizontal. `frac` is 0..1 of
// max speed; the number shown is px/s of carousel travel.

const GREEN = '#2CA152'

export type SpeedoVariant = 'ticks' | 'stroke' | 'bar'
export type SpeedoFont = 'pixel' | 'italic'

// Shallow top arc: 210° → 330° of a circle (120° sweep), wide and flat.
const R = 150
const CX = 160
const CY = 170
const A0 = (210 * Math.PI) / 180
const A1 = (330 * Math.PI) / 180
const pt = (a: number, r: number) => [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const

// Soft radial glow that rides the arc's leading tip (shared by both arc variants).
function ArcHalo({ frac }: { frac: number }) {
  const a = A0 + (A1 - A0) * frac
  const [x, y] = pt(a, R - 8)
  return (
    <>
      <defs>
        <radialGradient id="speedo-halo">
          <stop offset="0%" stopColor="rgba(44,161,82,0.38)" />
          <stop offset="55%" stopColor="rgba(44,161,82,0.10)" />
          <stop offset="75%" stopColor="rgba(44,161,82,0)" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={52} fill="url(#speedo-halo)"
        style={{ opacity: frac > 0.02 ? 1 : 0, transition: 'opacity 300ms ease' }} />
    </>
  )
}

function TickArc({ frac }: { frac: number }) {
  const N = 36
  const ticks = Array.from({ length: N }, (_, i) => {
    const a = A0 + ((A1 - A0) * i) / (N - 1)
    const lit = i / (N - 1) <= frac
    const [x1, y1] = pt(a, R - (lit ? 16 : 11))
    const [x2, y2] = pt(a, R)
    return { x1, y1, x2, y2, lit }
  })
  return (
    <svg viewBox="22 12 276 92" className="w-full overflow-visible" aria-hidden>
      <ArcHalo frac={frac} />
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.lit ? GREEN : 'rgba(255,255,255,0.18)'}
          strokeWidth={t.lit ? 2.4 : 1.6} strokeLinecap="round" />
      ))}
    </svg>
  )
}

function StrokeArc({ frac }: { frac: number }) {
  const arcPath = () => {
    const [sx, sy] = pt(A0, R)
    const [ex, ey] = pt(A1, R)
    return `M ${sx} ${sy} A ${R} ${R} 0 0 1 ${ex} ${ey}`
  }
  // arc length of the 120° sweep
  const len = R * (A1 - A0)
  return (
    <svg viewBox="22 12 276 92" className="w-full overflow-visible" aria-hidden>
      <ArcHalo frac={frac} />
      <path d={arcPath()} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2} strokeLinecap="round" />
      <path d={arcPath()} fill="none" stroke={GREEN} strokeWidth={2.5} strokeLinecap="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - frac)} />
    </svg>
  )
}

// Car-dash bar: continuous fill with a dark→bright gradient toward the leading
// edge, a lighter cap at the tip, a soft halo glowing behind it, and the
// unfilled track drawn as thin white ticks.
function Bar({ frac }: { frac: number }) {
  const N = 24
  const pct = frac * 100
  return (
    <div className="relative h-5 w-full" aria-hidden>
      {/* halo behind the leading edge */}
      <div
        className="absolute top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: `${pct}%`,
          background: 'radial-gradient(closest-side, rgba(44,161,82,0.4), rgba(44,161,82,0.1) 55%, transparent 72%)',
          opacity: frac > 0.02 ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      />
      {/* unfilled track — thin white ticks */}
      <div className="absolute inset-0 flex items-center justify-between px-[1px]">
        {Array.from({ length: N }, (_, i) => (
          <span key={i} className="h-full w-[2px] rounded-full bg-white/70" />
        ))}
      </div>
      {/* fill — gradient toward the end + light cap at the tip */}
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <div className="h-full w-full"
          style={{ background: 'linear-gradient(90deg, #0F3520 0%, #2CA152 78%, #3ECC70 100%)' }} />
      </div>
      {frac > 0.01 && (
        <span className="absolute inset-y-0 w-[3px] -translate-x-full rounded-[1px]"
          style={{ left: `${pct}%`, background: '#8CE7AE' }} />
      )}
    </div>
  )
}

export function Speedometer({
  speed, max = 9000, variant = 'ticks', font = 'pixel', visible = true,
}: {
  speed: number // px/s
  max?: number
  variant?: SpeedoVariant
  font?: SpeedoFont
  visible?: boolean
}) {
  const frac = Math.max(0, Math.min(1, speed / max))
  const numCls = font === 'pixel' ? 'font-pixel' : 'font-sans italic font-medium'
  return (
    <div
      className="pointer-events-none flex w-64 flex-col items-center transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {variant === 'ticks' && <TickArc frac={frac} />}
      {variant === 'stroke' && <StrokeArc frac={frac} />}
      {variant === 'bar' && <Bar frac={frac} />}
      <div className={`${variant === 'bar' ? 'mt-3' : '-mt-10'} flex items-baseline gap-2`}>
        <span className={`${numCls} text-5xl leading-none text-white tabular-nums`}>{Math.round(speed / 10) * 10}</span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">px/s</span>
      </div>
    </div>
  )
}
