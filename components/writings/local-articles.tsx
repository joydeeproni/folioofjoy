import type { ComponentType } from 'react'
import { DesigningForLowLiteracy } from './designing-for-low-literacy'

// Maps a writing slug to its bespoke, code-rendered body component. Metadata for
// these lives in lib/writings/local.ts; app/writings/[slug] renders the matching
// component here (falling back to the Sanity prose renderer for everything else).
export const LOCAL_ARTICLES: Record<string, ComponentType> = {
  'designing-for-low-literacy': DesigningForLowLiteracy,
}
