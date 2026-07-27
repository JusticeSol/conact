import type { Metadata } from 'next'
import { DM_Sans, IBM_Plex_Mono, Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

// Self-hosted by next/font — no request leaves the browser for Google, and the
// faces are preloaded, so there is no flash of fallback text on first paint.
// Each exposes a CSS variable; Marketplace.tsx references those, never the
// family name (next/font emits a hashed family, so literal names don't resolve).

// Variable fonts: no `weight` — the whole wght axis ships in one file.
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

// IBM Plex Mono has no variable axis, so the weights in use must be listed.
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CONACT',
  description: 'AI Agent Content Marketplace on Arc Network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${dmSans.variable} ${plexMono.variable}`}
    >
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
