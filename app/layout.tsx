import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}


