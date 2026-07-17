import type { MetadataRoute } from 'next'

// Served by Next.js at /manifest.webmanifest. `display: standalone` + the Apple
// web-app meta tags in layout.tsx make the site launch chrome-free when added to
// the Home Screen. background_color matches the near-black --background token;
// theme_color matches the default themeColor (updated live per-track on mobile).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Folio of Joy',
    short_name: 'Folio of Joy',
    description: 'Portfolio of a product designer — polish, intentionality, and craft.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#12171d',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
