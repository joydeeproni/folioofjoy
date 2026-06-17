import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import { AudioUI } from '@/lib/audio-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Folio of Joy — Product Designer',
  description: 'I\'m a product designer who started in computer science, then did the obvious late-2010s thing and developed opinions about interfaces, user psychology, and whether a button should feel expensive. I like polish, intentionality, and tools that actually move the craft forward instead of becoming another shrine we all pretend to worship.',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased min-h-screen">
        <Providers>
          {children}
          <AudioUI />
        </Providers>
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
      </body>
    </html>
  )
}
