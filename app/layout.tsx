import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { DialRoot } from 'dialkit'
import { Providers } from './providers'
import { AudioUI } from '@/lib/audio-context'
import { DitherTransition } from '@/components/dither-transition'
import { ContentProvider } from '@/components/content-provider'
import { AgentationDev } from '@/components/dev/agentation-dev'
import { getWork, getWritingsNav } from '@/lib/content'
import 'dialkit/styles.css'
import './globals.css'

// The Tagore quote doubles as the social-card description; the search-engine
// meta description is the plainer intro. Absolute OG/Twitter image URLs are
// resolved against metadataBase.
const TITLE = 'Folio of Joy – Portfolio of Joy Sengupta'
const QUOTE =
  'I slept and dreamt that life was joy. I awoke and saw that life was service. I acted and behold, service was joy.'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.joydeeproni.com'),
  title: TITLE,
  description:
    "I'm Joy, product designer based in Copenhagen. with knack for fiddling with tools to create something fun & joyful. Currently I am designing creative tools for Tactile Games.",
  openGraph: {
    title: TITLE,
    description: QUOTE,
    url: '/',
    siteName: 'Folio of Joy',
    type: 'website',
    images: [
      {
        url: '/preview.png',
        width: 2336,
        height: 1226,
        alt: 'Folio of Joy — two friends on a pixel-art swing set',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: QUOTE,
    images: ['/preview.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.webmanifest',
  // Launch full-screen with no browser chrome when added to the iOS Home Screen.
  // `black-translucent` makes the status bar transparent so the page runs truly
  // edge-to-edge; the safe-area insets (see globals.css) keep content clear of it.
  // `capable` emits the modern `mobile-web-app-capable` (Next normalizes the
  // legacy `apple-mobile-web-app-capable` into it); combined with the manifest's
  // `display: standalone` this covers iOS 16.4+ and Android.
  appleWebApp: {
    capable: true,
    title: 'Folio of Joy',
    statusBarStyle: 'black-translucent',
  },
}

// Pure black so the mobile browser chrome blends with the black homepage on
// first paint; updated live per-track by the audio context. `viewport-fit:
// cover` lets content extend into the notch / home-indicator regions — the
// prerequisite for the safe-area insets.
export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const work = getWork()
  const writings = getWritingsNav()
  return (
    <html lang="en">
      <head>
        {/* Adobe Fonts (Typekit) — argent-pixel-cf (`font-pixel`) + jubilat-variable (`font-jubilat`). */}
        <link rel="stylesheet" href="https://use.typekit.net/pvk2ybx.css" />
        <link rel="stylesheet" href="https://use.typekit.net/pzg7soy.css" />
      </head>
      <body className="font-sans antialiased min-h-dvh">
        <Providers>
          <ContentProvider work={work} writings={writings}>
            {children}
          </ContentProvider>
          <AudioUI />
          <DitherTransition />
        </Providers>
        {process.env.NODE_ENV !== 'production' && <DialRoot position="top-right" />}
        {process.env.NODE_ENV !== 'production' && <AgentationDev />}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {process.env.NODE_ENV === 'production' && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x8e0ps4d6h");`}
          </Script>
        )}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-L37PFWXGRK"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-L37PFWXGRK');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
