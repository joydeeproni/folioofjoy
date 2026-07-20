import type { WorkItem } from '@/lib/sanity/queries'

// Vercel Blob store used across the site for large media (audio, covers, work).
const BLOB = 'https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work'

// Bespoke Work items hosted outside Sanity (uploaded to Vercel Blob). Prepended
// to the Sanity-fed Work list so they lead the Work Preview.
export const LOCAL_WORK: WorkItem[] = [
  { src: `${BLOB}/canvas-stickynote.mp4`, caption: 'Draggable sticky-note canvas', category: 'SVC', links: [] },
  { src: `${BLOB}/property-listing-02.png`, caption: 'Cassi — property listing', category: 'SVC', links: [], frame: 'phone' },
  { src: `${BLOB}/mortgage-upload-01.png`, caption: 'Cassi — mortgage assistant', category: 'SVC', links: [], frame: 'phone' },
  { src: `${BLOB}/home-dashboard-03.png`, caption: 'Cassi — home dashboard', category: 'SVC', links: [], frame: 'phone' },
  { src: `${BLOB}/fact-card-01.png`, caption: 'Cassi — did-you-know card', category: 'SVC', links: [], frame: 'phone' },
  { src: `${BLOB}/game-result-01.png`, caption: 'Mini Parkering', category: 'JOY', links: [], frame: 'phone' },
  { src: `${BLOB}/game-over-01.png`, caption: 'Mini Parkering — game over', category: 'JOY', links: [], frame: 'phone' },
  { src: `${BLOB}/property-dashboard-01.png`, caption: 'Cassi — property dashboard', category: 'SVC', links: [] },
  { src: `${BLOB}/media-player-01.png`, caption: 'Media player redesign', category: 'JOY', links: [] },
  { src: `${BLOB}/maintenance-plan-01.png`, caption: 'Cassi — maintenance plan', category: 'SVC', links: [] },
  { src: `${BLOB}/home-value-cards-01.png`, caption: 'Cassi — home value FTUE', category: 'SVC', links: [] },
  { src: `${BLOB}/ftue-onboarding-04.png`, caption: 'Cassi — first-run onboarding', category: 'SVC', links: [] },
  { src: `${BLOB}/onboarding-flow-01.png`, caption: 'Cassi — onboarding flow', category: 'SVC', links: [] },
  { src: `${BLOB}/upload-progress-01.png`, caption: 'Cassi — uploading documents', category: 'SVC', links: [] },
  { src: `${BLOB}/claude-usage.png`, caption: 'My Claude usage', category: 'JOY', links: [] },
]
