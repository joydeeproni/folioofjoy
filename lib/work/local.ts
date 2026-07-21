import type { WorkItem, WorkLinkItem } from '@/lib/sanity/queries'

// Vercel Blob store used across the site for large media (audio, covers, work).
const BLOB = 'https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work'

// These items live in code (not Sanity), so their links live here too. The
// Cassi screens all link to the live site; Sanity items' links are managed in
// the Studio.
const CASSI: WorkLinkItem[] = [{ label: 'View Live', url: 'https://cassihome.com/' }]

// Bespoke Work items hosted outside Sanity (uploaded to Vercel Blob). Prepended
// to the Sanity-fed Work list so they lead the Work Preview.
export const LOCAL_WORK: WorkItem[] = [
  { src: `${BLOB}/canvas-stickynote.mp4`, caption: 'Draggable sticky-note canvas', category: 'SVC', links: [] },
  { src: `${BLOB}/property-listing-02.png`, caption: 'Cassi — property listing', category: 'SVC', links: CASSI },
  { src: `${BLOB}/mortgage-upload-01.png`, caption: 'Cassi — mortgage assistant', category: 'SVC', links: CASSI },
  { src: `${BLOB}/home-dashboard-03.png`, caption: 'Cassi — home dashboard', category: 'SVC', links: CASSI },
  { src: `${BLOB}/fact-card-01.png`, caption: 'Cassi — did-you-know card', category: 'SVC', links: CASSI },
  { src: `${BLOB}/game-result-01.png`, caption: 'Mini Parkering', category: 'JOY', links: [] },
  { src: `${BLOB}/game-over-01.png`, caption: 'Mini Parkering — game over', category: 'JOY', links: [] },
  { src: `${BLOB}/property-dashboard-01.png`, caption: 'Cassi — property dashboard', category: 'SVC', links: CASSI },
  { src: `${BLOB}/media-player-01.png`, caption: 'Media player redesign', category: 'JOY', links: [] },
  { src: `${BLOB}/maintenance-plan-01.png`, caption: 'Cassi — maintenance plan', category: 'SVC', links: CASSI },
  { src: `${BLOB}/ftue-onboarding-04.png`, caption: 'Cassi — first-run onboarding', category: 'SVC', links: CASSI },
  { src: `${BLOB}/onboarding-flow-01.png`, caption: 'Cassi — onboarding flow', category: 'SVC', links: CASSI },
  { src: `${BLOB}/upload-progress-01.png`, caption: 'Cassi — uploading documents', category: 'SVC', links: CASSI },
  { src: `${BLOB}/claude-usage.png`, caption: 'My Claude usage', category: 'JOY', links: [] },
  { src: `${BLOB}/tactile-deck.mp4`, caption: 'Tactile — internal sprint deck', category: 'BIZ', links: [] },
]
