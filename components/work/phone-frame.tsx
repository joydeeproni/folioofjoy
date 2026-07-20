import type { ReactNode } from 'react'

// A flat iPhone body that wraps a portrait mobile screenshot. Height-driven:
// give it a height and the width follows the phone aspect ratio. The screen
// content (children) should fill it — pass an <img>/<video> with object-cover.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full aspect-[9/19.3] rounded-[13%] bg-[#0d0d0f] p-[2.6%] shadow-2xl ring-1 ring-white/10">
      <div className="relative h-full w-full overflow-hidden rounded-[10.5%] bg-black">
        {children}
        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-[1.8%] z-10 h-[3.2%] w-[28%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  )
}
